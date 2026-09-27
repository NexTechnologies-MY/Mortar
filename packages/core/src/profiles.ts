import { ballInCourt } from './ball'
import { summarizeCases, type CaseData } from './sim'
import type { Booking, CaseSummary, IsoDate, Persona, Snapshot, StaffProfile, Task } from './types'

export interface AssignmentAccessContext {
  summaries: CaseSummary[]
  tasks: Task[]
}

/** Build access facts from confirmed case evidence and persisted tasks. */
export function createAssignmentAccessContext(data: CaseData, asOf: IsoDate): AssignmentAccessContext {
  return { summaries: summarizeCases(data, asOf), tasks: data.tasks }
}

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
  { id: 'legal-admin', name: 'Arvind Raj', persona: 'legal-admin' },
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

/** Resolve the internal assignee implied by the currently confirmed case state. */
export function currentCaseAssignee(booking: Booking, summary: CaseSummary): StaffProfile | null {
  const holder = ballInCourt(summary).holder
  if (holder === 'buyer' || holder === 'bank') {
    return (
      DEMO_PROFILES.find((profile) => profile.persona === 'loan-admin' && profile.name === booking.loanOwner) ?? null
    )
  }
  if (holder === 'solicitor') return profileFor('legal-admin')
  if (holder === 'developer') {
    return (
      DEMO_PROFILES.find((profile) => profile.persona === 'sales-admin' && profile.name === booking.salesOwner) ?? null
    )
  }
  return null
}

/** Central booking boundary used by snapshots, direct-id routes, and Ask MortarAI tools. */
export function canAccessBooking(booking: Booking, profile: StaffProfile, context?: AssignmentAccessContext): boolean {
  switch (profile.persona) {
    case 'manager':
      return true
    case 'sales-admin':
      return booking.salesOwner === profile.name
    case 'loan-admin':
    case 'legal-admin': {
      if (!context) return false
      const summary = context.summaries.find((candidate) => candidate.bookingId === booking.id)
      const assignee = summary ? currentCaseAssignee(booking, summary) : null
      if (assignee?.id === profile.id && assignee.persona === profile.persona) return true

      const expectedRole = profile.persona === 'loan-admin' ? 'loan_admin' : 'legal'
      return context.tasks.some(
        (task) =>
          task.bookingId === booking.id &&
          task.status === 'open' &&
          task.ownerRole === expectedRole &&
          task.ownerName === profile.name
      )
    }
  }
}

/** Filter all booking-linked snapshot collections as one consistent scope. */
export function scopeSnapshot(snapshot: Snapshot, profile: StaffProfile): Snapshot {
  const context = createAssignmentAccessContext(
    {
      bookings: snapshot.bookings,
      applications: snapshot.applications,
      events: snapshot.events,
      tasks: snapshot.tasks
    },
    snapshot.meta.referenceDate
  )
  const bookingIds = new Set(
    snapshot.bookings.filter((booking) => canAccessBooking(booking, profile, context)).map((b) => b.id)
  )
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
