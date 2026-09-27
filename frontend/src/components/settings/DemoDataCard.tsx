/** Seeded examples and the visitor's current records. */
import { useState } from 'react'
import { Info } from 'lucide-react'
import type { Snapshot } from '@mortar/core'
import { notify } from '@/components/ui/toastConfig'
import { formatDate } from '@/components/case'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function InfoTip({ children }: { children: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label={children} className="rounded-sm text-muted-foreground focus-visible:ring-2">
            <Info className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function DemoDataCard({
  snapshot,
  jevAnswers,
  onChange
}: {
  snapshot: Snapshot
  jevAnswers: number | null
  onChange: () => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const hasDemoData = snapshot.meta.seed !== 0

  const run = async (action: 'add' | 'delete') => {
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/demo/${action}`, { method: 'POST' })
      if (!response.ok) {
        const result = (await response.json()) as { error?: string }
        throw new Error(result.error ?? 'Could Not Update Demo Data.')
      }
      notify.success(action === 'add' ? 'Demo Data Added.' : 'Demo Data Deleted.')
      setConfirmDelete(false)
      await onChange()
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could Not Update Demo Data. Try Again.')
    } finally {
      setBusy(false)
    }
  }

  const counts: [string, number | null][] = [
    ['Bookings', snapshot.bookings.length],
    ['Applications', snapshot.applications.length],
    ['Events', snapshot.events.length],
    ['Messages', snapshot.messages.length],
    ['Tasks', snapshot.tasks.length],
    ['Playbooks', snapshot.playbooks.length],
    ['Jev Answers', jevAnswers]
  ]

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Demo Data</CardTitle>
          <StatusPill tone="neutral">Simulated Data</StatusPill>
          <InfoTip>Example bookings and activity for exploring Mortar.</InfoTip>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-4 border-b border-border py-1.5">
            <dt className="text-[13px] text-muted-foreground">Seed</dt>
            <dd className="font-mono text-[13px] tabular-nums">{hasDemoData ? snapshot.meta.seed : '—'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-border py-1.5">
            <dt className="text-[13px] text-muted-foreground">Reference Date</dt>
            <dd className="text-[13px] tabular-nums">{formatDate(snapshot.meta.referenceDate)}</dd>
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
        <div className="mt-auto flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={hasDemoData || busy} onClick={() => void run('add')}>
            Add Demo Data
          </Button>
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm" disabled={!hasDemoData || busy}>
                Delete Demo Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Demo Data?</DialogTitle>
                <DialogDescription>
                  Visitor-created bookings, messages, tasks and updates will be kept.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary" autoFocus>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" variant="destructive" disabled={busy} onClick={() => void run('delete')}>
                  {busy ? 'Deleting…' : 'Delete Demo Data'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
