/**
 * Stage pill — a booking's pipeline stage as a status pill.
 * Terminal exits (cancelled, lapsed) read danger; the rest follow the
 * spec's status words (Booked, With Bank, SPA Signed).
 */

import type { Stage } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'

export const STAGE_LABELS: Record<Stage, string> = {
  booked: 'Booked',
  loan_applied: 'With Bank',
  lo_issued: 'LO Issued',
  loan_agreement: 'Loan Agreement',
  disbursed: 'Disbursed',
  spa_signed: 'SPA Signed',
  cancelled: 'Cancelled',
  lapsed: 'Lapsed'
}

const STAGE_TONES: Record<Stage, StatusPillTone> = {
  booked: 'neutral',
  loan_applied: 'info',
  lo_issued: 'positive',
  loan_agreement: 'positive',
  disbursed: 'positive',
  spa_signed: 'signed',
  cancelled: 'danger',
  lapsed: 'danger'
}

export function StagePill({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <StatusPill tone={STAGE_TONES[stage]} className={className}>
      {STAGE_LABELS[stage]}
    </StatusPill>
  )
}
