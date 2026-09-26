/**
 * Applications card — the booking's bank applications with their derived
 * status (submitted, documents pending, approved, rejected, withdrawn).
 */

import type { ApplicationStatus, CaseSummary, LoanApplication } from '@mortar/core'
import { APPLICATION_STATUS_LABELS } from './labels'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import { usePersonaSafe } from '@/lib/persona'

const STATUS_TONES: Record<ApplicationStatus, StatusPillTone> = {
  submitted: 'info',
  documents_pending: 'warning',
  approved: 'positive',
  rejected: 'danger',
  withdrawn: 'neutral'
}

export function ApplicationsCard({ applications, summary }: { applications: LoanApplication[]; summary: CaseSummary }) {
  const { persona } = usePersonaSafe()
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

        {/* Role Information Boundary Notice */}
        {persona === 'legal-admin' && (
          <div className="rounded-md border border-border/80 bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2 mt-1">
            <Lock className="size-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-foreground">PDPA Privacy Boundary:</strong> Buyer debt ratios, private
              liabilities, and internal bank credit scores are restricted to Loan Admin desk. Legal purview begins upon
              Letter of Offer issuance.
            </div>
          </div>
        )}

        {persona === 'sales-admin' && (
          <div className="rounded-md border border-border/80 bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2 mt-1">
            <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-foreground">Sales Desk View:</strong> Track bank approval status to keep the buyer
              engaged. Complex underwriting calculations are owned by Loan Admin.
            </div>
          </div>
        )}

        {persona === 'loan-admin' && (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2 mt-1">
            <ShieldCheck className="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-foreground">Loan Underwriting Desk:</strong> Full panel bank management active.
              Review underwriting covenants and chase pending Letters of Offer.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
