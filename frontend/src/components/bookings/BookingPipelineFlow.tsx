/**
 * Who Holds Each Booking — Pipeline and holder filter strip.
 *
 * Visualizes the 5 conveyancing milestones and holders:
 * 1. Buyer: Reservation & pending documents
 * 2. Bank: Loan underwriting & credit approval
 * 3. Solicitor: SPA drafting & execution scheduling
 * 4. Signed: Converted milestone (legally sold)
 * 5. Us: Developer desk actions & case releases
 *
 * Each step acts as a filter: clicking a step filters the ledger below to that
 * holder, and a second click clears the filter back to all holders.
 */

import { AlertTriangle, Building2, CheckCircle2, FileSignature, Landmark, Scale, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type PipelineStageId = 'buyer' | 'bank' | 'solicitor' | 'spa' | 'developer'

export interface PipelineSelection {
  stageId: PipelineStageId | null
  stalledOnly?: boolean
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
  selection?: PipelineSelection | PipelineStageId | null
  onSelect: (selection: PipelineSelection) => void
  onClear: () => void
  className?: string
}

interface StepConfig {
  id: PipelineStageId
  title: string
  icon: typeof User
  holderLabel: string
  description: string
}

const STEPS: StepConfig[] = [
  {
    id: 'buyer',
    title: 'Buyer',
    icon: User,
    holderLabel: 'Buyer',
    description: 'Awaiting payslips, EPF statements, or buyer documents'
  },
  {
    id: 'bank',
    title: 'Bank',
    icon: Landmark,
    holderLabel: 'Bank',
    description: 'Submitted applications awaiting credit review & LO'
  },
  {
    id: 'solicitor',
    title: 'Solicitor',
    icon: Scale,
    holderLabel: 'Solicitor',
    description: 'LO accepted, drafting SPA & coordinating signing'
  },
  {
    id: 'spa',
    title: 'Signed',
    icon: FileSignature,
    holderLabel: 'Signed',
    description: 'Contract executed & legally binding sale completed'
  },
  {
    id: 'developer',
    title: 'Us',
    icon: Building2,
    holderLabel: 'Us',
    description: 'Developer desk actions & case releases'
  }
]

export function BookingPipelineFlow({ counts, selection, onSelect, onClear, className }: BookingPipelineFlowProps) {
  const currentStageId =
    typeof selection === 'string' ? selection : selection && typeof selection === 'object' ? selection.stageId : null

  const handleCardClick = (stageId: PipelineStageId) => {
    if (currentStageId === stageId) {
      onClear()
    } else {
      onSelect({ stageId, stalledOnly: false })
    }
  }

  return (
    <div
      className={cn('rounded-md border border-border bg-card p-4 sm:p-5 transition-colors', className)}
      data-testid="booking-pipeline-flow"
    >
      {/* Header with Title */}
      <div className="border-b border-border pb-3">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">Who Holds Each Booking</h2>
        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">Click A Stage To Filter By That Holder.</p>
      </div>

      {/* The 5-Step Process Pipeline */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_minmax(140px,0.8fr)]">
        {STEPS.map((step) => {
          const isSpa = step.id === 'spa'
          const isSelected = currentStageId === step.id
          const totalCount = isSpa
            ? counts.spa.total
            : step.id === 'buyer'
              ? counts.buyer.total
              : step.id === 'bank'
                ? counts.bank.total
                : step.id === 'solicitor'
                  ? counts.solicitor.total
                  : counts.developer.total
          const stalledCount = isSpa
            ? 0
            : step.id === 'buyer'
              ? counts.buyer.stalled
              : step.id === 'bank'
                ? counts.bank.stalled
                : step.id === 'solicitor'
                  ? counts.solicitor.stalled
                  : counts.developer.stalled

          const Icon = step.icon

          return (
            <Button
              key={step.id}
              type="button"
              variant="outline"
              aria-pressed={isSelected}
              aria-label={`Filter by ${step.title}: ${totalCount} bookings${stalledCount > 0 ? `, ${stalledCount} stalled` : ''}`}
              onClick={() => handleCardClick(step.id)}
              className={cn(
                'group relative flex h-auto flex-1 flex-col items-stretch justify-between rounded-md border p-3.5 sm:p-4 text-left whitespace-normal font-normal cursor-pointer transition-colors',
                isSelected
                  ? 'border-primary bg-accent/60 ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'border-border bg-card hover:bg-accent/40 hover:border-foreground/25'
              )}
            >
              {/* Top Row: Icon & Title */}
              <div className="flex items-center gap-2">
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
                <span className="block text-xs font-semibold leading-tight text-foreground">{step.title}</span>
              </div>

              {/* Middle: Big Figure and Label */}
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-foreground tabular-nums">
                    {totalCount}
                  </p>
                  <span className="text-xs text-muted-foreground font-medium">{isSpa ? 'signed' : 'bookings'}</span>
                </div>

                {/* Stall indicator pill or Completed badge */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {isSpa ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-status-positive-bg px-2 py-0.5 text-[11px] font-medium text-status-positive-fg border border-status-positive/25">
                      <CheckCircle2 className="size-3" />
                      Signed
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

              {/* Bottom: Context Note */}
              <div className="border-t border-border/60 pt-2.5">
                <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">{step.description}</p>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
