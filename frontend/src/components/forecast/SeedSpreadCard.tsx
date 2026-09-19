/**
 * Seed spread — "Try Another Seed" regenerates the dataset in the browser
 * under a new seed and lines its forecast up beside the canonical one, so the
 * demo can show how much the answer moves. The database is never touched.
 */

import type { Forecast } from '@mortar/core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export interface SeedRun {
  seed: number
  forecast: Forecast
}

export function SeedSpreadCard({
  canonicalSeed,
  runs,
  running,
  onTryAnother
}: {
  canonicalSeed: number
  /** Every run, canonical first. */
  runs: SeedRun[]
  running: boolean
  onTryAnother: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-base">Seed Spread</CardTitle>
          <p className="text-[13px] text-muted-foreground">
            The Same Method On A Fresh Simulation. Expected Signings Move; The Method Does Not.
          </p>
        </div>
        <Button type="button" size="sm" disabled={running} onClick={onTryAnother}>
          {running ? 'Simulating…' : 'Try Another Seed'}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Seed</TableHead>
              <TableHead className="text-right">Expected Signings</TableHead>
              <TableHead className="text-right">10th – 90th Percentile</TableHead>
              <TableHead className="text-right">Live Bookings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map(({ seed, forecast }) => (
              <TableRow key={seed}>
                <TableCell className="font-mono text-[13px]">
                  {seed}
                  {seed === canonicalSeed ? (
                    <Badge variant="secondary" className="ml-2">
                      Canonical
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums">{forecast.expectedSignings.toFixed(1)}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {forecast.rangeLow} – {forecast.rangeHigh}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{forecast.liveBookings}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Regenerated In The Browser Only; The Saved Simulation Is Untouched.
        </p>
      </CardContent>
    </Card>
  )
}
