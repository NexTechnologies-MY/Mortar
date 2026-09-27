import { describe, expect, it } from 'vitest'
import { managerSuggestions } from './manager'
import { STORIES } from './fixtures/stories'
import { DEFAULT_ASSUMPTIONS } from './sim/assumptions'
import type { CaseEvent, Snapshot } from './types'

const booking = { ...STORIES[0].booking, bookingDate: '2026-09-01' }
function event(kind: CaseEvent['kind'], date: string, overrides: Partial<CaseEvent> = {}): CaseEvent {
  return {
    id: kind,
    bookingId: booking.id,
    applicationId: null,
    kind,
    track: 'sales',
    occurredAt: `${date}T09:00:00+08:00`,
    recordedAt: `${date}T09:00:00+08:00`,
    reportedBy: 'Test',
    verifiedBy: 'Test',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...overrides
  }
}
function snapshot(today: string, extra: CaseEvent[] = []): Snapshot {
  return {
    meta: { seed: 1, referenceDate: today, resetAt: null },
    bookings: [booking],
    applications: [],
    events: [event('booked', '2026-09-01'), ...extra],
    tasks: [],
    messages: [],
    playbooks: [],
    extractions: [],
    signals: [],
    nextActions: []
  }
}
const assumptions = DEFAULT_ASSUMPTIONS.map((a) => (a.key === 'staleEvidenceDays' ? { ...a, value: 10 } : a))

describe('manager waiting suggestions', () => {
  it('flags at 150% of the expected wait, never below the threshold', () => {
    expect(managerSuggestions(snapshot('2026-09-06'), assumptions)).toEqual([])
    expect(managerSuggestions(snapshot('2026-09-15'), assumptions)).toEqual([])
    expect(managerSuggestions(snapshot('2026-09-16'), assumptions)[0]).toMatchObject({
      elapsed: 15,
      expected: 10,
      unit: 'days'
    })
    expect(managerSuggestions(snapshot('2026-09-17'), assumptions)[0]).toMatchObject({
      elapsed: 16,
      expected: 10,
      unit: 'days'
    })
  })
  it('excludes signed, cancelled and lapsed bookings even if old', () => {
    for (const kind of ['spa_signed', 'cancelled', 'lapsed'] as const) {
      expect(managerSuggestions(snapshot('2026-10-20', [event(kind, '2026-09-02')]), assumptions)).toEqual([])
    }
  })
  it('uses working days for a pending bank rather than calendar age', () => {
    const data = snapshot('2026-09-21', [
      event('loan_submitted', '2026-09-07', { applicationId: 'APP-1', track: 'loan' })
    ])
    data.applications = [{ id: 'APP-1', bookingId: booking.id, bank: 'Test Bank', banker: 'Demo' }]
    const limits = assumptions.map((a) =>
      a.key === 'staleEvidenceDays' ? { ...a, value: 100 } : a.key === 'undecidedStallWorkDays' ? { ...a, value: 6 } : a
    )
    expect(managerSuggestions(data, limits)[0]).toMatchObject({
      reason: 'Bank Decision Outstanding',
      elapsed: 10,
      expected: 6,
      unit: 'working days'
    })
  })
  it('fresh confirmed evidence restarts the no-update clock', () => {
    expect(managerSuggestions(snapshot('2026-09-20', [event('buyer_contacted', '2026-09-18')]), assumptions)).toEqual(
      []
    )
  })
})
