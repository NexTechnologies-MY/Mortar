import type { Backtest, Dataset, Forecast, IsoDate, StageRate } from '../types'
import { deriveCase, FUNNEL_STAGES, groupBy, type CaseFacts } from './cases'
import { dateOf, diffDays } from './dates'
import { createRng } from './random'
import { DEFAULT_SEED, HORIZON_DAYS } from './constants'

/** Wilson score interval at 95% (Brown, Cai and DasGupta 2001). */
export function wilsonInterval(signed: number, n: number, z = 1.96): { low: number; high: number } {
  if (n <= 0) return { low: 0, high: 1 }
  const p = signed / n
  const z2 = z * z
  const denom = 1 + z2 / n
  const centre = (p + z2 / (2 * n)) / denom
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom
  return { low: Math.max(0, centre - half), high: Math.min(1, centre + half) }
}

const SMALL_SAMPLE = 8

interface RateCell {
  signed: number
  n: number
}

interface RateModel {
  /** Key `${stageRank}:${ageBucket}` — resolved bookings by the age they entered that stage. */
  groups: Map<string, RateCell>
  stages: RateCell[]
  overall: RateCell
}

const bucketOf = (age: number) => (age < 10 ? 0 : age < 20 ? 1 : age < 30 ? 2 : -1)

function buildModel(facts: CaseFacts[]): { model: RateModel; live: CaseFacts[] } {
  const groups = new Map<string, RateCell>()
  const stages: RateCell[] = FUNNEL_STAGES.map(() => ({ signed: 0, n: 0 }))
  const overall: RateCell = { signed: 0, n: 0 }
  const live: CaseFacts[] = []
  for (const f of facts) {
    if (!f.exists) continue
    if (f.live) {
      live.push(f)
      continue
    }
    const hit = f.signedWithinHorizon ? 1 : 0
    overall.n += 1
    overall.signed += hit
    for (let r = 0; r < FUNNEL_STAGES.length; r += 1) {
      const entry = f.enteredAges[r]
      if (entry === null) continue
      stages[r].n += 1
      stages[r].signed += hit
      const b = bucketOf(entry)
      if (b >= 0) {
        const cell = groups.get(`${r}:${b}`) ?? { signed: 0, n: 0 }
        cell.n += 1
        cell.signed += hit
        groups.set(`${r}:${b}`, cell)
      }
    }
  }
  return { model: { groups, stages, overall }, live }
}

/**
 * Share of resolved bookings that reached this stage at a similar age and
 * signed within the horizon. Falls back to stage-only under 8 cases, then the
 * overall rate.
 */
function probability(f: CaseFacts, model: RateModel): number {
  const r = Math.max(0, f.funnelRank)
  const entry = f.enteredAges[r] ?? 0
  const cell = model.groups.get(`${r}:${bucketOf(entry)}`)
  if (cell && cell.n >= SMALL_SAMPLE) return cell.signed / cell.n
  const stage = model.stages[r]
  if (stage.n >= SMALL_SAMPLE) return stage.signed / stage.n
  return model.overall.n > 0 ? model.overall.signed / model.overall.n : 0
}

function factsFor(data: Dataset, asOf: IsoDate): CaseFacts[] {
  const appsByBooking = groupBy(data.applications, (x) => x.bookingId)
  const eventsByBooking = groupBy(data.events, (x) => x.bookingId)
  return data.bookings.map((b) => deriveCase(b, appsByBooking.get(b.id) ?? [], eventsByBooking.get(b.id) ?? [], asOf))
}

/** Expected signings within the horizon for live bookings, with a range from repeated draws. */
export function forecast(data: Dataset, asOf: IsoDate, options: { draws?: number; seed?: number } = {}): Forecast {
  const { draws = 2000, seed = DEFAULT_SEED } = options
  const { model, live } = buildModel(factsFor(data, asOf))
  const perBooking = live.map((f) => ({ bookingId: f.booking.id, probability: probability(f, model) }))
  const expectedSignings = perBooking.reduce((s, p) => s + p.probability, 0)
  const rng = createRng(seed)
  const counts = new Array<number>(draws).fill(0)
  for (let d = 0; d < draws; d += 1) {
    let c = 0
    for (const p of perBooking) if (rng.next() < p.probability) c += 1
    counts[d] = c
  }
  counts.sort((a, b) => a - b)
  const stageRates: StageRate[] = FUNNEL_STAGES.map((stage, r) => {
    const { signed, n } = model.stages[r]
    const { low, high } = wilsonInterval(signed, n)
    return { stage, signed, resolved: n, rate: n > 0 ? signed / n : 0, low, high }
  })
  return {
    asOf,
    horizonDays: HORIZON_DAYS,
    liveBookings: live.length,
    expectedSignings,
    rangeLow: counts[Math.floor(0.1 * (draws - 1))],
    rangeHigh: counts[Math.floor(0.9 * (draws - 1))],
    stageRates,
    perBooking
  }
}

const CALIBRATION_BUCKETS = [
  { bucket: '0–25%', lo: 0, hi: 0.25 },
  { bucket: '25–50%', lo: 0.25, hi: 0.5 },
  { bucket: '50–75%', lo: 0.5, hi: 0.75 },
  { bucket: '75–100%', lo: 0.75, hi: 1.01 }
] as const

/** Cut the log at `cutoff`, estimate from what was known then, and score the next horizon. */
export function backtest(data: Dataset, cutoff: IsoDate): Backtest {
  const filtered: Dataset = {
    bookings: data.bookings,
    applications: data.applications,
    events: data.events.filter((e) => dateOf(e.recordedAt) <= cutoff)
  }
  const { model, live } = buildModel(factsFor(filtered, cutoff))
  const eventsByBooking = groupBy(data.events, (x) => x.bookingId)
  const observed = (f: CaseFacts): number => {
    const signed = (eventsByBooking.get(f.booking.id) ?? []).find(
      (e) => e.status === 'confirmed' && e.kind === 'spa_signed'
    )
    return signed !== undefined && diffDays(f.booking.bookingDate, dateOf(signed.occurredAt)) <= HORIZON_DAYS ? 1 : 0
  }
  const rows = live.map((f) => ({ p: probability(f, model), o: observed(f) }))
  const predicted = rows.reduce((s, r) => s + r.p, 0)
  const observedCount = rows.reduce((s, r) => s + r.o, 0)
  const brier = rows.length > 0 ? rows.reduce((s, r) => s + (r.p - r.o) * (r.p - r.o), 0) / rows.length : 0
  const calibration = CALIBRATION_BUCKETS.map(({ bucket, lo, hi }) => {
    const inBucket = rows.filter((r) => r.p >= lo && r.p < hi)
    return {
      bucket,
      n: inBucket.length,
      predicted: inBucket.length > 0 ? inBucket.reduce((s, r) => s + r.p, 0) / inBucket.length : 0,
      observed: inBucket.length > 0 ? inBucket.reduce((s, r) => s + r.o, 0) / inBucket.length : 0
    }
  })
  return { cutoff, predicted, observed: observedCount, brier, calibration }
}
