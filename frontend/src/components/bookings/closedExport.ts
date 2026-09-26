/**
 * Closed-cases export (issue #23) — retention keeps every closed booking for
 * seven years (docs/TRD.md, Data Retention), so Closed never deletes a row; this is the
 * record a desk can pull out of Mortar for that file. Row-building is pure
 * and DOM/network-free so it is unit-testable on its own; only
 * `downloadClosedExport` touches the browser, and it lazy-loads
 * `write-excel-file/browser` the same way `readSheetFile.ts` lazy-loads
 * `read-excel-file/browser`, so the library stays out of every other page's
 * bundle. Never includes IC or phone — this is a closed-case ledger, not a
 * buyer contact list.
 */
import type { Booking, CaseEvent, CaseSummary, Stage } from '@mortar/core'
import { STAGE_LABELS } from '@/components/case/StagePill'

export interface ClosedExportRow {
  booking: string
  unit: string
  project: string
  buyer: string
  finalStage: string
  /** `YYYY-MM-DD` the confirmed exit event was recorded; `null` when the log carries none. */
  closedOn: string | null
  valueRm: number
  bank: string
  solicitor: string
  salesAgent: string
  loanOfficer: string
}

/** The event kind that closes each closed stage, so its confirmed date becomes "Closed On". */
const CLOSING_KIND: Partial<Record<Stage, CaseEvent['kind']>> = {
  disbursed: 'disbursed',
  cancelled: 'cancelled',
  lapsed: 'lapsed'
}

/** The day a closed booking's exit event was confirmed; `null` when none is on the log. */
function closedOnDate(bookingId: string, stage: Stage, events: readonly CaseEvent[]): string | null {
  const kind = CLOSING_KIND[stage]
  if (!kind) return null
  const matches = events.filter((e) => e.bookingId === bookingId && e.kind === kind && e.status === 'confirmed')
  if (matches.length === 0) return null
  // Most recent wins on the rare chance more than one confirmed exit event exists.
  return matches.reduce((latest, e) => (e.occurredAt > latest.occurredAt ? e : latest)).occurredAt.slice(0, 10)
}

/** The bank an export row credits: the approved application's, else the last one's, else blank. */
function exportBank(summary: CaseSummary): string {
  const approved = summary.applications.find((a) => a.status === 'approved')
  if (approved) return approved.bank
  const last = summary.applications[summary.applications.length - 1]
  return last ? last.bank : ''
}

/**
 * Builds one export row per closed booking, in the order given. Pure: no DOM,
 * no network, so it can be unit-tested without loading the xlsx writer.
 */
export function buildClosedExportRows(
  cases: readonly { booking: Booking; summary: CaseSummary }[],
  events: readonly CaseEvent[]
): ClosedExportRow[] {
  return cases.map(({ booking, summary }) => ({
    booking: booking.id,
    unit: booking.unit,
    project: booking.project,
    buyer: booking.buyer.name,
    finalStage: STAGE_LABELS[summary.stage],
    closedOn: closedOnDate(booking.id, summary.stage, events),
    valueRm: booking.priceRm,
    bank: exportBank(summary),
    solicitor: booking.legalFirm,
    salesAgent: booking.salesOwner,
    loanOfficer: booking.loanOwner
  }))
}

const header = (value: string) => ({ value, fontWeight: 'bold' as const })

/** `YYYY-MM-DD` to a UTC-midnight `Date`, matching how the booking template writes date cells. */
function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/**
 * Writes and downloads `mortar-closed-cases-<referenceDate>.xlsx` in the
 * browser: a bold header row, then one row per closed booking. `write-excel-file`
 * loads only when this runs, so it never reaches a bundle that does not export.
 */
export async function downloadClosedExport(rows: readonly ClosedExportRow[], referenceDate: string): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser')
  await writeXlsxFile(rows as ClosedExportRow[], {
    sheet: 'Closed Cases',
    columns: [
      { header: header('Booking'), width: 12, cell: (r: ClosedExportRow) => r.booking },
      { header: header('Unit'), width: 12, cell: (r: ClosedExportRow) => r.unit },
      { header: header('Project'), width: 20, cell: (r: ClosedExportRow) => r.project },
      { header: header('Buyer'), width: 26, cell: (r: ClosedExportRow) => r.buyer },
      { header: header('Final Stage'), width: 14, cell: (r: ClosedExportRow) => r.finalStage },
      {
        header: header('Closed On'),
        width: 14,
        cell: (r: ClosedExportRow) =>
          // House date format (DESIGN.md Data Formats): `31 May 2026`, not `31/05/2026` (issue L11).
          r.closedOn ? { value: isoToDate(r.closedOn), type: Date, format: 'd mmm yyyy' } : ''
      },
      {
        header: header('Value (RM)'),
        width: 14,
        cell: (r: ClosedExportRow) => ({ value: r.valueRm, type: Number, format: '#,##0' })
      },
      { header: header('Bank'), width: 20, cell: (r: ClosedExportRow) => r.bank },
      { header: header('Solicitor'), width: 24, cell: (r: ClosedExportRow) => r.solicitor },
      { header: header('Sales Agent'), width: 18, cell: (r: ClosedExportRow) => r.salesAgent },
      { header: header('Loan Officer'), width: 18, cell: (r: ClosedExportRow) => r.loanOfficer }
    ]
  }).toFile(`mortar-closed-cases-${referenceDate}.xlsx`)
}
