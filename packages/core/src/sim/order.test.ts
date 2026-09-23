/**
 * The order the case rules read events in. Staff updates recorded for the same
 * day can carry the same time, so equal times must keep the order they were
 * entered in (the database's `seq`), never a random id.
 */
import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent, LoanApplication } from '../types'
import { STORIES } from '../fixtures/stories'
import { byOccurred, deriveCase } from './cases'
import { generateDataset } from './generate'
import { DEFAULT_SEED, REFERENCE_DATE } from './constants'

const BOOKING: Booking = {
  id: 'BK-T001',
  project: 'Test Project',
  unit: 'A-01-01',
  priceRm: 500000,
  bookingDate: '2026-08-25',
  buyer: {
    name: 'Test Buyer',
    ic: '000000-00-9001',
    phone: '+60 00-000 9001',
    age: 36,
    grossMonthlyIncomeRm: 20000,
    monthlyCommitmentsRm: 0,
    propertiesOwned: 0
  },
  salesOwner: 'Test Agent',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Test Chambers'
}
const APEX: LoanApplication = { id: 'APP-T001', bookingId: BOOKING.id, bank: 'Apex Bank', banker: 'Kelvin Teo' }

/** Ids that sort against the order of entry, and with it. */
const LOW = 'EV-00000000-0000-4000-8000-000000000000'
const HIGH = 'EV-f0000000-0000-4000-8000-000000000000'

function event(over: Partial<CaseEvent> & Pick<CaseEvent, 'kind'>): CaseEvent {
  return {
    id: 'EV-T000',
    bookingId: BOOKING.id,
    applicationId: APEX.id,
    track: 'loan',
    occurredAt: '2026-09-10T12:00:00+08:00',
    recordedAt: '2026-09-18T10:00:00+08:00',
    reportedBy: 'Tan Mei Ling',
    verifiedBy: 'Tan Mei Ling',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...over
  }
}

const opening = [
  event({
    id: 'EV-T001',
    kind: 'booked',
    track: 'sales',
    applicationId: null,
    occurredAt: '2026-08-25T09:00:00+08:00',
    seq: 1
  }),
  event({ id: 'EV-T002', kind: 'loan_submitted', occurredAt: '2026-08-27T12:00:00+08:00', seq: 2 })
]
const derive = (events: CaseEvent[]) => deriveCase(BOOKING, [APEX], [...opening, ...events], REFERENCE_DATE)

describe('events at the same time', () => {
  it.each([
    [HIGH, LOW],
    [LOW, HIGH]
  ])('a request then a receipt stored in that order leaves nothing outstanding (ids %s, %s)', (first, second) => {
    // Shuffled on the way in, as rows can come from anywhere.
    const facts = derive([
      event({ id: second, kind: 'documents_received', document: 'payslip', seq: 4 }),
      event({ id: first, kind: 'documents_requested', document: 'payslip', seq: 3 })
    ])
    expect(facts.outstandingDocuments).toEqual([])
    expect(facts.applications[0].status).toBe('submitted')
  })

  it('a same-day bank decision follows the order of entry, not the ids', () => {
    const decide = (first: 'loan_approved' | 'loan_rejected', [firstId, secondId]: string[]) =>
      derive([
        event({ id: secondId, kind: first === 'loan_approved' ? 'loan_rejected' : 'loan_approved', seq: 4 }),
        event({ id: firstId, kind: first, seq: 3 })
      ]).applications[0].status
    const approvedFirst = [decide('loan_approved', [HIGH, LOW]), decide('loan_approved', [LOW, HIGH])]
    const rejectedFirst = [decide('loan_rejected', [HIGH, LOW]), decide('loan_rejected', [LOW, HIGH])]
    expect(approvedFirst[1]).toBe(approvedFirst[0])
    expect(rejectedFirst[1]).toBe(rejectedFirst[0])
    expect(approvedFirst[0]).not.toBe(rejectedFirst[0])
  })

  it.each([
    [HIGH, LOW],
    [LOW, HIGH]
  ])('rows with no seq fall back to when they were recorded (ids %s, %s)', (first, second) => {
    const facts = derive([
      event({ id: second, kind: 'documents_received', document: 'payslip', recordedAt: '2026-09-18T10:05:00+08:00' }),
      event({ id: first, kind: 'documents_requested', document: 'payslip', recordedAt: '2026-09-18T10:00:00+08:00' })
    ])
    expect(facts.outstandingDocuments).toEqual([])
  })

  it('puts a stored row before one not yet stored, and an earlier time first whatever the seq', () => {
    const stored = event({ id: HIGH, kind: 'documents_requested', seq: 9 })
    const unstored = event({ id: LOW, kind: 'documents_received' })
    expect(byOccurred(stored, unstored)).toBeLessThan(0)
    expect(byOccurred(unstored, stored)).toBeGreaterThan(0)
    const earlier = event({ kind: 'documents_received', occurredAt: '2026-09-10T11:00:00+08:00', seq: 10 })
    expect(byOccurred(earlier, stored)).toBeLessThan(0)
  })

  it('leaves the seeded order of each booking as it was', () => {
    const events = [
      ...generateDataset({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 }).events,
      ...STORIES.flatMap((s) => s.events)
    ]
    // The case rules read one booking at a time.
    const before = [...events].sort(
      (a, b) =>
        a.bookingId.localeCompare(b.bookingId) || a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id)
    )
    // Numbered in insertion order, the way the reset stores them.
    const stored = events
      .map((e, i) => ({ ...e, seq: i + 1 }))
      .sort((a, b) => a.bookingId.localeCompare(b.bookingId) || byOccurred(a, b))
    expect(stored.map((e) => e.id)).toEqual(before.map((e) => e.id))
  })
})
