/**
 * Case history — every event on the case, newest first: what happened, who
 * reported it, who verified it and where it stands. Provisional Jev proposals
 * become confirmed here when a reviewer accepts them. The full table waits
 * behind "Show Full History (N)"; the loan and legal track timelines above
 * carry the story the desk reads.
 */

import { useState } from 'react'
import { byOccurred, type CaseEvent } from '@mortar/core'
import { EvidencePill } from '@/components/case/EvidencePill'
import { DOCUMENT_LABELS, EVENT_KIND_LABELS, formatDateTime } from './labels'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const TRACK_LABELS: Record<CaseEvent['track'], string> = {
  sales: 'Sales',
  loan: 'Loan',
  legal: 'Legal'
}

/** The demo's own history and the story fixtures read the same to staff: Demo. */
const SOURCE_LABELS: Record<CaseEvent['source'], string> = {
  generator: 'Demo',
  story: 'Demo',
  staff: 'Staff',
  jev: 'Jev'
}

export function EvidenceLog({ events }: { events: CaseEvent[] }) {
  const [open, setOpen] = useState(false)
  // The case rules' order, reversed: equal times list the later entry first.
  const sorted = [...events].sort((a, b) => byOccurred(b, a))
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Case History</h2>
          {sorted.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[13px] text-muted-foreground"
              aria-expanded={open}
              aria-controls="case-history-table"
              onClick={() => setOpen((was) => !was)}
            >
              {open ? 'Hide Full History' : `Show Full History (${sorted.length})`}
            </Button>
          )}
        </div>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Updates Yet.</p>
        ) : (
          open && (
            <Table id="case-history-table">
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap text-[13px] tabular-nums">
                      {formatDateTime(event.occurredAt)}
                    </TableCell>
                    <TableCell className="text-[13px]">{TRACK_LABELS[event.track]}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{EVENT_KIND_LABELS[event.kind]}</span>
                      {event.document && (
                        <span className="text-[13px] text-muted-foreground"> · {DOCUMENT_LABELS[event.document]}</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-72 truncate text-[13px] text-muted-foreground">
                      {event.note ?? '—'}
                    </TableCell>
                    <TableCell className="text-[13px]">{event.reportedBy}</TableCell>
                    <TableCell className="text-[13px]">{event.verifiedBy ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{SOURCE_LABELS[event.source]}</Badge>
                    </TableCell>
                    <TableCell>
                      <EvidencePill status={event.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </CardContent>
    </Card>
  )
}
