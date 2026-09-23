/**
 * Imported card — the confirmation after a sheet lands: how many bookings, a
 * link to each, and Undo This Import behind a confirming Dialog (DESIGN.md
 * Dialog: destructive, Cancel focused first). Undo removes exactly this batch,
 * and the server refuses it once any booking in it has had an update, a
 * message or a task, so work done on a booking is never thrown away. The
 * import itself stays on record, stamped with who undid it and when.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PERSONA_STAFF, type Booking } from '@mortar/core'
import { undoImport } from '@/lib/api'
import { usePersona } from '@/lib/persona'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { notify } from '@/components/ui/toastConfig'

/** How many imported booking ids the card lists before summing up the rest. */
const SHOWN_IDS = 12

const bookingsWord = (n: number) => `${n.toLocaleString()} ${n === 1 ? 'Booking' : 'Bookings'}`

export function ImportedCard({
  importId,
  bookings,
  onUndone
}: {
  importId: string
  bookings: Booking[]
  /** Called after a successful undo, to drop the card and reload the desks. */
  onUndone: () => Promise<void>
}) {
  const { persona } = usePersona()
  const [open, setOpen] = useState(false)
  const [undoing, setUndoing] = useState(false)
  const first = bookings[0]?.id
  const last = bookings[bookings.length - 1]?.id
  const range = bookings.length === 1 ? first : `${first} To ${last}`

  const runUndo = async () => {
    setUndoing(true)
    try {
      const { removed } = await undoImport(importId, PERSONA_STAFF[persona].name)
      notify.success(
        `Import undone: ${removed.length.toLocaleString()} ${removed.length === 1 ? 'booking' : 'bookings'} removed.`
      )
      setOpen(false)
      await onUndone()
    } catch (e) {
      notify.error(
        e instanceof Error ? `Could not undo the import: ${e.message}.` : 'Could not undo the import. Try again.'
      )
    } finally {
      setUndoing(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" className="size-4 text-status-positive-fg" />
          <h2 className="text-base font-semibold">{bookingsWord(bookings.length)} Imported</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          They Are On The Bookings Desk Now, Each Waiting On The Developer To Collect The Loan Documents.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {bookings.slice(0, SHOWN_IDS).map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="rounded-sm border border-border px-2 py-0.5 font-mono text-[13px] font-medium hover:bg-accent"
            >
              {b.id}
            </Link>
          ))}
          {bookings.length > SHOWN_IDS ? (
            <span className="px-1 text-[13px] text-muted-foreground">
              And {(bookings.length - SHOWN_IDS).toLocaleString()} More
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link to="/bookings">Open Bookings</Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary" size="sm">
                Undo This Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Undo This Import?</DialogTitle>
                <DialogDescription>
                  Removes {range} from every desk. Mortar will not remove them once any has had an update, a message or
                  a task since the import.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary" autoFocus>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" variant="destructive" disabled={undoing} onClick={() => void runUndo()}>
                  {undoing ? 'Removing…' : `Remove ${bookingsWord(bookings.length)}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
