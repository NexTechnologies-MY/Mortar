/**
 * The SPA execution queue — every case sitting between loan approval and a
 * signed SPA, longest wait first. Rows navigate to the case page.
 *
 * Days Since LO is the column the desk is really reading, so it carries the
 * only emphasis in the row: past the stall threshold it turns danger-coloured.
 * Everything else stays plain text, per DESIGN.md Screen Density — a pill on
 * every row would discriminate between nothing.
 */

import { useNavigate } from 'react-router-dom'
import { formatRm } from '@/components/case'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { isLegalStall, type LegalRow } from './legal'

export function LegalQueueTable({ rows }: { rows: LegalRow[] }) {
  const navigate = useNavigate()
  return (
    <Table className="[&_td]:px-3 [&_th]:px-3">
      <TableHeader>
        <TableRow>
          <TableHead>Booking</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Buyer</TableHead>
          <TableHead>Firm</TableHead>
          <TableHead className="text-right">Days Since LO</TableHead>
          <TableHead>SPA Appointment</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ booking, summary, appointmentNote }) => {
          const flagged = summary.stallReasons.some(isLegalStall)
          return (
            <TableRow
              key={booking.id}
              tabIndex={0}
              aria-label={`Open Booking ${booking.id}`}
              className="cursor-pointer"
              onClick={() => navigate(`/bookings/${booking.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/bookings/${booking.id}`)
                }
              }}
            >
              <TableCell className="font-medium">{booking.id}</TableCell>
              <TableCell>{booking.unit}</TableCell>
              <TableCell className="max-w-44 truncate">{booking.buyer.name}</TableCell>
              <TableCell className="text-muted-foreground">{booking.legalFirm}</TableCell>
              <TableCell
                className={cn('text-right tabular-nums', flagged ? 'font-semibold text-status-danger-fg' : undefined)}
              >
                {summary.daysSinceLoIssued ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">{appointmentNote ?? 'Not Set'}</TableCell>
              <TableCell className="text-right tabular-nums">{formatRm(booking.priceRm)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
