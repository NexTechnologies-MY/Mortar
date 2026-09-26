/**
 * Signal chips — Jev's read on the buyer: responsiveness and hesitation as a
 * pair of status pills, with a Tooltip (as `RiskChip` carries one) naming
 * where the read comes from and how to update it (issue #21). Scores are 0–2
 * and clamped in case a model answers out of range. With no messages yet
 * there is nothing to read, so the cell says so in muted text instead of the
 * usual empty-value dash.
 */

import type { BuyerSignals } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const RESPONSIVENESS: { tone: StatusPillTone; label: string }[] = [
  { tone: 'danger', label: 'Unresponsive' },
  { tone: 'warning', label: 'Slow Replies' },
  { tone: 'positive', label: 'Prompt Replies' }
]

const HESITATION: { tone: StatusPillTone; label: string }[] = [
  { tone: 'positive', label: 'Committed' },
  { tone: 'warning', label: 'Some Doubts' },
  { tone: 'danger', label: 'Strong Doubts' }
]

const SOURCE_NOTE =
  "Jev's Read Of This Buyer's Messages: Reply Speed And Any Doubts. Log Messages On The Case Page To Update It."

const band = (score: number) => Math.min(2, Math.max(0, Math.round(score)))

export function SignalChips({ signals, className }: { signals?: BuyerSignals | null; className?: string }) {
  if (!signals) {
    return <span className={cn('text-muted-foreground', className)}>No Messages Yet</span>
  }
  const responsiveness = RESPONSIVENESS[band(signals.responsiveness.score)]
  const hesitation = HESITATION[band(signals.hesitation.score)]
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={cn('inline-flex cursor-default rounded-sm', className)}>
            <span role="group" aria-label="Buyer response" className="inline-flex items-center gap-1">
              <StatusPill tone={responsiveness.tone}>{responsiveness.label}</StatusPill>
              <StatusPill tone={hesitation.tone}>{hesitation.label}</StatusPill>
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="whitespace-pre-line">
          {SOURCE_NOTE}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
