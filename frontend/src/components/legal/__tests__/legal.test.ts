import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent } from '@mortar/core'
import { booking, stalledCase } from '@/pages/__tests__/mockSnapshot'
import { firmLoad, isLegalStall, legalQueue, sortLegalRows, type LegalRow } from '../legal'

const appointment = (bookingId: string, note: string | null, status: CaseEvent['status'] = 'confirmed'): CaseEvent => ({
  id: `EV-${bookingId}`,
  bookingId,
  applicationId: null,
  track: 'legal',
  kind: 'spa_appointment_set',
  occurredAt: '2026-08-28T10:00:00+08:00',
  recordedAt: '2026-08-28T10:05:00+08:00',
  reportedBy: 'Fixture',
  verifiedBy: 'Nurul Aina',
  status,
  source: 'generator',
  messageId: null,
  document: null,
  note
})

const waiting = (id: string, days: number, firm: string, priceRm = 500000) => ({
  booking: booking(id, { legalFirm: firm, priceRm }),
  summary: stalledCase(id, { stage: 'lo_issued', daysSinceLoIssued: days, stallReasons: [] })
})

describe('isLegalStall', () => {
  it('separates the legal reasons from the loan ones', () => {
    expect(isLegalStall('SPA Set 21 Days Ago, Still Unsigned')).toBe(true)
    expect(isLegalStall('SPA Not Scheduled 44 Days After LO')).toBe(true)
    expect(isLegalStall('Bank Has Not Decided After 12 Working Days')).toBe(false)
    expect(isLegalStall('Payslip Still Outstanding After 9 Days')).toBe(false)
  })
})

describe('legalQueue', () => {
  it('keeps only cases sitting at lo_issued, longest wait first', () => {
    const rows = [waiting('BK-1', 9, 'Alpha'), waiting('BK-2', 41, 'Beta'), waiting('BK-3', 20, 'Gamma')]
    const other = { booking: booking('BK-4'), summary: stalledCase('BK-4', { stage: 'loan_applied' }) }
    const queue = legalQueue(
      [...rows, other].map((r) => r.booking),
      [...rows, other].map((r) => r.summary),
      []
    )
    expect(queue.map((r) => r.booking.id)).toEqual(['BK-2', 'BK-3', 'BK-1'])
  })

  it('breaks a tie on the value the case is holding up', () => {
    const rows = [waiting('BK-1', 30, 'Alpha', 400000), waiting('BK-2', 30, 'Beta', 900000)]
    const queue = legalQueue(
      rows.map((r) => r.booking),
      rows.map((r) => r.summary),
      []
    )
    expect(queue.map((r) => r.booking.id)).toEqual(['BK-2', 'BK-1'])
  })

  it('carries the confirmed appointment note and ignores unconfirmed ones', () => {
    const rows = [waiting('BK-1', 12, 'Alpha'), waiting('BK-2', 11, 'Beta')]
    const queue = legalQueue(
      rows.map((r) => r.booking),
      rows.map((r) => r.summary),
      [appointment('BK-1', 'Appointment On 2026-09-04'), appointment('BK-2', 'Maybe', 'provisional')]
    )
    expect(queue.find((r) => r.booking.id === 'BK-1')?.appointmentNote).toBe('Appointment On 2026-09-04')
    expect(queue.find((r) => r.booking.id === 'BK-2')?.appointmentNote).toBeNull()
  })

  it('carries the latest appointment after a reschedule, whatever order the log lists them in', () => {
    const row = waiting('BK-1', 12, 'Alpha')
    const rescheduled = {
      ...appointment('BK-1', 'Appointment On 2026-09-25'),
      id: 'EV-BK-1-2',
      occurredAt: '2026-09-15T12:00:00+08:00'
    }
    const queue = legalQueue(
      [row.booking],
      [row.summary],
      [rescheduled, appointment('BK-1', 'Appointment On 2026-09-04')]
    )
    expect(queue[0].appointmentNote).toBe('Appointment On 2026-09-25')
  })

  it('needs a real letter of offer, not just the stage', () => {
    const noOffer = {
      booking: booking('BK-1'),
      summary: stalledCase('BK-1', { stage: 'lo_issued', daysSinceSpaSet: 3 })
    }
    expect(legalQueue([noOffer.booking], [noOffer.summary], [])).toEqual([])
  })

  it('drops a summary with no matching booking rather than rendering a ghost row', () => {
    expect(legalQueue([], [stalledCase('BK-missing', { stage: 'lo_issued', daysSinceLoIssued: 5 })], [])).toEqual([])
  })
})

describe('firmLoad', () => {
  it('groups by firm, heaviest first, with the median wait', () => {
    const rows = [
      waiting('BK-1', 10, 'Alpha', 100000),
      waiting('BK-2', 20, 'Alpha', 200000),
      waiting('BK-3', 30, 'Alpha', 300000),
      waiting('BK-4', 40, 'Beta', 900000)
    ]
    const load = firmLoad(
      legalQueue(
        rows.map((r) => r.booking),
        rows.map((r) => r.summary),
        []
      )
    )
    expect(load).toEqual([
      { firm: 'Alpha', awaiting: 3, medianDays: 20, valueRm: 600000 },
      { firm: 'Beta', awaiting: 1, medianDays: 40, valueRm: 900000 }
    ])
  })

  it('averages the middle pair when the group is even', () => {
    const rows = [waiting('BK-1', 10, 'Alpha'), waiting('BK-2', 21, 'Alpha')]
    const load = firmLoad(
      legalQueue(
        rows.map((r) => r.booking),
        rows.map((r) => r.summary),
        []
      )
    )
    expect(load[0].medianDays).toBe(16)
  })
})

const row = (
  id: string,
  overrides: Partial<Booking> = {},
  appointmentNote: string | null = null,
  summaryOverrides: Record<string, unknown> = {}
): LegalRow => ({
  booking: booking(id, overrides),
  summary: stalledCase(id, { stage: 'lo_issued', stallReasons: [], ...summaryOverrides }),
  appointmentNote
})

describe('sortLegalRows', () => {
  it('sorts by firm A-Z', () => {
    const r1 = row('BK-1', { legalFirm: 'Gamma' })
    const r2 = row('BK-2', { legalFirm: 'Alpha' })
    const r3 = row('BK-3', { legalFirm: 'Beta' })
    const result = sortLegalRows([r1, r2, r3], { key: 'firm', dir: 'asc' })
    expect(result.map((r) => r.booking.legalFirm)).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('sorts by firm Z-A', () => {
    const r1 = row('BK-1', { legalFirm: 'Beta' })
    const r2 = row('BK-2', { legalFirm: 'Alpha' })
    const r3 = row('BK-3', { legalFirm: 'Gamma' })
    const result = sortLegalRows([r1, r2, r3], { key: 'firm', dir: 'desc' })
    expect(result.map((r) => r.booking.legalFirm)).toEqual(['Gamma', 'Beta', 'Alpha'])
  })

  it('sorts by days descending with largest daysSinceLoIssued first', () => {
    const r1 = row('BK-1', {}, null, { daysSinceLoIssued: 10 })
    const r2 = row('BK-2', {}, null, { daysSinceLoIssued: 45 })
    const r3 = row('BK-3', {}, null, { daysSinceLoIssued: 25 })
    const result = sortLegalRows([r1, r2, r3], { key: 'days', dir: 'desc' })
    expect(result.map((r) => r.booking.id)).toEqual(['BK-2', 'BK-3', 'BK-1'])
  })

  it('orders rows by value both descending and ascending', () => {
    const r1 = row('BK-1', { priceRm: 300000 })
    const r2 = row('BK-2', { priceRm: 800000 })
    const r3 = row('BK-3', { priceRm: 500000 })

    const desc = sortLegalRows([r1, r2, r3], { key: 'value', dir: 'desc' })
    expect(desc.map((r) => r.booking.id)).toEqual(['BK-2', 'BK-3', 'BK-1'])

    const asc = sortLegalRows([r1, r2, r3], { key: 'value', dir: 'asc' })
    expect(asc.map((r) => r.booking.id)).toEqual(['BK-1', 'BK-3', 'BK-2'])
  })

  it('sorts by appointment ascending with no appointment note first then chronologically', () => {
    const rNoAppt = row('BK-1', {}, null)
    const rLater = row('BK-2', {}, 'Appointment On 2026-09-15')
    const rEarlier = row('BK-3', {}, 'Appointment On 2026-09-04')
    const result = sortLegalRows([rLater, rNoAppt, rEarlier], { key: 'appointment', dir: 'asc' })
    expect(result.map((r) => r.booking.id)).toEqual(['BK-1', 'BK-3', 'BK-2'])
  })

  it('preserves incoming order when there are ties', () => {
    const r1 = row('BK-1', { legalFirm: 'Alpha' })
    const r2 = row('BK-2', { legalFirm: 'Alpha' })
    const r3 = row('BK-3', { legalFirm: 'Beta' })

    const forward = sortLegalRows([r1, r2, r3], { key: 'firm', dir: 'asc' })
    expect(forward.map((r) => r.booking.id)).toEqual(['BK-1', 'BK-2', 'BK-3'])

    const reversed = sortLegalRows([r2, r1, r3], { key: 'firm', dir: 'asc' })
    expect(reversed.map((r) => r.booking.id)).toEqual(['BK-2', 'BK-1', 'BK-3'])
  })

  it('returns exact input order unchanged when sort is null', () => {
    const r1 = row('BK-3', { legalFirm: 'Zulu', priceRm: 900000 })
    const r2 = row('BK-1', { legalFirm: 'Alpha', priceRm: 300000 })
    const r3 = row('BK-2', { legalFirm: 'Beta', priceRm: 600000 })
    const result = sortLegalRows([r1, r2, r3], null)
    expect(result.map((r) => r.booking.id)).toEqual(['BK-3', 'BK-1', 'BK-2'])
  })
})
