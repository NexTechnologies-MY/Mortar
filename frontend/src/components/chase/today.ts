/**
 * Today's counts, shared by the page and the profile menu so the two can never
 * disagree. The page applies its filters on top; the menu reads the persona's
 * defaults.
 */

import { useMemo } from 'react'
import type { CaseSummary, OwnerRole, Snapshot, StaffProfile, Task } from '@mortar/core'
import { OWNER_ROLE_LABELS } from '@/components/case/OwnerBadge'
import { nextStepFor } from '@/components/case/nextStep'
import { managerQueue } from '@/components/manager/managerQueue'
import { useCases, useSnapshot } from '@/lib/data'
import { PERSONA_DESK_ROLE, usePersona, type Persona } from '@/lib/persona'
import { NEXT_ACTION_LABELS } from './chase'

/**
 * The owner filter Today opens on. Sales Admin coordinates every booking to a
 * signed SPA, so their Today is the whole chase; Loan Admin and Legal Admin
 * open on their own desk.
 */
export function defaultOwnerFilter(persona: Persona): 'all' | OwnerRole {
  return persona === 'sales-admin' || persona === 'manager' ? 'all' : PERSONA_DESK_ROLE[persona]
}

/**
 * The lead line's count and the first figure, in the words a person would say.
 *
 * All desks count every stalled booking; one desk counts the cases waiting on
 * it. Either way the number is the size of the list on screen, so the sentence
 * and the queue can never describe different work. Every form reads correctly
 * in the singular: "1 Stalled Booking", "1 Booking Needs A Move From You".
 */
export function headlineFor(ownerFilter: 'all' | OwnerRole, ownDesk: OwnerRole, count: number) {
  if (ownerFilter === 'all') {
    return {
      count,
      sentence: `${count} ${count === 1 ? 'Stalled Booking' : 'Stalled Bookings'}`,
      label: 'Stalled Bookings',
      info: 'Every booking that has stopped moving, whichever desk holds it.'
    }
  }
  const from = ownerFilter === ownDesk ? 'You' : OWNER_ROLE_LABELS[ownerFilter]
  return {
    count,
    sentence: `${count} ${count === 1 ? 'Booking Needs' : 'Bookings Need'} A Move From ${from}`,
    label: `${count === 1 ? 'Needs' : 'Need'} A Move From ${from}`,
    info: 'Stalled bookings whose next step is on this desk.'
  }
}

/** Open tasks assigned to this person in their own department. */
export function assignedTasksFor(openTasks: readonly Task[], profile: StaffProfile): Task[] {
  const desk = PERSONA_DESK_ROLE[profile.persona]
  return openTasks.filter(
    (t) =>
      t.ownerName === profile.name &&
      (t.ownerRole === desk ||
        (profile.persona === 'sales-admin' && (t.ownerRole === 'sales' || t.ownerRole === 'sales_admin')))
  )
}

/** Tasks due on or before the reference date. */
export function dueTodayCount(tasks: readonly Task[], referenceDate: string): number {
  return tasks.filter((t) => t.dueOn <= referenceDate).length
}

/** The "N Tasks Due Today" half of the lead line. */
export function dueTodayPhrase(count: number): string {
  return `${count} ${count === 1 ? 'Task' : 'Tasks'} Due Today`
}

/** Stalled cases whose next step sits with the given desk ('all' for every desk). */
export function stalledFor(snapshot: Snapshot, cases: readonly CaseSummary[], owner: 'all' | OwnerRole): CaseSummary[] {
  const bookings = new Map(snapshot.bookings.map((b) => [b.id, b]))
  const suggestions = new Map(snapshot.nextActions.map((s) => [s.bookingId, s]))
  return cases.filter((c) => {
    if (c.stallReasons.length === 0) return false
    if (owner === 'all') return true
    const booking = bookings.get(c.bookingId)
    return (
      !!booking &&
      nextStepFor(booking, c, NEXT_ACTION_LABELS, suggestions.get(c.bookingId)).defaultStep.ownerRole === owner
    )
  })
}

export type TodayFigure = { label: string; value: number }

/**
 * The two figures that open the active persona's Today, as the profile menu
 * shows them: a desk's headline count and tasks due today, or the Manager's
 * overdue cases and follow-ups awaiting a reply.
 */
export function useTodayFigures(): [TodayFigure, TodayFigure] | null {
  const { snapshot } = useSnapshot()
  const cases = useCases()
  const { profile } = usePersona()
  return useMemo(() => {
    if (!snapshot) return null
    if (profile.persona === 'manager') {
      const { decisions, sent } = managerQueue(snapshot, cases)
      return [
        { label: 'Overdue Cases', value: decisions.length + sent.length },
        { label: 'Awaiting Reply', value: sent.filter((c) => c.followUp?.status === 'open').length }
      ]
    }
    const owner = defaultOwnerFilter(profile.persona)
    const headline = headlineFor(owner, PERSONA_DESK_ROLE[profile.persona], stalledFor(snapshot, cases, owner).length)
    const openTasks = snapshot.tasks.filter((t) => t.status === 'open')
    return [
      { label: headline.label, value: headline.count },
      { label: 'Due Today', value: dueTodayCount(assignedTasksFor(openTasks, profile), snapshot.meta.referenceDate) }
    ]
  }, [snapshot, cases, profile])
}
