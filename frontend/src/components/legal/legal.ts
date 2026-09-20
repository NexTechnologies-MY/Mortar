/**
 * Legal-desk derivations: the SPA execution queue and the load each panel firm
 * is carrying. Kept component-free so the page and its tests share them.
 *
 * The queue is every case sitting at `lo_issued` — loan approved, SPA unsigned.
 * It deliberately ignores the 30-day forecast horizon: the cases worth showing
 * a legal admin are precisely the ones that have sat longest.
 */

import type { Booking, CaseEvent, CaseSummary } from '@mortar/core'

export interface LegalRow {
  booking: Booking
  summary: CaseSummary
  /** The note the appointment event carried, e.g. `Appointment On 2026-08-20`. Display only. */
  appointmentNote: string | null
}

/** True when a stall reason came from the legal rules rather than the loan ones. */
export function isLegalStall(reason: string): boolean {
  return reason.startsWith('SPA ')
}

/**
 * Cases in the legal waiting room, longest wait first. Ties break on value, so
 * two cases that have sat the same number of days rank by what they hold up.
 */
export function legalQueue(bookings: Booking[], cases: CaseSummary[], events: CaseEvent[]): LegalRow[] {
  const byId = new Map(bookings.map((b) => [b.id, b]))
  const notes = new Map<string, string>()
  for (const e of events) {
    if (e.kind === 'spa_appointment_set' && e.status === 'confirmed' && e.note) notes.set(e.bookingId, e.note)
  }
  return cases
    .filter((c) => c.stage === 'lo_issued')
    .flatMap((summary) => {
      const booking = byId.get(summary.bookingId)
      if (!booking) return []
      return [{ booking, summary, appointmentNote: notes.get(summary.bookingId) ?? null }]
    })
    .sort(
      (a, b) =>
        (b.summary.daysSinceLoIssued ?? 0) - (a.summary.daysSinceLoIssued ?? 0) || b.booking.priceRm - a.booking.priceRm
    )
}

export interface FirmLoad {
  firm: string
  /** Cases in the waiting room with this firm. */
  awaiting: number
  /** Median days since LO across those cases. */
  medianDays: number
  /** Sum of their booking prices. */
  valueRm: number
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
}

/**
 * What each panel firm is holding right now, heaviest first.
 *
 * This is a load table, not a league table. The generator assigns firms by a
 * uniform draw, so a difference between two firms here is the luck of the seed
 * rather than a difference in how they work. Read it as "who is holding what",
 * never as "who is slow".
 */
export function firmLoad(rows: LegalRow[]): FirmLoad[] {
  const groups = new Map<string, LegalRow[]>()
  for (const row of rows) {
    const list = groups.get(row.booking.legalFirm)
    if (list) list.push(row)
    else groups.set(row.booking.legalFirm, [row])
  }
  return [...groups.entries()]
    .map(([firm, group]) => ({
      firm,
      awaiting: group.length,
      medianDays: median(group.map((r) => r.summary.daysSinceLoIssued ?? 0)),
      valueRm: group.reduce((sum, r) => sum + r.booking.priceRm, 0)
    }))
    .sort((a, b) => b.awaiting - a.awaiting || b.valueRm - a.valueRm)
}
