/**
 * Demo Data card — the simulation's identity (seed, reference date, last
 * reset), record counts across the snapshot, and Reset Demo Data: a
 * destructive action behind a confirm dialog that restores the original
 * dataset for the next demo run.
 */

import { useState } from 'react'
import type { Snapshot } from '@mortar/core'
import { resetDemo } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { formatDate } from '@/components/case'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(value)
  return match ? `${formatDate(match[1])}, ${match[2]}` : formatDate(value)
}

export function DemoDataCard({
  snapshot,
  jevAnswers,
  onReset
}: {
  snapshot: Snapshot
  /** Stored `jev_answers` rows from `/api/health`; `null` while unknown. */
  jevAnswers: number | null
  onReset: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  const counts: [string, number | null][] = [
    ['Bookings', snapshot.bookings.length],
    ['Applications', snapshot.applications.length],
    ['Events', snapshot.events.length],
    ['Messages', snapshot.messages.length],
    ['Tasks', snapshot.tasks.length],
    ['Playbooks', snapshot.playbooks.length],
    // The snapshot only surfaces the latest answer per subject; the stored
    // `jev_answers` total comes from the health route.
    ['Jev Answers', jevAnswers]
  ]

  const runReset = async () => {
    setResetting(true)
    try {
      const meta = await resetDemo()
      notify.success(`Demo data reset to seed ${meta.seed}`)
      setOpen(false)
      await onReset()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Could not reset the demo data')
    } finally {
      setResetting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Demo Data</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          The Simulated Dataset Every Screen Reads. Resetting Restores The Original State For The Next Run.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-4 border-b border-border py-1.5">
            <dt className="text-[13px] text-muted-foreground">Seed</dt>
            <dd className="font-mono text-[13px] tabular-nums">{snapshot.meta.seed}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-border py-1.5">
            <dt className="text-[13px] text-muted-foreground">Reference Date</dt>
            <dd className="text-[13px] tabular-nums">{formatDate(snapshot.meta.referenceDate)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-border py-1.5 sm:col-span-2">
            <dt className="text-[13px] text-muted-foreground">Last Reset</dt>
            <dd className="text-[13px] tabular-nums">{formatDateTime(snapshot.meta.resetAt)}</dd>
          </div>
        </dl>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Records</p>
          <dl className="mt-1 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            {counts.map(([label, n]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border py-1.5">
                <dt className="text-[13px] text-muted-foreground">{label}</dt>
                <dd className="text-[13px] tabular-nums">{n === null ? '—' : n.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive" size="sm" className="w-fit">
              Reset Demo Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Demo Data?</DialogTitle>
              <DialogDescription>
                Restores the original simulated dataset. Every message, event and task added since the last reset is
                discarded.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary" autoFocus>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" variant="destructive" disabled={resetting} onClick={() => void runReset()}>
                {resetting ? 'Resetting…' : 'Reset Demo Data'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
