/**
 * Open tasks grouped by owner for the chase page. Each row links to its
 * booking and completes via `PATCH /api/tasks/:id`. Groups sort by owner role,
 * tasks by due date then title.
 */

import { Link } from 'react-router-dom'
import type { Task } from '@mortar/core'
import { OwnerBadge, formatDate } from '@/components/case'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const ROLE_ORDER = ['sales', 'sales_admin', 'loan_admin', 'legal'] as const

function groupTasks(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>()
  for (const task of tasks) {
    const key = `${task.ownerRole}|${task.ownerName}`
    const list = groups.get(key) ?? []
    list.push(task)
    groups.set(key, list)
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.dueOn.localeCompare(b.dueOn) || a.title.localeCompare(b.title))
  }
  return new Map(
    [...groups.entries()].sort(([a], [b]) => {
      const ra = ROLE_ORDER.indexOf(a.split('|')[0] as (typeof ROLE_ORDER)[number])
      const rb = ROLE_ORDER.indexOf(b.split('|')[0] as (typeof ROLE_ORDER)[number])
      return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb) || a.localeCompare(b)
    })
  )
}

export function ChaseTasks({
  tasks,
  completing,
  onComplete
}: {
  tasks: Task[]
  /** Task ids with a complete request in flight. */
  completing: ReadonlySet<string>
  onComplete: (task: Task) => void
}) {
  const groups = groupTasks(tasks)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...groups.entries()].map(([key, list]) => {
        const [role, name] = key.split('|') as [Task['ownerRole'], string]
        return (
          <Card key={key}>
            <CardContent className="flex flex-col gap-3 p-4">
              <OwnerBadge role={role} name={name} className="w-fit" />
              <ul className="flex flex-col">
                {list.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-[13px] text-muted-foreground">
                        <Link to={`/bookings/${task.bookingId}`} className="font-mono text-xs hover:underline">
                          {task.bookingId}
                        </Link>
                        {' · Due '}
                        {formatDate(task.dueOn)}
                        {task.origin === 'jev' ? ' · Jev' : ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={completing.has(task.id)}
                      onClick={() => onComplete(task)}
                    >
                      {completing.has(task.id) ? 'Completing…' : 'Complete'}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
