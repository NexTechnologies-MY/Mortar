/**
 * Evidence pill — the review status of a case event, or the freshness of a
 * case's evidence (`fresh` / `unknown`, for the list's evidence column).
 */

import type { EvidenceStatus } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'

export type EvidenceState = EvidenceStatus | 'fresh' | 'unknown'

export const EVIDENCE_LABELS: Record<EvidenceState, string> = {
  confirmed: 'Confirmed',
  provisional: 'Provisional',
  disputed: 'Disputed',
  superseded: 'Superseded',
  fresh: 'Fresh',
  unknown: 'Unknown'
}

const EVIDENCE_TONES: Record<EvidenceState, StatusPillTone> = {
  confirmed: 'positive',
  provisional: 'warning',
  disputed: 'danger',
  superseded: 'neutral',
  fresh: 'positive',
  unknown: 'warning'
}

export function EvidencePill({ status, className }: { status: EvidenceState; className?: string }) {
  return (
    <StatusPill tone={EVIDENCE_TONES[status]} className={className}>
      {EVIDENCE_LABELS[status]}
    </StatusPill>
  )
}
