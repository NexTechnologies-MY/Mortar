/**
 * The SPA execution queue — every case sitting between loan approval and a
 * signed SPA, longest wait first. Rows navigate to the case page, and each
 * carries the one update a legal admin makes on it most, so the case page is
 * never in the way.
 *
 * Every header sorts: a first click in the column's natural direction (names
 * A to Z, waits and values largest first, unset appointments first), a second
 * flips it, a third returns to longest wait first. Columns have fixed widths
 * and the two long headers wrap, so a header never runs into its neighbour at
 * either desktop width.
 *
 * The appointment cell carries the date alone: the column header already says
 * SPA Appointment, so the cell never repeats it.
 *
 * Days Since Loan Approved is the column the desk is really reading, so it
 * carries the only emphasis in the row: past the stall threshold it turns
 * danger-coloured. In the set-but-unsigned queue, an appointment whose date
 * has passed says so in the danger tone, because that is the case to chase.
 * Everything else stays plain text, per DESIGN.md Screen Density — a pill on
 * every row would discriminate between nothing.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate, formatRm } from '@/components/case'
import { Button } from '@/components/ui/button'
import { SortHeader, nextSort, type SortState } from '@/components/ui/SortHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  RecordLegalUpdateDialog,
  LEGAL_UPDATES,
  type LegalUpdateKind
} from '@/components/legal/RecordLegalUpdateDialog'
import { LEGAL_FIRST_DIR, isLegalStall, sortLegalRows, type LegalRow, type LegalSortKey } from './legal'

/**
 * Column widths in px, cell padding included; Buyer takes what is left. The two
 * long headers wrap onto two lines rather than widening the table, which is what
 * used to run "Days Since Loan Approved" into "SPA Appointment" at 1440 px.
 *
 * Firm, action and appointment are sized to their widest real content, so no
 * cell in them truncates or spills at either desktop width: `Kuan & Teh
 * Advocates` and `Wong Rahman Chambers` are both 20 characters and need 172px
 * of 14px text, and `Record Appointment` needs 152px inside a button that
 * carries its own 24px of padding. The appointment cell carries the date alone,
 * so it needs far less room than the note it used to repeat. Buyer is the
 * column that used to hold a wide empty gap, so the slack went to the columns
 * that were cutting their text.
 */
const WIDTHS = { booking: 88, unit: 88, firm: 200, days: 132, appointment: 176, action: 208, value: 112 } as const

/** Every fixed column except Buyer, whose width is whatever is left over. */
const FIXED_WIDTH = Object.values(WIDTHS).reduce((total, width) => total + width, 0)

/** The narrowest the table may be: every fixed column plus a Buyer worth reading. */
const MIN_BUYER_WIDTH = 160
const TABLE_MIN_WIDTH = FIXED_WIDTH + MIN_BUYER_WIDTH

/** The appointment's date as the note carries it, `null` when none is set. */
function appointmentDate(note: string | null): string | null {
  return /\d{4}-\d{2}-\d{2}/.exec(note ?? '')?.[0] ?? null
}

const COLUMNS: { key: LegalSortKey | 'action'; label: string; className?: string }[] = [
  { key: 'booking', label: 'Booking' },
  { key: 'unit', label: 'Unit' },
  { key: 'buyer', label: 'Buyer' },
  { key: 'firm', label: 'Firm' },
  { key: 'days', label: 'Days Since Loan Approved', className: 'text-right' },
  { key: 'appointment', label: 'SPA Appointment' },
  { key: 'action', label: 'Record' },
  { key: 'value', label: 'Value', className: 'text-right' }
]

export function LegalQueueTable({
  rows,
  kind,
  referenceDate,
  reportedBy,
  onRecorded
}: {
  rows: LegalRow[]
  /** Which queue this is, and with it the update each row offers. */
  kind: LegalUpdateKind
  /** The desks' today: the default and latest day an update can carry. */
  referenceDate: string
  /** The staff name the update is recorded under. */
  reportedBy: string
  /** Re-reads the snapshot once an update is saved. */
  onRecorded: () => Promise<void>
}) {
  const navigate = useNavigate()
  const [sort, setSort] = useState<SortState<LegalSortKey>>(null)
  const sorted = useMemo(() => sortLegalRows(rows, sort), [rows, sort])
  const [recording, setRecording] = useState<LegalRow | null>(null)

  return (
    <>
      <Table className="table-fixed [&_td]:px-3 [&_th]:px-3" style={{ minWidth: TABLE_MIN_WIDTH }}>
        <colgroup>
          <col style={{ width: WIDTHS.booking }} />
          <col style={{ width: WIDTHS.unit }} />
          <col />
          <col style={{ width: WIDTHS.firm }} />
          <col style={{ width: WIDTHS.days }} />
          <col style={{ width: WIDTHS.appointment }} />
          <col style={{ width: WIDTHS.action }} />
          <col style={{ width: WIDTHS.value }} />
        </colgroup>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) =>
              column.key === 'action' ? (
                <TableHead key="action" className="px-3">
                  <span className="sr-only">Record An Update</span>
                </TableHead>
              ) : (
                <SortHeader
                  key={column.key}
                  label={column.label}
                  columnKey={column.key}
                  sort={sort}
                  onSort={(key) => setSort((current) => nextSort(current, key, LEGAL_FIRST_DIR[key]))}
                  className={cn(
                    column.className,
                    '[&>button]:whitespace-normal [&>button]:text-left [&>button]:leading-[14px]'
                  )}
                />
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => {
            const { booking, summary, appointmentNote } = row
            const flagged = summary.stallReasons.some(isLegalStall)
            // A set appointment whose date has passed with nothing signed is
            // the row a legal admin works next, so it says so.
            const appointment = appointmentDate(appointmentNote)
            const passed = Boolean(appointment && appointment < referenceDate)
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
                <TableCell className={cn(passed ? 'font-semibold text-status-danger-fg' : 'text-muted-foreground')}>
                  {passed ? `Was On ${formatDate(appointment!)}` : appointment ? formatDate(appointment) : 'Not Set'}
                </TableCell>
                <TableCell>
                  {/* The row's own action, so a legal admin never has to open
                      the case to write down the call they just took. */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setRecording(row)
                    }}
                  >
                    {LEGAL_UPDATES[kind].label}
                  </Button>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatRm(booking.priceRm)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {recording && (
        <RecordLegalUpdateDialog
          open
          onOpenChange={(next) => {
            if (!next) setRecording(null)
          }}
          booking={recording.booking}
          kind={kind}
          summary={recording.summary}
          referenceDate={referenceDate}
          reportedBy={reportedBy}
          onRecorded={async () => {
            await onRecorded()
            setRecording(null)
          }}
        />
      )}
    </>
  )
}
