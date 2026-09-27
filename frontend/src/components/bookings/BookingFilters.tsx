/**
 * Filter bar for the bookings list — Active/Closed tabs, stage and financing-risk
 * selects, "Stalled Only" and "No Update 10+ Days" toggles. The count of visible
 * rows sits at the right edge.
 */

import type { RiskLevel, Stage } from '@mortar/core'
import { STAGE_LABELS } from '@/components/case/StagePill'
import { RISK_LABELS } from '@/components/case/RiskChip'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import { ListFilter } from 'lucide-react'

export type View = 'active' | 'closed'

export interface BookingFilter {
  stage: Stage | 'all'
  risk: RiskLevel | 'all'
  stalledOnly: boolean
  unknownOnly: boolean
}

export interface BookingFiltersProps {
  filter: BookingFilter
  onChange: (next: BookingFilter) => void
  shown: number
  total: number
  /** The stages the current tab can show; the Stage select offers only these (issue M10). */
  stages: Stage[]
  view?: View
  onViewChange?: (view: View) => void
  activeCount?: number
  closedCount?: number
  onExportClosed?: () => void
  exporting?: boolean
  exportDisabled?: boolean
}

const RISKS = Object.keys(RISK_LABELS) as RiskLevel[]

export function BookingFilters({
  filter,
  onChange,
  shown,
  total,
  stages,
  view = 'active',
  onViewChange,
  activeCount,
  closedCount,
  onExportClosed,
  exporting = false,
  exportDisabled = false
}: BookingFiltersProps) {
  const [open, setOpen] = useState(false)
  const check = (id: string, label: string, checked: boolean, onChange: (checked: boolean) => void) => (
    <div key={id} className="flex items-center gap-2 py-1">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <Label htmlFor={id} className="cursor-pointer text-sm">
        {label}
      </Label>
    </div>
  )
  const active = view === 'active'
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="secondary" size="sm" aria-label="Filters">
            <ListFilter aria-hidden="true" /> Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72">
          <p className="mb-2 text-sm font-semibold">Filter Bookings</p>
          {onViewChange && (
            <>
              {check(
                'bookings-active',
                `Active${activeCount !== undefined ? ` (${activeCount})` : ''}`,
                active,
                (checked) => {
                  if (checked) onViewChange('active')
                }
              )}
              {check(
                'bookings-closed',
                `Closed${closedCount !== undefined ? ` (${closedCount})` : ''}`,
                !active,
                (checked) => {
                  if (checked) onViewChange('closed')
                }
              )}
            </>
          )}
          <div className="my-2 border-t border-border" />
          {check('bookings-stage-all', 'All Stages', filter.stage === 'all', (checked) => {
            if (checked) onChange({ ...filter, stage: 'all' })
          })}
          {stages.map((stage) =>
            check(`bookings-stage-${stage}`, STAGE_LABELS[stage], filter.stage === stage, (checked) =>
              onChange({ ...filter, stage: checked ? stage : 'all' })
            )
          )}
          <div className="my-2 border-t border-border" />
          {check('bookings-risk-all', 'All Risk Levels', filter.risk === 'all', (checked) => {
            if (checked) onChange({ ...filter, risk: 'all' })
          })}
          {RISKS.map((level) =>
            check(`bookings-risk-${level}`, RISK_LABELS[level], filter.risk === level, (checked) =>
              onChange({ ...filter, risk: checked ? level : 'all' })
            )
          )}
          <div className="my-2 border-t border-border" />
          {check('bookings-stalled-only', 'Stalled Only', filter.stalledOnly, (checked) =>
            onChange({ ...filter, stalledOnly: checked })
          )}
          {check('bookings-unknown-only', 'No Update 10+ Days', filter.unknownOnly, (checked) =>
            onChange({ ...filter, unknownOnly: checked })
          )}
          {view === 'closed' && onExportClosed && (
            <Button
              className="mt-2 w-full"
              type="button"
              variant="secondary"
              size="sm"
              disabled={exportDisabled || exporting}
              onClick={onExportClosed}
            >
              {exporting ? 'Exporting…' : 'Export To Excel'}
            </Button>
          )}
        </PopoverContent>
      </Popover>
      <p className="ml-auto text-[13px] text-muted-foreground tabular-nums">
        {shown === total ? `${total} Bookings` : `${shown} Of ${total} Bookings`}
      </p>
    </div>
  )
}
