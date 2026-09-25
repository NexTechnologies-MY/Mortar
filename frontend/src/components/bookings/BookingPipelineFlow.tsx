/**
 * Booking-to-SPA Journey & Stalling Pipeline Tracker.
 *
 * Visualizes the 4 critical conveyancing milestones:
 * 1. Booking & Client (Buyer): Reservation & pending documents
 * 2. Panel Bank: Loan underwriting & credit approval
 * 3. Law Firm (Solicitor): SPA drafting & execution scheduling
 * 4. SPA Signed: Converted milestone (legally sold)
 *
 * Each node displays the total active cases on their hand (large KPI figure),
 * the number of stalled cases (with alert pills), and pressing a node filters
 * the ledger below to isolate those cases (stalled cases by default, with an
 * all-cases toggle and reset).
 */

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileSignature,
  Filter,
  Landmark,
  Scale,
  Sparkles,
  User,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePersonaSafe } from '@/lib/persona'

export type PipelineStageId = 'buyer' | 'bank' | 'solicitor' | 'spa' | 'developer'

export interface PipelineSelection {
  stageId: PipelineStageId | null
  stalledOnly: boolean
}

export interface PipelineStageCounts {
  total: number
  stalled: number
}

export interface PipelineCounts {
  buyer: PipelineStageCounts
  bank: PipelineStageCounts
  solicitor: PipelineStageCounts
  spa: { total: number }
  developer: PipelineStageCounts
}

export interface BookingPipelineFlowProps {
  counts: PipelineCounts
  selection: PipelineSelection
  onSelect: (selection: PipelineSelection) => void
  onClear: () => void
  className?: string
}

interface StepConfig {
  id: PipelineStageId
  stepNumber: string
  title: string
  subtitle: string
  icon: typeof User
  holderLabel: string
  description: string
}

const STEPS: StepConfig[] = [
  {
    id: 'buyer',
    stepNumber: '01',
    title: 'Client / Buyer',
    subtitle: 'Reservation & Docs',
    icon: User,
    holderLabel: 'Buyer',
    description: 'Awaiting payslips, EPF statements, or buyer documents'
  },
  {
    id: 'bank',
    stepNumber: '02',
    title: 'Panel Bank',
    subtitle: 'Loan Underwriting',
    icon: Landmark,
    holderLabel: 'Bank',
    description: 'Submitted applications awaiting credit review & LO'
  },
  {
    id: 'solicitor',
    stepNumber: '03',
    title: 'Law Firm',
    subtitle: 'Conveyancing & SPA',
    icon: Scale,
    holderLabel: 'Law Firm',
    description: 'LO accepted, drafting SPA & coordinating signing'
  },
  {
    id: 'spa',
    stepNumber: '04',
    title: 'SPA Signed',
    subtitle: 'Legally Sold',
    icon: FileSignature,
    holderLabel: 'SPA Signed',
    description: 'Contract executed & legally binding sale completed'
  }
]

export function BookingPipelineFlow({ counts, selection, onSelect, onClear, className }: BookingPipelineFlowProps) {
  const { persona } = usePersonaSafe()
  const isAnyActive = selection.stageId !== null

  // Map active persona to primary pipeline milestones
  const isPrimaryForStep = (stepId: PipelineStageId): { isPrimary: boolean; label: string } => {
    if (persona === 'sales-admin' && stepId === 'buyer') {
      return { isPrimary: true, label: '★ Your Primary Desk (Sales)' }
    }
    if (persona === 'loan-admin' && stepId === 'bank') {
      return { isPrimary: true, label: '★ Your Primary Desk (Underwriting)' }
    }
    if (persona === 'legal-admin' && (stepId === 'solicitor' || stepId === 'spa')) {
      return { isPrimary: true, label: '★ Your Primary Desk (Conveyancing)' }
    }
    return { isPrimary: false, label: '' }
  }

  const handleCardClick = (stageId: PipelineStageId) => {
    if (selection.stageId === stageId) {
      // Toggle off if already selected
      onClear()
      return
    }

    if (stageId === 'spa') {
      onSelect({ stageId: 'spa', stalledOnly: false })
      return
    }

    // Default to showing stalled cases if any are stalled; otherwise show all cases on hand
    const hasStalled =
      stageId === 'bank'
        ? counts.bank.stalled > 0
        : stageId === 'buyer'
          ? counts.buyer.stalled > 0
          : stageId === 'solicitor'
            ? counts.solicitor.stalled > 0
            : counts.developer.stalled > 0

    onSelect({ stageId, stalledOnly: hasStalled })
  }

  const getActiveFilterLabel = (): string => {
    if (!selection.stageId) return ''
    if (selection.stageId === 'spa') return `SPA Signed (${counts.spa.total} cases)`
    const labels: Record<PipelineStageId, string> = {
      buyer: 'Client / Buyer',
      bank: 'Panel Bank',
      solicitor: 'Law Firm',
      developer: 'Developer Desk',
      spa: 'SPA Signed'
    }
    const name = labels[selection.stageId]
    if (selection.stalledOnly) {
      const count =
        selection.stageId === 'bank'
          ? counts.bank.stalled
          : selection.stageId === 'buyer'
            ? counts.buyer.stalled
            : selection.stageId === 'solicitor'
              ? counts.solicitor.stalled
              : counts.developer.stalled
      return `Stalled by ${name} (${count} cases)`
    }
    const total =
      selection.stageId === 'bank'
        ? counts.bank.total
        : selection.stageId === 'buyer'
          ? counts.buyer.total
          : selection.stageId === 'solicitor'
            ? counts.solicitor.total
            : counts.developer.total
    return `All ${name} Cases (${total} cases)`
  }

  return (
    <div
      className={cn('rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs transition-colors', className)}
      data-testid="booking-pipeline-flow"
    >
      {/* Header with Title and Clear Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Booking-to-SPA Pipeline & Bottleneck Flow
            </h2>
            {isAnyActive && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                <Filter className="mr-1 size-3 inline" />
                Filtered View Active
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            End-to-end journey separated by stalling party. Click any stage to isolate cases on their hand or view
            stalled files.
          </p>
        </div>

        {isAnyActive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
            className="h-8 gap-1.5 text-xs border-dashed text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Reset Pipeline Filter
          </Button>
        )}
      </div>

      {/* The 4-Step Process Pipeline Line */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 relative">
        {STEPS.map((step, index) => {
          const isSpa = step.id === 'spa'
          const isPrimary = isPrimaryForStep(step.id)
          const isSelected = selection.stageId === step.id
          const totalCount = isSpa
            ? counts.spa.total
            : step.id === 'buyer'
              ? counts.buyer.total
              : step.id === 'bank'
                ? counts.bank.total
                : counts.solicitor.total
          const stalledCount = isSpa
            ? 0
            : step.id === 'buyer'
              ? counts.buyer.stalled
              : step.id === 'bank'
                ? counts.bank.stalled
                : counts.solicitor.stalled

          const Icon = step.icon

          return (
            <div key={step.id} className="relative flex flex-col">
              {/* Card Container */}
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Filter by ${step.title}: ${totalCount} on hand, ${stalledCount} stalled`}
                onClick={() => handleCardClick(step.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCardClick(step.id)
                  }
                }}
                className={cn(
                  'group flex flex-1 flex-col justify-between rounded-md border p-3.5 sm:p-4 text-left cursor-pointer transition-all duration-150 select-none relative',
                  isSelected
                    ? 'border-primary bg-accent/60 shadow-xs ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : isPrimary.isPrimary
                      ? 'border-primary/60 bg-accent/20 shadow-2xs ring-1 ring-primary/30 hover:bg-accent/40'
                      : 'border-border bg-card/60 hover:bg-accent/30 hover:border-foreground/25'
                )}
              >
                {/* Top Row: Step Index & Role Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        'flex size-7 items-center justify-center rounded-md border transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted/60 text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          {step.stepNumber}
                        </span>
                        {isPrimary.isPrimary && (
                          <span className="inline-flex items-center gap-0.5 rounded-xs bg-primary/15 px-1 py-0.2 text-[9px] font-bold text-primary border border-primary/25">
                            <Sparkles className="size-2.5" />
                            Your Desk
                          </span>
                        )}
                      </div>
                      <span className="block text-xs font-semibold leading-tight text-foreground">{step.title}</span>
                    </div>
                  </div>

                  {/* Flow connector indicator for desktop */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden lg:flex size-5 items-center justify-center text-muted-foreground/40 group-hover:text-muted-foreground/80 transition-colors">
                      <ChevronRight className="size-4" />
                    </div>
                  )}
                </div>

                {/* Middle: Big Figure and Label */}
                <div className="my-3">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-foreground tabular-nums">
                      {totalCount}
                    </p>
                    <span className="text-xs text-muted-foreground font-medium">
                      {isSpa ? 'conversions' : 'cases on hand'}
                    </span>
                  </div>

                  {/* Stall indicator pill or Completed badge */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {isSpa ? (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-status-positive-bg px-2 py-0.5 text-[11px] font-medium text-status-positive-fg border border-status-positive/25">
                        <CheckCircle2 className="size-3" />
                        Legally Sold
                      </span>
                    ) : stalledCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-status-danger-bg px-2 py-0.5 text-[11px] font-medium text-status-danger-fg border border-status-danger/25">
                        <AlertTriangle className="size-3 shrink-0" />
                        {stalledCount} Stalled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        0 Stalled
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom: Context Note & Interactive Toggle if Selected */}
                <div className="border-t border-border/60 pt-2.5">
                  {isSelected && !isSpa ? (
                    <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-foreground font-semibold">Filter Mode:</span>
                        <button
                          type="button"
                          onClick={() => onSelect({ stageId: step.id, stalledOnly: !selection.stalledOnly })}
                          className="text-primary underline text-[11px] hover:text-primary-hover cursor-pointer"
                        >
                          Switch to {selection.stalledOnly ? `All (${totalCount})` : `Stalled (${stalledCount})`}
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => onSelect({ stageId: step.id, stalledOnly: true })}
                          className={cn(
                            'flex-1 text-center py-1 px-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                            selection.stalledOnly
                              ? 'bg-status-danger-bg text-status-danger-fg font-semibold border border-status-danger/40'
                              : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          Stalled Only ({stalledCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelect({ stageId: step.id, stalledOnly: false })}
                          className={cn(
                            'flex-1 text-center py-1 px-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer',
                            !selection.stalledOnly
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          All Cases ({totalCount})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">{step.description}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Banner: Active Filter Summary and Developer Desk cases */}
      <div className="mt-3.5 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {isAnyActive ? (
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
              <span>
                Showing: <strong>{getActiveFilterLabel()}</strong>
              </span>
              <button
                type="button"
                onClick={onClear}
                className="text-primary hover:underline ml-1 cursor-pointer font-normal"
              >
                (Show All Active Bookings)
              </button>
            </div>
          ) : (
            <span>
              Tip: Click any stage above (e.g. <strong>Panel Bank</strong>) to immediately filter cases stalled by that
              party.
            </span>
          )}
        </div>

        {/* Developer desk actions badge */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-muted-foreground">Developer Desk:</span>
          <button
            type="button"
            onClick={() => handleCardClick('developer')}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer border',
              selection.stageId === 'developer'
                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                : 'bg-muted hover:bg-accent border-border text-foreground'
            )}
          >
            <Building2 className="size-3" />
            <span>{counts.developer.total} cases</span>
            {counts.developer.stalled > 0 && (
              <span className="text-status-danger-fg font-medium">({counts.developer.stalled} stalled)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
