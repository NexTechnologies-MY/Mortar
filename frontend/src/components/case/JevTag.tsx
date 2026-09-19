/**
 * Jev tag — where an answer came from: live (`Jev · Live 420 ms`), cached,
 * stale cache, or unavailable when Jev could not answer at all.
 */

import type { JevMeta } from '@mortar/core'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'

function presentation(meta: JevMeta): { tone: StatusPillTone; label: string } {
  if (meta.source === 'unavailable') return { tone: 'danger', label: 'Jev · Unavailable' }
  if (meta.stale) return { tone: 'warning', label: 'Jev · Stale' }
  if (meta.source === 'live') {
    return { tone: 'positive', label: `Jev · Live${meta.latencyMs != null ? ` ${meta.latencyMs} ms` : ''}` }
  }
  return { tone: 'neutral', label: 'Jev · Cached' }
}

export function JevTag({ meta, className }: { meta: JevMeta; className?: string }) {
  const { tone, label } = presentation(meta)
  return (
    <StatusPill tone={tone} className={className}>
      {label}
    </StatusPill>
  )
}
