/**
 * Bookings list route — the Loan Admin desk.
 * Every unit booking with its age, stage, who it is waiting on, financing
 * risk, buyer response and value. Stalled bookings sort first until the reader
 * sorts a column; filters cover stage, who holds the ball, risk, stalled only
 * and the no-recent-update flag. Clicking a row opens a quick view of the case
 * over the table.
 *
 * Active / Closed (issue #23): a closed booking (`disbursed`, `cancelled` or
 * `lapsed` — `spa_signed` stays Active) never leaves the database, per the
 * 7-year retention rule (docs/TRD.md, Data Retention); it only leaves the Active list,
 * behind its own tab with its own filtered, sorted, paginated view. Closed
 * carries an Export To Excel button so a desk can pull that record out of
 * Mortar. Add Booking (issue #24) enters one booking by hand, validated the
 * same way an imported sheet row is.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ClipboardList, HelpCircle, Search, Trash2, ListPlus, Download, X } from 'lucide-react'
import { ballInCourt, type EventKind, type Stage, type Task } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona, type Persona } from '@/lib/persona'
import { STAGE_LABELS } from '@/components/case/StagePill'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { BookingFilters, type BookingFilter } from '@/components/bookings/BookingFilters'
import {
  BookingPipelineFlow,
  type PipelineCounts,
  type PipelineSelection,
  type PipelineStageId
} from '@/components/bookings/BookingPipelineFlow'
import { BookingsTable, type BookingRow, type Sort, type SortKey } from '@/components/bookings/BookingsTable'
import { CaseQuickView } from '@/components/bookings/CaseQuickView'
import { buildClosedExportRows, downloadClosedExport } from '@/components/bookings/closedExport'
import { Pagination, usePagination } from '@/components/ui/Pagination'
import { nextSort } from '@/components/ui/SortHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { notify } from '@/components/ui/toastConfig'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { deleteBooking, postTask } from '@/lib/api'
import { waitingOnTask } from '@/components/bookings/WaitingOn'

type View = 'active' | 'closed'

/** Closed means the booking will never move again; `spa_signed` still has a legal file to close, so it stays Active. */
const CLOSED_STAGES = new Set<Stage>(['disbursed', 'cancelled', 'lapsed'])

/** Resolved for the "live" count: every closed stage plus `spa_signed`, which
 * stays on the Active tab but no longer counts as live. Derived from
 * `CLOSED_STAGES` so the two sets cannot drift apart (issue L13). */
const RESOLVED_STAGES = new Set<Stage>(['spa_signed', ...CLOSED_STAGES])

const ALL_STAGES = Object.keys(STAGE_LABELS) as Stage[]

/** The stages each tab can actually show, so the Stage filter never offers one
 * the current tab has zero of (issue M10). */
const STAGES_BY_VIEW: Record<View, Stage[]> = {
  active: ALL_STAGES.filter((s) => !CLOSED_STAGES.has(s)),
  closed: ALL_STAGES.filter((s) => CLOSED_STAGES.has(s))
}

type Row = BookingRow & { stalled: boolean; live: boolean; closed: boolean }

/** Default holder filter in the pipeline strip based on active persona. */
function defaultHolderForPersona(persona: Persona): PipelineStageId {
  if (persona === 'sales-admin') return 'buyer'
  if (persona === 'legal-admin') return 'solicitor'
  return 'bank'
}

export function BookingsPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { persona } = usePersona()
  const [filter, setFilter] = useState<BookingFilter>({
    stage: 'all',
    risk: 'all',
    stalledOnly: false,
    unknownOnly: false
  })
  const [inspecting, setInspecting] = useState<string | null>(null)
  const [view, setView] = useState<View>('active')
  const [exporting, setExporting] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkWorking, setBulkWorking] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [stripHolder, setStripHolder] = useState<PipelineStageId | null>(() => defaultHolderForPersona(persona))
  const lastPersonaRef = useRef(persona)

  useEffect(() => {
    if (lastPersonaRef.current !== persona) {
      lastPersonaRef.current = persona
      setStripHolder(defaultHolderForPersona(persona))
    }
  }, [persona])

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

  const signalsByBooking = useMemo(() => new Map((snapshot?.signals ?? []).map((s) => [s.bookingId, s])), [snapshot])

  /** Each booking's open task due soonest, for the Task column. */
  const openTaskByBooking = useMemo(() => {
    const map = new Map<string, Task>()
    for (const task of snapshot?.tasks ?? []) {
      if (task.status !== 'open') continue
      const held = map.get(task.bookingId)
      if (!held || task.dueOn < held.dueOn) map.set(task.bookingId, task)
    }
    return map
  }, [snapshot])

  const rows = useMemo<Row[]>(() => {
    if (!snapshot) return []
    const bookingsById = new Map(snapshot.bookings.map((b) => [b.id, b]))
    return cases
      .map((summary): Row | null => {
        const booking = bookingsById.get(summary.bookingId)
        if (!booking) return null
        const stalled = summary.stallReasons.length > 0
        const live = !RESOLVED_STAGES.has(summary.stage) && summary.bookingAgeDays < 30
        const closed = CLOSED_STAGES.has(summary.stage)
        return {
          booking,
          summary,
          signals: signalsByBooking.get(booking.id) ?? null,
          confirmedKinds: confirmedKinds.get(booking.id) ?? new Set<EventKind>(),
          openTask: openTaskByBooking.get(booking.id) ?? null,
          stalled,
          live,
          closed
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort(
        (a, b) =>
          Number(b.stalled) - Number(a.stalled) ||
          Number(b.live) - Number(a.live) ||
          b.summary.daysSinceEvidence - a.summary.daysSinceEvidence ||
          a.booking.id.localeCompare(b.booking.id)
      )
  }, [snapshot, cases, confirmedKinds, signalsByBooking, openTaskByBooking])

  // Active and Closed are two separate ledgers sharing one filter/sort state
  // (issue #23): a closed booking is never deleted, per the 7-year retention
  // rule, it just stops showing on the Active list.
  const { activeRows, closedRows } = useMemo(() => {
    const activeRows: Row[] = []
    const closedRows: Row[] = []
    for (const r of rows) (r.closed ? closedRows : activeRows).push(r)
    return { activeRows, closedRows }
  }, [rows])
  const viewRows = view === 'active' ? activeRows : closedRows

  const pipelineCounts = useMemo<PipelineCounts>(() => {
    const counts: PipelineCounts = {
      buyer: { total: 0, stalled: 0 },
      bank: { total: 0, stalled: 0 },
      solicitor: { total: 0, stalled: 0 },
      spa: { total: 0 },
      developer: { total: 0, stalled: 0 }
    }

    for (const r of activeRows) {
      if (r.summary.spaSigned || r.summary.stage === 'spa_signed') {
        counts.spa.total++
        continue
      }
      const bic = ballInCourt(r.summary)
      if (bic.holder === 'buyer') {
        counts.buyer.total++
        if (r.stalled) counts.buyer.stalled++
      } else if (bic.holder === 'bank') {
        counts.bank.total++
        if (r.stalled) counts.bank.stalled++
      } else if (bic.holder === 'solicitor') {
        counts.solicitor.total++
        if (r.stalled) counts.solicitor.stalled++
      } else if (bic.holder === 'developer') {
        counts.developer.total++
        if (r.stalled) counts.developer.stalled++
      }
    }

    return counts
  }, [activeRows])

  const [sort, setSort] = useState<Sort>(null)

  // Third click clears back to the default stalled-first ranking, so the
  // reader can always get back without reloading.
  const visible = useMemo(
    () =>
      viewRows.filter((r) => {
        if (filter.stage !== 'all' && r.summary.stage !== filter.stage) return false
        if (filter.risk !== 'all' && r.summary.risk.level !== filter.risk) return false
        if (filter.stalledOnly && !r.stalled) return false
        if (filter.unknownOnly && !r.summary.unknown) return false

        const needle = search.trim().toLocaleLowerCase()
        if (needle) {
          const text = [
            r.booking.unit,
            r.booking.buyer.name,
            r.booking.id,
            r.booking.legalFirm,
            ...r.summary.applications.map((application) => application.bank)
          ]
            .join(' ')
            .toLocaleLowerCase()
          if (!text.includes(needle)) return false
        }

        if (view === 'active' && stripHolder) {
          if (stripHolder === 'spa') {
            if (!r.summary.spaSigned && r.summary.stage !== 'spa_signed') return false
          } else {
            const bic = ballInCourt(r.summary)
            if (bic.holder !== stripHolder) return false
          }
        }

        return true
      }),
    [viewRows, filter, view, stripHolder, search]
  )

  // Applied after filtering so the sort acts on what the reader can see.
  const sorted = useMemo(() => {
    if (!sort) return visible
    const RISK_ORDER = { low: 0, medium: 1, high: 2 } as const
    const value = (r: (typeof visible)[number]) =>
      sort.key === 'age'
        ? r.summary.bookingAgeDays
        : sort.key === 'value'
          ? r.booking.priceRm
          : RISK_ORDER[r.summary.risk.level]
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...visible].sort((a, b) => (value(a) - value(b)) * dir || a.booking.id.localeCompare(b.booking.id))
  }, [visible, sort])

  const stats = useMemo(
    () => ({
      stalled: rows.filter((r) => r.stalled).length,
      unknown: rows.filter((r) => r.summary.unknown).length
    }),
    [rows]
  )

  const { pageRows, pagination } = usePagination(sorted)

  /** A re-sort returns to page one, for the same reason a filter change does. */
  const toggleSort = (key: SortKey) => {
    setSort((current) => nextSort(current, key))
    pagination.onPageChange(1)
  }

  /** A changed filter always returns the table to page one. */
  const applyFilter = (next: BookingFilter) => {
    setFilter(next)
    setSelectedIds([])
    pagination.onPageChange(1)
  }

  /** Switching Active/Closed always returns the table to page one, same as a
   * filter change; the Stage filter resets too, since a stage from the other
   * tab would just show a confusing "0 Of N" (issue M10). */
  const changeView = (next: View) => {
    setView(next)
    setSelectedIds([])
    setFilter((prev) => (prev.stage === 'all' ? prev : { ...prev, stage: 'all' }))
    pagination.onPageChange(1)
  }

  const handlePipelineSelect = (next: PipelineSelection) => {
    setStripHolder(next.stageId)
    setSelectedIds([])
    pagination.onPageChange(1)
  }

  const handlePipelineClear = () => {
    setStripHolder(null)
    setSelectedIds([])
    pagination.onPageChange(1)
  }

  // Export To Excel (issue #23) takes exactly what Closed is currently
  // showing — filtered and sorted, before pagination — never IC or phone.
  const exportClosed = async () => {
    if (!snapshot) return
    setExporting(true)
    try {
      const exportRows = buildClosedExportRows(
        sorted.map((r) => ({ booking: r.booking, summary: r.summary })),
        snapshot.events
      )
      await downloadClosedExport(exportRows, snapshot.meta.referenceDate)
    } catch {
      notify.error('Could Not Export The Closed Cases. Try Again.')
    } finally {
      setExporting(false)
    }
  }

  const selectedRows = rows.filter((row) => selectedIds.includes(row.booking.id))
  const createSelectedTasks = async () => {
    if (!snapshot) return
    setBulkWorking(true)
    try {
      const tasks = selectedRows.flatMap((row) => {
        const task = waitingOnTask(row.booking, row.summary, snapshot.meta.referenceDate)
        return task && !row.openTask ? [task] : []
      })
      await Promise.all(tasks.map((task) => postTask(task)))
      notify.success(`${tasks.length} Tasks Created`)
      setSelectedIds([])
      await refresh()
    } catch {
      notify.error('Could Not Create All Tasks. Try Again.')
    } finally {
      setBulkWorking(false)
    }
  }

  const exportSelected = async () => {
    if (!snapshot) return
    setBulkWorking(true)
    try {
      const exportRows = buildClosedExportRows(
        selectedRows.map((r) => ({ booking: r.booking, summary: r.summary })),
        snapshot.events
      )
      await downloadClosedExport(exportRows, snapshot.meta.referenceDate)
    } catch {
      notify.error('Could Not Export The Selected Bookings. Try Again.')
    } finally {
      setBulkWorking(false)
    }
  }

  const deleteSelected = async () => {
    if (selectedRows.length === 0) return
    setConfirmDelete(false)
    setBulkWorking(true)
    try {
      const outcomes = await Promise.allSettled(selectedRows.map((row) => deleteBooking(row.booking.id, persona)))
      const removed = outcomes.filter((outcome) => outcome.status === 'fulfilled').length
      const refused = outcomes.length - removed
      if (removed > 0) notify.success(`${removed} Bookings Deleted`)
      if (refused > 0)
        notify.error(`${refused} Bookings Could Not Be Deleted Because They Have Transaction Or Progression Data.`)
      setSelectedIds([])
      await refresh()
    } catch {
      notify.error('Could Not Delete The Selected Bookings. Try Again.')
    } finally {
      setBulkWorking(false)
    }
  }

  return (
    <PageContainer>
      <PageHeaderCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every Unit Booking, From Reservation Through To SPA Signing.
            </p>
          </div>
        </div>
      </PageHeaderCard>

      {loading && !snapshot ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-md" />
        </div>
      ) : error && !snapshot ? (
        <div className="mt-4">
          <EmptyState icon={ClipboardList} title="Bookings Could Not Load" description={error} />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={() => void refresh()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* A mutation's own save can succeed while the refresh after it fails; the
              table stays on screen with a way to retry rather than vanishing behind it. */}
          {error ? <RefreshErrorBanner onRetry={() => void refresh()} /> : null}

          {/* Two Stat Tiles */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              label="Stalled"
              icon={AlertTriangle}
              value={String(stats.stalled)}
              info="Live bookings with a stall reason."
              tone={stats.stalled > 0 ? 'alert' : 'default'}
            />
            <StatCard
              label="No Update 10+ Days"
              icon={HelpCircle}
              value={String(stats.unknown)}
              info="No confirmed evidence for 10 or more days."
              tone={stats.unknown > 0 ? 'alert' : 'default'}
            />
          </div>

          {/* Who Holds Each Booking — Pipeline Flow Strip */}
          {view === 'active' && (
            <div data-tour="booking-holder" className="mt-4">
              <BookingPipelineFlow
                counts={pipelineCounts}
                selection={{ stageId: stripHolder }}
                onSelect={handlePipelineSelect}
                onClear={handlePipelineClear}
              />
            </div>
          )}

          {/* Single Filter Row including Active/Closed Tabs */}
          <div data-tour="booking-filters" className="mt-4">
            <BookingFilters
              filter={filter}
              onChange={applyFilter}
              shown={visible.length}
              total={viewRows.length}
              stages={STAGES_BY_VIEW[view]}
              view={view}
              onViewChange={changeView}
              activeCount={activeRows.length}
              closedCount={closedRows.length}
              onExportClosed={exportClosed}
              exporting={exporting}
              exportDisabled={sorted.length === 0}
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search bookings"
                placeholder="Search unit, buyer, booking, bank or solicitor"
                value={search}
                onChange={(event) => {
                  setSelectedIds([])
                  setSearch(event.target.value)
                  pagination.onPageChange(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-md border border-border bg-card">
            {visible.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title={view === 'closed' ? 'No Closed Bookings Match' : 'No Bookings Match'}
                description={
                  view === 'closed'
                    ? 'Loosen The Stage Or Risk Filters, Or Check The Active Tab.'
                    : 'Loosen The Stage, Risk, Stalled Only Or No Update 10+ Days Filters, Or Clear The Holder Filter.'
                }
              />
            ) : (
              <>
                <BookingsTable
                  rows={pageRows}
                  sort={sort}
                  onSort={toggleSort}
                  onInspect={setInspecting}
                  referenceDate={snapshot?.meta.referenceDate ?? ''}
                  onChanged={refresh}
                  selectedIds={selectedIds}
                  onToggleSelected={(id) =>
                    setSelectedIds((current) =>
                      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
                    )
                  }
                  onToggleAll={(checked) =>
                    setSelectedIds((current) =>
                      checked
                        ? [...new Set([...current, ...pageRows.map((row) => row.booking.id)])]
                        : current.filter((id) => !pageRows.some((row) => row.booking.id === id))
                    )
                  }
                />
                <Pagination {...pagination} />
              </>
            )}
          </div>
          <CaseQuickView
            row={rows.find((r) => r.booking.id === inspecting) ?? null}
            referenceDate={snapshot?.meta.referenceDate ?? ''}
            onClose={() => setInspecting(null)}
            onChanged={refresh}
          />
          {selectedIds.length > 0 && (
            <div
              className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-card/85 px-3 py-2 shadow-[var(--shadow-overlay)] backdrop-blur-md"
              role="region"
              aria-label="Selected bookings actions"
            >
              <span className="pr-2 text-sm font-medium">{selectedIds.length} Selected</span>
              <Button size="sm" variant="destructive" disabled={bulkWorking} onClick={() => setConfirmDelete(true)}>
                <Trash2 aria-hidden="true" /> Delete
              </Button>
              <Button size="sm" variant="secondary" disabled={bulkWorking} onClick={() => void createSelectedTasks()}>
                <ListPlus aria-hidden="true" /> Create Tasks
              </Button>
              <Button size="sm" variant="secondary" disabled={bulkWorking} onClick={() => void exportSelected()}>
                <Download aria-hidden="true" /> Export To Excel
              </Button>
              <Button size="sm" variant="ghost" aria-label="Clear Selection" onClick={() => setSelectedIds([])}>
                <X aria-hidden="true" /> Clear Selection
              </Button>
            </div>
          )}
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Selected Bookings?</DialogTitle>
                <DialogDescription>
                  Delete {selectedRows.length} selected booking{selectedRows.length === 1 ? '' : 's'}? Any booking with
                  transaction or progression data will be retained and reported.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" disabled={bulkWorking} onClick={() => void deleteSelected()}>
                  Delete Bookings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </PageContainer>
  )
}
