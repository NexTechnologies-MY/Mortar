/**
 * Applications card — the booking's bank applications with their derived
 * status (submitted, documents pending, approved, rejected, withdrawn).
 */

import type { ApplicationStatus, CaseSummary, LoanApplication } from '@mortar/core'
import { APPLICATION_STATUS_LABELS } from './labels'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'

const STATUS_TONES: Record<ApplicationStatus, StatusPillTone> = {
  submitted: 'info',
  documents_pending: 'warning',
  approved: 'positive',
  rejected: 'danger',
  withdrawn: 'neutral'
}

export function ApplicationsCard({ applications, summary }: { applications: LoanApplication[]; summary: CaseSummary }) {
  const statusById = new Map(summary.applications.map((a) => [a.id, a.status]))
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Bank Applications
        </h2>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Applications Yet.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {applications.map((app) => {
              const status = statusById.get(app.id) ?? 'submitted'
              return (
                <li key={app.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{app.bank}</p>
                    <p className="truncate text-[13px] text-muted-foreground">{app.banker}</p>
                  </div>
                  <StatusPill tone={STATUS_TONES[status]}>{APPLICATION_STATUS_LABELS[status]}</StatusPill>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
