import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { TourStep } from './tourSteps'

type Rect = { top: number; left: number; width: number; height: number; radius: string }
export function Spotlight({
  step,
  onBack,
  onNext,
  canBack,
  last
}: {
  step: TourStep
  onBack: () => void
  onNext: () => void
  canBack: boolean
  last: boolean
}) {
  const [rect, setRect] = useState<Rect | null>(null)
  useEffect(() => {
    let frame = 0
    let observer: ResizeObserver | undefined
    let observedTarget: Element | null = null
    const measure = () => {
      const target = document.querySelector(step.target)
      if (target !== observedTarget) {
        observer?.disconnect()
        observedTarget = target
        if (target && typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(schedule)
          observer.observe(target)
        }
      }
      if (target) {
        const box = target.getBoundingClientRect()
        const next = {
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          radius: getComputedStyle(target).borderRadius || '6px'
        }
        setRect((current) =>
          current && Object.keys(next).every((key) => current[key as keyof Rect] === next[key as keyof Rect])
            ? current
            : next
        )
      } else setRect((current) => (current === null ? current : null))
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const mutations = new MutationObserver((records) => {
      if (records.some((record) => !(record.target as Element).closest?.('[data-tour-overlay]'))) schedule()
    })
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    const initial = window.setTimeout(() => {
      const target = document.querySelector(step.target)
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      target?.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
      schedule()
    }, 90)
    schedule()
    return () => {
      clearTimeout(initial)
      cancelAnimationFrame(frame)
      mutations.disconnect()
      observer?.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, true)
    }
  }, [step.target])

  const top = rect
    ? rect.top + rect.height + 12 + 120 < window.innerHeight
      ? rect.top + rect.height + 12
      : Math.max(16, rect.top - 132)
    : undefined
  const left = rect
    ? Math.min(Math.max(16, rect.left + rect.width / 2 - 176), Math.max(16, window.innerWidth - 368))
    : undefined
  return (
    <>
      {rect ? (
        <div
          data-tour-overlay
          aria-hidden="true"
          className="pointer-events-none fixed z-[90] border-2 border-foreground transition-[top,left,width,height] duration-[var(--motion-base)] motion-reduce:transition-none"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            borderRadius: rect.radius
          }}
        />
      ) : null}
      <section
        data-tour-overlay
        role="alert"
        aria-live="polite"
        className={`fixed z-[90] w-[min(22rem,calc(100vw-2rem))] rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-[var(--shadow-overlay)] transition-[top,left] duration-[var(--motion-base)] motion-reduce:transition-none ${rect ? '' : 'bottom-5 left-1/2 -translate-x-1/2'}`}
        style={rect ? { top, left } : undefined}
      >
        <p className="text-sm leading-5">{step.caption}</p>
        <div className="mt-3 flex justify-between gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={!canBack} onClick={onBack}>
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            {last ? 'Finish' : 'Next'}
          </Button>
        </div>
      </section>
    </>
  )
}
