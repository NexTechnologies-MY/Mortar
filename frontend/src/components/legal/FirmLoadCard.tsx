/**
 * What each panel firm is holding right now: cases awaiting SPA, the median
 * wait, and the value behind them.
 *
 * Read as load, not performance. The seeded generator assigns firms by a
 * uniform draw, so a gap between two rows here is the luck of the seed and not
 * evidence that one firm is slower than another. The caption says so on the
 * screen, because a table like this invites exactly the wrong reading.
 */

import type { FirmLoad } from './legal'
import { formatRmCompact } from '@/components/case'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function FirmLoadCard({ firms }: { firms: FirmLoad[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Panel Load
          <InfoTooltip text="Cases awaiting SPA with each firm right now." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Table className="[&_td]:px-3 [&_th]:px-3">
          <TableHeader>
            <TableRow>
              <TableHead>Firm</TableHead>
              <TableHead className="text-right">Awaiting</TableHead>
              <TableHead className="text-right">Median Wait</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {firms.map((f) => (
              <TableRow key={f.firm}>
                <TableCell className="font-medium">{f.firm}</TableCell>
                <TableCell className="text-right tabular-nums">{f.awaiting}</TableCell>
                <TableCell className="text-right tabular-nums">{f.medianDays} d</TableCell>
                <TableCell className="text-right tabular-nums">{formatRmCompact(f.valueRm)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">
          Load, not performance. Firms are assigned at random in the seeded data, so a gap between two rows here is the
          luck of the draw rather than evidence that one firm is slower.
        </p>
      </CardContent>
    </Card>
  )
}
