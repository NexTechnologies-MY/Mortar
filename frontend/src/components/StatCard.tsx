/**
 * Stat tile — the spec's KPI tile.
 * Flat --card surface with a 1px hairline: Eyebrow label, Display/Figure
 * value, Body/Small caption. Alert colours only the figure. An optional
 * `exact` value shows in a tooltip (figures are rounded for reading).
 */

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type StatCardProps = {
  /** Eyebrow label above the figure */
  label: string
  /** Display/Figure value, rounded for reading (e.g. "RM 7.4m") */
  value: string
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
export function StatCard({ label, value, caption, tone = 'default', exact, onClick, className }: StatCardProps) {
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
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

  const tileClass = cn('flex min-w-60 flex-col gap-1 rounded-md border border-border bg-card p-4', className)

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(tileClass, 'text-left transition-colors duration-[var(--motion-fast)] hover:bg-accent')}
      >
        {body}
      </button>
    )
  }

  return <div className={tileClass}>{body}</div>
}
