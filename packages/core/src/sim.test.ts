import { describe, expect, it } from 'vitest'
import type { Assumption, Booking, CaseEvent, Dataset } from './types'
import {
  backtest,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_SEED,
  financingRisk,
  forecast,
  generate,
  HORIZON_DAYS,
  PERSONA_STAFF,
  REFERENCE_DATE,
  summarizeCases
} from './sim'
import { deriveCase, STAGE_RANK } from './sim/cases'
import { STORIES } from './fixtures/stories'
import { wilsonInterval } from './sim/forecast'
import { monthlyInstalment } from './sim/risk'
import { addDays, dateOf, diffDays } from './sim/dates'

const OPTIONS = { seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 }
const emptyData: Dataset = { bookings: [], applications: [], events: [] }

/** The generated dataset plus the story bookings, merged the way the server's reset does. */
const withStories = (seed: number): Dataset => {
  const g = generate({ seed, referenceDate: REFERENCE_DATE, bookings: 140 })
  return {
    bookings: [...g.bookings, ...STORIES.map((s) => s.booking)],
    applications: [...g.applications, ...STORIES.flatMap((s) => s.applications)],
    events: [...g.events, ...STORIES.flatMap((s) => s.events)]
  }
}

const data: Dataset = generate(OPTIONS)
const summaries = summarizeCases({ ...data, tasks: [] }, REFERENCE_DATE)

const at = (date: string, hour = 10) => `${date}T${String(hour).padStart(2, '0')}:00:00+08:00`

function booking(over: Partial<Booking> = {}): Booking {
  return {
    id: 'BK-T001',
    project: 'Test Project',
    unit: 'A-01-01',
    priceRm: 500000,
    bookingDate: '2026-09-01',
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
    legalFirm: 'Test Chambers',
    ...over
  }
}

function event(over: Partial<CaseEvent> & { occurredAt: string }): CaseEvent {
  return {
    id: 'EV-T001',
    bookingId: 'BK-T001',
    applicationId: null,
    track: 'sales',
    kind: 'booked',
    recordedAt: over.occurredAt,
    reportedBy: 'Test Agent',
    verifiedBy: 'Nurul Aina',
    status: 'confirmed',
    source: 'story',
    messageId: null,
    document: null,
    note: null,
    ...over
  }
}

describe('generate', () => {
  it('is deterministic: the same options give the same dataset', () => {
    expect(generate(OPTIONS)).toEqual(data)
    expect(generate({ ...OPTIONS, seed: 1 })).not.toEqual(data)
  })

  it('emits nothing after the reference date', () => {
    for (const e of data.events) {
      expect(dateOf(e.occurredAt) <= REFERENCE_DATE).toBe(true)
      expect(dateOf(e.recordedAt) <= REFERENCE_DATE).toBe(true)
    }
  })

  it('emits exactly one booked event per booking', () => {
    for (const b of data.bookings) {
      expect(data.events.filter((e) => e.bookingId === b.id && e.kind === 'booked')).toHaveLength(1)
    }
  })

  it('spreads bookings over the 120 days before the reference date', () => {
    const dates = data.bookings.map((b) => b.bookingDate).sort()
    expect(dates[0] >= addDays(REFERENCE_DATE, -120)).toBe(true)
    expect(dates[dates.length - 1] <= REFERENCE_DATE).toBe(true)
    for (const b of data.bookings) {
      expect(b.priceRm).toBeGreaterThanOrEqual(350_000)
      expect(b.priceRm).toBeLessThanOrEqual(900_000)
    }
  })

  it('keeps stages monotonic along each confirmed event log', () => {
    for (const b of data.bookings) {
      const log = data.events
        .filter((e) => e.bookingId === b.id && e.status === 'confirmed')
        .sort((a, c) => a.occurredAt.localeCompare(c.occurredAt) || a.id.localeCompare(c.id))
      let best = -1
      for (let k = 1; k <= log.length; k += 1) {
        const stage = deriveCase(b, data.applications, log.slice(0, k), REFERENCE_DATE).stage
        const rank = STAGE_RANK[stage]
        expect(rank).toBeGreaterThanOrEqual(best)
        best = rank
      }
    }
  })

  it('produces a believable world: stalled, unknown and a risk spread', () => {
    expect(summaries.filter((s) => s.stallReasons.length > 0).length).toBeGreaterThanOrEqual(12)
    expect(summaries.filter((s) => s.unknown).length).toBeGreaterThanOrEqual(5)
    const levels = new Set(summaries.map((s) => s.risk.level))
    expect(levels).toEqual(new Set(['low', 'medium', 'high']))
    expect(summaries.filter((s) => s.risk.level === 'high').length).toBeGreaterThanOrEqual(10)
    const resolved = summaries.filter(
      (s) => s.stage === 'cancelled' || s.stage === 'lapsed' || s.bookingAgeDays >= HORIZON_DAYS
    )
    // Share of resolved bookings that signed within 30 days of booking: roughly half.
    const hits = resolved.filter((s) => {
      const b = data.bookings.find((x) => x.id === s.bookingId)!
      const signed = data.events.find(
        (e) => e.bookingId === s.bookingId && e.kind === 'spa_signed' && e.status === 'confirmed'
      )
      return signed !== undefined && diffDays(b.bookingDate, dateOf(signed.occurredAt)) <= HORIZON_DAYS
    })
    const share = hits.length / resolved.length
    expect(share).toBeGreaterThan(0.35)
    expect(share).toBeLessThan(0.65)
    for (const b of data.bookings) {
      const apps = data.applications.filter((a) => a.bookingId === b.id)
      expect(apps.length).toBeGreaterThanOrEqual(1)
      expect(apps.length).toBeLessThanOrEqual(3)
    }
  })
})

describe('summarizeCases', () => {
  it('handles an empty dataset', () => {
    expect(summarizeCases({ ...emptyData, tasks: [] }, REFERENCE_DATE)).toEqual([])
  })

  it('summarizes a hand-written booking', () => {
    const b = booking()
    const out = summarizeCases(
      { bookings: [b], applications: [], events: [event({ occurredAt: at('2026-09-01') })], tasks: [] },
      REFERENCE_DATE
    )
    expect(out).toHaveLength(1)
    expect(out[0].stage).toBe('booked')
    expect(out[0].bookingAgeDays).toBe(17)
    expect(out[0].unknown).toBe(true)
    expect(out[0].applications).toEqual([])
    expect(out[0].risk.level).toBe('low')
  })

  it('ignores provisional, disputed and superseded evidence when staging', () => {
    const b = booking()
    const events = [
      event({ occurredAt: at('2026-09-01') }),
      event({
        id: 'EV-T002',
        kind: 'loan_submitted',
        track: 'loan',
        occurredAt: at('2026-09-02'),
        status: 'provisional'
      }),
      event({ id: 'EV-T003', kind: 'loan_approved', track: 'loan', occurredAt: at('2026-09-05'), status: 'disputed' }),
      event({ id: 'EV-T004', kind: 'spa_signed', track: 'legal', occurredAt: at('2026-09-08'), status: 'superseded' })
    ]
    const out = summarizeCases({ bookings: [b], applications: [], events, tasks: [] }, REFERENCE_DATE)
    expect(out[0].stage).toBe('booked')
    expect(out[0].stallReasons).toContain('Disputed Evidence Awaits Review')
  })
})

describe('financingRisk', () => {
  it('computes the annuity instalment', () => {
    expect(monthlyInstalment(450_000, 4.2, 30)).toBeCloseTo(2200.58, 2)
    expect(monthlyInstalment(120_000, 0, 10)).toBeCloseTo(1000, 5)
  })

  it('prices a booking: 90% margin, tenure capped by age, DSR against the cap', () => {
    const risk = financingRisk(booking())
    expect(risk.loanRm).toBe(450_000)
    expect(risk.instalmentRm).toBe(2201)
    expect(risk.debtServiceRatio).toBeCloseTo((500 + 2201) / 10000, 3)
    expect(risk.level).toBe('low')
    expect(risk.reasons.join(' ')).toContain('Debt Service Ratio')
  })

  it('caps the margin at 70% from the third home and flags a high DSR', () => {
    const risk = financingRisk(
      booking({
        buyer: {
          name: 'Test Buyer',
          ic: '000000-00-9002',
          phone: '+60 00-000 9002',
          age: 45,
          grossMonthlyIncomeRm: 6000,
          monthlyCommitmentsRm: 2000,
          propertiesOwned: 2
        }
      })
    )
    expect(risk.marginOfFinancing).toBeCloseTo(0.7, 5)
    expect(risk.loanRm).toBe(350_000)
    expect(risk.level).toBe('high')
  })
})

describe('forecast', () => {
  it('places the Wilson interval on a known value', () => {
    const { low, high } = wilsonInterval(5, 10)
    expect(low).toBeCloseTo(0.2366, 4)
    expect(high).toBeCloseTo(0.7634, 4)
  })

  it('is deterministic and brackets the expectation inside the range', () => {
    const a = forecast(data, REFERENCE_DATE)
    expect(a).toEqual(forecast(data, REFERENCE_DATE))
    expect(a.asOf).toBe(REFERENCE_DATE)
    expect(a.horizonDays).toBe(HORIZON_DAYS)
    expect(a.liveBookings).toBe(a.perBooking.length)
    expect(a.expectedSignings).toBeCloseTo(
      a.perBooking.reduce((s, p) => s + p.probability, 0),
      10
    )
    expect(a.rangeLow).toBeLessThanOrEqual(a.expectedSignings)
    expect(a.rangeHigh).toBeGreaterThanOrEqual(a.expectedSignings)
    for (const r of a.stageRates) {
      expect(r.rate).toBeGreaterThanOrEqual(0)
      expect(r.rate).toBeLessThanOrEqual(1)
      expect(r.low).toBeLessThanOrEqual(r.rate)
      expect(r.high).toBeGreaterThanOrEqual(r.rate)
    }
  })
})

describe('backtest', () => {
  const cutoff = addDays(REFERENCE_DATE, -30)

  it('reads nothing after its cut', () => {
    const base = backtest(data, cutoff)
    const trimmed = backtest({ ...data, events: data.events.filter((e) => dateOf(e.recordedAt) <= cutoff) }, cutoff)
    expect(trimmed.predicted).toBeCloseTo(base.predicted, 10)
    const rewritten = backtest(
      {
        ...data,
        events: data.events.map((e) =>
          dateOf(e.recordedAt) > cutoff ? { ...e, kind: 'disbursed' as const, status: 'confirmed' as const } : e
        )
      },
      cutoff
    )
    expect(rewritten.predicted).toBeCloseTo(base.predicted, 10)
  })

  it('excludes evidence recorded after the cut even when it occurred before', () => {
    const b = booking({ bookingDate: '2026-08-10' })
    const events = [
      event({ occurredAt: at('2026-08-10') }),
      event({
        id: 'EV-T002',
        kind: 'loan_submitted',
        track: 'loan',
        occurredAt: at('2026-08-11'),
        recordedAt: at('2026-08-20')
      })
    ]
    const ds: Dataset = { bookings: [b], applications: [], events }
    const past = backtest(ds, '2026-08-19')
    const liveAtCut = backtest({ ...ds, events: [events[0]] }, '2026-08-19')
    expect(past.predicted).toBeCloseTo(liveAtCut.predicted, 10)
  })

  it('reports a Brier score and a four-bucket calibration table', () => {
    const out = backtest(data, cutoff)
    expect(out.cutoff).toBe(cutoff)
    expect(out.brier).toBeGreaterThanOrEqual(0)
    expect(out.brier).toBeLessThanOrEqual(1)
    expect(out.calibration).toHaveLength(4)
    for (const row of out.calibration) {
      expect(row.predicted).toBeGreaterThanOrEqual(0)
      expect(row.observed).toBeGreaterThanOrEqual(0)
    }
  })

  it('is calibrated: predicted tracks observed and the Brier score beats the naive 0.5', () => {
    const canon = backtest(withStories(DEFAULT_SEED), cutoff)
    expect(canon.brier).toBeLessThan(0.25)
    expect(canon.predicted).toBeGreaterThanOrEqual(canon.observed * 0.8)
    expect(canon.predicted).toBeLessThanOrEqual(canon.observed * 1.2)
    // The bound must hold across seeds, not just the one the demo shows.
    let predicted = 0
    let observed = 0
    let below = 0
    for (let seed = 1; seed <= 20; seed += 1) {
      const out = backtest(withStories(seed), cutoff)
      predicted += out.predicted
      observed += out.observed
      if (out.brier < 0.25) below += 1
      expect(out.brier).toBeLessThan(0.3)
    }
    expect(below).toBeGreaterThanOrEqual(18)
    expect(Math.abs(predicted - observed)).toBeLessThanOrEqual(observed * 0.15)
  })
})

describe('stories merged into the dataset', () => {
  const merged = withStories(DEFAULT_SEED)

  it('flags exactly one story booking as unknown: BK-9007', () => {
    const out = summarizeCases({ ...merged, tasks: [] }, REFERENCE_DATE)
    const unknown = out.filter((s) => s.unknown).map((s) => s.bookingId)
    expect(unknown.filter((id) => id.startsWith('BK-9'))).toEqual(['BK-9007'])
  })

  it('keeps live bookings a minority of the book', () => {
    const f = forecast(merged, REFERENCE_DATE)
    expect(f.liveBookings).toBeGreaterThan(0)
    expect(f.liveBookings).toBeLessThanOrEqual(Math.ceil(merged.bookings.length / 2))
  })
})

describe('staff and assumptions', () => {
  it('names one staff member per persona', () => {
    expect(PERSONA_STAFF['sales-admin'].name).toBe('Nurul Aina')
    expect(PERSONA_STAFF['loan-admin'].name).toBe('Tan Mei Ling')
    expect(PERSONA_STAFF.finance.name).toBe('Arvind Raj')
  })

  it('tags every number the simulation uses', () => {
    const keys = new Set(DEFAULT_ASSUMPTIONS.map((x: Assumption) => x.key))
    for (const key of ['approvalRate', 'dsrCap', 'interestRateAnnual', 'marginOfFinancingCap', 'unknownAfterDays']) {
      expect(keys.has(key)).toBe(true)
    }
    for (const x of DEFAULT_ASSUMPTIONS) {
      expect(x.label.length).toBeGreaterThan(0)
      expect(x.source.length).toBeGreaterThan(0)
      expect(x.min).toBeLessThanOrEqual(x.value)
      expect(x.value).toBeLessThanOrEqual(x.max)
    }
  })
})

describe('performance', () => {
  it('generates, summarizes and forecasts about 150 bookings in under 200 ms', () => {
    const start = Date.now()
    const ds = generate({ ...OPTIONS, bookings: 150 })
    const s = summarizeCases({ ...ds, tasks: [] }, REFERENCE_DATE)
    const f = forecast(ds, REFERENCE_DATE)
    const elapsed = Date.now() - start
    expect(s).toHaveLength(150)
    expect(f.liveBookings).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(200)
  })
})
