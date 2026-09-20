import { describe, expect, it } from 'vitest'
import type { CaseEvent } from '@mortar/core'
import { booking, stalledCase } from '@/pages/__tests__/mockSnapshot'
import { firmLoad, isLegalStall, legalQueue } from '../legal'

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

  it('drops a summary with no matching booking rather than rendering a ghost row', () => {
    expect(legalQueue([], [stalledCase('BK-missing', { stage: 'lo_issued' })], [])).toEqual([])
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
