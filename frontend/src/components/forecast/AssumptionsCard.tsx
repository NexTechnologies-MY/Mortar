/**
 * Assumptions panel — every DEFAULT_ASSUMPTIONS entry with its value, source
 * tag and source note. Marked as a placeholder until real company data
 * calibrates it.
 */

import { DEFAULT_ASSUMPTIONS } from '@mortar/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SOURCE_TAG_LABELS, SOURCE_TAG_TONES } from './forecast'

export function AssumptionsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Assumptions</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Every Rate And Threshold The Simulation, Risk Flag And Stall Rules Use. Placeholder To Calibrate On Company
          Data.
        </p>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Assumption</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEFAULT_ASSUMPTIONS.map((a) => (
                <TableRow key={a.key}>
                  <TableCell className="whitespace-normal">{a.label}</TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {a.value} {a.unit}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={SOURCE_TAG_TONES[a.tag]}>{SOURCE_TAG_LABELS[a.tag]}</StatusPill>
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">{a.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
