/**
 * Risk chip — the financing-risk flag as a status pill with a tooltip giving
 * the debt service ratio, instalment, margin and reasons. The trigger is a
 * button so the tooltip is reachable by keyboard focus.
 *
 * Role Purview & Information Boundaries:
 * - Loan Admin: Full credit ratio, DSR %, monthly instalment & reasons unmasked.
 * - Sales Admin: Risk level & buyer action reasons visible; internal banker DSR
 *   formulas masked to keep focus on sales lead chasing.
 * - Legal Admin: Malaysian PDPA compliant; buyer personal debt commitments &
 *   ratios masked from conveyancing desk; focus on LO & SPA execution.
 */

import { Lock } from 'lucide-react'
import type { FinancingRisk, RiskLevel } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePersonaSafe } from '@/lib/persona'
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
  const { persona } = usePersonaSafe()

  // Build role-appropriate details for tooltip
  let details: string

  if (persona === 'legal-admin') {
    details = [
      '🔒 Protected Under Malaysian PDPA (Loan Purview)',
      'Buyer debt service ratios & personal commitments are restricted from conveyancing desk.',
      'Primary Legal Purview: Verify Bank Letter of Offer & execute SPA.'
    ].join('\n')
  } else if (persona === 'sales-admin') {
    const reasons = risk.reasons.length > 0 ? risk.reasons : ['No specific risk flags recorded']
    details = [
      `Financing Risk: ${RISK_LABELS[risk.level]}`,
      '🔒 Internal DSR & Underwriting Ratios: Restricted to Loan Desk',
      'Buyer Action Items:',
      ...reasons
    ].join('\n')
  } else {
    // Default / Loan Admin: full unmasked financial underwriting details
    details = [
      `Debt Service ${formatPercent(risk.debtServiceRatio)} · Margin ${formatPercent(risk.marginOfFinancing)}`,
      `Instalment ${formatRm(risk.instalmentRm)}/mo`,
      ...risk.reasons
    ].join('\n')
  }

  const isLegal = persona === 'legal-admin'

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex cursor-default rounded-sm items-center">
            <StatusPill tone={RISK_TONES[risk.level]} className={className}>
              {isLegal && <Lock className="mr-1 size-3 shrink-0 inline-block" aria-hidden="true" />}
              {RISK_LABELS[risk.level]}
            </StatusPill>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="whitespace-pre-line text-xs max-w-xs">
          {details}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
