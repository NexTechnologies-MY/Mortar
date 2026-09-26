/**
 * Bookings table — the streamlined ledger of every unit booking.
 * Columns: unit (with booking ID), buyer, age, stage, waiting on, risk,
 * value, and task. Rows navigate to the case page; the Waiting On cell
 * opens the quick view instead, so the table keeps its place.
 *
 * Chip economy (DESIGN.md Screen Density): a pill earns its place only when it
 * discriminates between rows. Stage and Waiting On are plain text at their
 * common values and only become a pill at the states worth noticing, so the
 * eye is not asked to scan a hundred near-white rectangles to find the one
 * that matters. Waiting On took the place of Last Update, which read "Up to
 * date" on nearly every row; a stuck case now says who holds it and how long
 * it has sat.
 *
 * Columns have fixed widths (table-layout: fixed), sized from the widest real
 * content across the seeded ledger. Buyer takes whatever width is left and truncates.
 *
 * Task, the last column, says whether anyone is already chasing the booking and
 * offers Add Task when nobody is (see TaskCell).
 */

import { useNavigate } from 'react-router-dom'
import {
  ballInCourt,
  type Booking,
  type BuyerSignals,
  type CaseSummary,
  type EventKind,
  type Stage,
  type Task
} from '@mortar/core'
import { RiskChip } from '@/components/case/RiskChip'
import { StagePill } from '@/components/case/StagePill'
import { STAGE_LABELS } from '@/components/case/StagePill'
import { formatDays, formatRm } from '@/components/case/format'
import { StageTracker } from './StageTracker'
import { TaskCell } from './TaskCell'
import { WaitingOnCell } from './WaitingOn'
import { SortHeader, type SortDir, type SortState } from '@/components/ui/SortHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { usePersonaSafe } from '@/lib/persona'

export interface BookingRow {
  booking: Booking
  summary: CaseSummary
  signals: BuyerSignals | null
  confirmedKinds: ReadonlySet<EventKind>
  /** The open task due soonest; `null` when nobody is chasing the booking. */
  openTask: Task | null
}

/** Sortable columns. The rest of the ledger keeps the caller's ranking. */
export type SortKey = 'age' | 'value' | 'risk'
export type { SortDir }
export type Sort = SortState<SortKey>

/**
 * Column widths in px, cell padding included, each sized from the widest real
 * content across the seeded ledger. Buyer has none: it takes what is left.
 */
const WIDTHS = {
  unit: 92,
  age: 56,
  stage: 176,
  waitingOn: 136,
  risk: 116,
  value: 94,
  task: 108
} as const

/** Stages where the pill carries news; everywhere else the word alone does. */
const PILL_STAGES: ReadonlySet<Stage> = new Set<Stage>(['spa_signed', 'cancelled', 'lapsed'])

export function BookingsTable({
  rows,
  sort = null,
  onSort,
  onInspect,
  referenceDate,
  onChanged
}: {
  rows: BookingRow[]
  sort?: Sort
  onSort?: (key: SortKey) => void
  /** Opens the quick view for a booking; without it the Waiting On cell is not a button. */
  onInspect?: (bookingId: string) => void
  /** The desks' today; a task added from the Task column falls due from it. */
  referenceDate: string
  /** Reloads the data after the Task column adds a task. */
  onChanged: () => Promise<void>
}) {
  const navigate = useNavigate()
  const sortable = onSort ?? (() => {})
  const { persona } = usePersonaSafe()

  return (
    <Table className="min-w-[860px] table-fixed [&_td]:px-2 [&_td:first-child]:pl-3 [&_td:last-child]:pr-3 [&_th]:px-2 [&_th:first-child]:pl-3 [&_th:last-child]:pr-3">
      <colgroup>
        <col style={{ width: WIDTHS.unit }} />
        <col />
        <col style={{ width: WIDTHS.age }} />
        <col style={{ width: WIDTHS.stage }} />
        <col style={{ width: WIDTHS.waitingOn }} />
        <col style={{ width: WIDTHS.risk }} />
        <col style={{ width: WIDTHS.value }} />
        <col style={{ width: WIDTHS.task }} />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead>Unit</TableHead>
          <TableHead>Buyer</TableHead>
          <SortHeader label="Age" columnKey="age" sort={sort} onSort={sortable} className="text-right" />
          <TableHead>Stage</TableHead>
          <TableHead>Waiting On</TableHead>
          <SortHeader label="Risk" columnKey="risk" sort={sort} onSort={sortable} />
          <SortHeader label="Value" columnKey="value" sort={sort} onSort={sortable} className="text-right" />
          <TableHead>Task</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ booking, summary, confirmedKinds, openTask }) => {
          const bic = ballInCourt(summary)
          const isMyDesk =
            (persona === 'sales-admin' && bic.holder === 'buyer') ||
            (persona === 'loan-admin' && bic.holder === 'bank') ||
            (persona === 'legal-admin' && (bic.holder === 'solicitor' || summary.stage === 'spa_signed'))

          return (
            <TableRow
              key={booking.id}
              tabIndex={0}
              aria-label={`Open Booking ${booking.id}`}
              className={cn(
                'cursor-pointer transition-colors',
                isMyDesk && 'bg-primary/[0.03] hover:bg-primary/[0.06]'
              )}
              onClick={() => navigate(`/bookings/${booking.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/bookings/${booking.id}`)
                }
              }}
            >
              <TableCell>
                <span className="font-mono text-[13px] font-semibold text-foreground block leading-tight">
                  {booking.unit}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground block leading-tight mt-0.5">
                  {booking.id}
                </span>
              </TableCell>
              <TableCell className="truncate">{booking.buyer.name}</TableCell>
              <TableCell
                className={cn(
                  'text-right tabular-nums',
                  summary.stallReasons.length > 0 && 'font-medium text-status-danger-fg'
                )}
              >
                {formatDays(summary.bookingAgeDays)}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1.5">
                  <StageTracker stage={summary.stage} confirmedKinds={confirmedKinds} />
                  {PILL_STAGES.has(summary.stage) ? (
                    <StagePill stage={summary.stage} />
                  ) : (
                    <span className="text-[13px] text-muted-foreground">{STAGE_LABELS[summary.stage]}</span>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <WaitingOnCell
                  ball={ballInCourt(summary)}
                  daysSinceEvidence={summary.daysSinceEvidence}
                  unit={booking.unit}
                  onInspect={onInspect ? () => onInspect(booking.id) : undefined}
                />
              </TableCell>
              <TableCell>
                <RiskChip risk={summary.risk} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatRm(booking.priceRm)}</TableCell>
              <TableCell>
                <TaskCell
                  booking={booking}
                  summary={summary}
                  openTask={openTask}
                  referenceDate={referenceDate}
                  onChanged={onChanged}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
