/**
 * Case quick view — a side sheet opened from the ledger's Waiting On cell, so
 * a desk can see where a unit is, who holds it and what to do next without
 * leaving the table (its filters, sort and page stay put). The full case is one
 * link away.
 */

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ballInCourt } from '@mortar/core'
import { RiskChip } from '@/components/case/RiskChip'
import { StagePill } from '@/components/case/StagePill'
import { formatDate, formatDaysLong, formatRm } from '@/components/case/format'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { BookingRow } from './BookingsTable'
import { CaseJourney, WaitingOnPanel } from './WaitingOn'

export function CaseQuickView({
  row,
  referenceDate,
  onClose,
  onChanged
}: {
  /** The case to show; `null` keeps the sheet closed. */
  row: BookingRow | null
  referenceDate: string
  onClose: () => void
  onChanged: () => Promise<void>
}) {
  return (
    <Sheet open={row !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      {row ? (
        <SheetContent
          // Focus the sheet itself on open. Left to the default, focus lands on
          // the first control, the risk chip, and pops its tooltip unasked.
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).focus()
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-xl leading-tight">
              <span className="font-mono font-medium">{row.booking.unit}</span>
              <span className="text-muted-foreground"> · </span>
              {row.booking.buyer.name}
            </SheetTitle>
            <SheetDescription>
              {row.booking.id} · {formatRm(row.booking.priceRm)} · Booked {formatDate(row.booking.bookingDate)} ·{' '}
              {formatDaysLong(row.summary.bookingAgeDays)} Ago
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <StagePill stage={row.summary.stage} />
            <RiskChip risk={row.summary.risk} />
          </div>
          <CaseJourney
            summary={row.summary}
            confirmedKinds={row.confirmedKinds}
            stalled={ballInCourt(row.summary).stalled}
          />
          <WaitingOnPanel
            key={row.booking.id}
            booking={row.booking}
            summary={row.summary}
            referenceDate={referenceDate}
            onChanged={onChanged}
            className="border-t border-border pt-4"
          />
          <SheetFooter className="border-t border-border pt-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/bookings/${row.booking.id}`}>
                Open Full Case
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
