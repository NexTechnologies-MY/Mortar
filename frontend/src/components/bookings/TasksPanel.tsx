/**
 * Tasks panel — the case's open and completed follow-up tasks, each with its
 * owner, due date and origin. Open tasks complete in place.
 */

import { useState } from 'react'
import type { Task } from '@mortar/core'
import { OwnerBadge } from '@/components/case/OwnerBadge'
import { formatDate } from '@/components/case/format'
import { NEXT_ACTION_LABELS } from './labels'
import { ApiError, updateTask } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function TasksPanel({ tasks, onChanged }: { tasks: Task[]; onChanged: () => Promise<void> }) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const ordered = [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1
    return a.dueOn.localeCompare(b.dueOn) || a.id.localeCompare(b.id)
  })

  const complete = async (task: Task) => {
    setPendingId(task.id)
    try {
      await updateTask(task.id, 'done')
      notify.success('Task completed.')
      await onChanged()
    } catch (e) {
      // The server's own words for a refusal it wants read (4xx); a plain sentence
      // for anything else, never a raw status or technical wording (DESIGN.md).
      notify.error(e instanceof ApiError ? e.message : 'The Task Could Not Be Updated. Try Again.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Tasks</h2>
        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Tasks Yet.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {ordered.map((task) => (
              <li key={task.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      task.status !== 'open' && 'text-muted-foreground line-through'
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <OwnerBadge role={task.ownerRole} name={task.ownerName} />
                    <Badge variant="secondary">{NEXT_ACTION_LABELS[task.action]}</Badge>
                    <Badge variant="outline">{task.origin === 'jev' ? 'Jev' : 'Staff'}</Badge>
                    <span className="text-[13px] text-muted-foreground">Due {formatDate(task.dueOn)}</span>
                  </div>
                </div>
                {task.status === 'open' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    disabled={pendingId === task.id}
                    onClick={() => void complete(task)}
                  >
                    Complete
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
