import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent, CaseSummary, EventKind, LoanApplication } from './types'
import { REFERENCE_DATE, summarizeCases } from './sim'
import { deriveCase } from './sim/cases'
import { ballInCourt } from './ball'

// Updates staff record by hand: parallel banks, withdrawals the buyer comes back
// from, and documents recorded for one bank or for none. The generator never
// writes these, so each case here is built event by event.

const b: Booking = {
  id: 'BK-T100',
  project: 'Test Project',
  unit: 'A-01-01',
  priceRm: 500000,
  bookingDate: '2026-08-25',
  buyer: {
    name: 'Test Buyer',
    ic: '000000-00-9100',
    phone: '+60 00-000 9100',
    age: 36,
    grossMonthlyIncomeRm: 20000,
    monthlyCommitmentsRm: 0,
    propertiesOwned: 0
  },
  salesOwner: 'Test Agent',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Test Chambers'
}
const A: LoanApplication = { id: 'APP-A', bookingId: b.id, bank: 'Apex Bank', banker: 'Kelvin Teo' }
const B: LoanApplication = { id: 'APP-B', bookingId: b.id, bank: 'Bumi Bank', banker: 'Aida Rahman' }

let seq = 0
/** What `POST /api/events` stores for a staff update: confirmed, noon on the chosen day, recorded that evening. */
function ev(kind: EventKind, on: string, extra: Partial<CaseEvent> = {}): CaseEvent {
  seq += 1
  return {
    id: `EV-T${String(seq).padStart(4, '0')}`,
    bookingId: b.id,
    applicationId: null,
    track: 'loan',
    kind,
    occurredAt: `${on}T12:00:00+08:00`,
    recordedAt: `${on}T18:00:00+08:00`,
    reportedBy: 'Tan Mei Ling',
    verifiedBy: 'Tan Mei Ling',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...extra
  }
}

const booked = ev('booked', '2026-08-25', { track: 'sales' })
const submitted = (app: LoanApplication, on: string) => ev('loan_submitted', on, { applicationId: app.id })
const approved = (app: LoanApplication, on: string) => ev('loan_approved', on, { applicationId: app.id })
const rejected = (app: LoanApplication, on: string) => ev('loan_rejected', on, { applicationId: app.id })
const withdrew = (on: string) => ev('buyer_withdrew', on, { track: 'sales' })
const requested = (app: LoanApplication | null, document: CaseEvent['document'], on: string) =>
  ev('documents_requested', on, { applicationId: app?.id ?? null, document })
const received = (app: LoanApplication | null, document: CaseEvent['document'], on: string) =>
  ev('documents_received', on, { applicationId: app?.id ?? null, document })

function summarize(apps: LoanApplication[], events: CaseEvent[]): CaseSummary {
  return summarizeCases({ bookings: [b], applications: apps, events, tasks: [] }, REFERENCE_DATE)[0]
}

const statuses = (s: CaseSummary) => s.applications.map((a) => `${a.bank}: ${a.status}`)
const bankStalls = (s: CaseSummary) => s.stallReasons.filter((r) => r.startsWith('Bank Has Not Decided'))
const documentStalls = (s: CaseSummary) => s.stallReasons.filter((r) => r.includes('Still Outstanding'))

describe('a buyer who withdrew', () => {
  it('stops the bank clock on the application the withdrawal covers', () => {
    const s = summarize([A], [booked, submitted(A, '2026-08-27'), withdrew('2026-09-17')])
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn'])
    expect(s.buyerWithdrew).toBe(true)
    expect(bankStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'developer', nextMove: 'review_release' })
  })

  it('counts a submission on the day of the withdrawal as withdrawn too', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), submitted(B, '2026-09-01')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: withdrawn'])
    expect(s.buyerWithdrew).toBe(true)
    expect(bankStalls(s)).toEqual([])
  })

  it('takes a bank submitted after the withdrawal as the buyer coming back', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), submitted(B, '2026-09-03')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: submitted'])
    expect(s.buyerWithdrew).toBe(false)
    // Only the new bank's clock runs: 11 working days from 3 Sep to 18 Sep.
    expect(bankStalls(s)).toEqual(['Bank Has Not Decided After 11 Working Days'])
    expect(ballInCourt(s)).toMatchObject({ holder: 'bank', waitingFor: 'Bumi Bank To Decide On The Loan' })
  })

  it('hands the case to the solicitor once the new bank approves', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        withdrew('2026-09-01'),
        submitted(B, '2026-09-02'),
        approved(B, '2026-09-05')
      ]
    )
    expect(s.stage).toBe('lo_issued')
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: approved'])
    expect(s.buyerWithdrew).toBe(false)
    expect(bankStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  it('stays withdrawn when a bank approves after the withdrawal with no new submission', () => {
    const s = summarize([A], [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), approved(A, '2026-09-05')])
    expect(statuses(s)).toEqual(['Apex Bank: approved'])
    expect(s.buyerWithdrew).toBe(true)
    expect(ballInCourt(s)).toMatchObject({ holder: 'developer', nextMove: 'review_release' })
  })

  it('reads the latest withdrawal: withdrawing again after coming back withdraws again', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), submitted(B, '2026-09-03'), withdrew('2026-09-10')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: withdrawn'])
    expect(s.buyerWithdrew).toBe(true)
    expect(bankStalls(s)).toEqual([])
  })
})

describe('a case once a bank has approved', () => {
  it('drops a rejected bank’s open document request', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        rejected(A, '2026-09-03'),
        submitted(B, '2026-09-04'),
        approved(B, '2026-09-07')
      ]
    )
    expect(s.outstandingDocuments).toEqual([])
    expect(documentStalls(s)).toEqual([])
    expect(s.risk.reasons).not.toContain('Income Document Outstanding')
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  it('drops the documents another bank is still waiting on', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(B, 'epf_statement', '2026-08-29'),
        approved(A, '2026-09-14')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: approved', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual([])
    expect(documentStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  it('stops chasing another bank for a decision', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), submitted(B, '2026-08-27'), approved(A, '2026-09-14')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: approved', 'Bumi Bank: submitted'])
    expect(bankStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  it('keeps the approving bank’s own request on the list, but waits on the solicitor', () => {
    const s = summarize(
      [A],
      [booked, submitted(A, '2026-08-27'), requested(A, 'payslip', '2026-09-01'), approved(A, '2026-09-14')]
    )
    expect(s.outstandingDocuments).toEqual(['payslip'])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })
})

describe('a bank that declined', () => {
  it('no longer holds the case up with a document it asked for', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        rejected(A, '2026-09-03'),
        submitted(B, '2026-09-14')
      ]
    )
    expect(s.outstandingDocuments).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'bank', waitingFor: 'Bumi Bank To Decide On The Loan' })
  })
})

describe('one document ledger for the case and each bank', () => {
  it('clears a bank’s request with a receipt recorded not for one bank', () => {
    const s = summarize(
      [A],
      [
        booked,
        submitted(A, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        received(null, 'payslip', '2026-09-02')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: submitted'])
    expect(s.outstandingDocuments).toEqual([])
    // The bank's clock restarts on the day the payslip came in: 12 working days to 18 Sep.
    expect(bankStalls(s)).toEqual(['Bank Has Not Decided After 12 Working Days'])
    expect(ballInCourt(s)).toMatchObject({ holder: 'bank', waitingFor: 'Apex Bank To Decide On The Loan' })
  })

  it('clears a document on every bank with one receipt not for one bank', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'payslip', '2026-08-29'),
        received(null, 'payslip', '2026-09-16')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: submitted', 'Bumi Bank: submitted'])
    expect(s.outstandingDocuments).toEqual([])
  })

  it('clears only that bank’s requests with All Outstanding Documents for one bank', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'epf_statement', '2026-08-28'),
        requested(null, 'ic_copy', '2026-08-28'),
        received(A, null, '2026-09-16')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: submitted', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual(['epf_statement', 'ic_copy'])
    expect(ballInCourt(s)).toMatchObject({ holder: 'buyer', waitingFor: 'EPF Statement And IC Copy From The Buyer' })
  })

  it('clears everything with All Outstanding Documents not for one bank', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'epf_statement', '2026-08-28'),
        requested(null, 'ic_copy', '2026-08-28'),
        received(null, null, '2026-09-16')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: submitted', 'Bumi Bank: submitted'])
    expect(s.outstandingDocuments).toEqual([])
  })

  it('leaves another bank’s request for the same document open', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'payslip', '2026-08-29'),
        received(A, 'payslip', '2026-09-16')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: submitted', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual(['payslip'])
  })

  it('clears a request not for one bank with a receipt for one bank', () => {
    const s = summarize(
      [A],
      [
        booked,
        requested(null, 'payslip', '2026-08-26'),
        submitted(A, '2026-08-27'),
        received(A, 'payslip', '2026-09-16')
      ]
    )
    expect(s.outstandingDocuments).toEqual([])
  })
})

describe('the bank clock', () => {
  it('starts no earlier than the submission when a receipt is back-dated before it', () => {
    const events = [
      booked,
      submitted(A, '2026-09-10'),
      ev('documents_received', '2026-08-26', {
        applicationId: A.id,
        document: 'payslip',
        recordedAt: '2026-09-18T10:00:00+08:00'
      })
    ]
    expect(deriveCase(b, [A], events, REFERENCE_DATE).applications[0].pendingSince).toBe('2026-09-10')
    // Six working days from 10 Sep, not 17 from 26 Aug.
    expect(bankStalls(summarize([A], events))).toEqual([])
  })

  it('restarts at a receipt after the submission', () => {
    const events = [booked, submitted(A, '2026-08-27'), received(A, 'payslip', '2026-09-08')]
    expect(deriveCase(b, [A], events, REFERENCE_DATE).applications[0].pendingSince).toBe('2026-09-08')
  })
})
