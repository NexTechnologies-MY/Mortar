/**
 * Legal-desk derivations: the SPA execution queue and the load each panel firm
 * is carrying. Kept component-free so the page and its tests share them.
 *
 * The queue is every case sitting at `lo_issued` with a letter of offer on the
 * log — loan approved, SPA unsigned.
 * It deliberately ignores the 30-day forecast horizon: the cases worth showing
 * a legal admin are precisely the ones that have sat longest.
 */

import type { Booking, CaseEvent, CaseSummary } from '@mortar/core'
import type { SortDir, SortState } from '@/components/ui/SortHeader'

export interface LegalRow {
  booking: Booking
  summary: CaseSummary
  /** The note the latest appointment event carried, e.g. `Appointment On 2026-08-20`. Display only. */
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
  // The latest confirmed appointment stands: a reschedule replaces the one before it.
  const appointments = new Map<string, CaseEvent>()
  for (const e of events) {
    if (e.kind !== 'spa_appointment_set' || e.status !== 'confirmed') continue
    const seen = appointments.get(e.bookingId)
    if (!seen || e.occurredAt >= seen.occurredAt) appointments.set(e.bookingId, e)
  }
  // A real letter of offer: the waiting room's clock starts at one.
  return cases
    .filter((c) => c.stage === 'lo_issued' && c.daysSinceLoIssued !== null)
    .flatMap((summary) => {
      const booking = byId.get(summary.bookingId)
      if (!booking) return []
      return [{ booking, summary, appointmentNote: appointments.get(summary.bookingId)?.note || null }]
    })
    .sort(
      (a, b) =>
        (b.summary.daysSinceLoIssued ?? 0) - (a.summary.daysSinceLoIssued ?? 0) || b.booking.priceRm - a.booking.priceRm
    )
}

/** Columns the legal queue sorts by. */
export type LegalSortKey = 'booking' | 'unit' | 'buyer' | 'firm' | 'days' | 'appointment' | 'value'

/** The direction a column sorts in first: names A to Z, waits and values largest first, unset appointments first. */
export const LEGAL_FIRST_DIR: Record<LegalSortKey, SortDir> = {
  booking: 'asc',
  unit: 'asc',
  buyer: 'asc',
  firm: 'asc',
  days: 'desc',
  appointment: 'asc',
  value: 'desc'
}

/** The appointment's date as written in its note, `''` when none is set, so unset ones sort first. */
function appointmentDate(row: LegalRow): string {
  return /\d{4}-\d{2}-\d{2}/.exec(row.appointmentNote ?? '')?.[0] ?? ''
}

function sortValue(row: LegalRow, key: LegalSortKey): string | number {
  switch (key) {
    case 'booking':
      return row.booking.id
    case 'unit':
      return row.booking.unit
    case 'buyer':
      return row.booking.buyer.name
    case 'firm':
      return row.booking.legalFirm
    case 'days':
      return row.summary.daysSinceLoIssued ?? 0
    case 'appointment':
      return appointmentDate(row)
    case 'value':
      return row.booking.priceRm
  }
}

/**
 * The queue in the reader's chosen order; `null` keeps `legalQueue`'s longest
 * wait first. Ties keep that default order, so a firm's cases still read
 * longest wait first.
 */
export function sortLegalRows(rows: LegalRow[], sort: SortState<LegalSortKey>): LegalRow[] {
  if (!sort) return rows
  const dir = sort.dir === 'asc' ? 1 : -1
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const va = sortValue(a.row, sort.key)
      const vb = sortValue(b.row, sort.key)
      const order =
        typeof va === 'number' && typeof vb === 'number' ? va - vb : collator.compare(String(va), String(vb))
      return order * dir || a.index - b.index
    })
    .map(({ row }) => row)
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
