/**
 * Team (`/team`, Manager only) — who each booking is waiting on, desk by desk.
 *
 * Four figures open the page, each a way into the view behind its number. The
 * desks table follows: one row per staff profile, most overdue first, counting
 * the open bookings whose next move sits with that person by the same rule the
 * Manager's follow-ups use (`currentCaseAssignee`). A row opens Bookings
 * narrowed to those bookings. It replaces the old `/manager` page, which
 * redirects here.
 */

import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, SearchX } from 'lucide-react'
import { forecast, teamSummary, type TeamRow } from '@mortar/core'
import { formatRm, formatRmCompact } from '@/components/case'
import { EYEBROW } from '@/components/chase/TodayRail'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { DESK_OF_PERSONA, ProfileAvatar, RoleLabel } from '@/components/people/RoleLabel'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { useCases, useSnapshot } from '@/lib/data'
import { cn } from '@/lib/utils'

const CARD = 'rounded-md border border-card-border bg-card shadow-card'

function Figure({
  label,
  value,
  to,
  exact,
  alert
}: {
  label: string
  value: string
  to: string
  exact?: string
  alert?: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        CARD,
        'flex flex-col gap-1 p-4 outline-none transition-[box-shadow,transform] duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-px hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <span className={EYEBROW}>{label}</span>
      <span
        title={exact}
        className={cn(
          'text-[30px] font-semibold leading-9 tracking-[-0.03em] tabular-nums',
          alert ? 'text-status-danger-fg' : 'text-foreground'
        )}
      >
        {value}
      </span>
    </Link>
  )
}

function longestWait(row: TeamRow): string {
  if (!row.longestWait) return '—'
  const { elapsed, unit } = row.longestWait
  return `${elapsed} ${unit === 'working days' ? 'Working Days' : elapsed === 1 ? 'Day' : 'Days'}`
}

/** The row's bookings as a bar: stalled first, then moving, scaled to the busiest person. */
function WaitingBar({ row, scale }: { row: TeamRow; scale: number }) {
  const width = (n: number) => `${scale > 0 ? (n / scale) * 100 : 0}%`
  return (
    <span aria-hidden="true" className="flex h-2 w-[120px] overflow-hidden rounded-sm bg-muted">
      <span className="h-full bg-status-danger" style={{ width: width(row.stalled) }} />
      <span className="h-full bg-muted-foreground/45" style={{ width: width(row.waiting - row.stalled) }} />
    </span>
  )
}

export function TeamPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const navigate = useNavigate()
  const team = useMemo(() => (snapshot ? teamSummary(snapshot, cases) : null), [snapshot, cases])
  const outlook = useMemo(
    () =>
      snapshot
        ? forecast(snapshot, snapshot.meta.referenceDate, { seed: snapshot.meta.seed, model: snapshot.forecastModel })
        : null,
    [snapshot]
  )
  const scale = Math.max(0, ...(team?.rows.map((r) => r.waiting) ?? []))

  return (
    <PageContainer>
      <PageHeaderCard tourTarget="team-header">
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">Who Each Booking Is Waiting On, Desk By Desk</p>
      </PageHeaderCard>

      {error && !snapshot ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load The Team" description={error} />
        </div>
      ) : !team || !outlook ? (
        loading ? (
          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : null
      ) : (
        <>
          {error ? <RefreshErrorBanner onRetry={() => void refresh()} /> : null}
          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Figure label="Open Bookings" value={String(team.openBookings)} to="/bookings" />
            <Figure label="Overdue Cases" value={String(team.overdue)} to="/chase" alert={team.overdue > 0} />
            <Figure
              label="Value At Risk"
              value={formatRmCompact(team.valueAtRisk)}
              exact={formatRm(team.valueAtRisk)}
              to="/bookings"
            />
            <Figure
              label={`Expected Signings In ${outlook.horizonDays} Days`}
              value={outlook.support === 'supported' ? String(Math.round(outlook.expectedSignings)) : 'Unavailable'}
              exact={outlook.support === 'supported' ? outlook.expectedSignings.toFixed(1) : undefined}
              to="/forecast"
            />
          </div>

          <div className="mb-3 mt-9 flex flex-wrap items-center justify-between gap-3">
            <h2 className={cn(EYEBROW, 'flex items-center gap-1')}>
              Desks
              <InfoTooltip text="Open Bookings Whose Next Move Sits With Each Person, Most Overdue First." />
            </h2>
            <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2.5 rounded-[2px] bg-status-danger" />
                Stalled
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2.5 rounded-[2px] bg-muted-foreground/45" />
                Moving
              </span>
            </div>
          </div>

          <div className={cn(CARD, 'overflow-x-auto')}>
            <table
              className="w-full min-w-[860px] border-collapse text-sm"
              aria-label="Bookings waiting on each person"
            >
              <thead>
                <tr className="h-10 border-b border-border text-left">
                  <th scope="col" className={cn(EYEBROW, 'px-4 font-semibold')}>
                    Person
                  </th>
                  <th scope="col" className={cn(EYEBROW, 'px-4 font-semibold')}>
                    Waiting On Them
                  </th>
                  {['Stalled', 'Overdue', 'Longest Wait', 'Value At Risk', 'Open Tasks'].map((h) => (
                    <th key={h} scope="col" className={cn(EYEBROW, 'px-4 text-right font-semibold')}>
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="w-10">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {team.rows.map((row) => {
                  const to = `/bookings?waitingOn=${encodeURIComponent(row.profileId)}`
                  const desk = DESK_OF_PERSONA[row.persona]
                  return (
                    <tr
                      key={row.profileId}
                      data-testid={`team-row-${row.profileId}`}
                      onClick={() => navigate(to)}
                      className="h-16 cursor-pointer border-b border-border transition-colors duration-[var(--motion-fast)] last:border-b-0 hover:bg-accent"
                    >
                      <td className="px-4">
                        <span className="flex min-w-0 items-center gap-3">
                          <ProfileAvatar desk={desk} size={32} />
                          <span className="flex min-w-0 flex-col items-start gap-1">
                            <Link
                              to={to}
                              onClick={(e) => e.stopPropagation()}
                              className="truncate font-medium text-foreground underline-offset-4 hover:underline"
                            >
                              {row.name}
                            </Link>
                            <span className="flex items-center gap-2">
                              <RoleLabel desk={desk} />
                              {row.owned !== null ? (
                                <span className="text-xs text-muted-foreground">Owns {row.owned} Bookings</span>
                              ) : null}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4">
                        <span className="flex items-center gap-3">
                          <span className="w-7 text-right font-medium tabular-nums">{row.waiting}</span>
                          <WaitingBar row={row} scale={scale} />
                        </span>
                      </td>
                      <td className="px-4 text-right tabular-nums">{row.stalled}</td>
                      <td
                        className={cn(
                          'px-4 text-right tabular-nums',
                          row.overdue > 0 && 'font-semibold text-status-danger-fg'
                        )}
                      >
                        {row.overdue}
                      </td>
                      <td className="px-4 text-right tabular-nums">{longestWait(row)}</td>
                      <td className="px-4 text-right tabular-nums" title={formatRm(row.valueAtRisk)}>
                        {formatRmCompact(row.valueAtRisk)}
                      </td>
                      <td className="px-4 text-right tabular-nums">{row.openTasks}</td>
                      <td className="pr-4 text-right">
                        <ChevronRight aria-hidden="true" className="ml-auto size-4 text-muted-foreground" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {team.unassigned > 0 ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
              {team.unassigned} Other Open {team.unassigned === 1 ? 'Booking Has' : 'Bookings Have'} No Move Waiting On
              Anyone Right Now.
            </p>
          ) : null}
        </>
      )}
    </PageContainer>
  )
}
