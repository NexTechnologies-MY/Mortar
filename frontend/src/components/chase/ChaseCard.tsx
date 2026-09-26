/**
 * Chase card — one stalled live booking in Today's queue.
 *
 * Card stack, in reading order: unit and buyer, the blocker in plain words,
 * one muted meta line, the next step, the footer. The unit and buyer open the
 * case's side sheet, the same one a row click opens on the ledger, so an update
 * can be recorded without leaving Today. One pill per card — urgency when the
 * card is overdue, otherwise Task Open — and the risk chip only when the
 * financing risk is High, because a chip true of every card on the page is not
 * a warning any more.
 *
 * Sales Admin's Today shows every desk's stalled bookings, so a card names the
 * desk that owns its next step whenever that is not the reader's own: a move
 * marked "Loan Admin" is not one the person reading it can make.
 *
 * There is one next step. It is the rule-based move from `ballInCourt`, which
 * every screen leads with, so the same click here, in Waiting On and in the
 * table raises the same task. When Jev's cached answer names a different move,
 * it gets one extra muted line and its own small button — never a second block
 * of equal weight. The "Jev checked earlier" note lives in a tooltip on the
 * suggestion's glyph rather than on a pill.
 */

import type { Booking, CaseSummary, Task } from '@mortar/core'
import { RiskChip, STAGE_LABELS, formatDate, formatDaysLong, formatRm } from '@/components/case'
import { OWNER_ROLE_LABELS } from '@/components/case/OwnerBadge'
import type { NextStep } from '@/components/case/nextStep'
import { PERSONA_DESK_ROLE, usePersona } from '@/lib/persona'
import type { LucideIcon } from 'lucide-react'
import { Plus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { actionIcon, blockerIcon, documentStepLabel, urgencyFor } from './chase'

/** Renders a decorative glyph handed in as a prop, so the icon component is
    never created inside the card's own render. */
function Glyph({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return <Icon aria-hidden="true" className={cn('size-4 shrink-0 text-muted-foreground', className)} />
}

export function ChaseCard({
  booking,
  summary,
  step,
  alternativeStep,
  openTask = null,
  suggesting,
  creating,
  onInspect,
  onSuggest,
  onCreateTask
}: {
  booking: Booking
  summary: CaseSummary
  /** The case's one next step, from `nextStepFor`. */
  step: NextStep
  /** Jev's differing move, when there is one. */
  alternativeStep?: NextStep
  openTask?: Task | null
  suggesting?: boolean
  creating?: boolean
  /** Opens the case's side sheet over the queue. */
  onInspect: () => void
  onSuggest: () => void
  /** Raises the task for the step the person picked. */
  onCreateTask: (step: NextStep) => void
}) {
  // Today is read as one persona, so the card asks the same question its
  // reader would: is this move mine to make, or another desk's?
  const { persona } = usePersona()
  const desk = PERSONA_DESK_ROLE[persona]
  const deskLabel = step.ownerRole === desk ? null : OWNER_ROLE_LABELS[step.ownerRole]

  const urgency = urgencyFor(undefined, summary.daysSinceEvidence)
  // One pill per card: the overdue date when the card is late, otherwise
  // whether a task is already open. Due-today is the queue's norm, so it says
  // nothing, and a card with a task is already reported in the footer.
  const pill = openTask ? null : urgency.tone === 'danger' ? (
    <StatusPill tone={urgency.tone}>{urgency.label}</StatusPill>
  ) : null

  return (
    <article
      data-testid={`chase-card-${booking.id}`}
      data-card-interactive=""
      className="flex flex-col gap-3 rounded-md border border-card-border bg-card p-4 shadow-card transition-[box-shadow,transform] duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-px hover:shadow-card-hover"
    >
      {/* Header: unit + buyer. The whole pair opens the case's side sheet, the
          same one a row click opens on the ledger, so what happened can be
          recorded without leaving Today. */}
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onInspect}
          aria-label={`Quick View ${booking.unit}: ${booking.id} · ${booking.buyer.name}`}
          className="-mx-1 min-w-0 rounded-sm px-1 py-0.5 text-left transition-colors duration-[var(--motion-fast)] hover:bg-accent"
        >
          <span className="block font-mono text-[13px] font-medium text-foreground">{booking.unit}</span>
          <span className="block truncate text-[13px] text-muted-foreground">
            {booking.id} · {booking.buyer.name}
          </span>
        </button>
        {pill}
      </div>

      {/* Blocker. The glyph names the kind of blocker, never its severity. */}
      <p className="flex items-start gap-2 text-base font-semibold tracking-[-0.01em] text-foreground">
        <Glyph icon={blockerIcon(summary.stallReasons, step.document)} className="mt-0.5" />
        <span>{summary.stallReasons.join(' · ')}</span>
      </p>

      {/* One muted meta line. The risk chip only earns its place when the
          financing risk is High; the stage, age and price read in a line. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
        {summary.risk.level === 'high' ? <RiskChip risk={summary.risk} /> : null}
        <span>
          {STAGE_LABELS[summary.stage]} · {formatDaysLong(summary.bookingAgeDays)} Old · Last Update{' '}
          {formatDaysLong(summary.daysSinceEvidence)} Ago
        </span>
        <span className="tabular-nums">{formatRm(booking.priceRm)}</span>
      </div>

      {/* The one next step, and Jev's alternative as a single muted line. */}
      <div className="flex flex-col gap-1.5 text-[13px]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Glyph icon={actionIcon(step.action)} />
          <span className="font-medium text-foreground">{documentStepLabel(step.label, step.document)}</span>
          {deskLabel ? <span className="text-muted-foreground">· {deskLabel}</span> : null}
        </div>
        {alternativeStep ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
            <span>Jev Suggests: {documentStepLabel(alternativeStep.label, alternativeStep.document)} Instead</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-[13px]"
              disabled={creating}
              onClick={() => onCreateTask(alternativeStep)}
            >
              {creating ? 'Creating…' : 'Do That Instead'}
            </Button>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2">
        {openTask ? (
          <p className="mr-auto flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
            <StatusPill tone="info" className="shrink-0">
              Task Open
            </StatusPill>
            <span className="truncate">
              Due {formatDate(openTask.dueOn)} · {openTask.ownerName}
            </span>
          </p>
        ) : null}
        <JevRefresh suggesting={suggesting} onSuggest={onSuggest} />
        {openTask ? null : (
          <Button type="button" variant="default" size="sm" disabled={creating} onClick={() => onCreateTask(step)}>
            <Plus aria-hidden="true" />
            {creating ? 'Creating…' : 'Create Task'}
          </Button>
        )}
      </div>
    </article>
  )
}

/**
 * "Ask Jev again" as a ghost icon button, with the note on when Jev last
 * checked in its tooltip — a note that was true of every card on the page is
 * not a warning, so it explains rather than shouts.
 */
function JevRefresh({ suggesting, onSuggest }: { suggesting?: boolean; onSuggest: () => void }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Ask Jev Again"
            disabled={suggesting}
            onClick={onSuggest}
          >
            <RefreshCw aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{suggesting ? 'Asking Jev…' : 'Ask Jev Again. Jev Checked Earlier.'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
