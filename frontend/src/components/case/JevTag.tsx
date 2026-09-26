/**
 * Jev tag — where an answer came from, said in words a sales officer uses.
 * Jev keeps its name because attribution is the point: someone reading a
 * suggested action should know who suggested it. What it never shows is the
 * machine state behind the answer, so no cache states and no latency figure
 * (DESIGN.md Plain Language).
 *
 * It speaks once, not on every row. A case carries this on each message and on
 * the What To Do and Buyer Response panels, so six grey pills said nothing a
 * reader did not already know. What survives is what the person who just asked
 * needs to see: Jev checked just now, or Jev could not check. A cached answer
 * that still matches the case says nothing at all, and a cached answer the
 * case has since moved on from is a small clock whose tooltip says why, for
 * whoever goes looking for it.
 */

import type { JevMeta } from '@mortar/core'
import { Clock } from 'lucide-react'
import { StatusPill, type StatusPillTone } from '@/components/ui/status-pill'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** Why the clock is there, for anyone who asks the icon. */
const OUT_OF_DATE = 'Jev Read This Before The Latest Update. Ask Jev Again To Refresh.'

/** The pill states that still matter to whoever just asked. */
function pill(meta: JevMeta): { tone: StatusPillTone; label: string } | null {
  if (meta.source === 'unavailable') return { tone: 'danger', label: 'Jev Could Not Check' }
  if (meta.source === 'live') return { tone: 'positive', label: 'Jev Checked Just Now' }
  return null
}

export function JevTag({ meta, className }: { meta: JevMeta; className?: string }) {
  const shown = pill(meta)
  if (shown) {
    return (
      <StatusPill tone={shown.tone} className={className}>
        {shown.label}
      </StatusPill>
    )
  }
  // A cached answer that still matches the case carries no news.
  if (!meta.stale) return null
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex items-center align-middle text-muted-foreground', className)}>
            <Clock aria-label={OUT_OF_DATE} className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{OUT_OF_DATE}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
