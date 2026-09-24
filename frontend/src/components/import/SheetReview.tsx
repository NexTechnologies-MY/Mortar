/**
 * Sheet review — what Mortar read from a booking sheet, before anything is
 * stored. States the columns it could not find, the sheet-wide assumptions,
 * then every row in sheet order: Ready, or To Fix with each reason. Only the
 * ready rows are imported; a row to fix is corrected in the sheet and the
 * sheet dropped again, so the sheet stays the team's record.
 */

import { FileWarning, Info } from 'lucide-react'
import { SHEET_FIELD_LABELS, type SheetReading, type SheetRow } from '@mortar/core'
import { formatDate, formatRm } from '@/components/case/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination, usePagination } from '@/components/ui/Pagination'
import { StatusPill } from '@/components/ui/status-pill'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`

function RowStatus({ row }: { row: SheetRow }) {
  if (row.draft) {
    return (
      <div className="flex flex-col items-start gap-1">
        <StatusPill tone="positive">Ready</StatusPill>
        {row.warnings.length > 0 ? (
          <span className="text-[13px] text-muted-foreground">{row.warnings.join(' · ')}</span>
        ) : null}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <StatusPill tone="danger">To Fix</StatusPill>
      <span className="text-[13px] text-status-danger-fg">{row.errors.join(' · ')}</span>
    </div>
  )
}

export function SheetReview({
  sheet,
  importing,
  onImport
}: {
  sheet: SheetReading
  importing: boolean
  onImport: () => void
}) {
  const { pageRows, pagination } = usePagination(sheet.rows)

  if (sheet.headerLine === null) {
    return (
      <EmptyState
        icon={FileWarning}
        title="No Header Row Found"
        description="Put The Column Names (Unit, Buyer Name, IC Number And So On) In The First Row, Then Drop The Sheet Again."
      />
    )
  }
  if (sheet.missing.length > 0) {
    const found = Object.values(sheet.columns)
    return (
      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          <h2 className="text-base font-semibold">Columns Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The Sheet Needs {sheet.missing.map((f) => SHEET_FIELD_LABELS[f]).join(', ')}. Add{' '}
            {sheet.missing.length === 1 ? 'That Column' : 'Those Columns'} And Drop The Sheet Again.
          </p>
          {found.length > 0 ? (
            <p className="text-[13px] text-muted-foreground">
              Read From Row {sheet.headerLine}: {found.join(', ')}.
            </p>
          ) : null}
        </CardContent>
      </Card>
    )
  }
  if (sheet.rows.length === 0) {
    return (
      <EmptyState
        icon={FileWarning}
        title="No Bookings Under The Header"
        description={`Row ${sheet.headerLine} Holds The Column Names, But No Row Below It Has A Booking.`}
      />
    )
  }

  const ready = sheet.rows.filter((r) => r.draft).length
  const toFix = sheet.rows.length - ready

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Review</h2>
            <StatusPill tone="positive">{ready.toLocaleString()} Ready</StatusPill>
            {toFix > 0 ? <StatusPill tone="warning">{toFix.toLocaleString()} To Fix</StatusPill> : null}
          </div>
          <Button type="button" onClick={onImport} disabled={ready === 0 || importing}>
            {importing ? 'Importing…' : `Import ${plural(ready, 'Booking', 'Bookings')}`}
          </Button>
        </div>
        {toFix > 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Rows To Fix Stay Out Of The Import. Correct Them In The Sheet And Drop It Again; Units Already Imported Are
            Caught As Held.
          </p>
        ) : null}
        {sheet.notes.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sheet.notes.map((note) => (
              <li key={note} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Info aria-hidden="true" className="size-4 shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="overflow-hidden rounded-md border border-border">
          <Table className="[&_td]:px-3 [&_th]:px-3">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Row</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Booked</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.line}>
                  <TableCell className="text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                    {row.line}
                  </TableCell>
                  <TableCell className="font-mono text-[13px] font-medium">{row.unit || '—'}</TableCell>
                  <TableCell className="max-w-44 truncate">{row.buyerName || '—'}</TableCell>
                  <TableCell className="tabular-nums">{formatDate(row.draft?.bookingDate)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRm(row.draft?.priceRm)}</TableCell>
                  <TableCell className="whitespace-normal">
                    <RowStatus row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination {...pagination} />
        </div>
      </CardContent>
    </Card>
  )
}
