/**
 * Jev tag — where an answer came from, said in words a sales officer uses.
 * Jev keeps its name because attribution is the point: someone reading a
 * suggested action should know who suggested it. What it never shows is the
 * machine state behind the answer, so no cache states and no latency figure
 * (DESIGN.md Plain Language).
 */

import type { JevMeta } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'

function presentation(meta: JevMeta): { tone: StatusPillTone; label: string } {
  if (meta.source === 'unavailable') return { tone: 'danger', label: 'Jev Could Not Check' }
  if (meta.stale) return { tone: 'warning', label: "Jev's Answer May Be Out Of Date" }
  if (meta.source === 'live') return { tone: 'positive', label: 'Jev Checked Just Now' }
  return { tone: 'neutral', label: 'Jev Checked Earlier' }
}

export function JevTag({ meta, className }: { meta: JevMeta; className?: string }) {
  const { tone, label } = presentation(meta)
  return (
    <StatusPill tone={tone} className={className}>
      {label}
    </StatusPill>
  )
}
