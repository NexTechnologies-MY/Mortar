/**
 * Waiting On — who holds the ball on a case and the move that unblocks it,
 * from `ballInCourt` in `@mortar/core`. Three pieces share it:
 *
 * - `WaitingOnCell`: the ledger cell. Plain text while the case is moving; a
 *   danger pill with the days since the last update once a stall rule fires
 *   (DESIGN.md Chip economy). Opens the quick view, not the case page.
 * - `CaseJourney`: the five milestones with the one being waited on marked.
 * - `WaitingOnPanel`: holder, what they owe, why it is stuck, the next move and
 *   who on the developer's side makes it, with one button to put it on the
 *   task list. The quick view and the case page both show it.
 */

import { useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { Plus } from 'lucide-react'
import { ballInCourt, type BallInCourt, type Booking, type CaseSummary, type EventKind } from '@mortar/core'
import { BALL_HOLDER_ICONS, BALL_HOLDER_LABELS, MOVE_OWNER } from '@/components/case/ball'
import { OwnerBadge } from '@/components/case/OwnerBadge'
import { formatDaysLong } from '@/components/case/format'
import { NEXT_ACTION_ICONS, NEXT_ACTION_LABELS, addDays, ownerName, taskTitle } from '@/components/chase/chase'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { notify } from '@/components/ui/toastConfig'
import { postTask } from '@/lib/api'
import { cn } from '@/lib/utils'
import { SEGMENTS, STAGE_PROGRESS, progressFromKinds } from './StageTracker'

export function WaitingOnCell({
  ball,
  daysSinceEvidence,
  unit,
  onInspect
}: {
  ball: BallInCourt
  daysSinceEvidence: number
  unit: string
  /** Opens the quick view; without it the cell is plain content. */
  onInspect?: () => void
}) {
  if (ball.holder === null) return <span className="text-[13px] text-muted-foreground">—</span>
  const label = BALL_HOLDER_LABELS[ball.holder]
  const Icon = BALL_HOLDER_ICONS[ball.holder]
  const content = ball.stalled ? (
    <StatusPill tone="danger" className="tabular-nums">
      {label} · {daysSinceEvidence} d
    </StatusPill>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </span>
  )
  if (!onInspect) return content
  // The row itself opens the case page; this cell opens the quick view instead.
  const open = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
    onInspect()
  }
  return (
    <button
      type="button"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open(e)
        }
      }}
      aria-label={`Quick View ${unit}: Waiting On ${label}${ball.stalled ? `, No Update For ${formatDaysLong(daysSinceEvidence)}` : ''}`}
      className="-mx-1 inline-flex items-center rounded-sm px-1 py-0.5 transition-colors duration-[var(--motion-fast)] hover:bg-accent"
    >
      {content}
    </button>
  )
}

export function CaseJourney({
  summary,
  confirmedKinds,
  stalled
}: {
  summary: CaseSummary
  confirmedKinds: ReadonlySet<EventKind>
  stalled: boolean
}) {
  const progress = confirmedKinds.size > 0 ? progressFromKinds(confirmedKinds) : STAGE_PROGRESS[summary.stage]
  const closed = summary.stage === 'cancelled' || summary.stage === 'lapsed'
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Case Journey">
      {SEGMENTS.map((label, i) => {
        const done = i < progress
        const current = !closed && i === progress
        const state = done ? 'Done' : current ? (stalled ? 'Stuck' : 'Next') : 'To Come'
        return (
          <li key={label} className="flex flex-col gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                'h-1 rounded-full',
                // The next step is info-blue, so it never reads as one more done step.
                done ? 'bg-inverse' : current ? (stalled ? 'bg-status-danger' : 'bg-status-info') : 'bg-input'
              )}
            />
            <span
              className={cn(
                'text-[11px] font-medium leading-tight',
                done
                  ? 'text-foreground'
                  : current
                    ? stalled
                      ? 'text-status-danger-fg'
                      : 'text-status-info-fg'
                    : 'text-muted-foreground'
              )}
            >
              {label}
              <span className="sr-only">: {state}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * The task Waiting On proposes: its next move, owned by whoever on the
 * developer's side makes it, due today once the case is stuck and in two days
 * otherwise. `null` when the case waits on nobody. The panel and the bookings
 * table's Add Task both raise exactly this task.
 */
export function waitingOnTask(booking: Booking, summary: CaseSummary, referenceDate: string) {
  const ball = ballInCourt(summary)
  if (ball.holder === null || ball.nextMove === null) return null
  const ownerRole = MOVE_OWNER[ball.nextMove]
  return {
    bookingId: booking.id,
    action: ball.nextMove,
    title: taskTitle(ball.nextMove, booking, summary.outstandingDocuments[0]),
    ownerRole,
    ownerName: ownerName(ownerRole, booking),
    dueOn: addDays(referenceDate, ball.stalled ? 0 : 2),
    origin: 'staff' as const
  }
}

export function WaitingOnPanel({
  booking,
  summary,
  referenceDate,
  onChanged,
  wide = false,
  className
}: {
  booking: Booking
  summary: CaseSummary
  /** The desks' today; a new task falls due from it. */
  referenceDate: string
  onChanged: () => Promise<void>
  /** Sets the next move beside the holder on large screens, for the case page banner. */
  wide?: boolean
  className?: string
}) {
  const ball = ballInCourt(summary)
  const task = waitingOnTask(booking, summary, referenceDate)
  const [adding, setAdding] = useState(false)
  // Keyed on the task itself, not a plain flag: the panel is keyed by booking
  // id, so recording an update that changes the next move must re-enable Add
  // Task rather than leaving it stuck on "Task Added" for a task that no
  // longer matches what is on screen.
  const [addedTaskKey, setAddedTaskKey] = useState<string | null>(null)

  if (ball.holder === null || ball.nextMove === null || task === null) {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Waiting On</h2>
        <p className="text-sm text-muted-foreground">{ball.waitingFor}.</p>
      </div>
    )
  }

  const HolderIcon = BALL_HOLDER_ICONS[ball.holder]
  const MoveIcon = NEXT_ACTION_ICONS[ball.nextMove]
  const move = ball.nextMove
  const ownerRole = task.ownerRole
  const owner = task.ownerName
  const taskKey = `${task.action}:${task.title}`
  const added = addedTaskKey === taskKey

  const addTask = async () => {
    setAdding(true)
    try {
      await postTask(task)
      setAddedTaskKey(taskKey)
      notify.success(`Task added for ${owner}.`)
      await onChanged()
    } catch {
      notify.error('Could not add the task. Try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className={cn(wide ? 'grid grid-cols-1 gap-4 lg:grid-cols-2' : 'flex flex-col gap-3', className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Waiting On</h2>
          <p className="flex items-center gap-2 text-base font-semibold">
            <HolderIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            {BALL_HOLDER_LABELS[ball.holder]}
          </p>
          <p className="text-sm text-muted-foreground">Waiting For {ball.waitingFor}.</p>
        </div>
        {ball.stalled ? (
          <div className="flex flex-wrap gap-1.5">
            {summary.stallReasons.map((reason) => (
              <StatusPill key={reason} tone="danger">
                {reason}
              </StatusPill>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground">
            {summary.daysSinceEvidence === 0
              ? 'Updated Today. Nothing Is Stuck.'
              : `Last Update ${formatDaysLong(summary.daysSinceEvidence)} Ago. Nothing Is Stuck Yet.`}
          </p>
        )}
      </div>
      <div
        className={cn(
          'flex flex-col gap-2 border-t border-border pt-3',
          wide && 'lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0'
        )}
      >
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Next Move</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <MoveIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            {NEXT_ACTION_LABELS[move]}
          </span>
          <OwnerBadge role={ownerRole} name={owner} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" onClick={() => void addTask()} disabled={adding || added}>
            <Plus aria-hidden="true" />
            {added ? 'Task Added' : adding ? 'Adding…' : 'Add Task'}
          </Button>
          {summary.openTasks > 0 && !added ? (
            <span className="text-[13px] text-muted-foreground">
              {summary.openTasks} Open {summary.openTasks === 1 ? 'Task' : 'Tasks'} On This Case
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
