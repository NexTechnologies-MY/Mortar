/**
 * Compact stage tracker — five 10px × 4px bars for Booked, Documents,
 * Loan Submitted, Loan Approved and SPA Signed, beside the stage name in
 * table rows. Completed and current bars use --inverse; upcoming --input.
 * Cancelled and lapsed bookings freeze at the last confirmed milestone, so
 * callers pass the booking's confirmed event kinds when they have them.
 */

import type { EventKind, Stage } from '@mortar/core'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const SEGMENTS = ['Booked', 'Documents', 'Loan Submitted', 'Loan Approved', 'SPA Signed'] as const

const STAGE_PROGRESS: Record<Stage, number> = {
  booked: 1,
  loan_applied: 3,
  lo_issued: 4,
  loan_agreement: 5,
  disbursed: 5,
  spa_signed: 5,
  cancelled: 0,
  lapsed: 0
}

/** Milestones reached, derived from the confirmed event kinds the case holds. */
function progressFromKinds(kinds: ReadonlySet<EventKind>): number {
  if (kinds.has('spa_signed')) return 5
  if (kinds.has('loan_approved')) return 4
  if (kinds.has('loan_submitted')) return 3
  if (kinds.has('documents_received')) return 2
  if (kinds.has('booked')) return 1
  return 0
}

export function StageTracker({
  stage,
  confirmedKinds,
  className
}: {
  stage: Stage
  /** Confirmed event kinds on the case; when given, exits freeze at the last milestone. */
  confirmedKinds?: ReadonlySet<EventKind>
  className?: string
}) {
  const progress = confirmedKinds ? progressFromKinds(confirmedKinds) : STAGE_PROGRESS[stage]
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="img"
            aria-label={`Stage ${progress} Of 5: ${SEGMENTS[Math.max(0, progress - 1)] ?? 'None'}`}
            className={cn('inline-flex cursor-default items-center gap-0.5', className)}
          >
            {SEGMENTS.map((label, i) => (
              <span key={label} className={cn('h-1 w-2.5 rounded-full', i < progress ? 'bg-inverse' : 'bg-input')} />
            ))}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{SEGMENTS.join(' · ')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
