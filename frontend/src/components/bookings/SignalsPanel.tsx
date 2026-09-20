/**
 * Signals panel — Jev's read on the buyer from their messages: responsiveness
 * and hesitation as status chips with the source tag. The confidence sentence
 * sits in an InfoTooltip beside the heading.
 */

import { useState } from 'react'
import type { BuyerSignals } from '@mortar/core'
import { JEV_REVIEW_THRESHOLD } from '@mortar/core'
import { JevTag } from '@/components/case/JevTag'
import { SignalChips } from '@/components/case/SignalChips'
import { formatPercent } from '@/components/case/format'
import { Card, CardContent } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { StatusPill } from '@/components/ui/status-pill'

/**
 * InfoTooltip's trigger is pointer-only (`tabIndex={-1}`), so the tooltip sits
 * on a wrapper whose hover and keyboard focus hold the controlled open state.
 */
function HeadingNote({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      tabIndex={0}
      aria-label={label}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="inline-flex rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
    >
      <InfoTooltip text={text} open={open} />
    </span>
  )
}

export function SignalsPanel({
  signals,
  hasBuyerMessages
}: {
  signals: BuyerSignals | null
  /** `false` when the buyer has never messaged — Jev is never asked, so there is no read to show. */
  hasBuyerMessages: boolean
}) {
  const needsReview =
    signals !== null &&
    (signals.responsiveness.confidence < JEV_REVIEW_THRESHOLD || signals.hesitation.confidence < JEV_REVIEW_THRESHOLD)
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Buyer Response
          </h2>
          {signals && (
            <HeadingNote
              label="Buyer signal confidences"
              text={`Responsiveness Confidence ${formatPercent(signals.responsiveness.confidence)} · Hesitation Confidence ${formatPercent(signals.hesitation.confidence)}`}
            />
          )}
          {signals && <JevTag meta={signals.meta} />}
          {needsReview && <StatusPill tone="warning">Needs Review</StatusPill>}
        </div>
        {signals ? (
          <SignalChips signals={signals} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {hasBuyerMessages ? 'No Signal Read Yet.' : 'No Buyer Messages Have Arrived Yet.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
