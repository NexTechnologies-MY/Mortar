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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {onViewChange && (
        <Tabs value={view} onValueChange={(next) => onViewChange(next as View)}>
          <TabsList>
            <TabsTrigger value="active">Active{activeCount !== undefined ? ` (${activeCount})` : ''}</TabsTrigger>
            <TabsTrigger value="closed">Closed{closedCount !== undefined ? ` (${closedCount})` : ''}</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {view === 'closed' && onExportClosed && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={exportDisabled || exporting}
          onClick={onExportClosed}
        >
          {exporting ? 'Exporting…' : 'Export To Excel'}
        </Button>
      )}
      <Select value={filter.stage} onValueChange={(stage) => onChange({ ...filter, stage: stage as Stage | 'all' })}>
        <SelectTrigger aria-label="Filter By Stage" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {stages.map((stage) => (
            <SelectItem key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filter.risk} onValueChange={(risk) => onChange({ ...filter, risk: risk as RiskLevel | 'all' })}>
        <SelectTrigger aria-label="Filter By Risk" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Risk Levels</SelectItem>
          {RISKS.map((level) => (
            <SelectItem key={level} value={level}>
              {RISK_LABELS[level]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Checkbox
          id="bookings-stalled-only"
          checked={filter.stalledOnly}
          onCheckedChange={(checked) => onChange({ ...filter, stalledOnly: checked === true })}
        />
        <Label htmlFor="bookings-stalled-only" className="cursor-pointer text-sm">
          Stalled Only
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="bookings-unknown-only"
          checked={filter.unknownOnly}
          onCheckedChange={(checked) => onChange({ ...filter, unknownOnly: checked === true })}
        />
        <Label htmlFor="bookings-unknown-only" className="cursor-pointer text-sm">
          No Update 10+ Days
        </Label>
      </div>
      <p className="ml-auto text-[13px] text-muted-foreground tabular-nums">
        {shown === total ? `${total} Bookings` : `${shown} Of ${total} Bookings`}
      </p>
    </div>
  )
}
