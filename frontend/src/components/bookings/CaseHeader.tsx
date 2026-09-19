/**
 * Case header — the booking's identity and current state at a glance:
 * unit and buyer as the title, project, price and booking date beneath,
 * stage, evidence freshness, financing risk, outstanding documents, stall
 * reasons and the three owners as pills.
 */

import type { Booking, CaseSummary } from '@mortar/core'
import { EvidencePill } from '@/components/case/EvidencePill'
import { OwnerBadge } from '@/components/case/OwnerBadge'
import { RiskChip } from '@/components/case/RiskChip'
import { StagePill } from '@/components/case/StagePill'
import { formatDate, formatDaysLong, formatRm } from '@/components/case/format'
import { DOCUMENT_LABELS } from './labels'
import { StatusPill } from '@/components/ui/status-pill'

export function CaseHeader({ booking, summary }: { booking: Booking; summary: CaseSummary }) {
  return (
    <header className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">
          <span className="font-mono font-medium">{booking.unit}</span>
          <span className="text-muted-foreground"> · </span>
          {booking.buyer.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.project} · {formatRm(booking.priceRm)} · Booked {formatDate(booking.bookingDate)} ·{' '}
          {formatDaysLong(summary.bookingAgeDays)} Ago
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <StagePill stage={summary.stage} />
        <EvidencePill status={summary.unknown ? 'unknown' : 'fresh'} />
        <RiskChip risk={summary.risk} />
        {summary.outstandingDocuments.map((doc) => (
          <StatusPill key={doc} tone="warning">
            {DOCUMENT_LABELS[doc]} Outstanding
          </StatusPill>
        ))}
        {summary.stallReasons.map((reason) => (
          <StatusPill key={reason} tone="danger">
            {reason}
          </StatusPill>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <OwnerBadge role="sales" name={booking.salesOwner} />
        <OwnerBadge role="loan_admin" name={booking.loanOwner} />
        <OwnerBadge role="legal" name={booking.legalFirm} />
      </div>
    </header>
  )
}
