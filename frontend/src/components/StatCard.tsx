/**
 * Stat tile — the spec's KPI tile.
 * --card surface lifted by --shadow-card: an optional Lucide glyph beside the
 * Eyebrow label, the Display/Figure value, then a Body/Small caption. Alert
 * colours only the figure. An optional `exact` value shows in a tooltip
 * (figures are rounded for reading). The glyph is decorative and always sits
 * beside the label, never beside the figure (DESIGN.md Icons).
 */

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

type StatCardProps = {
  /** Eyebrow label above the figure */
  label: string
  /** Decorative Lucide glyph beside the label */
  icon?: LucideIcon
  /** Display/Figure value, rounded for reading (e.g. "RM 7.4m") */
  value: string
  /** One-sentence explanation shown in an InfoTooltip beside the label */
  info?: string
  /** Body/Small caption under the figure */
  caption?: string
  /** 'alert' colours only the figure in --status-danger-fg */
  tone?: 'default' | 'alert'
  /** Exact value shown in a tooltip on the figure */
  exact?: string
  /** When set, the tile becomes a button (each tile opens the list behind its number) */
  onClick?: () => void
  className?: string
}

/** Renders one stat tile with eyebrow label, figure, and optional caption. */
export function StatCard({
  label,
  icon: Icon,
  value,
  info,
  caption,
  tone = 'default',
  exact,
  onClick,
  className
}: StatCardProps) {
  const figure = (
    <p
      className={cn(
        'text-3xl font-semibold tracking-[-0.03em] tabular-nums',
        tone === 'alert' ? 'text-status-danger-fg' : 'text-foreground'
      )}
    >
      {value}
    </p>
  )

  const body = (
    <>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
        {label}
        {info ? (
          // In a clickable tile the icon's own press must not also fire the tile's.
          <span onClick={onClick ? (e) => e.stopPropagation() : undefined}>
            <InfoTooltip text={info} />
          </span>
        ) : null}
      </p>
      {exact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="w-fit cursor-default">
                {figure}
              </span>
            </TooltipTrigger>
            <TooltipContent>{exact}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        figure
      )}
      {caption ? <p className="text-[13px] text-muted-foreground">{caption}</p> : null}
    </>
  )

  const tileClass = cn(
    'flex min-w-60 flex-col gap-1 rounded-md border border-card-border bg-card p-4 shadow-card',
    className
  )

  if (onClick) {
    // A div with button semantics: the info tooltip's trigger is itself a
    // button, which may not nest inside a <button>.
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
        className={cn(tileClass, 'text-left transition-colors duration-[var(--motion-fast)] hover:bg-accent')}
      >
        {body}
      </div>
    )
  }

  return <div className={tileClass}>{body}</div>
}
