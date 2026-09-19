/**
 * Stage conversion rates — the share of resolved bookings reaching each stage
 * that signed within the horizon. Bar chart with Wilson-interval whiskers over
 * a table carrying the exact rate, sample size and interval.
 */

import { Bar, BarChart, CartesianGrid, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { StageRate } from '@mortar/core'
import { STAGE_LABELS, formatPercent } from '@/components/case'
import { ProbabilityBar } from '@/components/case'
import { ChartTooltipContent } from '@/components/charts/ChartTooltipContent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function StageRatesCard({ stageRates }: { stageRates: StageRate[] }) {
  const chartData = stageRates.map((r) => ({
    stage: STAGE_LABELS[r.stage],
    rate: Math.round(r.rate * 100),
    error: [Math.max(0, Math.round((r.rate - r.low) * 100)), Math.max(0, Math.round((r.high - r.rate) * 100))] as [
      number,
      number
    ]
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Stage Conversion Rates</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Share Of Resolved Bookings Reaching Each Stage That Signed Within 30 Days Of Booking.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="h-44" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="stage"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                interval="preserveStartEnd"
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
              <Bar dataKey="rate" name="Signed Rate" fill="var(--status-signed)" radius={[2, 2, 0, 0]}>
                <ErrorBar dataKey="error" width={4} strokeWidth={1.5} stroke="var(--muted-foreground)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Signed / Resolved</TableHead>
              <TableHead className="w-40">Rate</TableHead>
              <TableHead className="text-right">95% Interval</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stageRates.map((r) => (
              <TableRow key={r.stage}>
                <TableCell>{STAGE_LABELS[r.stage]}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.signed} / {r.resolved}
                </TableCell>
                <TableCell>
                  <ProbabilityBar probability={r.rate} />
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.resolved === 0 ? '—' : `${formatPercent(r.low)} – ${formatPercent(r.high)}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-[13px] text-muted-foreground">
          Approval Falls As The Debt Service Ratio Rises — By Construction, So The Risk Flag Carries Signal.
        </p>
      </CardContent>
    </Card>
  )
}
