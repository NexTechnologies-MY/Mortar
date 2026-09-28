/**
 * Today (`/chase`) — every persona's home desk, the Manager's included. The
 * lead line answers the only question the page opens with: how many bookings
 * are stalled, and how many tasks are due today. The work queue comes first;
 * a rail beside it (stacked above it below 1280px) holds the two figures,
 * Your Tasks and Recent Bookings, and stays in view while the queue scrolls.
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
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { AlertTriangle, Banknote, BellRing, SearchX, SlidersHorizontal, Users } from 'lucide-react'
import { teamSummary } from '@mortar/core'
import type { Booking, CaseSummary, EventKind, NextActionSuggestion, OwnerRole, RiskLevel, Task } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { ApiError, fetchNextAction, postTask, updateTask } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CaseQuickView } from '@/components/bookings/CaseQuickView'
import type { BookingRow } from '@/components/bookings/BookingsTable'
import { ChaseCard } from '@/components/chase/ChaseCard'
import {
  BusiestDesk,
  EYEBROW,
  FollowUpsSent,
  Rail,
  RailFigures,
  RecentBookings,
  YourTasks
} from '@/components/chase/TodayRail'
import {
  assignedTasksFor,
  defaultOwnerFilter,
  dueTodayCount,
  dueTodayPhrase,
  headlineFor
} from '@/components/chase/today'
import { ManagerCard } from '@/components/manager/ManagerCard'
import { managerQueue } from '@/components/manager/managerQueue'
import { NEXT_ACTION_LABELS, ownerName as resolveOwnerName } from '@/components/chase/chase'
import { formatRm, formatRmCompact } from '@/components/case'
import { nextStepFor, stepToTask, type NextStep } from '@/components/case/nextStep'
import { PERSONA_DESK_ROLE, usePersona } from '@/lib/persona'

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

/** The Manager's desks: a follow-up always goes to a person on one of these. */
const MANAGER_DESK_OPTIONS: { value: 'all' | OwnerRole; label: string }[] = [
  { value: 'all', label: 'All Desks' },
  { value: 'sales_admin', label: 'Sales Admin' },
  { value: 'loan_admin', label: 'Loan Admin' },
  { value: 'legal', label: 'Legal Admin' }
]

const QUEUE_PREVIEW = 8

/** Creation time is optional for old/imported rows. Booking dates are not a substitute. */
function createdWithinLastSevenDays(createdAt: string | null | undefined, referenceDate: string): boolean {
  if (!createdAt || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(createdAt)) return false
  const createdDate = createdAt.slice(0, 10)
  const reference = new Date(`${referenceDate}T00:00:00Z`)
  const created = new Date(`${createdDate}T00:00:00Z`)
  if (Number.isNaN(reference.getTime()) || Number.isNaN(created.getTime())) return false
  const firstDate = new Date(reference)
  firstDate.setUTCDate(firstDate.getUTCDate() - 6)
  return created >= firstDate && created <= reference
}

function matchesSuggestedTask(task: Task, booking: Booking, step: NextStep): boolean {
  const normalizeRole = (role: OwnerRole) => (role === 'sales' ? 'sales_admin' : role)
  return (
    task.bookingId === booking.id &&
    task.action === step.action &&
    task.ownerName === resolveOwnerName(step.ownerRole, booking) &&
    normalizeRole(task.ownerRole) === normalizeRole(step.ownerRole)
  )
}

function AdminToday() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { persona, profile } = usePersona()
  // The persona's own desk, as the owner role its staff member works under.
  const deskRole = PERSONA_DESK_ROLE[persona]
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | OwnerRole>(() => defaultOwnerFilter(persona))
  const [queueExpanded, setQueueExpanded] = useState(false)
  const [mineOnly, setMineOnly] = useState(true)
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
  const assignedTasks = useMemo(() => assignedTasksFor(openTasks, profile), [openTasks, profile])

  const headline = headlineFor(ownerFilter, deskRole, stalled.length)
  const dueToday = snapshot ? dueTodayCount(assignedTasks, snapshot.meta.referenceDate) : 0

  /** Each booking's open task due soonest. */
  const openTaskByBooking = useMemo(() => {
    const map = new Map<string, Task>()
    for (const task of openTasks) {
      const held = map.get(task.bookingId)
      if (!held || task.dueOn < held.dueOn) map.set(task.bookingId, task)
    }
    return map
  }, [openTasks])

  /** A recommendation is useful only if the same action is not already open. */
  const recommended = useMemo(
    () =>
      stalled.filter((c) => {
        const proposed = steps.get(c.bookingId)?.defaultStep
        const booking = bookings.get(c.bookingId)
        return proposed && booking && !openTasks.some((task) => matchesSuggestedTask(task, booking, proposed))
      }),
    [stalled, steps, openTasks, bookings]
  )

  const recentBookings = useMemo(() => {
    if (!snapshot) return []
    return snapshot.bookings
      .filter((b) => createdWithinLastSevenDays(b.createdAt, snapshot.meta.referenceDate))
      .sort((a, b) => {
        const dateA = a.createdAt ?? ''
        const dateB = b.createdAt ?? ''
        return dateB.localeCompare(dateA) || a.id.localeCompare(b.id)
      })
  }, [snapshot])

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
    if (openTasks.some((task) => matchesSuggestedTask(task, booking, step))) return
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

  const queueCount = recommended.length
  return (
    <TodayLayout
      lead={`${headline.sentence} · ${dueTodayPhrase(dueToday)}`}
      loading={loading && !snapshot}
      failed={error && !snapshot ? error : null}
      refreshFailed={!!error && !!snapshot}
      onRetry={() => void refresh()}
      rail={
        <Rail label="Your day">
          <RailFigures
            figures={[
              {
                label: headline.label,
                icon: AlertTriangle,
                value: String(headline.count),
                info: headline.info,
                onClick: () => applyFilters('all', 'all')
              },
              {
                label: 'Value At Risk',
                icon: Banknote,
                value: formatRmCompact(valueAtRisk),
                exact: formatRm(valueAtRisk),
                info: "Sum of every stalled booking's price.",
                onClick: () => applyFilters('all', 'all')
              }
            ]}
          />
          <YourTasks
            mine={assignedTasks}
            everyone={openTasks}
            mineOnly={mineOnly}
            onMineOnly={setMineOnly}
            profile={profile}
            referenceDate={snapshot?.meta.referenceDate ?? ''}
            completing={completing}
            onComplete={(t) => void completeTask(t)}
          />
          <RecentBookings
            bookings={recentBookings}
            canOpen={(id) => cases.some((c) => c.bookingId === id)}
            onOpen={setInspecting}
          />
        </Rail>
      }
    >
      <QueueHeader title="Recommended Actions" info="Stalled Bookings, Most Overdue First.">
        <FilterSelect
          label="Filter by risk"
          icon={SlidersHorizontal}
          value={riskFilter}
          options={RISK_OPTIONS}
          onChange={(v) => applyFilters(v as 'all' | RiskLevel, ownerFilter)}
        />
        <FilterSelect
          label="Filter by owner"
          icon={Users}
          value={ownerFilter}
          options={OWNER_OPTIONS}
          onChange={(v) => applyFilters(riskFilter, v as 'all' | OwnerRole)}
        />
      </QueueHeader>

      {queueCount === 0 ? (
        <EmptyState
          icon={BellRing}
          title="Nothing To Chase"
          description={
            allStalled.length === 0
              ? 'No Live Booking Has A Stall Reason Right Now.'
              : stalled.length === 0
                ? 'No Stalled Booking Matches These Filters.'
                : 'Open Tasks Already Cover These Recommended Actions.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(queueExpanded ? recommended : recommended.slice(0, QUEUE_PREVIEW)).map((summary) => {
              const booking = bookings.get(summary.bookingId)
              const next = steps.get(summary.bookingId)
              if (!booking || !next) return null
              return (
                <ChaseCard
                  tourTarget={summary === stalled[0] ? 'today-card' : undefined}
                  actionsTarget={summary === stalled[0] ? 'today-actions' : undefined}
                  quickViewTarget={summary === stalled[0] ? 'today-quick-view' : undefined}
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
          <ShowMore total={queueCount} expanded={queueExpanded} onToggle={() => setQueueExpanded((v) => !v)} />
        </>
      )}

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
    </TodayLayout>
  )
}

/**
 * The Manager's Today: the same page, with Decisions For You as its queue —
 * the overdue cases no follow-up covers yet — and a rail of the overdue count,
 * value at risk across every desk, the follow-ups already sent and a shortcut
 * to the busiest desk on Team.
 */
function ManagerToday() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { profile } = usePersona()
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [deskFilter, setDeskFilter] = useState<'all' | OwnerRole>('all')
  const [expanded, setExpanded] = useState(false)

  const queue = useMemo(
    () => (snapshot ? managerQueue(snapshot, cases) : { decisions: [], sent: [] }),
    [snapshot, cases]
  )
  const team = useMemo(() => (snapshot ? teamSummary(snapshot, cases) : null), [snapshot, cases])

  const applyFilters = (risk: 'all' | RiskLevel, desk: 'all' | OwnerRole) => {
    setRiskFilter(risk)
    setDeskFilter(desk)
    setExpanded(false)
  }

  const decisions = queue.decisions
    .filter((c) => riskFilter === 'all' || c.summary.risk.level === riskFilter)
    .filter((c) => deskFilter === 'all' || c.ownerRole === deskFilter)
  const overdue = queue.decisions.length + queue.sent.length
  const awaiting = queue.sent.filter((c) => c.followUp?.status === 'open').length
  const busiest = team?.rows.find((r) => r.overdue > 0 || r.stalled > 0)

  return (
    <TodayLayout
      lead={`${overdue} Overdue ${overdue === 1 ? 'Case' : 'Cases'} · ${awaiting} ${
        awaiting === 1 ? 'Follow-Up' : 'Follow-Ups'
      } Awaiting Reply`}
      loading={loading && !snapshot}
      failed={error && !snapshot ? error : null}
      refreshFailed={!!error && !!snapshot}
      onRetry={() => void refresh()}
      rail={
        <Rail label="Your overview">
          <RailFigures
            figures={[
              {
                label: 'Overdue Cases',
                icon: AlertTriangle,
                value: String(overdue),
                tone: overdue > 0 ? 'alert' : 'default',
                info: 'Open cases waiting at least half as long again as the step should take, across every desk.',
                onClick: () => applyFilters('all', 'all')
              },
              {
                label: 'Value At Risk',
                icon: Banknote,
                value: formatRmCompact(team?.valueAtRisk ?? 0),
                exact: formatRm(team?.valueAtRisk ?? 0),
                info: "Sum of every stalled booking's price, across every desk.",
                to: '/team'
              }
            ]}
          />
          <FollowUpsSent cases={queue.sent} />
          {busiest ? <BusiestDesk row={busiest} /> : null}
        </Rail>
      }
    >
      <QueueHeader
        title={`Decisions For You · ${decisions.length}`}
        info="Overdue Cases No Follow-Up Covers Yet, Most Overdue First."
      >
        <FilterSelect
          label="Filter by risk"
          icon={SlidersHorizontal}
          value={riskFilter}
          options={RISK_OPTIONS}
          onChange={(v) => applyFilters(v as 'all' | RiskLevel, deskFilter)}
        />
        <FilterSelect
          label="Filter by desk"
          icon={Users}
          value={deskFilter}
          options={MANAGER_DESK_OPTIONS}
          onChange={(v) => applyFilters(riskFilter, v as 'all' | OwnerRole)}
        />
      </QueueHeader>

      {decisions.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No Decisions Waiting"
          description={
            queue.decisions.length === 0
              ? 'Every Overdue Case Already Has A Follow-Up.'
              : 'No Overdue Case Matches These Filters.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(expanded ? decisions : decisions.slice(0, QUEUE_PREVIEW)).map((item, i) => (
              <ManagerCard
                key={item.booking.id}
                tourTarget={i === 0 ? 'today-card' : undefined}
                item={item}
                referenceDate={snapshot?.meta.referenceDate ?? ''}
                managerName={profile.name}
                onSent={refresh}
              />
            ))}
          </div>
          <ShowMore total={decisions.length} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
        </>
      )}
    </TodayLayout>
  )
}

/** Title, lead line, then the queue beside its rail (the rail first below 1280px). */
function TodayLayout({
  lead,
  loading,
  failed,
  refreshFailed,
  onRetry,
  rail,
  children
}: {
  lead: string
  loading: boolean
  /** The first load failed: there is nothing to show. */
  failed: string | null
  /** A refresh after a save failed: the page stays, with a way to retry. */
  refreshFailed: boolean
  onRetry: () => void
  rail: ReactNode
  children: ReactNode
}) {
  return (
    <PageContainer>
      <PageHeaderCard tourTarget="today-header">
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Today</h1>
        {!loading && !failed ? <p className="mt-1 text-sm text-muted-foreground">{lead}</p> : null}
      </PageHeaderCard>

      {failed ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={failed} />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          {refreshFailed ? <RefreshErrorBanner onRetry={onRetry} /> : null}
          <div className="mt-7 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            {rail}
            <section aria-label="Work queue" className="flex min-w-0 flex-col gap-4 xl:col-start-1 xl:row-start-1">
              {children}
            </section>
          </div>
        </>
      )}
    </PageContainer>
  )
}

/** The queue's eyebrow title, with its filters on the right. */
function QueueHeader({ title, info, children }: { title: string; info: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className={`${EYEBROW} flex items-center gap-1`}>
        {title}
        <InfoTooltip text={info} />
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function FilterSelect({
  label,
  icon: Icon,
  value,
  options,
  onChange
}: {
  label: string
  icon: typeof Users
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-44 bg-card">
        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ShowMore({ total, expanded, onToggle }: { total: number; expanded: boolean; onToggle: () => void }) {
  if (total <= QUEUE_PREVIEW) return null
  return (
    <div className="flex justify-center pt-1">
      <Button type="button" variant="secondary" onClick={onToggle}>
        {expanded ? 'Show Fewer' : `Show ${total - QUEUE_PREVIEW} More`}
      </Button>
    </div>
  )
}

export function ChasePage() {
  const { persona } = usePersona()
  return persona === 'manager' ? <ManagerToday /> : <AdminToday />
}
