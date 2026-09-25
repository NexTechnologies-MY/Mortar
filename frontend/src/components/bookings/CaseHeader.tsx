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
import { usePersonaSafe } from '@/lib/persona'
import { cn } from '@/lib/utils'

export function CaseHeader({ booking, summary }: { booking: Booking; summary: CaseSummary }) {
  const { persona } = usePersonaSafe()
  const isSalesDesk = persona === 'sales-admin'
  const isLoanDesk = persona === 'loan-admin'
  const isLegalDesk = persona === 'legal-admin'
  return (
    <header className="flex flex-col gap-3">
      <div>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em]">
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
        <div className="relative inline-flex items-center">
          <OwnerBadge
            role="sales"
            name={isSalesDesk ? `${booking.salesOwner} (Your Desk)` : booking.salesOwner}
            className={cn(isSalesDesk && 'ring-2 ring-primary/70 font-semibold bg-primary/10 text-foreground')}
          />
        </div>
        <div className="relative inline-flex items-center">
          <OwnerBadge
            role="loan_admin"
            name={isLoanDesk ? `${booking.loanOwner} (Your Desk)` : booking.loanOwner}
            className={cn(isLoanDesk && 'ring-2 ring-primary/70 font-semibold bg-primary/10 text-foreground')}
          />
        </div>
        <div className="relative inline-flex items-center">
          <OwnerBadge
            role="legal"
            name={isLegalDesk ? `${booking.legalFirm} (Your Desk)` : booking.legalFirm}
            className={cn(isLegalDesk && 'ring-2 ring-primary/70 font-semibold bg-primary/10 text-foreground')}
          />
        </div>
      </div>
    </header>
  )
}
