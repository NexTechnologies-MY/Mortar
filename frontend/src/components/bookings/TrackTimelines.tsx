/**
 * Track timelines — the case's loan and legal tracks side by side, with the
 * sales events beneath. Each entry carries its date, kind, document, note and
 * evidence status; provisional and disputed events show but never advance
 * the case.
 */

import type { CaseEvent, Track } from '@mortar/core'
import { EvidencePill } from '@/components/case/EvidencePill'
import { formatDate } from '@/components/case/format'
import { DOCUMENT_LABELS, EVENT_KIND_LABELS } from './labels'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DOTS: Record<CaseEvent['status'], string> = {
  confirmed: 'bg-inverse',
  provisional: 'bg-status-warning',
  disputed: 'bg-status-danger',
  superseded: 'bg-input'
}

function TrackColumn({ title, events }: { title: string; events: CaseEvent[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
      {events.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No Events Yet.</p>
      ) : (
        <ol className="flex flex-col">
          {events.map((event, i) => (
            <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < events.length - 1 && (
                <span aria-hidden="true" className="absolute top-3 left-[3px] h-full w-px bg-border" />
              )}
              <span
                aria-hidden="true"
                className={cn('relative mt-1.5 size-[7px] shrink-0 rounded-full', DOTS[event.status])}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">{EVENT_KIND_LABELS[event.kind]}</span>
                  <EvidencePill status={event.status} />
                </div>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {formatDate(event.occurredAt)}
                  {event.document ? ` · ${DOCUMENT_LABELS[event.document]}` : ''}
                  {event.note ? ` — ${event.note}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function TrackTimelines({ events }: { events: CaseEvent[] }) {
  const byTrack = (track: Track) =>
    events.filter((e) => e.track === track).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2">
        <TrackColumn title="Loan Track" events={byTrack('loan')} />
        <TrackColumn title="Legal Track" events={byTrack('legal')} />
        <div className="sm:col-span-2">
          <TrackColumn title="Sales Events" events={byTrack('sales')} />
        </div>
      </CardContent>
    </Card>
  )
}
