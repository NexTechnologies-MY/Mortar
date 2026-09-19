/**
 * Signals panel — Jev's read on the buyer from their messages: responsiveness
 * and hesitation as status chips with confidences and the source tag.
 */

import type { BuyerSignals } from '@mortar/core'
import { JevTag } from '@/components/case/JevTag'
import { SignalChips } from '@/components/case/SignalChips'
import { formatPercent } from '@/components/case/format'
import { Card, CardContent } from '@/components/ui/card'

export function SignalsPanel({ signals }: { signals: BuyerSignals | null }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Buyer Signals</h2>
          {signals && <JevTag meta={signals.meta} />}
        </div>
        {signals ? (
          <>
            <SignalChips signals={signals} />
            <p className="text-[13px] text-muted-foreground">
              Responsiveness {formatPercent(signals.responsiveness.confidence)} · Hesitation{' '}
              {formatPercent(signals.hesitation.confidence)} Confidence
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No Signal Read Yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
