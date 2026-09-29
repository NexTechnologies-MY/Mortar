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
  ForecastModel,
  IsoDate,
  IsoDateTime,
  Task
} from './types'
import { DEFAULT_SEED } from './sim/constants'
import { DEFAULT_ASSUMPTIONS } from './sim/assumptions'
import { summarizeCases as summarize } from './sim/cases'
import { forecast as runForecast, backtest as runBacktest, buildForecastModel } from './sim/forecast'
import { generateDataset } from './sim/generate'
import { financingRiskFor } from './sim/risk'
import { addDays } from './sim/dates'

export { DEFAULT_SEED, REFERENCE_DATE, HORIZON_DAYS, PERSONA_STAFF } from './sim/constants'
export { PROJECT_NAME } from './sim/names'
export { leakage } from './sim/leakage'
export { byOccurred } from './sim/cases'
export { FUNNEL_STAGES } from './sim/cases'
export type { Leakage, LeakageCause, RecoveryEstimate } from './sim/leakage'
export { DEFAULT_ASSUMPTIONS }
export { buildForecastModel }

export interface GeneratorOptions {
  seed: number
  referenceDate: IsoDate
  /** Generated bookings, excluding story fixtures. */
  bookings: number
  /** Overrides by `Assumption.key`. */
  assumptions?: Record<string, number>
}

const CANONICAL_DEMO_BOOKINGS = 140
const FARAH_OVERDUE_EXAMPLE_ID = 'BK-0017'

/** Keep a second Sales Admin overdue example in the shipped demo seed only. */
function addFarahOverdueExample(dataset: Dataset, referenceDate: IsoDate): Dataset {
  const booking = dataset.bookings.find((candidate) => candidate.id === FARAH_OVERDUE_EXAMPLE_ID)
  if (!booking || booking.salesOwner !== 'Farah Izzati') return dataset

  const bookingEvents = dataset.events.filter((event) => event.bookingId === booking.id)
  const lastEvent = bookingEvents[bookingEvents.length - 1]
  if (!lastEvent || lastEvent.kind !== 'buyer_contacted') return dataset

  const overdueDate = addDays(referenceDate, -20)
  const updateDate = (dateTime: IsoDateTime) => `${overdueDate}${dateTime.slice(10)}`
  return {
    ...dataset,
    events: dataset.events.map((event) =>
      event.id === lastEvent.id
        ? { ...event, occurredAt: updateDate(event.occurredAt), recordedAt: updateDate(event.recordedAt) }
        : event
    )
  }
}

/** Keep three sales-held Today cards with an Overdue pill for each admin in the canonical seed. */
function addSalesTodayOverdueExamples(dataset: Dataset, referenceDate: IsoDate): Dataset {
  const overdueDate = addDays(referenceDate, -10)
  const shiftDate = (dateTime: IsoDateTime, days: number) =>
    `${addDays(dateTime.slice(0, 10), days)}${dateTime.slice(10)}`

  return {
    ...dataset,
    bookings: dataset.bookings.map((booking) => {
      if (booking.id === 'BK-0016') return { ...booking, bookingDate: addDays(booking.bookingDate, -5) }
      if (booking.id === 'BK-0025') return { ...booking, bookingDate: addDays(booking.bookingDate, -10) }
      return booking
    }),
    events: dataset.events.map((event) => {
      if (event.bookingId === 'BK-0016' || event.bookingId === 'BK-0025') {
        const days = event.bookingId === 'BK-0016' ? -5 : -10
        return {
          ...event,
          occurredAt: shiftDate(event.occurredAt, days),
          recordedAt: shiftDate(event.recordedAt, days)
        }
      }

      if (event.bookingId === 'BK-0022' && event.occurredAt.slice(0, 10) > overdueDate) {
        return {
          ...event,
          occurredAt: shiftDate(event.occurredAt, -10),
          recordedAt: shiftDate(event.recordedAt, -10)
        }
      }

      if (event.bookingId === 'BK-0066' && event.kind === 'loan_rejected') {
        return {
          ...event,
          occurredAt: shiftDate(event.occurredAt, -10),
          recordedAt: shiftDate(event.recordedAt, -10)
        }
      }

      return event
    })
  }
}

export type CaseData = Dataset & { tasks: Task[] }

/** Seeded stage-transition Monte Carlo: the same options always give the same dataset. */
export function generate(options: GeneratorOptions): Dataset {
  const dataset = generateDataset(options)
  if (options.seed !== DEFAULT_SEED || options.bookings !== CANONICAL_DEMO_BOOKINGS) return dataset
  return addSalesTodayOverdueExamples(addFarahOverdueExample(dataset, options.referenceDate), options.referenceDate)
}

/**
 * The reference date with the current wall-clock time, in +08:00. Live writes
 * use this. The date never moves, so at midnight Malaysia time the result
 * falls back to 00:00: never time a duration by it, or order rows by it alone.
 */
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
export function forecast(
  data: Dataset,
  asOf: IsoDate,
  options: { draws?: number; seed?: number; model?: ForecastModel } = {}
): Forecast {
  return runForecast(data, asOf, options)
}

/** Cut the log at `cutoff`, estimate from what was known then, and score the next horizon. */
export function backtest(data: Dataset, cutoff: IsoDate): Backtest {
  return runBacktest(data, cutoff)
}
