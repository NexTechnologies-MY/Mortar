/**
 * The bookings table's last column: is anyone already chasing this booking?
 *
 * - An open task shows as Task Open, with what, when and who on hover.
 * - With none, Add Task raises the task Waiting On proposes (the same one the
 *   case page adds), which then lists under Open Tasks on the Chase List.
 * - A case that waits on nobody (signed, cancelled, lapsed) shows a dash.
 *
 * There is no "Add To Chase List": the Chase List takes every stalled booking
 * by itself, and the red Age figure already marks those rows. A task is the
 * manual way to chase one.
 */

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Booking, CaseSummary, Task } from '@mortar/core'
import { formatDate } from '@/components/case/format'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { notify } from '@/components/ui/toastConfig'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { postTask } from '@/lib/api'
import { waitingOnTask } from './WaitingOn'

export function TaskCell({
  booking,
  summary,
  openTask,
  referenceDate,
  onChanged
}: {
  booking: Booking
  summary: CaseSummary
  /** The open task due soonest, when there is one. */
  openTask: Task | null
  /** The desks' today; a new task falls due from it. */
  referenceDate: string
  onChanged: () => Promise<void>
}) {
  const [adding, setAdding] = useState(false)

  if (openTask) {
    const detail = `${openTask.title} · Due ${formatDate(openTask.dueOn)} · ${openTask.ownerName}`
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* The pill itself stays 22px (DESIGN.md Status Pill anatomy); padding
                on the trigger, not the pill, gets the tap target to 24px+ (issue L10). */}
            <button
              type="button"
              aria-label={`Task Open: ${detail}`}
              className="inline-flex cursor-default rounded-sm p-0.5"
            >
              <StatusPill tone="info">Task Open</StatusPill>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{detail}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const task = waitingOnTask(booking, summary, referenceDate)
  if (!task) return <span className="text-[13px] text-muted-foreground">—</span>

  const add = async () => {
    setAdding(true)
    try {
      await postTask(task)
      notify.success(`Task added for ${booking.id}: ${task.title}`)
      await onChanged()
    } catch {
      notify.error('Could not add the task. Try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={`Add Task For ${booking.id}: ${task.title}`}
      disabled={adding}
      // Quiet on purpose: nearly every row offers it, so the Task Open pill is
      // what the eye should find.
      className="h-7 gap-1 px-2 text-[13px] text-muted-foreground hover:text-foreground"
      // The row opens the case page; this button must not.
      onClick={(e) => {
        e.stopPropagation()
        void add()
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Plus aria-hidden="true" />
      {adding ? 'Adding…' : 'Add Task'}
    </Button>
  )
}
