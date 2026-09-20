/**
 * Bookings list route — the Loan Admin desk.
 * Every unit booking with its age, stage, evidence freshness, financing risk,
 * buyer signals and open tasks. Stalled bookings sort first; filters cover
 * stage, risk and the unknown-evidence flag.
 */

import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import type { EventKind } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { BookingFilters, type BookingFilter } from '@/components/bookings/BookingFilters'
import { BookingsTable, type BookingRow } from '@/components/bookings/BookingsTable'
import { Pagination, usePagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

const RESOLVED_STAGES = new Set(['spa_signed', 'cancelled', 'lapsed'])

type Row = BookingRow & { stalled: boolean; live: boolean }

export function BookingsPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const [filter, setFilter] = useState<BookingFilter>({ stage: 'all', risk: 'all', unknownOnly: false })

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

  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter.stage === 'all' || r.summary.stage === filter.stage) &&
          (filter.risk === 'all' || r.summary.risk.level === filter.risk) &&
          (!filter.unknownOnly || r.summary.unknown)
      ),
    [rows, filter]
  )

  const stats = useMemo(
    () => ({
      live: rows.filter((r) => r.live).length,
      stalled: rows.filter((r) => r.stalled).length,
      unknown: rows.filter((r) => r.summary.unknown).length,
      signed: rows.filter((r) => r.summary.stage === 'spa_signed').length
    }),
    [rows]
  )

  const { pageRows, pagination } = usePagination(visible)

  /** A changed filter always returns the table to page one. */
  const applyFilter = (next: BookingFilter) => {
    setFilter(next)
    pagination.onPageChange(1)
  }

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Bookings</h1>
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
            <StatCard label="Live Bookings" value={String(stats.live)} info="Unresolved, booked within 30 days." />
            <StatCard
              label="Stalled"
              value={String(stats.stalled)}
              info="Live bookings with a stall reason."
              tone={stats.stalled > 0 ? 'alert' : 'default'}
            />
            <StatCard
              label="Unknown"
              value={String(stats.unknown)}
              info="No confirmed evidence for 10 or more days."
              tone={stats.unknown > 0 ? 'alert' : 'default'}
            />
            <StatCard label="SPA Signed" value={String(stats.signed)} info="Reached SPA signing — legally sold." />
          </div>
          <div className="mt-4">
            <BookingFilters filter={filter} onChange={applyFilter} shown={visible.length} total={rows.length} />
          </div>
          <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
            {visible.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No Bookings Match"
                description="Loosen The Stage, Risk Or Unknown Filters To See More Bookings."
              />
            ) : (
              <>
                <BookingsTable rows={pageRows} />
                <Pagination {...pagination} />
              </>
            )}
          </div>
        </>
      )}
    </PageContainer>
  )
}
