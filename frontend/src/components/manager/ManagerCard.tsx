/**
 * Manager card — one overdue case in the Manager's Decisions For You, drawn as
 * a Today card: unit and buyer, how far past its expected wait it is, the
 * blocker in plain words, one meta line, who it is waiting on, then Open Case
 * and Request Follow-Up. No percentages and no Jev scores: the blocker sentence
 * says why the case is here.
 *
 * Request Follow-Up raises the next step as a task for the person holding the
 * case, flagged as the Manager's; the server reuses an equivalent open task
 * rather than adding a second one.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, type LucideIcon } from 'lucide-react'
import { STAGE_LABELS, formatDaysLong, formatRm } from '@/components/case'
import { stepToTask } from '@/components/case/nextStep'
import { blockerIcon } from '@/components/chase/chase'
import { DESK_OF_PERSONA, RoleLabel } from '@/components/people/RoleLabel'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { notify } from '@/components/ui/toastConfig'
import { postTask } from '@/lib/api'
import { overdueBy, type ManagerCase } from './managerQueue'

/** Renders a glyph handed in as a prop, so the icon is never created inside the card's render. */
function Glyph({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
}

export function ManagerCard({
  item,
  referenceDate,
  managerName,
  onSent,
  tourTarget
}: {
  item: ManagerCase
  referenceDate: string
  managerName: string
  /** Called once the follow-up is saved, to refresh the queue. */
  onSent: () => Promise<void> | void
  tourTarget?: string
}) {
  const { booking, summary, wait, recipient, ownerRole, step } = item
  const [saving, setSaving] = useState(false)

  const send = async () => {
    if (!recipient || saving) return
    setSaving(true)
    try {
      await postTask({
        ...stepToTask(step, booking, referenceDate, { daysUntilDue: 0 }),
        ownerRole,
        ownerName: recipient.name,
        managerFlaggedBy: managerName
      })
      notify.success(`Follow-up sent to ${recipient.name}.`)
      await onSent()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Could not send the follow-up.')
      await onSent()
    } finally {
      setSaving(false)
    }
  }

  return (
    <article
      data-testid={`manager-card-${booking.id}`}
      data-tour={tourTarget}
      className="flex flex-col gap-3 rounded-md border border-card-border bg-card p-4 shadow-card transition-[box-shadow,transform] duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-px hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="block font-mono text-[13px] font-medium text-foreground">{booking.unit}</span>
          <span className="block truncate text-[13px] text-muted-foreground">
            {booking.id} · {booking.buyer.name}
          </span>
        </div>
        <StatusPill tone="danger" className="shrink-0">
          Overdue {overdueBy(wait)} d
        </StatusPill>
      </div>

      <p className="flex items-start gap-2 text-base font-semibold tracking-[-0.01em] text-foreground">
        <Glyph icon={blockerIcon(summary.stallReasons, step.document)} />
        <span>{summary.stallReasons.length > 0 ? summary.stallReasons.join(' · ') : wait.reason}</span>
      </p>

      <p className="text-[13px] text-muted-foreground">
        {STAGE_LABELS[summary.stage]} · Last Update {formatDaysLong(summary.daysSinceEvidence)} Ago ·{' '}
        <span className="tabular-nums">{formatRm(booking.priceRm)}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-muted-foreground">Waiting On</span>
        {recipient ? (
          <>
            <RoleLabel desk={DESK_OF_PERSONA[recipient.persona]} />
            <span className="font-medium text-foreground">{recipient.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">No One On The Team</span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <Button asChild variant="ghost" size="sm" className="-ml-1.5 px-1.5">
          <Link to={`/bookings/${booking.id}`}>Open Case</Link>
        </Button>
        {recipient ? (
          <Button type="button" size="sm" disabled={saving} onClick={() => void send()}>
            <Send aria-hidden="true" />
            {saving ? 'Sending…' : 'Request Follow-Up'}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
