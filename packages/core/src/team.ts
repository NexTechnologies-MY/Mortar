import type { CaseEvent, CaseSummary, LoanApplication, Persona, Snapshot } from './types'
import { DEMO_PROFILES, canManageTaskStatus, currentCaseAssignee } from './profiles'
import { managerSuggestions } from './manager'
import { deriveCase } from './sim/cases'

export interface TeamRow {
  profileId: string
  name: string
  persona: Exclude<Persona, 'manager'>
  /** Open bookings whose next move currently sits with this person. */
  waiting: number
  /** Of those, the ones with at least one stall reason. */
  stalled: number
  /** Overdue cases (managerSuggestions) whose recipient is this person. */
  overdue: number
  /** The longest overdue wait among those, or null when there is none. */
  longestWait: { elapsed: number; unit: 'days' | 'working days' } | null
  /** Sum of priceRm across the stalled bookings this person holds. */
  valueAtRisk: number
  /** Open tasks assigned to this exact person in their own department. */
  openTasks: number
  /** Bookings this person owns as sales owner; null for loan and legal. */
  owned: number | null
}

export interface TeamSummary {
  rows: TeamRow[]
  openBookings: number
  /** Open bookings whose next move sits with no staff profile. */
  unassigned: number
  overdue: number
  valueAtRisk: number
}

interface RowAccumulator {
  waiting: number
  stalled: number
  overdue: number
  longestWait: { elapsed: number; unit: 'days' | 'working days' } | null
  valueAtRisk: number
}

export function teamSummary(snapshot: Snapshot, cases: CaseSummary[]): TeamSummary {
  const today = snapshot.meta.referenceDate
  const casesByBookingId = new Map(cases.map((c) => [c.bookingId, c]))
  const bookingsById = new Map(snapshot.bookings.map((b) => [b.id, b]))

  const appsByBookingId = new Map<string, LoanApplication[]>()
  for (const app of snapshot.applications) {
    const list = appsByBookingId.get(app.bookingId)
    if (list) list.push(app)
    else appsByBookingId.set(app.bookingId, [app])
  }

  const eventsByBookingId = new Map<string, CaseEvent[]>()
  for (const event of snapshot.events) {
    const list = eventsByBookingId.get(event.bookingId)
    if (list) list.push(event)
    else eventsByBookingId.set(event.bookingId, [event])
  }

  const nonManagerProfiles = DEMO_PROFILES.filter(
    (p): p is typeof p & { persona: Exclude<Persona, 'manager'> } => p.persona !== 'manager'
  )

  const accumulators = new Map<string, RowAccumulator>()
  for (const profile of nonManagerProfiles) {
    accumulators.set(profile.id, {
      waiting: 0,
      stalled: 0,
      overdue: 0,
      longestWait: null,
      valueAtRisk: 0
    })
  }

  let openBookings = 0
  let unassigned = 0
  let totalValueAtRisk = 0

  for (const booking of snapshot.bookings) {
    const apps = appsByBookingId.get(booking.id) ?? []
    const events = eventsByBookingId.get(booking.id) ?? []
    const facts = deriveCase(booking, apps, events, today)
    if (!facts.open) continue

    openBookings++

    const summary = casesByBookingId.get(booking.id)
    const isStalled = Boolean(summary && summary.stallReasons.length > 0)
    if (isStalled) {
      totalValueAtRisk += booking.priceRm
    }

    const assignee = summary ? currentCaseAssignee(booking, summary) : null
    if (!assignee) {
      unassigned++
    } else {
      const acc = accumulators.get(assignee.id)
      if (acc) {
        acc.waiting++
        if (isStalled) {
          acc.stalled++
          acc.valueAtRisk += booking.priceRm
        }
      }
    }
  }

  const suggestions = managerSuggestions(snapshot)
  const totalOverdue = suggestions.length

  for (const suggestion of suggestions) {
    const booking = bookingsById.get(suggestion.bookingId)
    const summary = casesByBookingId.get(suggestion.bookingId)
    const assignee = booking && summary ? currentCaseAssignee(booking, summary) : null
    if (assignee) {
      const acc = accumulators.get(assignee.id)
      if (acc) {
        acc.overdue++
        if (!acc.longestWait || suggestion.elapsed > acc.longestWait.elapsed) {
          acc.longestWait = { elapsed: suggestion.elapsed, unit: suggestion.unit }
        }
      }
    }
  }

  const rows: TeamRow[] = nonManagerProfiles.map((profile) => {
    const acc = accumulators.get(profile.id)!

    const openTasks = snapshot.tasks.filter(
      (task) => task.status === 'open' && canManageTaskStatus(task, profile)
    ).length

    const owned =
      profile.persona === 'sales-admin' ? snapshot.bookings.filter((b) => b.salesOwner === profile.name).length : null

    return {
      profileId: profile.id,
      name: profile.name,
      persona: profile.persona,
      waiting: acc.waiting,
      stalled: acc.stalled,
      overdue: acc.overdue,
      longestWait: acc.longestWait,
      valueAtRisk: acc.valueAtRisk,
      openTasks,
      owned
    }
  })

  rows.sort((a, b) => {
    if (b.overdue !== a.overdue) return b.overdue - a.overdue
    if (b.stalled !== a.stalled) return b.stalled - a.stalled
    if (b.waiting !== a.waiting) return b.waiting - a.waiting
    return a.name.localeCompare(b.name)
  })

  return {
    rows,
    openBookings,
    unassigned,
    overdue: totalOverdue,
    valueAtRisk: totalValueAtRisk
  }
}
