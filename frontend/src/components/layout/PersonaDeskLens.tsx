/**
 * PersonaDeskLens — Role context and information boundary banner.
 *
 * Visually communicates the active persona's purview:
 * - Loan Admin: Full credit underwriting, DSR calculations & panel bank tracking.
 * - Sales Admin: Buyer engagement, follow-up queues, with confidential credit ratios masked.
 * - Legal Admin: Conveyancing, LO verification & SPA execution, with buyer salary/debt masked per PDPA.
 *
 * Includes quick-switch buttons so users can instantly test and experience
 * the role-tailored views and information boundaries.
 */

import { Eye, EyeOff, Landmark, Scale, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PERSONAS, PERSONA_PERMISSIONS, usePersona } from '@/lib/persona'

const PERSONA_ICONS = {
  'sales-admin': UserCheck,
  'loan-admin': Landmark,
  'legal-admin': Scale
}

export function PersonaDeskLens({ className }: { className?: string }) {
  const { persona, setPersona } = usePersona()
  const perm = PERSONA_PERMISSIONS[persona]
  const Icon = PERSONA_ICONS[persona]

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card/80 p-3 sm:p-4 text-xs transition-colors shadow-2xs',
        className
      )}
      data-testid="persona-desk-lens"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Active Persona Role & Lens Summary */}
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-accent text-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground text-sm">{perm.deskLabel}</span>
              <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
                {perm.lensSummary}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1 text-foreground/80">
                <Eye className="size-3 text-status-positive" />
                <span>
                  <strong>Purview:</strong> {perm.whatYouSee}
                </span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <EyeOff className="size-3 text-muted-foreground/80" />
                <span>
                  <strong>Boundaries:</strong> {perm.whatIsMasked}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Role Switcher */}
        <div className="flex items-center gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline mr-1">Switch Lens:</span>
          {PERSONAS.map((p) => {
            const PIcon = PERSONA_ICONS[p.id]
            const isCurrent = persona === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p.id)}
                aria-pressed={isCurrent}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer border',
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                    : 'border-border bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <PIcon className="size-3.5" />
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
