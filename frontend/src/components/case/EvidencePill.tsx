/**
 * Update pill — the review status of a case event, or how current a case's
 * updates are (`fresh` / `unknown`, for the list's Last Update column).
 * Wording follows DESIGN.md Plain Language: no "evidence", no "provisional".
 */

import type { EvidenceStatus } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'

export type EvidenceState = EvidenceStatus | 'fresh' | 'unknown'

export const EVIDENCE_LABELS: Record<EvidenceState, string> = {
  confirmed: 'Confirmed',
  provisional: 'Unconfirmed',
  disputed: 'Queried',
  superseded: 'Replaced',
  fresh: 'Up To Date',
  unknown: 'No Recent Update'
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
