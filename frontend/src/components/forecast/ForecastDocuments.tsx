/**
 * Forecast documents — the detail behind the forecast as a stack of documents
 * (#54). The chips above the stack pick a document; the front card shows its
 * title and summary beside a square motif, and the cards behind it peek out
 * underneath. Previous and next buttons, the arrow keys and a swipe move
 * through the stack. Open Document reads it in a sheet; Ask MortarAI opens the
 * assistant with a question about it already sent.
 */

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { askMortarAI } from '@/components/brain/askBus'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface ForecastDocument {
  title: string
  summary: string
  /** A square monochrome illustration, served from `public/forecast/`. */
  motif: string
  /** What Ask MortarAI is asked about this document. */
  question: string
  content: ReactNode
}

const SWIPE = 48

export function ForecastDocuments({ documents }: { documents: ForecastDocument[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const pointerStart = useRef<number | null>(null)
  const index = Math.min(activeIndex, documents.length - 1)
  const active = documents[index]

  const move = (direction: -1 | 1) => {
    setActiveIndex((i) => (i + direction + documents.length) % documents.length)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      move(event.key === 'ArrowRight' ? 1 : -1)
    }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return
    const distance = event.clientX - pointerStart.current
    pointerStart.current = null
    if (Math.abs(distance) >= SWIPE) move(distance < 0 ? 1 : -1)
  }

  if (!active) return null

  const stepper = (direction: -1 | 1, className?: string) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={direction < 0 ? 'Previous document' : 'Next document'}
      onClick={() => move(direction)}
      className={cn('size-9 shrink-0 rounded-full', className)}
    >
      {direction < 0 ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
    </Button>
  )

  return (
    <section className="mt-10" aria-labelledby="forecast-documents-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="forecast-documents-heading" className="text-lg font-semibold text-foreground">
            Forecast Documents
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Pick a document to read the detail, or ask about it.</p>
        </div>
        <p className="text-[13px] tabular-nums text-muted-foreground" aria-live="polite">
          {index + 1} / {documents.length}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a forecast document">
        {documents.map((document, i) => (
          <Button
            key={document.title}
            type="button"
            variant={i === index ? 'default' : 'outline'}
            size="sm"
            aria-pressed={i === index}
            onClick={() => setActiveIndex(i)}
          >
            {document.title}
          </Button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        {stepper(-1, 'max-sm:hidden')}
        <div
          className="forecast-document-stack relative w-full max-w-[768px] touch-pan-y pb-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          role="group"
          aria-roledescription="carousel"
          aria-label="Forecast documents"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={(event) => {
            pointerStart.current = event.clientX
          }}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            pointerStart.current = null
          }}
        >
          {/* The two cards behind peek out underneath, so it reads as a stack. */}
          {[2, 1].map((depth) => (
            <div
              key={depth}
              aria-hidden="true"
              className="absolute inset-x-3 bottom-0 top-6 rounded-md border border-card-border bg-muted shadow-card"
              style={{ transform: `translateY(${depth * 10 - 20}px) scale(${1 - depth * 0.025})` }}
            />
          ))}
          <article
            aria-roledescription="slide"
            aria-label={`Document ${index + 1} of ${documents.length}: ${active.title}`}
            className="relative z-10 flex flex-col gap-6 rounded-md border border-card-border bg-card p-6 shadow-card sm:aspect-video sm:flex-row sm:items-stretch sm:p-8"
          >
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
              <span className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-muted-foreground">
                Document {index + 1} Of {documents.length}
              </span>
              <span className="flex flex-col gap-2">
                <span className="text-2xl font-semibold leading-8 tracking-[-0.02em] text-foreground">
                  {active.title}
                </span>
                <span className="text-sm leading-6 text-muted-foreground">{active.summary}</span>
              </span>
              <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open Document
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => askMortarAI(active.question)}
                  className="flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Ask MortarAI
                  <Sparkles aria-hidden="true" className="size-4" />
                </button>
              </span>
            </div>
            <img
              src={active.motif}
              alt=""
              draggable={false}
              className="hidden aspect-square h-full shrink-0 select-none rounded-sm object-cover sm:block dark:invert-[0.9]"
            />
          </article>
        </div>
        {stepper(1, 'max-sm:hidden')}
      </div>
      <div className="mt-3 flex justify-center gap-3 sm:hidden">
        {stepper(-1)}
        {stepper(1)}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-auto bottom-0 left-1/2 max-h-[min(90vh,900px)] w-[min(860px,calc(100vw-2rem))] max-w-none translate-y-0 rounded-t-md rounded-b-none border-b-0 bg-card p-0 shadow-[var(--shadow-overlay)] data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full sm:bottom-6 sm:rounded-md sm:border-b sm:translate-y-0">
          <div className="border-b border-border px-8 pb-5 pt-8 sm:px-12 sm:pt-10">
            <DialogHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Forecast Document {index + 1} Of {documents.length}
              </p>
              <DialogTitle className="pt-2 text-2xl">{active.title}</DialogTitle>
              <DialogDescription>{active.summary}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-[calc(min(90vh,900px)-150px)] space-y-4 overflow-y-auto px-6 py-6 sm:px-12 sm:py-8">
            {active.content}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
