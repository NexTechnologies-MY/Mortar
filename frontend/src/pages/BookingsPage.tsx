/**
 * Bookings list route — the Loan Admin desk.
 * Every unit booking with its age, stage, who it is waiting on, financing
 * risk, buyer response and value. Stalled bookings sort first until the reader
 * sorts a column; filters cover stage, who holds the ball, risk and the
 * no-recent-update flag. The Waiting On cell opens a quick view of the case
 * over the table.
 */

import { useMemo, useState } from 'react'
import { AlertTriangle, ClipboardList, FileSignature, HelpCircle } from 'lucide-react'
import { ballInCourt, type EventKind } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { BookingFilters, type BookingFilter } from '@/components/bookings/BookingFilters'
import { BookingsTable, type BookingRow, type Sort, type SortKey } from '@/components/bookings/BookingsTable'
import { CaseQuickView } from '@/components/bookings/CaseQuickView'
import { Pagination, usePagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

const RESOLVED_STAGES = new Set(['spa_signed', 'cancelled', 'lapsed'])

type Row = BookingRow & { stalled: boolean; live: boolean }

export function BookingsPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const [filter, setFilter] = useState<BookingFilter>({
    stage: 'all',
    waitingOn: 'all',
    risk: 'all',
    unknownOnly: false
  })
  const [inspecting, setInspecting] = useState<string | null>(null)

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

  const rows = useMemo<Row[]>(() => {
    if (!snapshot) return []
    const bookingsById = new Map(snapshot.bookings.map((b) => [b.id, b]))
    return cases
      .map((summary): Row | null => {
        const booking = bookingsById.get(summary.bookingId)
        if (!booking) return null
        const stalled = summary.stallReasons.length > 0
        const live = !RESOLVED_STAGES.has(summary.stage) && summary.bookingAgeDays < 30
        return {
          booking,
          summary,
          signals: signalsByBooking.get(booking.id) ?? null,
          confirmedKinds: confirmedKinds.get(booking.id) ?? new Set<EventKind>(),
          stalled,
          live
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
  }, [snapshot, cases, confirmedKinds, signalsByBooking])

  const [sort, setSort] = useState<Sort>(null)

  // Third click clears back to the default stalled-first ranking, so the
  // reader can always get back without reloading.
  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter.stage === 'all' || r.summary.stage === filter.stage) &&
          (filter.waitingOn === 'all' || ballInCourt(r.summary).holder === filter.waitingOn) &&
          (filter.risk === 'all' || r.summary.risk.level === filter.risk) &&
          (!filter.unknownOnly || r.summary.unknown)
      ),
    [rows, filter]
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
    setSort((current) =>
      current?.key !== key ? { key, dir: 'desc' } : current.dir === 'desc' ? { key, dir: 'asc' } : null
    )
    pagination.onPageChange(1)
  }

  /** A changed filter always returns the table to page one. */
  const applyFilter = (next: BookingFilter) => {
    setFilter(next)
    pagination.onPageChange(1)
  }

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every Unit Booking, From Reservation Through To SPA Signing.
        </p>
      </PageHeaderCard>

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
              label="Unknown"
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
          <div className="mt-4">
            <BookingFilters filter={filter} onChange={applyFilter} shown={visible.length} total={rows.length} />
          </div>
          <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
            {visible.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No Bookings Match"
                description="Loosen The Stage, Waiting On, Risk Or Unknown Filters To See More Bookings."
              />
            ) : (
              <>
                <BookingsTable rows={pageRows} sort={sort} onSort={toggleSort} onInspect={setInspecting} />
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
