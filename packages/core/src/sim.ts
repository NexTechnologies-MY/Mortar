/**
 * Simulation, case derivation, financing risk and forecasting (lane W1).
 * Signatures are part of the contract; internals sit under ./sim/.
 */
import type {
  Assumption,
  Backtest,
  Booking,
  CaseSummary,
  Dataset,
  FinancingRisk,
  Forecast,
  IsoDate,
  IsoDateTime,
  Task
} from './types'
import { DEFAULT_ASSUMPTIONS } from './sim/assumptions'
import { summarizeCases as summarize } from './sim/cases'
import { forecast as runForecast, backtest as runBacktest } from './sim/forecast'
import { generateDataset } from './sim/generate'
import { financingRiskFor } from './sim/risk'

export { DEFAULT_SEED, REFERENCE_DATE, HORIZON_DAYS, PERSONA_STAFF } from './sim/constants'
export { leakage } from './sim/leakage'
export type { Leakage, LeakageCause, RecoveryEstimate } from './sim/leakage'
export { DEFAULT_ASSUMPTIONS }

export interface GeneratorOptions {
  seed: number
  referenceDate: IsoDate
  /** Generated bookings, excluding story fixtures. */
  bookings: number
  /** Overrides by `Assumption.key`. */
  assumptions?: Record<string, number>
}

export type CaseData = Dataset & { tasks: Task[] }

/** Seeded stage-transition Monte Carlo: the same options always give the same dataset. */
export function generate(options: GeneratorOptions): Dataset {
  return generateDataset(options)
}

/** The reference date with the current wall-clock time, in +08:00. Live writes use this. */
export function simNow(referenceDate: IsoDate, clock: Date = new Date()): IsoDateTime {
  const shifted = new Date(clock.getTime() + 8 * 3_600_000)
  return `${referenceDate}T${shifted.toISOString().slice(11, 19)}+08:00`
}

/** Stage, evidence recency, applications, outstanding documents, risk and stall reasons per booking. */
export function summarizeCases(
  data: CaseData,
  asOf: IsoDate,
  assumptions: Assumption[] = DEFAULT_ASSUMPTIONS
): CaseSummary[] {
  return summarize(data, asOf, assumptions)
}

export function financingRisk(booking: Booking, assumptions: Assumption[] = DEFAULT_ASSUMPTIONS): FinancingRisk {
  return financingRiskFor(booking, assumptions)
}

/** Expected signings within the horizon for live bookings, with a range from repeated draws. */
export function forecast(data: Dataset, asOf: IsoDate, options: { draws?: number; seed?: number } = {}): Forecast {
  return runForecast(data, asOf, options)
}

/** Cut the log at `cutoff`, estimate from what was known then, and score the next horizon. */
export function backtest(data: Dataset, cutoff: IsoDate): Backtest {
  return runBacktest(data, cutoff)
}
