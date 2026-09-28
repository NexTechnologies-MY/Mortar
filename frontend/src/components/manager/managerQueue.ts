/**
 * The Manager's queue: every overdue case (a wait at or beyond 150% of its
 * expected time), split into the ones still waiting on a decision and the ones
 * already followed up. The two lists never overlap, so a case shows once — in
 * Decisions For You on Today, or in Follow-Ups You Sent in its rail.
 */

import {
  currentCaseAssignee,
  managerSuggestions,
  type Booking,
  type CaseSummary,
  type OwnerRole,
  type Snapshot,
  type StaffProfile,
  type Task,
  type WaitingSuggestion
} from '@mortar/core'
import { nextStepFor, type NextStep } from '@/components/case/nextStep'
import { NEXT_ACTION_LABELS } from '@/components/chase/chase'

export type ManagerCase = {
  booking: Booking
  summary: CaseSummary
  /** The case's most overdue clock. */
  wait: WaitingSuggestion
  /** The person the next move sits with, or null when no profile holds it. */
  recipient: StaffProfile | null
  /** The owner role a follow-up to the recipient is raised under. */
  ownerRole: OwnerRole
  step: NextStep
  /** The Manager's follow-up on this case, while it still stands. */
  followUp: Task | null
}

/** The owner role a follow-up to this person is raised under. */
export function recipientRole(recipient: StaffProfile | null): OwnerRole {
  return recipient?.persona === 'legal-admin'
    ? 'legal'
    : recipient?.persona === 'loan-admin'
      ? 'loan_admin'
      : 'sales_admin'
}

/**
 * A follow-up stands while its task is open, or done with no confirmed update
 * recorded since: finishing the task without new evidence does not take the
 * case back off the Manager's hands.
 */
function standingFollowUp(snapshot: Snapshot, booking: Booking, recipient: StaffProfile | null, step: NextStep) {
  return (
    snapshot.tasks.find(
      (t) =>
        t.bookingId === booking.id &&
        !!t.managerFlaggedBy &&
        t.ownerName === recipient?.name &&
        t.action === step.action &&
        (t.status === 'open' ||
          (t.status === 'done' &&
            !!t.completedAt &&
            !snapshot.events.some(
              (e) => e.bookingId === booking.id && e.status === 'confirmed' && e.recordedAt > t.completedAt!
            )))
    ) ?? null
  )
}

/** Overdue cases, most overdue first, split by whether a follow-up stands. */
export function managerQueue(
  snapshot: Snapshot,
  cases: readonly CaseSummary[]
): { decisions: ManagerCase[]; sent: ManagerCase[] } {
  const summaries = new Map(cases.map((c) => [c.bookingId, c]))
  const bookings = new Map(snapshot.bookings.map((b) => [b.id, b]))
  const decisions: ManagerCase[] = []
  const sent: ManagerCase[] = []
  for (const wait of managerSuggestions(snapshot)) {
    const booking = bookings.get(wait.bookingId)
    const summary = summaries.get(wait.bookingId)
    if (!booking || !summary) continue
    const recipient = currentCaseAssignee(booking, summary)
    const step = nextStepFor(booking, summary, NEXT_ACTION_LABELS).defaultStep
    const followUp = standingFollowUp(snapshot, booking, recipient, step)
    const item = { booking, summary, wait, recipient, ownerRole: recipientRole(recipient), step, followUp }
    ;(followUp ? sent : decisions).push(item)
  }
  return { decisions, sent }
}

/** How far past its expected wait a case is, in the rule's own unit. */
export function overdueBy(wait: WaitingSuggestion): number {
  return Math.max(0, wait.elapsed - wait.expected)
}
