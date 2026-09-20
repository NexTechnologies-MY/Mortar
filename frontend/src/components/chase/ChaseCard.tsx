/**
 * Chase card — one stalled live booking in the Sales Admin chase queue.
 * Follows the spec's chase-card anatomy: a 3px urgency edge, unit and buyer
 * header with an urgency pill, the blocker in plain words, a meta line, Jev's
 * suggested next action with its source tag, and the action footer.
 */

import { Link } from 'react-router-dom'
import { JEV_REVIEW_THRESHOLD } from '@mortar/core'
import type { Booking, CaseSummary, DocumentKind, NextActionSuggestion } from '@mortar/core'
import { JevTag, RiskChip, STAGE_LABELS, formatDaysLong, formatRm } from '@/components/case'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import { NEXT_ACTION_LABELS, DOCUMENT_LABELS, ownerName, ownerRoleLabel, urgencyFor } from './chase'

const EDGE_TONES = {
  danger: 'border-l-status-danger',
  warning: 'border-l-status-warning',
  neutral: 'border-l-status-neutral'
} as const

export function ChaseCard({
  booking,
  summary,
  suggestion,
  document,
  primary,
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
  /** The first card carries the page's one primary action. */
  primary?: boolean
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
      className={cn(
        'flex flex-col gap-3 rounded-md border border-border border-l-[3px] bg-card p-4',
        EDGE_TONES[urgency.tone]
      )}
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

      {/* Blocker */}
      <p className="text-base font-semibold tracking-[-0.01em] text-foreground">{summary.stallReasons.join(' · ')}</p>

      {/* Meta line: the risk chip stays; stage, age, last evidence and price
          fold into one muted line. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
        <RiskChip risk={summary.risk} />
        <span>
          {STAGE_LABELS[summary.stage]} · {formatDaysLong(summary.bookingAgeDays)} Old · Last Evidence{' '}
          {formatDaysLong(summary.daysSinceEvidence)} Ago
        </span>
        <span className="tabular-nums">{formatRm(booking.priceRm)}</span>
      </div>

      {/* Jev suggestion */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-sm bg-muted px-2 py-1.5 text-[13px]">
        {suggestion ? (
          <>
            <span className="font-medium text-foreground">
              {NEXT_ACTION_LABELS[suggestion.action.value]}
              {document ? ` · ${DOCUMENT_LABELS[document]}` : ''}
            </span>
            <span className="text-muted-foreground">
              {ownerRoleLabel(suggestion.owner.value)} · {ownerName(suggestion.owner.value, booking)}
            </span>
            {needsReview ? <StatusPill tone="warning">Needs Review</StatusPill> : null}
            <JevTag meta={suggestion.meta} className="ml-auto" />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2">
        {suggestion ? (
          <Button type="button" variant="ghost" size="sm" disabled={suggesting} onClick={onSuggest}>
            {suggesting ? 'Re-Running Jev…' : 'Re-Run Jev'}
          </Button>
        ) : null}
        <Button
          type="button"
          variant={primary ? 'default' : 'secondary'}
          size="sm"
          disabled={creating || suggestion === undefined}
          onClick={onCreateTask}
        >
          {creating ? 'Creating…' : 'Create Task'}
        </Button>
      </div>
    </article>
  )
}
