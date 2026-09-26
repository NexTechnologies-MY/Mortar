/**
 * Record a legal update from the queue row itself — the two things a legal
 * admin does all day, an appointment set and an SPA signed, without opening
 * the case page at all.
 *
 * The form is preset to the update the button names and opens straight away
 * rather than behind another button: the reader has already decided what
 * happened and is here to write it down. Saving re-reads the snapshot, which
 * moves the case out of the queue section it was in, and the dialog closes.
 */

import { useState } from 'react'
import type { Booking, CaseSummary, EventKind } from '@mortar/core'
import { RecordUpdateForm } from '@/components/bookings/RecordUpdateForm'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/** The two legal updates a queue row can offer, in the wording the button uses. */
export const LEGAL_UPDATES = {
  spa_appointment_set: { label: 'Record Appointment', title: 'Record The SPA Appointment' },
  spa_signed: { label: 'Record Signing', title: 'Record The SPA Signing' }
} as const

export type LegalUpdateKind = keyof typeof LEGAL_UPDATES

export function RecordLegalUpdateDialog({
  booking,
  kind,
  summary,
  referenceDate,
  reportedBy,
  onRecorded,
  open,
  onOpenChange
}: {
  /** The case the row belongs to; names the dialog so a screen reader says which. */
  booking: Booking
  kind: LegalUpdateKind
  summary: CaseSummary
  referenceDate: string
  reportedBy: string
  /** Re-reads the snapshot once the update is saved. */
  onRecorded: () => Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const copy = LEGAL_UPDATES[kind]
  // Remount on every open so the preset form starts clean rather than holding
  // the last booking's appointment date and note.
  const [shown, setShown] = useState<{ bookingId: string; kind: EventKind } | null>(null)
  if (open && shown?.bookingId !== booking.id) setShown({ bookingId: booking.id, kind })
  if (!open || shown?.kind !== kind) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {booking.id} · {booking.unit} · {booking.buyer.name}
          </DialogDescription>
        </DialogHeader>
        <RecordUpdateForm
          booking={booking}
          applications={summary.applications}
          summary={summary}
          referenceDate={referenceDate}
          reportedBy={reportedBy}
          onRecorded={onRecorded}
          initialKind={kind}
        />
      </DialogContent>
    </Dialog>
  )
}
