/**
 * Bookings list route — the Loan Admin desk.
 * Every unit booking with its age, stage, who it is waiting on, financing
 * risk, buyer response and value. Stalled bookings sort first until the reader
 * sorts a column; filters cover stage, who holds the ball, risk and the
 * no-recent-update flag. The Waiting On cell opens a quick view of the case
 * over the table.
 *
 * Active / Closed (issue #23): a closed booking (`disbursed`, `cancelled` or
 * `lapsed` — `spa_signed` stays Active) never leaves the database, per the
 * 7-year retention rule (docs/RETENTION.md); it only leaves the Active list,
 * behind its own tab with its own filtered, sorted, paginated view. Closed
 * carries an Export To Excel button so a desk can pull that record out of
 * Mortar. Add Booking (issue #24) enters one booking by hand, validated the
 * same way an imported sheet row is.
 */

import { useMemo, useState } from 'react'
import { AlertTriangle, ClipboardList, FileSignature, HelpCircle, Plus } from 'lucide-react'
import {
  ballInCourt,
  PERSONA_STAFF,
  unitKey,
  type Booking,
  type EventKind,
  type SheetDefaults,
  type Stage,
  type Task
} from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { AddBookingDialog } from '@/components/bookings/AddBookingDialog'
import { BookingFilters, type BookingFilter } from '@/components/bookings/BookingFilters'
import { BookingsTable, type BookingRow, type Sort, type SortKey } from '@/components/bookings/BookingsTable'
import { CaseQuickView } from '@/components/bookings/CaseQuickView'
import { buildClosedExportRows, downloadClosedExport } from '@/components/bookings/closedExport'
import { Pagination, usePagination } from '@/components/ui/Pagination'
import { nextSort } from '@/components/ui/SortHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notify } from '@/components/ui/toastConfig'

const RESOLVED_STAGES = new Set(['spa_signed', 'cancelled', 'lapsed'])

/** Closed means the booking will never move again; `spa_signed` still has a legal file to close, so it stays Active. */
const CLOSED_STAGES = new Set<Stage>(['disbursed', 'cancelled', 'lapsed'])

type View = 'active' | 'closed'

type Row = BookingRow & { stalled: boolean; live: boolean; closed: boolean }

/** The project most bookings belong to: what a hand-entered booking joins when it leaves Project blank. */
function mainProject(bookings: Booking[]): string {
  const counts = new Map<string, number>()
  for (const b of bookings) counts.set(b.project, (counts.get(b.project) ?? 0) + 1)
  let best = 'Unnamed Project'
  let most = 0
  for (const [project, n] of counts) {
    if (n > most) {
      best = project
      most = n
    }
  }
  return best
}

export function BookingsPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { persona } = usePersona()
  const [filter, setFilter] = useState<BookingFilter>({
    stage: 'all',
    waitingOn: 'all',
    risk: 'all',
    unknownOnly: false
  })
  const [inspecting, setInspecting] = useState<string | null>(null)
  const [view, setView] = useState<View>('active')
  const [addOpen, setAddOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

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

  const [sort, setSort] = useState<Sort>(null)

  // Third click clears back to the default stalled-first ranking, so the
  // reader can always get back without reloading.
  const visible = useMemo(
    () =>
      viewRows.filter(
        (r) =>
          (filter.stage === 'all' || r.summary.stage === filter.stage) &&
          (filter.waitingOn === 'all' || ballInCourt(r.summary).holder === filter.waitingOn) &&
          (filter.risk === 'all' || r.summary.risk.level === filter.risk) &&
          (!filter.unknownOnly || r.summary.unknown)
      ),
    [viewRows, filter]
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
      live: rows.filter((r) => r.live).length,
      stalled: rows.filter((r) => r.stalled).length,
      unknown: rows.filter((r) => r.summary.unknown).length,
      signed: rows.filter((r) => r.summary.stage === 'spa_signed').length
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
    pagination.onPageChange(1)
  }

  /** Switching Active/Closed always returns the table to page one, same as a filter change. */
  const changeView = (next: View) => {
    setView(next)
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

  const defaults = useMemo<SheetDefaults | null>(
    () =>
      snapshot
        ? {
            project: mainProject(snapshot.bookings),
            salesOwner: 'Unassigned',
            loanOwner: PERSONA_STAFF['loan-admin'].name,
            legalFirm: 'Unassigned'
          }
        : null,
    [snapshot]
  )

  // A unit is free again once its booking was cancelled or lapsed — the same
  // rule ImportPage applies, so a hand-entered booking is checked against
  // exactly the units an import would refuse.
  const held = useMemo(() => {
    if (!snapshot) return new Map<string, string>()
    const freed = new Set(cases.filter((c) => c.stage === 'cancelled' || c.stage === 'lapsed').map((c) => c.bookingId))
    return new Map(snapshot.bookings.filter((b) => !freed.has(b.id)).map((b) => [unitKey(b.project, b.unit), b.id]))
  }, [snapshot, cases])

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
          <Button type="button" className="shrink-0" disabled={!snapshot} onClick={() => setAddOpen(true)}>
            <Plus aria-hidden="true" />
            Add Booking
          </Button>
        </div>
      </PageHeaderCard>

      <AddBookingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        referenceDate={snapshot?.meta.referenceDate ?? ''}
        defaults={defaults}
        held={held}
        persona={persona}
        onImported={refresh}
      />

      {loading && !snapshot ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Live Bookings"
              icon={ClipboardList}
              value={String(stats.live)}
              info="Unresolved, booked within 30 days."
            />
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
            <StatCard
              label="SPA Signed"
              icon={FileSignature}
              value={String(stats.signed)}
              info="Reached SPA signing — legally sold."
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Tabs value={view} onValueChange={(next) => changeView(next as View)}>
              <TabsList>
                <TabsTrigger value="active">Active ({activeRows.length})</TabsTrigger>
                <TabsTrigger value="closed">Closed ({closedRows.length})</TabsTrigger>
              </TabsList>
            </Tabs>
            {view === 'closed' ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={sorted.length === 0 || exporting}
                onClick={() => void exportClosed()}
              >
                {exporting ? 'Exporting…' : 'Export To Excel'}
              </Button>
            ) : null}
          </div>

          <div className="mt-3">
            <BookingFilters filter={filter} onChange={applyFilter} shown={visible.length} total={viewRows.length} />
          </div>
          <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
            {visible.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title={view === 'closed' ? 'No Closed Bookings Match' : 'No Bookings Match'}
                description={
                  view === 'closed'
                    ? 'Loosen The Stage, Waiting On Or Risk Filters, Or Check The Active Tab.'
                    : 'Loosen The Stage, Waiting On, Risk Or No Update 10+ Days Filters To See More Bookings.'
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
        </>
      )}
    </PageContainer>
  )
}
