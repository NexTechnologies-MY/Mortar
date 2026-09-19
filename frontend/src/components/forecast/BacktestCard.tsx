/**
 * Backtest card — what the method predicted at the cutoff against what the
 * event log actually produced: predicted vs observed signings, the Brier
 * score, and a four-bucket calibration table with a paired chart.
 */

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Backtest } from '@mortar/core'
import { formatDate, formatPercent } from '@/components/case'
import { ChartTooltipContent } from '@/components/charts/ChartTooltipContent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function BacktestCard({ backtest }: { backtest: Backtest }) {
  const calibration = backtest.calibration.map((c) => ({
    bucket: c.bucket,
    predicted: Math.round(c.predicted * 100),
    observed: Math.round(c.observed * 100)
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Backtest</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          The Same Method Run At {formatDate(backtest.cutoff)}, Scored Against The Events That Followed.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Predicted</p>
            <p className="text-2xl font-semibold tracking-[-0.03em] tabular-nums text-foreground">
              {backtest.predicted.toFixed(1)}
            </p>
            <p className="text-[13px] text-muted-foreground">Expected Signings At The Cut</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Observed</p>
            <p className="text-2xl font-semibold tracking-[-0.03em] tabular-nums text-foreground">
              {backtest.observed}
            </p>
            <p className="text-[13px] text-muted-foreground">Signed Within 30 Days Of Booking</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Brier Score</p>
            <p className="text-2xl font-semibold tracking-[-0.03em] tabular-nums text-foreground">
              {backtest.brier.toFixed(3)}
            </p>
            <p className="text-[13px] text-muted-foreground">Mean Squared Error, Lower Is Better</p>
          </div>
        </div>

        <div className="h-40" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calibration} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: 'var(--accent)' }}
                content={<ChartTooltipContent valueFormatter={(v) => `${v}%`} />}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }} />
              <Bar dataKey="predicted" name="Predicted" fill="var(--status-info)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="observed" name="Observed" fill="var(--status-signed)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Predicted Probability</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Predicted</TableHead>
              <TableHead className="text-right">Observed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backtest.calibration.map((c) => (
              <TableRow key={c.bucket}>
                <TableCell>{c.bucket}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{c.n}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(c.predicted)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(c.observed)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-[13px] text-muted-foreground">
          A Backtest On Simulated Data Proves The Method, Not The Business.
        </p>
      </CardContent>
    </Card>
  )
}
