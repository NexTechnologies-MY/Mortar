/**
 * The leakage rules, checked on hand-written cases rather than the canonical
 * seed, so a generator change moves the numbers on screen without breaking the
 * claims the module makes.
 */
import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent, Dataset, LoanApplication } from '../types'
import { leakage } from './leakage'

const REFERENCE_DATE = '2026-09-18'
const at = (date: string) => `${date}T10:00:00+08:00`

let seq = 0

const booking = (id: string, priceRm = 500000, bookingDate = '2026-07-01'): Booking => ({
  id,
  project: 'Test Project',
  unit: `A-${id}`,
  priceRm,
  bookingDate,
  buyer: {
    name: 'Test Buyer',
    ic: '000000-00-9001',
    phone: '+60 00-000 9001',
    age: 40,
    grossMonthlyIncomeRm: 10000,
    monthlyCommitmentsRm: 500,
    propertiesOwned: 0
  },
  salesOwner: 'Test Agent',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Test Chambers'
})

const ev = (bookingId: string, kind: CaseEvent['kind'], date: string): CaseEvent => ({
  id: `EV-${(seq += 1)}`,
  bookingId,
  applicationId: null,
  track: 'loan',
  kind,
  occurredAt: at(date),
  recordedAt: at(date),
  reportedBy: 'Fixture',
  verifiedBy: 'Nurul Aina',
  status: 'confirmed',
  source: 'generator',
  messageId: null,
  document: null,
  note: null
})

const app = (id: string, bookingId: string): LoanApplication => ({ id, bookingId, bank: 'Test Bank', banker: 'Banker' })

const data = (bookings: Booking[], applications: LoanApplication[], events: CaseEvent[]): Dataset => ({
  bookings,
  applications,
  events
})

describe('leakage', () => {
  it('reports nothing when no booking has died', () => {
    const out = leakage(data([booking('BK-1')], [], [ev('BK-1', 'booked', '2026-07-01')]), REFERENCE_DATE)
    expect(out.deadUnits).toBe(0)
    expect(out.deadValueRm).toBe(0)
    expect(out.causes).toEqual([])
    expect(out.recovery.missedUnits).toBe(0)
  })

  it('ranks causes by value lost, not by how many died', () => {
    const out = leakage(
      data(
        [booking('BK-1', 900000), booking('BK-2', 100000), booking('BK-3', 100000)],
        [],
        [
          // One expensive rejection outweighs two cheap withdrawals.
          ev('BK-1', 'loan_rejected', '2026-08-01'),
          ev('BK-1', 'cancelled', '2026-08-05'),
          ev('BK-2', 'buyer_withdrew', '2026-08-01'),
          ev('BK-2', 'cancelled', '2026-08-02'),
          ev('BK-3', 'buyer_withdrew', '2026-08-01'),
          ev('BK-3', 'cancelled', '2026-08-02')
        ]
      ),
      REFERENCE_DATE
    )
    expect(out.deadUnits).toBe(3)
    expect(out.deadValueRm).toBe(1100000)
    expect(out.causes.map((c) => [c.cause, c.units])).toEqual([
      ['Loan Rejected', 1],
      ['Buyer Withdrew', 2]
    ])
    expect(out.causes[0].share).toBeCloseTo(900000 / 1100000, 5)
  })

  it('attributes a rejection followed by a withdrawal to the rejection', () => {
    const out = leakage(
      data(
        [booking('BK-1')],
        [],
        [
          ev('BK-1', 'loan_rejected', '2026-08-01'),
          ev('BK-1', 'buyer_withdrew', '2026-08-03'),
          ev('BK-1', 'cancelled', '2026-08-04')
        ]
      ),
      REFERENCE_DATE
    )
    expect(out.causes.map((c) => c.cause)).toEqual(['Loan Rejected'])
  })

  it('counts the unit-days a dead booking held its unit off the market', () => {
    const out = leakage(
      data([booking('BK-1', 500000, '2026-07-01')], [], [ev('BK-1', 'lapsed', '2026-07-21')]),
      REFERENCE_DATE
    )
    expect(out.unitDaysHeld).toBe(20)
    expect(out.medianDaysHeld).toBe(20)
  })

  it('measures the second-bank rate over resolved cases only', () => {
    const out = leakage(
      data(
        [booking('BK-1'), booking('BK-2'), booking('BK-3')],
        [
          app('LA-1a', 'BK-1'),
          app('LA-1b', 'BK-1'),
          app('LA-2a', 'BK-2'),
          app('LA-2b', 'BK-2'),
          app('LA-3a', 'BK-3'),
          app('LA-3b', 'BK-3')
        ],
        [
          // Resubmitted and signed.
          ev('BK-1', 'loan_rejected', '2026-07-10'),
          ev('BK-1', 'spa_signed', '2026-07-20'),
          // Resubmitted and died.
          ev('BK-2', 'loan_rejected', '2026-07-10'),
          ev('BK-2', 'cancelled', '2026-07-25'),
          // Resubmitted, still in play: must not count either way.
          ev('BK-3', 'loan_rejected', '2026-09-15')
        ]
      ),
      REFERENCE_DATE
    )
    expect(out.recovery.secondBankSample).toBe(2)
    expect(out.recovery.secondBankRate).toBe(0.5)
  })

  it('sizes the opportunity from the rejections nobody resubmitted, with a range', () => {
    const out = leakage(
      data(
        [booking('BK-1'), booking('BK-2'), booking('BK-3'), booking('BK-4')],
        [app('LA-3a', 'BK-3'), app('LA-3b', 'BK-3'), app('LA-4a', 'BK-4'), app('LA-4b', 'BK-4')],
        [
          // Died on a rejection with one application: the missed set.
          ev('BK-1', 'loan_rejected', '2026-07-10'),
          ev('BK-1', 'cancelled', '2026-07-15'),
          ev('BK-2', 'loan_rejected', '2026-07-10'),
          ev('BK-2', 'cancelled', '2026-07-15'),
          // Resubmitted and signed, so the measured rate is 100%.
          ev('BK-3', 'loan_rejected', '2026-07-10'),
          ev('BK-3', 'spa_signed', '2026-07-20'),
          ev('BK-4', 'loan_rejected', '2026-07-10'),
          ev('BK-4', 'spa_signed', '2026-07-20')
        ]
      ),
      REFERENCE_DATE
    )
    expect(out.recovery.missedUnits).toBe(2)
    expect(out.recovery.missedValueRm).toBe(1000000)
    expect(out.recovery.secondBankRate).toBe(1)
    expect(out.recovery.recoverableUnits).toBe(2)
    // n = 2 is tiny, so the interval must be wide: a 100% point estimate off two
    // cases cannot be allowed to read as certainty.
    expect(out.recovery.rateLow).toBeLessThan(0.5)
    expect(out.recovery.recoverableUnitsLow).toBeLessThan(out.recovery.recoverableUnits)
    expect(out.recovery.rateHigh).toBe(1)
  })

  it('names the live bookings sitting on a rejection with no second bank', () => {
    const out = leakage(
      data(
        [booking('BK-1', 700000, '2026-09-01'), booking('BK-2', 400000, '2026-09-01')],
        [app('LA-2a', 'BK-2'), app('LA-2b', 'BK-2')],
        [ev('BK-1', 'loan_rejected', '2026-09-10'), ev('BK-2', 'loan_rejected', '2026-09-10')]
      ),
      REFERENCE_DATE
    )
    // BK-2 already went to a second bank, so only BK-1 is actionable today.
    expect(out.recovery.liveBookingIds).toEqual(['BK-1'])
    expect(out.recovery.liveValueRm).toBe(700000)
  })
})
