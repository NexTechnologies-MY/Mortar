/**
 * Bookings table — the loan admin's ledger of every unit booking.
 * Columns: booking ID, unit, buyer, age, stage, waiting on, risk, buyer
 * response and value. Rows navigate to the case page; the Waiting On cell
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
 * Buyer is capped at max-w-44 on purpose. Widening it pushes the table past
 * the 1280px container and clips Value off the right edge; the horizontal
 * scroll hides the clip rather than fixing it. A truncated name is the better
 * trade, because the name is recoverable on the case page and the value is
 * not recoverable from this row at all.
 */

import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import {
  ballInCourt,
  type Booking,
  type BuyerSignals,
  type CaseSummary,
  type EventKind,
  type Stage
} from '@mortar/core'
import { RiskChip } from '@/components/case/RiskChip'
import { SignalChips } from '@/components/case/SignalChips'
import { StagePill } from '@/components/case/StagePill'
import { STAGE_LABELS } from '@/components/case/StagePill'
import { formatDays, formatRm } from '@/components/case/format'
import { StageTracker } from './StageTracker'
import { WaitingOnCell } from './WaitingOn'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface BookingRow {
  booking: Booking
  summary: CaseSummary
  signals: BuyerSignals | null
  confirmedKinds: ReadonlySet<EventKind>
}

/** Sortable columns. The rest of the ledger keeps the caller's ranking. */
export type SortKey = 'age' | 'value' | 'risk'
export type SortDir = 'asc' | 'desc'
export type Sort = { key: SortKey; dir: SortDir } | null

/** Stages where the pill carries news; everywhere else the word alone does. */
const PILL_STAGES: ReadonlySet<Stage> = new Set<Stage>(['spa_signed', 'cancelled', 'lapsed'])

function SortHeader({
  label,
  columnKey,
  sort,
  onSort,
  className
}: {
  label: string
  columnKey: SortKey
  sort: Sort
  onSort: (key: SortKey) => void
  className?: string
}) {
  const active = sort?.key === columnKey
  const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <TableHead className={className} aria-sort={!active ? 'none' : sort.dir === 'asc' ? 'ascending' : 'descending'}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-[var(--motion-fast)] hover:text-foreground',
          active ? 'text-foreground' : 'text-muted-foreground',
          className?.includes('text-right') && 'flex-row-reverse'
        )}
      >
        {label}
        <Icon aria-hidden="true" className="size-3 shrink-0" />
      </button>
    </TableHead>
  )
}

export function BookingsTable({
  rows,
  sort = null,
  onSort,
  onInspect
}: {
  rows: BookingRow[]
  sort?: Sort
  onSort?: (key: SortKey) => void
  /** Opens the quick view for a booking; without it the Waiting On cell is not a button. */
  onInspect?: (bookingId: string) => void
}) {
  const navigate = useNavigate()
  const sortable = onSort ?? (() => {})
  return (
    <Table className="[&_td]:px-3 [&_th]:px-3">
      <TableHeader>
        <TableRow>
          <TableHead>Booking</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Buyer</TableHead>
          <SortHeader label="Age" columnKey="age" sort={sort} onSort={sortable} className="text-right" />
          <TableHead>Stage</TableHead>
          <TableHead>Waiting On</TableHead>
          <SortHeader label="Risk" columnKey="risk" sort={sort} onSort={sortable} />
          <TableHead>Buyer Response</TableHead>
          <SortHeader label="Value" columnKey="value" sort={sort} onSort={sortable} className="text-right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ booking, summary, signals, confirmedKinds }) => (
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
            <TableCell className="font-mono text-[13px] font-medium">{booking.id}</TableCell>
            <TableCell className="font-mono text-[13px] font-medium">{booking.unit}</TableCell>
            <TableCell className="max-w-44 truncate">{booking.buyer.name}</TableCell>
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
            <TableCell>
              <SignalChips signals={signals} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatRm(booking.priceRm)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
