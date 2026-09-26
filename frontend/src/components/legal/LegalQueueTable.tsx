/**
 * The SPA execution queue — every case sitting between loan approval and a
 * signed SPA, longest wait first. Rows navigate to the case page.
 *
 * Every header sorts: a first click in the column's natural direction (names
 * A to Z, waits and values largest first, unset appointments first), a second
 * flips it, a third returns to longest wait first. Columns have fixed widths,
 * so a re-sort or a refresh never slides the headers.
 *
 * Days Since LO is the column the desk is really reading, so it carries the
 * only emphasis in the row: past the stall threshold it turns danger-coloured.
 * Everything else stays plain text, per DESIGN.md Screen Density — a pill on
 * every row would discriminate between nothing.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate, formatRm } from '@/components/case'
import { SortHeader, nextSort, type SortState } from '@/components/ui/SortHeader'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { LEGAL_FIRST_DIR, isLegalStall, sortLegalRows, type LegalRow, type LegalSortKey } from './legal'

/** Column widths in px, cell padding included; Buyer takes what is left. */
const WIDTHS = { booking: 96, unit: 100, firm: 210, days: 140, appointment: 230, value: 130 } as const

/** The note's raw `YYYY-MM-DD` reads as the house date format, e.g. `Appointment
 * On 2026-07-29` becomes `Appointment On 29 Jul 2026`; a note with no date, or
 * none at all, reads as-is (or "Not Set"). */
function displayAppointmentNote(note: string | null): string {
  if (!note) return 'Not Set'
  const isoDate = /\d{4}-\d{2}-\d{2}/.exec(note)?.[0]
  return isoDate ? note.replace(isoDate, formatDate(isoDate)) : note
}

const COLUMNS: { key: LegalSortKey; label: string; className?: string }[] = [
  { key: 'booking', label: 'Booking' },
  { key: 'unit', label: 'Unit' },
  { key: 'buyer', label: 'Buyer' },
  { key: 'firm', label: 'Firm' },
  { key: 'days', label: 'Days Since LO', className: 'text-right' },
  { key: 'appointment', label: 'SPA Appointment' },
  { key: 'value', label: 'Value', className: 'text-right' }
]

export function LegalQueueTable({ rows }: { rows: LegalRow[] }) {
  const navigate = useNavigate()
  const [sort, setSort] = useState<SortState<LegalSortKey>>(null)
  const sorted = useMemo(() => sortLegalRows(rows, sort), [rows, sort])

  return (
    <Table className="min-w-[960px] table-fixed [&_td]:px-3 [&_th]:px-3">
      <colgroup>
        <col style={{ width: WIDTHS.booking }} />
        <col style={{ width: WIDTHS.unit }} />
        <col />
        <col style={{ width: WIDTHS.firm }} />
        <col style={{ width: WIDTHS.days }} />
        <col style={{ width: WIDTHS.appointment }} />
        <col style={{ width: WIDTHS.value }} />
      </colgroup>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((column) => (
            <SortHeader
              key={column.key}
              label={column.label}
              columnKey={column.key}
              sort={sort}
              onSort={(key) => setSort((current) => nextSort(current, key, LEGAL_FIRST_DIR[key]))}
              className={column.className}
            />
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(({ booking, summary, appointmentNote }) => {
          const flagged = summary.stallReasons.some(isLegalStall)
          return (
            <TableRow
              key={booking.id}
              tabIndex={0}
              aria-label={`Open Booking ${booking.id}`}
              className="cursor-pointer"
              onClick={() => navigate(`/bookings/${booking.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/bookings/${booking.id}`)
                }
              }}
            >
              <TableCell className="font-medium">{booking.id}</TableCell>
              <TableCell>{booking.unit}</TableCell>
              <TableCell className="truncate">{booking.buyer.name}</TableCell>
              <TableCell className="truncate text-muted-foreground">{booking.legalFirm}</TableCell>
              <TableCell
                className={cn('text-right tabular-nums', flagged ? 'font-semibold text-status-danger-fg' : undefined)}
              >
                {summary.daysSinceLoIssued ?? '—'}
              </TableCell>
              <TableCell className="truncate text-muted-foreground">
                {displayAppointmentNote(appointmentNote)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatRm(booking.priceRm)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
