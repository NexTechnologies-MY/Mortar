/**
 * Risk chip — the financing-risk flag as a status pill with a tooltip giving
 * the debt service ratio, instalment, margin and reasons. The trigger is a
 * button so the tooltip is reachable by keyboard focus.
 */

import type { FinancingRisk, RiskLevel } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatPercent, formatRm } from './format'

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk'
}

const RISK_TONES: Record<RiskLevel, StatusPillTone> = {
  low: 'positive',
  medium: 'warning',
  high: 'danger'
}

export function RiskChip({ risk, className }: { risk: FinancingRisk; className?: string }) {
  const details = [
    `Debt Service ${formatPercent(risk.debtServiceRatio)} · Margin ${formatPercent(risk.marginOfFinancing)}`,
    `Instalment ${formatRm(risk.instalmentRm)}/mo`,
    ...risk.reasons
  ].join('\n')

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex cursor-default rounded-sm">
            <StatusPill tone={RISK_TONES[risk.level]} className={className}>
              {RISK_LABELS[risk.level]}
            </StatusPill>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="whitespace-pre-line">
          {details}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
