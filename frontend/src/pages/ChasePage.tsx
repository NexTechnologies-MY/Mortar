/**
 * Chase page — the Sales Admin home desk. Every stalled live booking as a
 * chase card: its stall reasons, financing-risk chip and Jev's suggested next
 * action (cached first, re-run live). Below, the open tasks grouped by
 * owner. Filters narrow the queue by risk and by suggested owner.
 */
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { AlertTriangle, Banknote, BellRing, Flame, ListChecks, SearchX, SlidersHorizontal, Users } from 'lucide-react'
import type { CaseSummary, NextActionSuggestion, OwnerRole, RiskLevel, Task } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { fetchNextAction, postTask, updateTask } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChaseCard } from '@/components/chase/ChaseCard'
import { ChaseTasks } from '@/components/chase/ChaseTasks'
import { NEXT_ACTION_LABELS, dueOnForUrgency, ownerName, taskTitle, urgencyFor } from '@/components/chase/chase'
import { formatRm, formatRmCompact } from '@/components/case'
import type { DocumentKind } from '@mortar/core'

const RISK_OPTIONS: { value: 'all' | RiskLevel; label: string }[] = [
  { value: 'all', label: 'All Risk' },
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' }
]

const OWNER_OPTIONS: { value: 'all' | OwnerRole; label: string }[] = [
  { value: 'all', label: 'All Owners' },
  { value: 'sales', label: 'Sales' },
  { value: 'sales_admin', label: 'Sales Admin' },
  { value: 'loan_admin', label: 'Loan Admin' },
  { value: 'legal', label: 'Legal' }
]

const QUEUE_PREVIEW = 6

export function ChasePage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | OwnerRole>('all')
  const [queueExpanded, setQueueExpanded] = useState(false)

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

  /** The document a request_document suggestion refers to: outstanding, else Jev's proposed request. */
  const documentFor = (bookingId: string): DocumentKind | undefined => {
    const summary = cases.find((c) => c.bookingId === bookingId)
    if (summary?.outstandingDocuments.length) return summary.outstandingDocuments[0]
    const proposed = (snapshot?.events ?? []).filter(
      (e) => e.bookingId === bookingId && e.kind === 'documents_requested' && e.status !== 'superseded' && e.document
    )
    return proposed[proposed.length - 1]?.document ?? undefined
  }

  /** The queue ranks by urgency. Evidence awaiting review can clear a stall with
   * one confirmation, so it leads; then overdue, due-today and upcoming cards,
   * urgent scores first; ties break on value at risk, then the stalest stall. */
  const stalled = useMemo(() => {
    const pending = new Set((snapshot?.events ?? []).filter((e) => e.status === 'provisional').map((e) => e.bookingId))
    const toneOrder = { danger: 0, warning: 1, neutral: 2 } as const
    const rank = (c: CaseSummary) => {
      const urgency = urgencyFor(suggestions.get(c.bookingId), c.daysSinceEvidence)
      return { pending: !pending.has(c.bookingId), tone: toneOrder[urgency.tone], score: urgency.score }
    }
    return cases
      .filter((c) => c.stallReasons.length > 0)
      .filter((c) => riskFilter === 'all' || c.risk.level === riskFilter)
      .filter((c) => ownerFilter === 'all' || suggestions.get(c.bookingId)?.owner.value === ownerFilter)
      .sort((a, b) => {
        const ra = rank(a)
        const rb = rank(b)
        return (
          Number(ra.pending) - Number(rb.pending) ||
          ra.tone - rb.tone ||
          rb.score - ra.score ||
          (bookings.get(b.bookingId)?.priceRm ?? 0) - (bookings.get(a.bookingId)?.priceRm ?? 0) ||
          b.daysSinceEvidence - a.daysSinceEvidence
        )
      })
  }, [cases, riskFilter, ownerFilter, suggestions, bookings, snapshot])

  const allStalled = useMemo(() => cases.filter((c) => c.stallReasons.length > 0), [cases])
  const openTasks = useMemo(() => (snapshot?.tasks ?? []).filter((t) => t.status === 'open'), [snapshot])
  const valueAtRisk = allStalled.reduce((sum, c) => sum + (bookings.get(c.bookingId)?.priceRm ?? 0), 0)
  const highRisk = allStalled.filter((c) => c.risk.level === 'high').length

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
      notify.error(e instanceof Error ? e.message : 'Could not reach Jev')
    } finally {
      setFlag(setSuggesting, bookingId, false)
    }
  }

  const createTask = async (bookingId: string) => {
    const booking = bookings.get(bookingId)
    const suggestion = suggestions.get(bookingId)
    if (!booking || !suggestion || !snapshot) return
    setFlag(setCreating, bookingId, true)
    try {
      const ownerRole = suggestion.owner.value
      await postTask({
        bookingId,
        action: suggestion.action.value,
        title: taskTitle(suggestion.action.value, booking, documentFor(bookingId)),
        ownerRole,
        ownerName: ownerName(ownerRole, booking),
        dueOn: dueOnForUrgency(suggestion.urgency.score, snapshot.meta.referenceDate),
        origin: suggestion.meta.source === 'unavailable' ? 'staff' : 'jev'
      })
      notify.success(`Task created for ${bookingId}: ${NEXT_ACTION_LABELS[suggestion.action.value]}`)
      await refresh()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Could not create the task')
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
      notify.error(e instanceof Error ? e.message : 'Could not complete the task')
    } finally {
      setFlag(setCompleting, task.id, false)
    }
  }

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Chase List</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every Stalled Booking, Its Blocker In Plain Words, And Who To Chase Today.
        </p>
      </PageHeaderCard>

      {error ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={error} />
        </div>
      ) : loading && !snapshot ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-3">
            <StatCard
              label="Stalled Bookings"
              icon={AlertTriangle}
              value={String(allStalled.length)}
              info="Live bookings with a stall reason."
              exact="Click To Clear The Filters"
              onClick={() => applyFilters('all', 'all')}
            />
            <StatCard
              label="High Risk"
              icon={Flame}
              value={String(highRisk)}
              info="Stalled bookings flagged high financing risk."
              exact={riskFilter === 'high' ? 'Filtered — Click To Clear' : 'Click To Filter The Queue'}
              tone={highRisk > 0 ? 'alert' : 'default'}
              onClick={() => applyFilters(riskFilter === 'high' ? 'all' : 'high', ownerFilter)}
            />
            <StatCard
              label="Open Tasks"
              icon={ListChecks}
              value={String(openTasks.length)}
              info="Open tasks across every owner below."
            />
            <StatCard
              label="Value At Risk"
              icon={Banknote}
              value={formatRmCompact(valueAtRisk)}
              info="Sum of stalled booking prices."
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
                Action Today
                <InfoTooltip text="Stalled Bookings, Ranked By Urgency." />
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {(queueExpanded ? stalled : stalled.slice(0, QUEUE_PREVIEW)).map((summary) => {
                  const booking = bookings.get(summary.bookingId)
                  if (!booking) return null
                  return (
                    <ChaseCard
                      key={summary.bookingId}
                      booking={booking}
                      summary={summary}
                      suggestion={suggestions.get(summary.bookingId)}
                      document={documentFor(summary.bookingId)}
                      suggesting={suggesting.has(summary.bookingId)}
                      creating={creating.has(summary.bookingId)}
                      onSuggest={() => void suggest(summary.bookingId)}
                      onCreateTask={() => void createTask(summary.bookingId)}
                    />
                  )
                })}
              </div>
              {stalled.length > QUEUE_PREVIEW ? (
                <div className="mt-4 flex justify-center">
                  <Button type="button" variant="secondary" onClick={() => setQueueExpanded((v) => !v)}>
                    {queueExpanded ? 'Show Fewer' : `Show ${stalled.length - QUEUE_PREVIEW} More Stalled Bookings`}
                  </Button>
                </div>
              ) : null}
            </section>
          )}

          {openTasks.length > 0 ? (
            <section className="mt-8">
              <h2 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Open Tasks
                <InfoTooltip text="Grouped By Owner." />
              </h2>
              <div className="mt-3">
                <ChaseTasks tasks={openTasks} completing={completing} onComplete={(t) => void completeTask(t)} />
              </div>
            </section>
          ) : null}
        </>
      )}
    </PageContainer>
  )
}
