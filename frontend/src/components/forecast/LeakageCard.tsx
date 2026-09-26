/**
 * Where bookings died, ranked by what they cost. The counterpart to the
 * forecast above it: that panel says what will sign, this one says what did
 * not, and why.
 *
 * Ranked by value rather than count, because a cause that kills four expensive
 * units matters more than one that kills five cheap ones, and the whole point
 * of the panel is to put the causes in order of size.
 */

import type { Leakage } from '@mortar/core'
import { formatRm, formatRmCompact } from '@/components/case'
import { ProbabilityBar } from '@/components/case'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function LeakageCard({ leakage }: { leakage: Leakage }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Where Bookings Died
          <InfoTooltip text="Cancelled and lapsed bookings, grouped by the first cause in the event log." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {leakage.deadUnits} bookings worth {formatRm(leakage.deadValueRm)} never reached an SPA. They held their units
          off the market for {leakage.unitDaysHeld.toLocaleString()} unit-days, a median of {leakage.medianDaysHeld}{' '}
          days each.
        </p>
        <Table className="[&_td]:px-3 [&_th]:px-3">
          <TableHeader>
            <TableRow>
              <TableHead>Cause</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Share Of Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leakage.causes.map((c) => (
              <TableRow key={c.cause}>
                <TableCell className="font-medium">{c.cause}</TableCell>
                <TableCell className="text-right tabular-nums">{c.units}</TableCell>
                <TableCell className="text-right tabular-nums">{formatRmCompact(c.valueRm)}</TableCell>
                <TableCell>
                  <ProbabilityBar probability={c.share} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">
          A booking that took a rejection and then saw the buyer walk is counted against the rejection, because that is
          what set the rest in motion.
        </p>
      </CardContent>
    </Card>
  )
}
