/**
 * The one change worth making, with its arithmetic on the screen.
 *
 * Most bookings that died took a loan rejection and never went to a second
 * bank. Cases that did resubmit signed often enough to be worth the effort, so
 * the recoverable figure is that rate applied to the ones nobody resubmitted.
 *
 * The sample behind the rate is small — single digits — so the estimate is
 * never shown as a bare number. The Wilson interval sits beside it in the same
 * type size, and the live list below turns the claim into work someone can do
 * this afternoon rather than a figure in a deck.
 */

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Leakage } from '@mortar/core'
import { formatRm, formatRmCompact, formatPercent } from '@/components/case'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

export function RecoveryCard({ leakage }: { leakage: Leakage }) {
  const r = leakage.recovery

  if (r.missedUnits === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Second Bank, Never Tried</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Every booking that took a rejection was resubmitted somewhere else. Nothing was lost for want of a second
            application.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Second Bank, Never Tried
          <InfoTooltip text="Bookings that died after a rejection without a second submission." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-[-0.03em] tabular-nums text-foreground">
            {r.recoverableUnits} units
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {r.recoverableUnitsLow} to {r.recoverableUnitsHigh} units, {formatRmCompact(r.recoverableValueLowRm)} to{' '}
            {formatRmCompact(r.recoverableValueHighRm)}
          </p>
        </div>

        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Died after a rejection, never resubmitted</dt>
            <dd className="tabular-nums">
              {r.missedUnits} &middot; {formatRmCompact(r.missedValueRm)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Signed after going to a second bank</dt>
            <dd className="tabular-nums">
              {formatPercent(r.secondBankRate)} of {r.secondBankSample}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">That rate, at 95% confidence</dt>
            <dd className="tabular-nums">
              {formatPercent(r.rateLow)} to {formatPercent(r.rateHigh)}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          {r.missedUnits} &times; {formatPercent(r.secondBankRate)} = {r.recoverableUnits} units, or{' '}
          {formatRm(r.recoverableValueRm)}. The rate comes from {r.secondBankSample} resolved cases, which is a small
          sample — read the range, not the single figure.
        </p>

        {r.liveBookingIds.length > 0 ? (
          <div className="border-t border-border pt-3">
            <p className="text-sm text-foreground">
              {r.liveBookingIds.length} live {r.liveBookingIds.length === 1 ? 'booking is' : 'bookings are'} sitting on
              a rejection right now with no second submission, worth {formatRm(r.liveValueRm)}.
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {r.liveBookingIds.map((id) => (
                <li key={id}>
                  <Link
                    to={`/bookings/${id}`}
                    className="inline-flex items-center gap-1 rounded-sm border border-input px-2 py-1 text-[13px] font-medium text-foreground transition-colors duration-[120ms] hover:bg-accent"
                  >
                    {id}
                    <ArrowRight aria-hidden="true" className="size-3 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="border-t border-border pt-3 text-sm text-muted-foreground">
            No live booking is sitting on a rejection without a second submission today.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
