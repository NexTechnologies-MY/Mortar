/**
 * Bookings table — the loan admin's ledger of every unit booking.
 * Columns: booking ID, unit, buyer, age, stage (compact tracker + pill),
 * evidence freshness, financing risk, buyer signals and open tasks.
 * Rows navigate to the case page; stalled rows sort first by the caller.
 */

import { useNavigate } from 'react-router-dom'
import type { Booking, BuyerSignals, CaseSummary, EventKind } from '@mortar/core'
import { EvidencePill } from '@/components/case/EvidencePill'
import { RiskChip } from '@/components/case/RiskChip'
import { SignalChips } from '@/components/case/SignalChips'
import { StagePill } from '@/components/case/StagePill'
import { formatDays } from '@/components/case/format'
import { StageTracker } from './StageTracker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface BookingRow {
  booking: Booking
  summary: CaseSummary
  signals: BuyerSignals | null
  confirmedKinds: ReadonlySet<EventKind>
}

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const navigate = useNavigate()
  // Nine pill-heavy columns need tighter cells than the shared `px-4`, or the
  // table outgrows the 1280px container and the last column clips.
  return (
    <Table className="[&_td]:px-3 [&_th]:px-3">
      <TableHeader>
        <TableRow>
          <TableHead>Booking</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Buyer</TableHead>
          <TableHead className="text-right">Age</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Evidence</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead>Signals</TableHead>
          <TableHead className="text-right">Tasks</TableHead>
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
                <StagePill stage={summary.stage} />
              </span>
            </TableCell>
            <TableCell>
              <EvidencePill status={summary.unknown ? 'unknown' : 'fresh'} />
            </TableCell>
            <TableCell>
              <RiskChip risk={summary.risk} />
            </TableCell>
            <TableCell>
              <SignalChips signals={signals} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{summary.openTasks > 0 ? summary.openTasks : '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
