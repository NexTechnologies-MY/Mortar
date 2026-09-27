import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export interface ForecastDocument {
  title: string
  summary: string
  content: ReactNode
}

export function ForecastDocuments({ documents }: { documents: ForecastDocument[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const pointerStart = useRef<number | null>(null)

  const move = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + documents.length) % documents.length)
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
    if (Math.abs(distance) >= 48) move(distance < 0 ? 1 : -1)
  }

  const active = documents[activeIndex]

  return (
    <section className="mt-8" aria-labelledby="forecast-documents-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="forecast-documents-heading" className="text-lg font-semibold text-foreground">
            Forecast Documents
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Select a document to read the detail.</p>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
          {activeIndex + 1} / {documents.length}
        </p>
      </div>

      <div
        className="forecast-document-stack relative mx-auto h-56 max-w-3xl touch-pan-y"
        role="group"
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
        onTouchStart={(event) => {
          pointerStart.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          const start = pointerStart.current
          const end = event.changedTouches[0]?.clientX
          pointerStart.current = null
          if (start !== null && end !== undefined && Math.abs(end - start) >= 48) move(end < start ? 1 : -1)
        }}
      >
        {[2, 1].map((offset) => {
          return (
            <div
              key={offset}
              aria-hidden="true"
              className="absolute inset-x-3 top-5 h-44 rounded-md border border-card-border bg-muted shadow-card transition-transform duration-200"
              style={{ transform: `translateY(${(3 - offset) * 10}px) scale(${1 - (3 - offset) * 0.025})` }}
            />
          )
        })}
        <Button
          type="button"
          variant="outline"
          aria-current="true"
          aria-label={`${active.title}. ${active.summary}. Open document`}
          onClick={() => setOpen(true)}
          className="absolute inset-x-0 top-0 z-10 flex h-44 flex-col items-stretch justify-between rounded-md border-card-border bg-card p-6 text-left whitespace-normal font-normal shadow-card transition-transform duration-200 hover:-translate-y-1 hover:bg-card"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Document {activeIndex + 1} Of {documents.length}
          </span>
          <span>
            <span className="block text-xl font-semibold tracking-tight text-foreground">{active.title}</span>
            <span className="mt-2 block text-sm text-muted-foreground">{active.summary}</span>
          </span>
          <span className="text-xs font-medium text-foreground">
            Open Document <span aria-hidden="true">↗</span>
          </span>
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Choose a forecast document">
        {documents.map((document, index) => (
          <Button
            key={document.title}
            type="button"
            variant={index === activeIndex ? 'default' : 'outline'}
            size="sm"
            aria-current={index === activeIndex ? 'true' : undefined}
            aria-label={document.title}
            onClick={() => {
              setActiveIndex(index)
              setOpen(true)
            }}
          >
            {document.title}
          </Button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-auto bottom-0 left-1/2 max-h-[min(90vh,900px)] w-[min(860px,calc(100vw-2rem))] max-w-none translate-y-0 rounded-t-md rounded-b-none border-b-0 bg-card p-0 shadow-[var(--shadow-overlay)] data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full sm:bottom-6 sm:rounded-md sm:border-b sm:translate-y-0">
          <div className="border-b border-border px-8 pb-5 pt-8 sm:px-12 sm:pt-10">
            <DialogHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Forecast Document {activeIndex + 1} Of {documents.length}
              </p>
              <DialogTitle className="pt-2 text-2xl">{active.title}</DialogTitle>
              <DialogDescription>{active.summary}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-[calc(min(90vh,900px)-150px)] overflow-y-auto px-6 py-6 sm:px-12 sm:py-8">
            {active.content}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
