/**
 * Today's rail — the right-hand column that stays in view while the queue
 * scrolls, and stacks above the queue below 1280px.
 *
 * Everything in it is a summary of, or a shortcut into, work that lives
 * elsewhere: the two figures (each clears the queue's filters), Your Tasks,
 * Recent Bookings, and for the Manager, Follow-Ups You Sent and the busiest
 * desk.
 */

import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Booking, StaffProfile, Task, TeamRow } from '@mortar/core'
import { canManageTaskStatus } from '@mortar/core'
import { OWNER_ROLE_LABELS, formatDate, formatRm, formatRmCompact } from '@/components/case'
import { DESK_OF_PERSONA, DESK_OF_ROLE, RoleLabel } from '@/components/people/RoleLabel'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import type { ManagerCase } from '@/components/manager/managerQueue'

export const EYEBROW = 'text-[11px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-muted-foreground'

const RAIL_CARD = 'rounded-md border border-card-border bg-card shadow-card'

/** The rail's container: sticky from 1280px, scrolling on its own when taller than the window. */
export function Rail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside
      aria-label={label}
      className="flex flex-col gap-4 xl:sticky xl:top-[72px] xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100dvh-88px)] xl:overflow-y-auto xl:pb-1"
    >
      {children}
    </aside>
  )
}

export type RailFigure = {
  label: string
  icon: LucideIcon
  value: string
  /** The exact figure, for a rounded one. */
  exact?: string
  info?: string
  tone?: 'default' | 'alert'
  /** Applies the filter behind the number. */
  onClick?: () => void
  to?: string
}

/** Two figures: a two-up row below 1280px, stacked in one card beside the queue. */
export function RailFigures({ figures }: { figures: [RailFigure, RailFigure] }) {
  return (
    <div className={cn(RAIL_CARD, 'grid grid-cols-2 px-4 xl:grid-cols-1')}>
      {figures.map((f, i) => {
        const body = (
          <>
            <span className="flex items-center gap-1.5">
              <f.icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <span className={EYEBROW}>{f.label}</span>
            </span>
            <span
              title={f.exact}
              className={cn(
                'whitespace-nowrap text-2xl font-semibold leading-8 tracking-[-0.03em] tabular-nums sm:text-[30px] sm:leading-9',
                f.tone === 'alert' ? 'text-status-danger-fg' : 'text-foreground'
              )}
            >
              {f.value}
            </span>
          </>
        )
        const className = cn(
          'flex flex-col items-start gap-1 py-3 text-left',
          i === 0 ? 'border-r border-border pr-4 xl:border-b xl:border-r-0 xl:pr-0' : 'pl-4 xl:pl-0',
          (f.onClick || f.to) &&
            'rounded-sm outline-none transition-colors duration-[var(--motion-fast)] hover:text-link focus-visible:ring-2 focus-visible:ring-ring'
        )
        return (
          <div key={f.label} className="flex min-w-0 items-start gap-1">
            {f.to ? (
              <Link to={f.to} className={cn(className, 'grow')}>
                {body}
              </Link>
            ) : f.onClick ? (
              <button type="button" onClick={f.onClick} className={cn(className, 'grow')}>
                {body}
              </button>
            ) : (
              <div className={cn(className, 'grow')}>{body}</div>
            )}
            {f.info ? (
              <span className="mt-3 shrink-0">
                <InfoTooltip text={f.info} />
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/** A task's due date as one pill: overdue, due today, or the date. */
function DuePill({ dueOn, referenceDate }: { dueOn: string; referenceDate: string }) {
  if (dueOn < referenceDate) return <StatusPill tone="danger">Overdue</StatusPill>
  if (dueOn === referenceDate) return <StatusPill tone="warning">Due Today</StatusPill>
  return <StatusPill tone="neutral">Due {formatDate(dueOn)}</StatusPill>
}

const TASK_PREVIEW = 5

/**
 * Your Tasks: the person's open tasks, soonest first, with a Mine/Everyone
 * switch. Each row's circle completes the task; the title opens the case.
 */
export function YourTasks({
  mine,
  everyone,
  mineOnly,
  onMineOnly,
  profile,
  referenceDate,
  completing,
  onComplete
}: {
  mine: readonly Task[]
  everyone: readonly Task[]
  mineOnly: boolean
  onMineOnly: (mineOnly: boolean) => void
  profile: StaffProfile
  referenceDate: string
  completing: ReadonlySet<string>
  onComplete: (task: Task) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const tasks = [...(mineOnly ? mine : everyone)].sort(
    (a, b) =>
      Number(!!b.managerFlaggedBy) - Number(!!a.managerFlaggedBy) ||
      a.dueOn.localeCompare(b.dueOn) ||
      a.title.localeCompare(b.title)
  )
  const shown = expanded ? tasks : tasks.slice(0, TASK_PREVIEW)
  return (
    <section data-tour="open-tasks" aria-label="Your tasks" className={cn(RAIL_CARD, 'flex flex-col gap-3 p-4')}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cn(EYEBROW, 'flex items-center gap-1')}>
          Your Tasks · {tasks.length}
          <InfoTooltip text="Open Tasks, Ordered By Due Date." />
        </h2>
        <div role="group" aria-label="Whose tasks" className="flex rounded-md bg-muted p-0.5">
          {[
            { label: 'Mine', on: mineOnly, value: true },
            { label: 'Everyone', on: !mineOnly, value: false }
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={option.on}
              onClick={() => {
                onMineOnly(option.value)
                setExpanded(false)
              }}
              className={cn(
                'h-7 rounded-sm px-2.5 text-xs font-medium outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring',
                option.on ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {mineOnly ? `No Open Tasks For ${profile.name}.` : 'No Open Tasks.'}
        </p>
      ) : (
        <ul className="flex flex-col">
          {shown.map((task) => {
            const canComplete = canManageTaskStatus(task, profile)
            const busy = completing.has(task.id)
            return (
              <li
                key={task.id}
                className="flex items-start gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0"
              >
                {canComplete ? (
                  <button
                    type="button"
                    aria-label={`Complete: ${task.title}`}
                    disabled={busy}
                    onClick={() => onComplete(task)}
                    className="group mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-muted-foreground/60 bg-card outline-none transition-colors duration-[var(--motion-fast)] hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <Check
                      aria-hidden="true"
                      className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={3}
                    />
                  </button>
                ) : (
                  <span aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                )}
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Link
                    to={`/bookings/${task.bookingId}`}
                    className="text-sm font-medium leading-5 text-foreground underline-offset-4 hover:underline"
                  >
                    {busy ? 'Completing…' : task.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-xs text-muted-foreground">{task.bookingId}</span>
                    <DuePill dueOn={task.dueOn} referenceDate={referenceDate} />
                    {task.managerFlaggedBy ? (
                      <span className="text-xs text-muted-foreground">From {task.managerFlaggedBy}</span>
                    ) : null}
                  </div>
                  {!mineOnly ? (
                    <RoleLabel desk={DESK_OF_ROLE[task.ownerRole]} className="w-fit">
                      {OWNER_ROLE_LABELS[task.ownerRole]} · {task.ownerName}
                    </RoleLabel>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {tasks.length > TASK_PREVIEW ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
        >
          {expanded ? 'Show Fewer Tasks' : `Show All ${tasks.length} Tasks`}
        </button>
      ) : null}
    </section>
  )
}

const RECENT_PREVIEW = 5

/** Bookings created in the last seven days, folded to one line until opened. */
export function RecentBookings({
  bookings,
  canOpen,
  onOpen
}: {
  bookings: readonly Booking[]
  canOpen: (id: string) => boolean
  onOpen: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? bookings : bookings.slice(0, RECENT_PREVIEW)
  return (
    <section aria-label="Recent bookings" className={cn(RAIL_CARD, 'flex flex-col gap-3 p-4')}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={EYEBROW}>Recent Bookings{bookings.length > 0 ? ` · ${bookings.length}` : ''}</h2>
        {bookings.length === 0 ? (
          <span className="text-[13px] text-muted-foreground">None This Week</span>
        ) : (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
          >
            {open ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {open && bookings.length > 0 ? (
        <>
          <ul className="flex flex-col">
            {shown.map((booking) => (
              <li key={booking.id} className="border-t border-border first:border-t-0">
                {canOpen(booking.id) ? (
                  <button
                    type="button"
                    onClick={() => onOpen(booking.id)}
                    aria-label={`Open ${booking.id} · ${booking.buyer.name}`}
                    className="-mx-2 flex w-[calc(100%+16px)] flex-col items-start gap-0.5 rounded-sm px-2 py-2 text-left transition-colors duration-[var(--motion-fast)] hover:bg-accent"
                  >
                    <RecentLine booking={booking} />
                  </button>
                ) : (
                  <div className="flex flex-col gap-0.5 py-2">
                    <RecentLine booking={booking} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          {bookings.length > RECENT_PREVIEW ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="self-start text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
            >
              {expanded ? 'Show Fewer' : `Show ${bookings.length - RECENT_PREVIEW} More`}
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

function RecentLine({ booking }: { booking: Booking }) {
  return (
    <>
      <span className="font-mono text-[13px] font-medium">{booking.unit}</span>
      <span className="text-[13px] text-muted-foreground">
        <span className="font-mono text-xs">{booking.id}</span> · {booking.buyer.name}
      </span>
    </>
  )
}

/** The Manager's follow-ups that still stand: case, blocker, recipient and whether they replied. */
export function FollowUpsSent({ cases }: { cases: readonly ManagerCase[] }) {
  return (
    <section aria-label="Follow-ups you sent" className={cn(RAIL_CARD, 'flex flex-col gap-3.5 p-4')}>
      <h2 className={EYEBROW}>Follow-Ups You Sent · {cases.length}</h2>
      {cases.length === 0 ? (
        <p className="text-sm text-muted-foreground">None Waiting On A Reply.</p>
      ) : (
        <ul className="flex flex-col">
          {cases.map(({ booking, summary, recipient, wait, followUp }) => (
            <li
              key={booking.id}
              className="flex flex-col gap-1.5 border-t border-border py-3 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between gap-2">
                <Link to={`/bookings/${booking.id}`} className="min-w-0 truncate underline-offset-4 hover:underline">
                  <span className="font-mono text-[13px] font-medium">{booking.unit}</span>
                  <span className="text-[13px] text-muted-foreground"> · {booking.buyer.name}</span>
                </Link>
                {followUp?.status === 'open' ? (
                  <StatusPill tone="neutral" className="shrink-0">
                    Awaiting Reply
                  </StatusPill>
                ) : (
                  <StatusPill tone="positive" className="shrink-0">
                    Answered
                  </StatusPill>
                )}
              </div>
              <span className="text-[13px] text-muted-foreground">{summary.stallReasons[0] ?? wait.reason}</span>
              {recipient ? (
                <span className="flex items-center gap-1.5 text-[13px]">
                  <span className="text-muted-foreground">To</span>
                  <RoleLabel desk={DESK_OF_PERSONA[recipient.persona]} />
                  <span className="font-medium">{recipient.name}</span>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** The desk holding the most overdue work, as a shortcut to Team. */
export function BusiestDesk({ row }: { row: TeamRow }) {
  return (
    <Link
      to="/team"
      className={cn(
        RAIL_CARD,
        'group flex flex-col gap-2 p-4 outline-none transition-[box-shadow,transform] duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-px hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <span className={EYEBROW}>Busiest Desk</span>
      <span className="flex items-center gap-2">
        <RoleLabel desk={DESK_OF_PERSONA[row.persona]} />
        <span className="font-medium">{row.name}</span>
      </span>
      <span className="text-[13px] text-muted-foreground">
        {row.stalled} Stalled ·{' '}
        <span className="tabular-nums" title={formatRm(row.valueAtRisk)}>
          {formatRmCompact(row.valueAtRisk)}
        </span>{' '}
        At Risk
      </span>
      <span className="flex items-center gap-1 text-[13px] font-medium">
        Open Team
        <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
