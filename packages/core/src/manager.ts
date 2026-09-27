import type { Assumption, Snapshot } from './types'
import { DEFAULT_ASSUMPTIONS, assumptionValue } from './sim/assumptions'
import { deriveCase } from './sim/cases'
import { diffDays, workDaysBetween } from './sim/dates'

export interface WaitingSuggestion {
  bookingId: string
  reason: string
  elapsed: number
  expected: number
  unit: 'days' | 'working days'
}

/** Uses the same confirmed-event clocks and expected waits as the stall rules. */
export function managerSuggestions(
  snapshot: Snapshot,
  assumptions: Assumption[] = DEFAULT_ASSUMPTIONS
): WaitingSuggestion[] {
  const today = snapshot.meta.referenceDate
  const result: WaitingSuggestion[] = []
  for (const booking of snapshot.bookings) {
    const facts = deriveCase(
      booking,
      snapshot.applications.filter((a) => a.bookingId === booking.id),
      snapshot.events.filter((e) => e.bookingId === booking.id),
      today
    )
    if (!facts.open) continue
    const waits: WaitingSuggestion[] = []
    const add = (reason: string, elapsed: number, key: string, unit: WaitingSuggestion['unit'] = 'days') => {
      const expected = assumptionValue(assumptions, key)
      if (expected > 0 && elapsed >= expected * 1.5)
        waits.push({ bookingId: booking.id, reason, elapsed, expected, unit })
    }
    add('No Confirmed Update', facts.daysSinceEvidence, 'staleEvidenceDays')
    if (facts.loIssuedOn !== null) {
      if (facts.spaAppointmentSetOn !== null) {
        if (facts.spaAppointmentOn === null || facts.spaAppointmentOn < today)
          add('Signing Still Outstanding', diffDays(facts.spaAppointmentSetOn, today), 'spaSigningStallDays')
      } else add('Signing Appointment Needed', diffDays(facts.loIssuedOn, today), 'spaSchedulingStallDays')
    } else {
      for (const document of facts.outstandingDocuments)
        add('Buyer Documents Outstanding', document.sinceDays, 'documentStallDays')
      for (const application of facts.applications) {
        if (application.pendingSince !== null)
          add(
            'Bank Decision Outstanding',
            workDaysBetween(application.pendingSince, today),
            'undecidedStallWorkDays',
            'working days'
          )
      }
    }
    // One clear suggestion per booking, using its most overdue active clock.
    waits.sort((a, b) => b.elapsed / b.expected - a.elapsed / a.expected)
    if (waits[0]) result.push(waits[0])
  }
  return result.sort(
    (a, b) => b.elapsed / b.expected - a.elapsed / a.expected || a.bookingId.localeCompare(b.bookingId)
  )
}
