/**
 * Assumptions panel — every DEFAULT_ASSUMPTIONS entry with its value, source
 * tag and source note, folded behind one control that names the count.
 * Marked as a placeholder until real company data calibrates it.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { DEFAULT_ASSUMPTIONS } from '@mortar/core'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { StatusPill } from '@/components/ui/status-pill'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SOURCE_TAG_LABELS, SOURCE_TAG_TONES, formatAssumptionValue } from './forecast'

export function AssumptionsCard() {
  const [open, setOpen] = useState(false)
  const count = DEFAULT_ASSUMPTIONS.length

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Assumptions
          <InfoTooltip text="Every rate and threshold the simulation, risk flag and stall rules use." />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
            {open ? 'Hide' : 'Show'} {count} Assumptions
          </button>
          <StatusPill tone="warning">Placeholder To Calibrate On Company Data</StatusPill>
        </div>
        {open ? (
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
                      {formatAssumptionValue(a)}
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
        ) : null}
      </CardContent>
    </Card>
  )
}
