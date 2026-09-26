/**
 * Case header — the booking's identity and current state at a glance:
 * unit and buyer as the title, project, price and booking date beneath, then
 * one status sentence in words (stage, who holds it, how long, and whether it
 * has stalled). Outstanding documents stay as pills, because a reader acts on
 * them; the stage, freshness and stall reasons do not, so they live in the
 * sentence instead of three more pills. Owners are one muted line.
 */

import type { Booking, CaseSummary } from '@mortar/core'
import { ballInCourt } from '@mortar/core'
import { RiskChip } from '@/components/case/RiskChip'
import { STAGE_LABELS } from '@/components/case/StagePill'
import { formatDate, formatRm } from '@/components/case/format'
import { DOCUMENT_LABELS } from './labels'
import { StatusPill } from '@/components/ui/status-pill'

export function CaseHeader({ booking, summary }: { booking: Booking; summary: CaseSummary }) {
  const { waitingFor, stalled } = ballInCourt(summary)
  // The case is closed: a signed SPA or a booking that lapsed. There is no
  // party to wait on and no clock running against anybody.
  const closed = summary.stage === 'spa_signed' || summary.stage === 'cancelled' || summary.stage === 'lapsed'

  // The status sentence is one Title Case line, so the age reads "16 Days
  // Old" beside "With Bank" rather than the sentence case a clause would take.
  const age = `${summary.bookingAgeDays} ${summary.bookingAgeDays === 1 ? 'Day' : 'Days'} Old`
  const party = closed ? null : `Waiting On ${waitingFor.charAt(0).toUpperCase()}${waitingFor.slice(1)}`
  const clauses = [STAGE_LABELS[summary.stage], party, age].filter(Boolean)
  if (stalled) clauses.push('Stalled')

  return (
    <header className="flex flex-col gap-3">
      <div>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em]">
          <span className="font-mono font-medium">{booking.unit}</span>
          <span className="text-muted-foreground"> · </span>
          {booking.buyer.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.project} · {formatRm(booking.priceRm)} · Booked {formatDate(booking.bookingDate)}
        </p>
        <p className="mt-1 text-sm">
          {clauses.map((clause, i) => (
            <span key={clause}>
              {i > 0 && <span className="text-muted-foreground"> · </span>}
              <span className={clause === 'Stalled' ? 'text-status-danger-fg' : undefined}>{clause}</span>
            </span>
          ))}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.salesOwner} (Sales) · {booking.loanOwner} (Loan) · {booking.legalFirm} (Legal)
        </p>
      </div>
      {(summary.outstandingDocuments.length > 0 || summary.risk.level !== 'low') && (
        <div className="flex flex-wrap items-center gap-1.5">
          {summary.risk.level !== 'low' && <RiskChip risk={summary.risk} />}
          {summary.outstandingDocuments.map((doc) => (
            <StatusPill key={doc} tone="warning">
              {DOCUMENT_LABELS[doc]} Outstanding
            </StatusPill>
          ))}
        </div>
      )}
    </header>
  )
}
