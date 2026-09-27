/**
 * Who Holds Each Booking — Pipeline and holder filter strip.
 *
 * Visualizes the 5 milestones and holders:
 * 1. Buyer
 * 2. Bank
 * 3. Solicitor
 * 4. Signed
 * 5. Us
 *
 * Each step carries its count and, unless the case is closed, how many of them
 * have stalled. There is no description line under a step: at five across, one
 * line of prose only ever read half-truncated.
 *
 * Each step acts as a filter: clicking a step filters the table below to that
 * holder, and a second click clears the filter back to all holders.
 */

import { AlertTriangle, Building2, ChevronDown, FileSignature, Landmark, Scale, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

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
}

const STEPS: StepConfig[] = [
  { id: 'buyer', title: 'Buyer', icon: User, holderLabel: 'Buyer' },
  { id: 'bank', title: 'Bank', icon: Landmark, holderLabel: 'Bank' },
  { id: 'solicitor', title: 'Solicitor', icon: Scale, holderLabel: 'Solicitor' },
  { id: 'spa', title: 'Signed', icon: FileSignature, holderLabel: 'Signed' },
  { id: 'developer', title: 'Us', icon: Building2, holderLabel: 'Us' }
]

export function BookingPipelineFlow({ counts, selection, onSelect, onClear, className }: BookingPipelineFlowProps) {
  const [expanded, setExpanded] = useState(false)
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
      className={cn('rounded-md border border-border bg-card p-3 transition-colors', className)}
      data-testid="booking-pipeline-flow"
    >
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 -ml-2 gap-1 text-left"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown aria-hidden="true" className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
          <h2 className="text-sm font-semibold text-foreground">Who Holds Each Booking</h2>
        </Button>
        <div className="flex items-center gap-2">
          <InfoTooltip text="Click A Holder To Filter The Bookings Below." />
          {!expanded && (
            <div className="flex items-center gap-1.5">
              {STEPS.map((step) => {
                const Icon = step.icon
                const count = step.id === 'spa' ? counts.spa.total : counts[step.id].total
                return (
                  <span
                    key={step.id}
                    className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground"
                    aria-label={`${step.title}: ${count}`}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {count}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* The 5-Step Process Pipeline */}
      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_minmax(140px,0.8fr)]">
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

                  {/* Stall indicator, or nothing on the signed step: its count
                    already reads "21 signed" and it is the one stage that
                    cannot stall. */}
                  {isSpa ? null : (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {stalledCount > 0 ? (
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
                  )}
                </div>
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
