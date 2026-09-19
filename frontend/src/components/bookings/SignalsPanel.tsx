/**
 * Signals panel — Jev's read on the buyer from their messages: responsiveness
 * and hesitation as status chips with confidences and the source tag.
 */

import type { BuyerSignals } from '@mortar/core'
import { JEV_REVIEW_THRESHOLD } from '@mortar/core'
import { JevTag } from '@/components/case/JevTag'
import { SignalChips } from '@/components/case/SignalChips'
import { formatPercent } from '@/components/case/format'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'

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
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Buyer Signals</h2>
          {signals && <JevTag meta={signals.meta} />}
          {needsReview && <StatusPill tone="warning">Needs Review</StatusPill>}
        </div>
        {signals ? (
          <>
            <SignalChips signals={signals} />
            <p className="text-[13px] text-muted-foreground">
              Responsiveness Confidence {formatPercent(signals.responsiveness.confidence)} · Hesitation Confidence{' '}
              {formatPercent(signals.hesitation.confidence)}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {hasBuyerMessages ? 'No Signal Read Yet.' : 'No Buyer Messages Have Arrived Yet.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
