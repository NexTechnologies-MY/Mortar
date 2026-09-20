/**
 * Chase card — one stalled live booking in the Sales Admin chase queue.
 * Follows the spec's chase-card anatomy: unit and buyer header with an urgency
 * pill, the blocker in plain words, a meta line, Jev's suggested next action
 * with its source tag, and the action footer. Urgency is carried by the pill
 * and its word alone: no coloured strip runs down any edge (DESIGN.md
 * acceptance criterion 13). Create Task is Primary on every card, never on the
 * first card only — one action offered many times.
 */

import { Link } from 'react-router-dom'
import { JEV_REVIEW_THRESHOLD } from '@mortar/core'
import type { Booking, CaseSummary, DocumentKind, NextActionSuggestion } from '@mortar/core'
import { JevTag, RiskChip, STAGE_LABELS, formatDaysLong, formatRm } from '@/components/case'
import type { LucideIcon } from 'lucide-react'
import { Plus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import {
  NEXT_ACTION_LABELS,
  DOCUMENT_LABELS,
  actionIcon,
  blockerIcon,
  ownerName,
  ownerRoleLabel,
  urgencyFor
} from './chase'

/** Renders a decorative glyph handed in as a prop, so the icon component is
    never created inside the card's own render. */
function Glyph({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return <Icon aria-hidden="true" className={cn('size-4 shrink-0 text-muted-foreground', className)} />
}

export function ChaseCard({
  booking,
  summary,
  suggestion,
  document,
  suggesting,
  creating,
  onSuggest,
  onCreateTask
}: {
  booking: Booking
  summary: CaseSummary
  suggestion?: NextActionSuggestion
  /** The document the suggestion refers to, when one is outstanding or proposed. */
  document?: DocumentKind
  suggesting?: boolean
  creating?: boolean
  onSuggest: () => void
  onCreateTask: () => void
}) {
  const urgency = urgencyFor(suggestion, summary.daysSinceEvidence)
  const needsReview = suggestion !== undefined && suggestion.action.confidence < JEV_REVIEW_THRESHOLD

  return (
    <article
      data-testid={`chase-card-${booking.id}`}
      data-card-interactive=""
      className="flex flex-col gap-3 rounded-md border border-card-border bg-card p-4 shadow-card transition-[box-shadow,transform] duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-px hover:shadow-card-hover"
    >
      {/* Header: unit + buyer + urgency pill */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/bookings/${booking.id}`}
            className="font-mono text-[13px] font-medium text-foreground hover:underline"
          >
            {booking.unit}
          </Link>
          <p className="truncate text-[13px] text-muted-foreground">
            {booking.id} · {booking.buyer.name}
          </p>
        </div>
        {/* Due Today is the queue's norm, so the pill only appears when a card
            differs: overdue, or scheduled later than today. */}
        {urgency.score !== 2 ? (
          <StatusPill tone={urgency.tone} className="shrink-0 whitespace-nowrap">
            {urgency.label}
          </StatusPill>
        ) : null}
      </div>

      {/* Blocker. The glyph names the kind of blocker, never its severity. */}
      <p className="flex items-start gap-2 text-base font-semibold tracking-[-0.01em] text-foreground">
        <Glyph icon={blockerIcon(summary.stallReasons, document)} className="mt-0.5" />
        <span>{summary.stallReasons.join(' · ')}</span>
      </p>

      {/* Meta line: the risk chip stays; stage, age, last evidence and price
          fold into one muted line. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
        <RiskChip risk={summary.risk} />
        <span>
          {STAGE_LABELS[summary.stage]} · {formatDaysLong(summary.bookingAgeDays)} Old · Last Update{' '}
          {formatDaysLong(summary.daysSinceEvidence)} Ago
        </span>
        <span className="tabular-nums">{formatRm(booking.priceRm)}</span>
      </div>

      {/* Jev's suggested next action. The action and its owner share the first
          line; the Jev tag always takes its own line beneath, because the tag
          is a sentence now and wrapped at a different point on every card when
          it shared the row. */}
      <div className="flex flex-col gap-1.5 rounded-sm bg-muted px-2 py-1.5 text-[13px]">
        {suggestion ? (
          <>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Glyph icon={actionIcon(suggestion.action.value)} />
              <span className="font-medium text-foreground">
                {NEXT_ACTION_LABELS[suggestion.action.value]}
                {document ? ` · ${DOCUMENT_LABELS[document]}` : ''}
              </span>
              <span className="text-muted-foreground">
                {ownerRoleLabel(suggestion.owner.value)} · {ownerName(suggestion.owner.value, booking)}
              </span>
              {needsReview ? <StatusPill tone="warning">Needs Review</StatusPill> : null}
            </div>
            <JevTag meta={suggestion.meta} className="self-start" />
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-muted-foreground">No Suggestion Yet</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-7 px-2"
              disabled={suggesting}
              onClick={onSuggest}
            >
              {suggesting ? 'Asking Jev…' : 'Suggest Next Action'}
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2">
        {suggestion ? (
          <Button type="button" variant="ghost" size="sm" disabled={suggesting} onClick={onSuggest}>
            <RefreshCw aria-hidden="true" />
            {suggesting ? 'Asking Jev…' : 'Ask Jev Again'}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={creating || suggestion === undefined}
          onClick={onCreateTask}
        >
          <Plus aria-hidden="true" />
          {creating ? 'Creating…' : 'Create Task'}
        </Button>
      </div>
    </article>
  )
}
