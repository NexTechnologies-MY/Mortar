/**
 * Filter bar for the bookings list — stage, who the case is waiting on, and
 * financing-risk selects plus a "No Update 10+ Days" toggle (issue #22; the
 * internal field name `unknownOnly` is unchanged, only the label reads
 * plainly for staff). The count of visible rows sits at the right edge.
 */

import type { BallHolder, RiskLevel, Stage } from '@mortar/core'
import { BALL_HOLDERS, BALL_HOLDER_LABELS } from '@/components/case/ball'
import { STAGE_LABELS } from '@/components/case/StagePill'
import { RISK_LABELS } from '@/components/case/RiskChip'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface BookingFilter {
  stage: Stage | 'all'
  waitingOn: BallHolder | 'all'
  risk: RiskLevel | 'all'
  unknownOnly: boolean
}

const RISKS = Object.keys(RISK_LABELS) as RiskLevel[]

export function BookingFilters({
  filter,
  onChange,
  shown,
  total,
  stages
}: {
  filter: BookingFilter
  onChange: (next: BookingFilter) => void
  shown: number
  total: number
  /** The stages the current tab can show; the Stage select offers only these (issue M10). */
  stages: Stage[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
      <Select
        value={filter.waitingOn}
        onValueChange={(waitingOn) => onChange({ ...filter, waitingOn: waitingOn as BallHolder | 'all' })}
      >
        <SelectTrigger aria-label="Filter By Who The Case Waits On" className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Waiting On Anyone</SelectItem>
          {BALL_HOLDERS.map((holder) => (
            <SelectItem key={holder} value={holder}>
              Waiting On {BALL_HOLDER_LABELS[holder]}
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
