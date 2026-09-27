/**
 * Case quick view — a side sheet opened from the ledger's row or its Waiting
 * On cell, so a desk can see where a unit is, who holds it and what to do next
 * without leaving the table (its filters, sort and page stay put). Record An
 * Update opens in place behind a button, so the answer can be logged without
 * the full case page. The full case is one link away.
 */

import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ballInCourt, PERSONA_STAFF } from '@mortar/core'
import type { NextActionSuggestion } from '@mortar/core'
import { RiskChip } from '@/components/case/RiskChip'
import { StagePill } from '@/components/case/StagePill'
import { formatDate, formatDaysLong, formatRm } from '@/components/case/format'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePersona } from '@/lib/persona'
import type { BookingRow } from './BookingsTable'
import { RecordUpdateForm } from './RecordUpdateForm'
import { CaseJourney, WaitingOnPanel } from './WaitingOn'

export function CaseQuickView({
  row,
  referenceDate,
  suggestion,
  onClose,
  onChanged
}: {
  /** The case to show; `null` keeps the sheet closed. */
  row: BookingRow | null
  referenceDate: string
  /** Jev's cached answer for the shown case, when the caller has one. */
  suggestion?: NextActionSuggestion
  onClose: () => void
  onChanged: () => Promise<void>
}) {
  const { persona, profile } = usePersona()
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
            // Jev's cached answer, so the alternative reads the same here as it
            // does on Today and on the case page.
            suggestion={suggestion}
            className="border-t border-border pt-4"
          />
          {/* A closed case takes no more updates. */}
          {row.summary.stage !== 'cancelled' && row.summary.stage !== 'lapsed' && (
            <RecordUpdateForm
              key={row.booking.id}
              booking={row.booking}
              applications={row.summary.applications}
              summary={row.summary}
              referenceDate={referenceDate}
              reportedBy={profile?.name ?? PERSONA_STAFF[persona].name}
              onRecorded={onChanged}
              collapsible
              className="border-t border-border pt-4"
            />
          )}
          <SheetFooter className="border-t border-border pt-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/bookings/${row.booking.id}`}>
                Open Full Case
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
