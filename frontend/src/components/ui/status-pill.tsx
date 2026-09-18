/**
 * Status pill — the spec's single way to show state.
 * Six tones (neutral, info, positive, warning, danger, signed); the tone's
 * 6px solid dot always sits next to a word — never colour alone.
 */

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StatusPillTone = 'neutral' | 'info' | 'positive' | 'warning' | 'danger' | 'signed'

const TONE_STYLES: Record<StatusPillTone, { pill: string; dot: string }> = {
  neutral: { pill: 'bg-status-neutral-bg text-status-neutral-fg', dot: 'bg-status-neutral' },
  info: { pill: 'bg-status-info-bg text-status-info-fg', dot: 'bg-status-info' },
  positive: { pill: 'bg-status-positive-bg text-status-positive-fg', dot: 'bg-status-positive' },
  warning: { pill: 'bg-status-warning-bg text-status-warning-fg', dot: 'bg-status-warning' },
  danger: { pill: 'bg-status-danger-bg text-status-danger-fg', dot: 'bg-status-danger' },
  // Signed is the only solid pill — its dot uses the tone's fg colour.
  signed: { pill: 'bg-status-signed-bg text-status-signed-fg', dot: 'bg-status-signed-fg' }
}

type StatusPillProps = {
  tone: StatusPillTone
  children: ReactNode
  className?: string
}

export function StatusPill({ tone, children, className }: StatusPillProps) {
  const styles = TONE_STYLES[tone]
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-sm px-2 text-xs font-medium',
        styles.pill,
        className
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', styles.dot)} />
      {children}
    </span>
  )
}
