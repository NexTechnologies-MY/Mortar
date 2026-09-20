/**
 * Signal chips — Jev's read on the buyer: responsiveness and hesitation as a
 * pair of status pills. Scores are 0–2 and clamped in case a model answers
 * out of range.
 */

import type { BuyerSignals } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'
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

const band = (score: number) => Math.min(2, Math.max(0, Math.round(score)))

export function SignalChips({ signals, className }: { signals?: BuyerSignals | null; className?: string }) {
  if (!signals) {
    return <span className={cn('text-muted-foreground', className)}>—</span>
  }
  const responsiveness = RESPONSIVENESS[band(signals.responsiveness.score)]
  const hesitation = HESITATION[band(signals.hesitation.score)]
  return (
    <span role="group" aria-label="Buyer response" className={cn('inline-flex items-center gap-1', className)}>
      <StatusPill tone={responsiveness.tone}>{responsiveness.label}</StatusPill>
      <StatusPill tone={hesitation.tone}>{hesitation.label}</StatusPill>
    </span>
  )
}
