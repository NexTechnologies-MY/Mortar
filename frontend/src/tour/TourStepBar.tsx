import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { TourStep } from './tourSteps'

export function TourStepBar({
  steps,
  index,
  onGoTo,
  onEnd
}: {
  steps: TourStep[]
  index: number
  onGoTo: (index: number) => void
  onEnd: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const current = steps[index]
  return (
    <nav
      data-tour-overlay
      aria-label="Walkthrough progress"
      className="fixed left-1/2 top-3 z-[90] w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-overlay)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-[var(--motion-base)]"
            style={{ width: `${((index + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs">
          {index + 1} / {steps.length} · {current.label}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onEnd}>
          End
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide Steps' : 'Steps'}
        </Button>
      </div>
      {expanded ? (
        <ol className="mt-2 flex flex-wrap gap-1">
          {steps.map((step, i) => (
            <li key={`${step.label}-${i}`}>
              <button
                type="button"
                aria-current={i === index ? 'step' : undefined}
                onClick={() => onGoTo(i)}
                className="rounded px-2 py-1 text-xs hover:bg-accent aria-[current=step]:font-semibold"
              >
                {i + 1}. {step.label}
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </nav>
  )
}
