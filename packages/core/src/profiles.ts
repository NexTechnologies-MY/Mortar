import type { Booking, Persona, Snapshot, StaffProfile } from './types'

/** Named identities offered by the public synthetic demo. */
export const DEMO_PROFILES: StaffProfile[] = [
  { id: 'sales-nurul-aina', name: 'Nurul Aina', persona: 'sales-admin' },
  { id: 'sales-farah-izzati', name: 'Farah Izzati', persona: 'sales-admin' },
  { id: 'sales-kelvin-chow', name: 'Kelvin Chow', persona: 'sales-admin' },
  { id: 'sales-dinesh-rao', name: 'Dinesh Rao', persona: 'sales-admin' },
  { id: 'sales-mei-xuan', name: 'Mei Xuan', persona: 'sales-admin' },
  { id: 'sales-hafiz-rahman', name: 'Hafiz Rahman', persona: 'sales-admin' },
  { id: 'sales-jocelyn-ng', name: 'Jocelyn Ng', persona: 'sales-admin' },
  { id: 'loan-tan-mei-ling', name: 'Tan Mei Ling', persona: 'loan-admin' },
  { id: 'legal-admin', name: 'Legal Admin', persona: 'legal-admin' },
  { id: 'manager', name: 'Project Manager', persona: 'manager' }
]

export function profileFor(id: string): StaffProfile | null {
  return DEMO_PROFILES.find((profile) => profile.id === id) ?? null
}

export function profileForPersona(persona: Persona): StaffProfile {
  return DEMO_PROFILES.find((profile) => profile.persona === persona) ?? DEMO_PROFILES[0]!
}

export function defaultProfileForPersona(persona: Persona): StaffProfile {
  return profileForPersona(persona)
}

/** Central booking boundary used by snapshots, direct-id routes, and Copilot tools. */
export function canAccessBooking(booking: Booking, profile: StaffProfile): boolean {
  switch (profile.persona) {
    case 'manager':
      return true
    case 'sales-admin':
      return booking.salesOwner === profile.name
    case 'loan-admin':
      // The demo has one shared loan desk; all loan cases belong to that desk.
      return true
    case 'legal-admin':
      // Legal Admin represents the shared conveyancing department.
      return true
  }
}

/** Filter all booking-linked snapshot collections as one consistent scope. */
export function scopeSnapshot(snapshot: Snapshot, profile: StaffProfile): Snapshot {
  const bookingIds = new Set(snapshot.bookings.filter((booking) => canAccessBooking(booking, profile)).map((b) => b.id))
  const messageIds = new Set(
    snapshot.messages.filter((message) => bookingIds.has(message.bookingId)).map((message) => message.id)
  )
  return {
    ...snapshot,
    bookings: snapshot.bookings.filter((b) => bookingIds.has(b.id)),
    applications: snapshot.applications.filter((a) => bookingIds.has(a.bookingId)),
    events: snapshot.events.filter((e) => bookingIds.has(e.bookingId)),
    messages: snapshot.messages.filter((m) => bookingIds.has(m.bookingId)),
    tasks: snapshot.tasks.filter((t) => bookingIds.has(t.bookingId)),
    extractions: snapshot.extractions.filter((e) => messageIds.has(e.messageId)),
    signals: snapshot.signals.filter((v) => bookingIds.has(v.bookingId)),
    nextActions: snapshot.nextActions.filter((a) => bookingIds.has(a.bookingId))
  }
}
