/**
 * Where bookings die, ranked by what they cost, and how much of it was
 * recoverable. The forecast answers what will sign; this answers what did not,
 * and why. Both read the same event log, so the two halves cannot disagree.
 *
 * Every figure here is counted from confirmed events. Nothing is estimated
 * except `recoverableUnits`, which is stated as a rate times a count so the
 * arithmetic is visible on the screen rather than asserted.
 */

import type { CaseEvent, Dataset, IsoDate } from '../types'
import { deriveCase, groupBy } from './cases'
import { wilsonInterval } from './forecast'

export interface LeakageCause {
  /** Plain-language cause, already in the Title Case the screens use. */
  cause: string
  units: number
  valueRm: number
  /** Share of total leaked value, 0–1. */
  share: number
}

export interface RecoveryEstimate {
  /** Dead bookings that took a rejection and never went to a second bank. */
  missedUnits: number
  missedValueRm: number
  /** Of resolved cases that did resubmit after a rejection, the share that signed. */
  secondBankRate: number
  /** How many resolved cases that rate was measured over. Small; read with the interval. */
  secondBankSample: number
  /** Wilson 95% interval on `secondBankRate`, as the stage rates carry. */
  rateLow: number
  rateHigh: number
  /** `missedUnits * secondBankRate`, rounded to one decimal. */
  recoverableUnits: number
  recoverableValueRm: number
  /** The same estimate at each end of the interval, so the claim is never a bare point. */
  recoverableUnitsLow: number
  recoverableUnitsHigh: number
  recoverableValueLowRm: number
  recoverableValueHighRm: number
  /** Still alive, rejected, no second submission: the set to act on today. */
  liveBookingIds: string[]
  liveValueRm: number
}

export interface Leakage {
  asOf: IsoDate
  deadUnits: number
  deadValueRm: number
  /** Days those dead bookings held a unit off the market, summed. */
  unitDaysHeld: number
  medianDaysHeld: number
  causes: LeakageCause[]
  recovery: RecoveryEstimate
}

/**
 * Root-cause order. A booking that took a rejection and then saw the buyer walk
 * is counted against the rejection, because that is what set the rest in
 * motion. The order is a judgement, stated here rather than buried, and it is
 * the only judgement in this module.
 */
const CAUSE_RULES: { cause: string; hit: (kinds: ReadonlySet<CaseEvent['kind']>) => boolean }[] = [
  { cause: 'Loan Rejected', hit: (k) => k.has('loan_rejected') },
  { cause: 'Buyer Withdrew', hit: (k) => k.has('buyer_withdrew') },
  { cause: 'Valuation Shortfall', hit: (k) => k.has('valuation_shortfall') },
  { cause: 'Buyer Went Hesitant', hit: (k) => k.has('buyer_hesitant') },
  { cause: 'Documents Never Returned', hit: (k) => k.has('documents_requested') && !k.has('documents_received') },
  { cause: 'Approved Then Stalled', hit: (k) => k.has('loan_approved') },
  { cause: 'No Bank Decision', hit: (k) => k.has('loan_submitted') }
]

const SETTLED_RANKS = new Set(['spa_signed', 'loan_agreement', 'disbursed'])

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
}

/** True once a case reached a signed SPA or anything past it. */
function signed(stage: string): boolean {
  return SETTLED_RANKS.has(stage)
}

/** Why bookings died and what a second bank submission would have been worth. */
export function leakage(data: Dataset, asOf: IsoDate): Leakage {
  const appsByBooking = groupBy(data.applications, (x) => x.bookingId)
  const eventsByBooking = groupBy(data.events, (x) => x.bookingId)

  const dead: { id: string; priceRm: number; heldDays: number; kinds: Set<CaseEvent['kind']>; apps: number }[] = []
  let retriedResolved = 0
  let retriedSigned = 0
  const liveRejectedNoRetry: { id: string; priceRm: number }[] = []

  for (const booking of data.bookings) {
    const apps = appsByBooking.get(booking.id) ?? []
    const events = eventsByBooking.get(booking.id) ?? []
    const facts = deriveCase(booking, apps, events, asOf)
    if (!facts.exists) continue

    const confirmed = events.filter((e) => e.status === 'confirmed')
    const rejected = confirmed.some((e) => e.kind === 'loan_rejected')
    const retried = apps.length > 1

    // The second-bank base rate is measured over resolved cases only. Counting
    // cases still in play would drag the rate down with outcomes not yet known.
    if (rejected && retried && (facts.terminal !== null || signed(facts.stage))) {
      retriedResolved += 1
      if (signed(facts.stage)) retriedSigned += 1
    }

    if (facts.terminal !== null) {
      dead.push({
        id: booking.id,
        priceRm: booking.priceRm,
        heldDays: facts.terminalAge ?? facts.ageDays,
        kinds: new Set(confirmed.map((e) => e.kind)),
        apps: apps.length
      })
    } else if (facts.open && rejected && !retried) {
      liveRejectedNoRetry.push({ id: booking.id, priceRm: booking.priceRm })
    }
  }

  const deadValueRm = dead.reduce((sum, d) => sum + d.priceRm, 0)
  const tally = new Map<string, { units: number; valueRm: number }>()
  for (const d of dead) {
    const cause = CAUSE_RULES.find((r) => r.hit(d.kinds))?.cause ?? 'No Signal Recorded'
    const cur = tally.get(cause) ?? { units: 0, valueRm: 0 }
    tally.set(cause, { units: cur.units + 1, valueRm: cur.valueRm + d.priceRm })
  }
  const causes: LeakageCause[] = [...tally.entries()]
    .map(([cause, v]) => ({ cause, ...v, share: deadValueRm === 0 ? 0 : v.valueRm / deadValueRm }))
    .sort((a, b) => b.valueRm - a.valueRm)

  const missed = dead.filter((d) => d.kinds.has('loan_rejected') && d.apps <= 1)
  const missedValueRm = missed.reduce((sum, d) => sum + d.priceRm, 0)
  const secondBankRate = retriedResolved === 0 ? 0 : retriedSigned / retriedResolved
  // n is small here — single digits on the canonical seed. The interval is not
  // decoration: it is the difference between a finding and a guess, and the
  // screen must show it beside the point estimate.
  const { low, high } = wilsonInterval(retriedSigned, retriedResolved)
  const units = (rate: number) => Math.round(missed.length * rate * 10) / 10

  return {
    asOf,
    deadUnits: dead.length,
    deadValueRm,
    unitDaysHeld: dead.reduce((sum, d) => sum + d.heldDays, 0),
    medianDaysHeld: median(dead.map((d) => d.heldDays)),
    causes,
    recovery: {
      missedUnits: missed.length,
      missedValueRm,
      secondBankRate,
      secondBankSample: retriedResolved,
      rateLow: low,
      rateHigh: high,
      recoverableUnits: units(secondBankRate),
      recoverableValueRm: Math.round(missedValueRm * secondBankRate),
      recoverableUnitsLow: units(low),
      recoverableUnitsHigh: units(high),
      recoverableValueLowRm: Math.round(missedValueRm * low),
      recoverableValueHighRm: Math.round(missedValueRm * high),
      liveBookingIds: liveRejectedNoRetry.map((b) => b.id),
      liveValueRm: liveRejectedNoRetry.reduce((sum, b) => sum + b.priceRm, 0)
    }
  }
}
