/**
 * Simulation, case derivation, financing risk and forecasting (lane W1).
 * Signatures are part of the contract; the bodies below are placeholders.
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

/** The canonical demo seed. */
export const DEFAULT_SEED = 20260918
/** "Today" on every screen, so screenshots match the pitch video. */
export const REFERENCE_DATE: IsoDate = '2026-09-18'
/** Conversion means an SPA signed within this many days of booking. */
export const HORIZON_DAYS = 30

/** Every rate and threshold the simulation, risk flag and stall rule use, with its source tag. */
export const DEFAULT_ASSUMPTIONS: Assumption[] = []

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
  return notBuilt('generate', options)
}

/** The reference date with the current wall-clock time, in +08:00. Live writes use this. */
export function simNow(referenceDate: IsoDate, clock: Date = new Date()): IsoDateTime {
  return notBuilt('simNow', [referenceDate, clock])
}

/** Stage, evidence recency, applications, outstanding documents, risk and stall reasons per booking. */
export function summarizeCases(
  data: CaseData,
  asOf: IsoDate,
  assumptions: Assumption[] = DEFAULT_ASSUMPTIONS
): CaseSummary[] {
  return notBuilt('summarizeCases', [data, asOf, assumptions])
}

export function financingRisk(booking: Booking, assumptions: Assumption[] = DEFAULT_ASSUMPTIONS): FinancingRisk {
  return notBuilt('financingRisk', [booking, assumptions])
}

/** Expected signings within the horizon for live bookings, with a range from repeated draws. */
export function forecast(data: Dataset, asOf: IsoDate, options: { draws?: number; seed?: number } = {}): Forecast {
  return notBuilt('forecast', [data, asOf, options])
}

/** Cut the log at `cutoff`, estimate from what was known then, and score the next horizon. */
export function backtest(data: Dataset, cutoff: IsoDate): Backtest {
  return notBuilt('backtest', [data, cutoff])
}

function notBuilt(name: string, input: unknown): never {
  throw new Error(`@mortar/core ${name} is not built yet (${typeof input} input)`)
}
