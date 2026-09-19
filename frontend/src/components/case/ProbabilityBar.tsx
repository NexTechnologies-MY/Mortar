/**
 * Probability bar — a signing probability as a thin meter plus its whole
 * percentage. Ink fill by default; pass `tone` to bind a status solid.
 */

import { type StatusPillTone } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import { formatPercent } from './format'

const FILLS: Record<StatusPillTone, string> = {
  neutral: 'bg-status-neutral',
  info: 'bg-status-info',
  positive: 'bg-status-positive',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
  signed: 'bg-status-signed'
}

export function ProbabilityBar({
  probability,
  tone,
  className
}: {
  /** A 0–1 probability; clamped to the bar. */
  probability: number
  /** Status solid for the fill; defaults to ink. */
  tone?: StatusPillTone
  className?: string
}) {
  const pct = Math.round(Math.min(1, Math.max(0, probability)) * 100)
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        role="meter"
        aria-label="Probability"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-1 w-16 shrink-0 overflow-hidden rounded-full bg-input"
      >
        <span
          className={cn('block h-full rounded-full', tone ? FILLS[tone] : 'bg-inverse')}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-xs tabular-nums text-muted-foreground">{formatPercent(probability)}</span>
    </span>
  )
}
