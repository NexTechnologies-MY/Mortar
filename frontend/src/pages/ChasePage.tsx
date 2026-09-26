/**
 * Today (`/chase`) — every persona's home desk. The header answers the only
 * question the page opens with: how many bookings are stalled, and how many
 * tasks are due today. Two stat tiles follow, the filter row, then the cards.
 *
 * Sales Admin coordinates every booking to a signed SPA, so their home opens
 * on the whole chase — every desk, every owner. Loan Admin and Legal Admin open
 * on their own desk. The header sentence and the first tile follow the owner
 * filter rather than the persona, so choosing a desk relabels them instead of
 * leaving one sentence describing a different list from the one on screen.
 *
 * Each card names the blocker in plain words and the one next step, which is
 * the rule-based move from `ballInCourt` — the same move Waiting On and the
 * table's Task column raise, so one click anywhere creates one task. Jev's
 * cached answer appears only where it differs, as a single extra line. Clicking
 * the unit and buyer opens the same side sheet a row opens on the ledger.
 */
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { AlertTriangle, Banknote, BellRing, ListChecks, SearchX, SlidersHorizontal, Users } from 'lucide-react'
import { PERSONA_STAFF } from '@mortar/core'
import type { CaseSummary, EventKind, NextActionSuggestion, OwnerRole, RiskLevel, Task } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { ApiError, fetchNextAction, postTask, updateTask } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CaseQuickView } from '@/components/bookings/CaseQuickView'
import type { BookingRow } from '@/components/bookings/BookingsTable'
import { ChaseCard } from '@/components/chase/ChaseCard'
import { ChaseTasks } from '@/components/chase/ChaseTasks'
import { NEXT_ACTION_LABELS } from '@/components/chase/chase'
import { OWNER_ROLE_LABELS, formatRm, formatRmCompact } from '@/components/case'
import { nextStepFor, stepToTask, type NextStep } from '@/components/case/nextStep'
import { PERSONA_DESK_ROLE, usePersona, type Persona } from '@/lib/persona'

const RISK_OPTIONS: { value: 'all' | RiskLevel; label: string }[] = [
  { value: 'all', label: 'All Risk' },
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' }
]

const OWNER_OPTIONS: { value: 'all' | OwnerRole; label: string }[] = [
  { value: 'all', label: 'All Desks' },
  { value: 'sales', label: 'Sales' },
  { value: 'sales_admin', label: 'Sales Admin' },
  { value: 'loan_admin', label: 'Loan Admin' },
  { value: 'legal', label: 'Legal' }
]

const QUEUE_PREVIEW = 9

/**
 * What the page opens on, per persona.
 *
 * Sales Admin coordinates every booking to a signed SPA, so their home is the
 * whole chase: every desk, and every owner's tasks. Loan Admin and Legal Admin
 * open on their own desk and their own work. One place decides all of it, so
 * the owner filter, the header and Open Tasks cannot drift apart.
 */
function defaultsFor(persona: Persona): { owner: 'all' | OwnerRole; mineOnly: boolean } {
  return persona === 'sales-admin'
    ? { owner: 'all', mineOnly: false }
    : { owner: PERSONA_DESK_ROLE[persona], mineOnly: true }
}

/**
 * The header's count and the first tile, in the words a person would say.
 *
 * All desks count every stalled booking; one desk counts the cases waiting on
 * it. Either way the number is the size of the list on screen, so the sentence
 * and the queue can never describe different work. The tile drops the subject —
 * a tile reads "Need A Move From You" under the figure — and the sentence keeps
 * it, because a sentence with no subject is a headline. Every form reads
 * correctly in the singular: "1 Stalled Booking", "1 Booking Needs A Move From
 * You".
 */
function headlineFor(ownerFilter: 'all' | OwnerRole, ownDesk: OwnerRole, count: number) {
  if (ownerFilter === 'all') {
    return {
      count,
      sentence: `${count} ${count === 1 ? 'Stalled Booking' : 'Stalled Bookings'}`,
      tileLabel: 'Stalled Bookings',
      tileInfo: 'Every booking that has stopped moving, whichever desk holds it.'
    }
  }
  const from = ownerFilter === ownDesk ? 'You' : OWNER_ROLE_LABELS[ownerFilter]
  return {
    count,
    sentence: `${count} ${count === 1 ? 'Booking Needs' : 'Bookings Need'} A Move From ${from}`,
    tileLabel: `${count === 1 ? 'Needs' : 'Need'} A Move From ${from}`,
    tileInfo: 'Stalled bookings whose next step is on this desk.'
  }
}

export function ChasePage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { persona } = usePersona()
  // The persona's own desk, as the owner role its staff member works under.
  const deskRole = PERSONA_DESK_ROLE[persona]
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | OwnerRole>(() => defaultsFor(persona).owner)
  const [queueExpanded, setQueueExpanded] = useState(false)
  const [mineOnly, setMineOnly] = useState(() => defaultsFor(persona).mineOnly)
  const [inspecting, setInspecting] = useState<string | null>(null)

  /** A changed filter re-folds the queue to its first few cards. */
  const applyFilters = (risk: 'all' | RiskLevel, owner: 'all' | OwnerRole) => {
    setRiskFilter(risk)
    setOwnerFilter(owner)
    setQueueExpanded(false)
  }
  const [live, setLive] = useState<Record<string, NextActionSuggestion>>({})
  const [suggesting, setSuggesting] = useState<ReadonlySet<string>>(new Set())
  const [creating, setCreating] = useState<ReadonlySet<string>>(new Set())
  const [completing, setCompleting] = useState<ReadonlySet<string>>(new Set())

  const bookings = useMemo(() => new Map((snapshot?.bookings ?? []).map((b) => [b.id, b])), [snapshot])
  const suggestions = useMemo(() => {
    const map = new Map((snapshot?.nextActions ?? []).map((s) => [s.bookingId, s]))
    for (const [id, s] of Object.entries(live)) map.set(id, s)
    return map
  }, [snapshot, live])

  const steps = useMemo(() => {
    const map = new Map<string, ReturnType<typeof nextStepFor>>()
    for (const summary of cases) {
      const booking = bookings.get(summary.bookingId)
      if (!booking) continue
      map.set(summary.bookingId, nextStepFor(booking, summary, NEXT_ACTION_LABELS, suggestions.get(summary.bookingId)))
    }
    return map
  }, [cases, bookings, suggestions])

  /** Bookings with evidence waiting for a person to confirm it. One
   * confirmation can clear a stall outright, so they lead the queue. */
  const awaitingReview = useMemo(
    () => new Set((snapshot?.events ?? []).filter((e) => e.status === 'provisional').map((e) => e.bookingId)),
    [snapshot]
  )

  /** The queue ranks by what clears a stall soonest: evidence awaiting review
   * first, then how long each case has sat still, then by value at risk, then
   * by age. Jev's urgency score is not in it — asking Jev must never move a
   * card, or the queue reshuffles under the person reading it. */
  const stalled = useMemo(() => {
    // The owner filter's match for a case is the desk that makes its next step.
    const ownerFor = (c: CaseSummary): OwnerRole | undefined => steps.get(c.bookingId)?.defaultStep.ownerRole
    return cases
      .filter((c) => c.stallReasons.length > 0)
      .filter((c) => riskFilter === 'all' || c.risk.level === riskFilter)
      .filter((c) => ownerFilter === 'all' || ownerFor(c) === ownerFilter)
      .sort(
        (a, b) =>
          Number(awaitingReview.has(b.bookingId)) - Number(awaitingReview.has(a.bookingId)) ||
          b.daysSinceEvidence - a.daysSinceEvidence ||
          (bookings.get(b.bookingId)?.priceRm ?? 0) - (bookings.get(a.bookingId)?.priceRm ?? 0) ||
          b.bookingAgeDays - a.bookingAgeDays
      )
  }, [cases, riskFilter, ownerFilter, steps, bookings, awaitingReview])

  const allStalled = useMemo(() => cases.filter((c) => c.stallReasons.length > 0), [cases])
  const openTasks = useMemo(() => (snapshot?.tasks ?? []).filter((t) => t.status === 'open'), [snapshot])

  const headline = headlineFor(ownerFilter, deskRole, stalled.length)
  const dueToday = useMemo(() => {
    if (!snapshot) return 0
    return openTasks.filter((t) => t.dueOn <= snapshot.meta.referenceDate).length
  }, [openTasks, snapshot])

  /** Each booking's open task due soonest. */
  const openTaskByBooking = useMemo(() => {
    const map = new Map<string, Task>()
    for (const task of openTasks) {
      const held = map.get(task.bookingId)
      if (!held || task.dueOn < held.dueOn) map.set(task.bookingId, task)
    }
    return map
  }, [openTasks])

  const valueAtRisk = allStalled.reduce((sum, c) => sum + (bookings.get(c.bookingId)?.priceRm ?? 0), 0)

  /** The confirmed evidence kinds per booking, for the side sheet's journey. */
  const confirmedKinds = useMemo(() => {
    const map = new Map<string, Set<EventKind>>()
    for (const event of snapshot?.events ?? []) {
      if (event.status !== 'confirmed') continue
      const set = map.get(event.bookingId) ?? new Set<EventKind>()
      set.add(event.kind)
      map.set(event.bookingId, set)
    }
    return map
  }, [snapshot])

  /** The row the side sheet shows, built the way `/bookings` builds it. */
  const quickViewRow = useMemo((): BookingRow | null => {
    if (!inspecting) return null
    const booking = bookings.get(inspecting)
    const summary = cases.find((c) => c.bookingId === inspecting)
    if (!booking || !summary) return null
    return {
      booking,
      summary,
      signals: null,
      confirmedKinds: confirmedKinds.get(booking.id) ?? new Set<EventKind>(),
      openTask: openTaskByBooking.get(booking.id) ?? null
    }
  }, [inspecting, bookings, cases, confirmedKinds, openTaskByBooking])

  /** Open Tasks defaults to the active persona's own work, with an all-owners widen. */
  const shownTasks = useMemo(
    () => (mineOnly ? openTasks.filter((t) => t.ownerName === PERSONA_STAFF[persona].name) : openTasks),
    [openTasks, mineOnly, persona]
  )

  const setFlag = (set: Dispatch<SetStateAction<ReadonlySet<string>>>, id: string, on: boolean) =>
    set((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const suggest = async (bookingId: string) => {
    setFlag(setSuggesting, bookingId, true)
    try {
      const suggestion = await fetchNextAction(bookingId)
      setLive((prev) => ({ ...prev, [bookingId]: suggestion }))
      if (suggestion.meta.source === 'unavailable') notify.warning('Jev is unavailable — showing a neutral answer')
    } catch (e) {
      notify.error(e instanceof ApiError ? e.message : 'Could Not Reach Jev. Try Again.')
    } finally {
      setFlag(setSuggesting, bookingId, false)
    }
  }

  /** Raises whichever step the person picked — the default or Jev's alternative. */
  const createTask = async (bookingId: string, step: NextStep) => {
    const booking = bookings.get(bookingId)
    if (!booking || !snapshot) return
    setFlag(setCreating, bookingId, true)
    try {
      await postTask(
        stepToTask(step, booking, snapshot.meta.referenceDate, {
          daysUntilDue: 0,
          origin: suggestions.get(bookingId)?.action.value === step.action ? 'jev' : 'staff'
        })
      )
      notify.success(`Task created for ${bookingId}: ${step.label}`)
      await refresh()
    } catch (e) {
      notify.error(e instanceof ApiError ? e.message : 'Could Not Create The Task. Try Again.')
    } finally {
      setFlag(setCreating, bookingId, false)
    }
  }

  const completeTask = async (task: Task) => {
    setFlag(setCompleting, task.id, true)
    try {
      await updateTask(task.id, 'done')
      notify.success(`Completed: ${task.title}`)
      await refresh()
    } catch (e) {
      notify.error(e instanceof ApiError ? e.message : 'Could Not Complete The Task. Try Again.')
    } finally {
      setFlag(setCompleting, task.id, false)
    }
  }

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {headline.sentence} · {dueToday} {dueToday === 1 ? 'Task' : 'Tasks'} Due Today
        </p>
      </PageHeaderCard>

      {error && !snapshot ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={error} />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={() => void refresh()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : loading && !snapshot ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          {/* A create-task or complete-task save can land fine while the refresh after
              it fails; the queue stays on screen with a way to retry rather than
              vanishing behind it. */}
          {error ? <RefreshErrorBanner onRetry={() => void refresh()} /> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <StatCard
              label={headline.tileLabel}
              icon={AlertTriangle}
              value={String(headline.count)}
              info={headline.tileInfo}
              exact="Click To Clear The Filters"
              onClick={() => applyFilters('all', 'all')}
            />
            <StatCard
              label="Value At Risk"
              icon={Banknote}
              value={formatRmCompact(valueAtRisk)}
              info="Sum of every stalled booking's price."
              exact={formatRm(valueAtRisk)}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Select value={riskFilter} onValueChange={(v) => applyFilters(v as 'all' | RiskLevel, ownerFilter)}>
              <SelectTrigger aria-label="Filter by risk" className="w-44">
                <SlidersHorizontal aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RISK_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ownerFilter} onValueChange={(v) => applyFilters(riskFilter, v as 'all' | OwnerRole)}>
              <SelectTrigger aria-label="Filter by owner" className="w-44">
                <Users aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OWNER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {stalled.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={BellRing}
                title="Nothing To Chase"
                description={
                  allStalled.length === 0
                    ? 'No Live Booking Has A Stall Reason Right Now.'
                    : 'No Stalled Booking Matches These Filters.'
                }
              />
            </div>
          ) : (
            <section className="mt-6">
              <h2 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Bookings Needing A Move
                <InfoTooltip text="Stalled Bookings, Most Overdue First." />
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {(queueExpanded ? stalled : stalled.slice(0, QUEUE_PREVIEW)).map((summary) => {
                  const booking = bookings.get(summary.bookingId)
                  const next = steps.get(summary.bookingId)
                  if (!booking || !next) return null
                  return (
                    <ChaseCard
                      key={summary.bookingId}
                      booking={booking}
                      summary={summary}
                      step={next.defaultStep}
                      alternativeStep={next.alternativeStep}
                      openTask={openTaskByBooking.get(summary.bookingId) ?? null}
                      suggesting={suggesting.has(summary.bookingId)}
                      creating={creating.has(summary.bookingId)}
                      onInspect={() => setInspecting(summary.bookingId)}
                      onSuggest={() => void suggest(summary.bookingId)}
                      onCreateTask={(step) => void createTask(summary.bookingId, step)}
                    />
                  )
                })}
              </div>
              {stalled.length > QUEUE_PREVIEW ? (
                <div className="mt-4 flex justify-center">
                  <Button type="button" variant="secondary" onClick={() => setQueueExpanded((v) => !v)}>
                    {queueExpanded ? 'Show Fewer' : `Show ${stalled.length - QUEUE_PREVIEW} More`}
                  </Button>
                </div>
              ) : null}
            </section>
          )}

          {openTasks.length > 0 ? (
            <section className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <ListChecks aria-hidden="true" className="size-4 shrink-0" />
                  Open Tasks
                  <InfoTooltip text="Grouped By Owner." />
                </h2>
                <Button type="button" variant="ghost" size="sm" onClick={() => setMineOnly((v) => !v)}>
                  {mineOnly ? 'Show All Owners' : 'Show Mine Only'}
                </Button>
              </div>
              <div className="mt-3">
                <ChaseTasks
                  tasks={shownTasks}
                  completing={completing}
                  onComplete={(t) => void completeTask(t)}
                  emptyLabel={`No Open Tasks For ${PERSONA_STAFF[persona].name}.`}
                />
              </div>
            </section>
          ) : null}

          {/* The same side sheet a row opens on the ledger, so what happened
              can be recorded from Today without leaving it. A save in here
              refreshes the queue behind the sheet, as it does there. */}
          <CaseQuickView
            row={quickViewRow}
            referenceDate={snapshot?.meta.referenceDate ?? ''}
            suggestion={inspecting ? suggestions.get(inspecting) : undefined}
            onClose={() => setInspecting(null)}
            onChanged={refresh}
          />
        </>
      )}
    </PageContainer>
  )
}
