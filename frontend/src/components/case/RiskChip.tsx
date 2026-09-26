/**
 * Risk chip — the financing-risk flag as a status pill, with a tooltip that
 * explains the risk in plain words: monthly repayments compared with income,
 * the margin, the instalment, and the reasons. The trigger is a button so the
 * tooltip is reachable by keyboard focus.
 *
 * Every persona sees the same figures. Nothing on the server masks buyer data,
 * so the chip claims no masking and no privacy boundary.
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
  const reasons = risk.reasons.length > 0 ? risk.reasons : ['No Specific Risk Flags Recorded']
  const details = [
    `Monthly Repayments Compared With Income: ${formatPercent(risk.debtServiceRatio)}`,
    `Loan Against The Property Value: ${formatPercent(risk.marginOfFinancing)}`,
    `Monthly Repayment ${formatRm(risk.instalmentRm)}`,
    ...reasons
  ].join('\n')

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex cursor-default rounded-sm items-center">
            <StatusPill tone={RISK_TONES[risk.level]} className={className}>
              {RISK_LABELS[risk.level]}
            </StatusPill>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs whitespace-pre-line text-xs">
          {details}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
