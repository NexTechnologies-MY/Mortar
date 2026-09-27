import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  currentCaseAssignee,
  managerSuggestions,
  type Booking,
  type CaseSummary,
  type OwnerRole,
  type WaitingSuggestion
} from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { fetchNextAction, postTask } from '@/lib/api'
import { nextStepFor, stepToTask } from '@/components/case/nextStep'
import { NEXT_ACTION_LABELS } from '@/components/chase/chase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Disclosure } from '@/components/ui/Disclosure'
import { notify } from '@/components/ui/toastConfig'

function ManagerCase({
  booking,
  summary,
  wait,
  onSent
}: {
  booking: Booking
  summary: CaseSummary
  wait?: WaitingSuggestion
  onSent: (id: string) => void
}) {
  const { snapshot, refresh } = useSnapshot()
  const { profile } = usePersona()
  const recipient = currentCaseAssignee(booking, summary)
  const step = nextStepFor(booking, summary, NEXT_ACTION_LABELS).defaultStep
  const ownerRole: OwnerRole =
    recipient?.persona === 'legal-admin' ? 'legal' : recipient?.persona === 'loan-admin' ? 'loan_admin' : 'sales_admin'
  const [saving, setSaving] = useState(false)
  const [asking, setAsking] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const existing = snapshot?.tasks.find(
    (t) =>
      t.bookingId === booking.id &&
      t.status === 'open' &&
      t.ownerName === recipient?.name &&
      t.action === step.action &&
      (t.ownerRole === ownerRole || (ownerRole === 'sales_admin' && t.ownerRole === 'sales'))
  )
  const suggestion = snapshot?.nextActions.find((s) => s.bookingId === booking.id)
  const confidence =
    suggestion &&
    suggestion.meta.source !== 'unavailable' &&
    !suggestion.meta.stale &&
    suggestion.action.value === step.action &&
    Number.isFinite(suggestion.action.confidence) &&
    suggestion.action.confidence >= 0 &&
    suggestion.action.confidence <= 1
      ? Math.round(suggestion.action.confidence * 100)
      : null
  const overdue = wait ? Math.max(0, wait.elapsed - wait.expected) : 0
  const percent = wait ? Math.max(0, Math.round((wait.elapsed / wait.expected - 1) * 100)) : 0
  const create = async () => {
    if (!snapshot || saving || !recipient || existing?.managerFlaggedBy) return
    setSaving(true)
    try {
      await postTask({
        ...stepToTask(step, booking, snapshot.meta.referenceDate, { daysUntilDue: 0 }),
        ownerRole,
        ownerName: recipient.name,
        managerFlaggedBy: profile.name
      })
      onSent(booking.id)
      notify.success(`Follow-up sent to ${recipient.name}.`)
      await refresh()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Could not send the follow-up.')
      await refresh()
    } finally {
      setSaving(false)
    }
  }
  const ask = async () => {
    setAsking(true)
    try {
      await fetchNextAction(booking.id)
      await refresh()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Jev is unavailable.')
    } finally {
      setAsking(false)
    }
  }
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 space-y-1">
            <Link to={`/bookings/${booking.id}`} className="font-medium underline-offset-4 hover:underline">
              {booking.unit} · {booking.buyer.name}
            </Link>
            <p className="text-sm tabular-nums">
              {wait ? `${overdue} ${wait.unit} overdue · ${percent}% overdue` : 'No Overdue Wait'}
              {' · '}
              {confidence !== null ? `Jev: ${confidence}% For This Action` : 'Timing-Based Follow-Up'}
            </p>
          </div>
          {recipient ? (
            <Button
              className="h-auto min-h-9 shrink-0 whitespace-normal sm:max-w-64"
              disabled={saving || !!existing?.managerFlaggedBy}
              onClick={() => void create()}
            >
              {existing?.managerFlaggedBy
                ? `Awaiting ${recipient.name}`
                : saving
                  ? 'Sending…'
                  : `${existing ? 'Flag Task For' : 'Request Follow-Up From'} ${recipient.name}`}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">No Follow-Up Recipient</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'Why This Case'}
        </Button>
        {expanded && (
          <div id={detailsId} className="space-y-2 text-sm text-muted-foreground">
            <p>
              {wait
                ? `${wait.reason}: ${wait.elapsed} ${wait.unit} elapsed; ${wait.expected} expected.`
                : summary.stallReasons.join('. ')}
            </p>
            <p>
              {step.label}
              {recipient ? ` · ${recipient.name}` : '. Check the case assignment before requesting a follow-up.'}
            </p>
            <p>
              {confidence !== null
                ? 'Jev’s percentage is confidence in this action, not the chance of a sale. You decide whether to send it.'
                : 'This follow-up uses confirmed waiting times. No current Jev score supports this action.'}
            </p>
            {existing && (
              <Link className="underline" to={`/bookings/${booking.id}`}>
                Open Task: {existing.title}
              </Link>
            )}
            <Button variant="secondary" size="sm" disabled={asking} onClick={() => void ask()}>
              {asking ? 'Asking Jev…' : 'Ask Jev'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ManagerCases({ suggestionsOnly = false }: { suggestionsOnly?: boolean }) {
  const { snapshot } = useSnapshot()
  const cases = useCases()
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)
  const waits = useMemo(() => (snapshot ? managerSuggestions(snapshot, undefined, 0) : []), [snapshot])
  const waitById = new Map(waits.map((s) => [s.bookingId, s]))
  const shown = cases
    .filter((c) =>
      suggestionsOnly
        ? (waitById.get(c.bookingId)?.elapsed ?? 0) >= (waitById.get(c.bookingId)?.expected ?? Infinity) * 1.5
        : c.stallReasons.length > 0
    )
    .sort(
      (a, b) =>
        waits.findIndex((w) => w.bookingId === a.bookingId) - waits.findIndex((w) => w.bookingId === b.bookingId)
    )
  if (!snapshot) return null
  const awaiting = shown.filter((c) => {
    if (sent.has(c.bookingId)) return false
    const booking = snapshot.bookings.find((b) => b.id === c.bookingId)
    if (!booking) return false
    const recipient = currentCaseAssignee(booking, c)
    const action = nextStepFor(booking, c, NEXT_ACTION_LABELS).defaultStep.action
    return snapshot.tasks.some(
      (t) =>
        t.bookingId === c.bookingId &&
        t.managerFlaggedBy &&
        t.ownerName === recipient?.name &&
        t.action === action &&
        (t.status === 'open' ||
          (t.status === 'done' &&
            t.completedAt &&
            !snapshot.events.some(
              (e) => e.bookingId === c.bookingId && e.status === 'confirmed' && e.recordedAt > t.completedAt!
            )))
    )
  })
  const awaitingIds = new Set(awaiting.map((c) => c.bookingId))
  const decisions = suggestionsOnly ? shown.filter((c) => !awaitingIds.has(c.bookingId)) : shown
  const renderCase = (summary: CaseSummary) => {
    const booking = snapshot.bookings.find((b) => b.id === summary.bookingId)
    return (
      booking && (
        <ManagerCase
          key={booking.id}
          booking={booking}
          summary={summary}
          wait={waitById.get(booking.id)}
          onSent={(id) => setSent((previous) => new Set([...previous, id]))}
        />
      )
    )
  }
  return (
    <div className="space-y-3">
      {decisions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {suggestionsOnly ? 'No New Follow-Ups Needed.' : 'No Bookings Need A Move.'}
        </p>
      ) : (
        (showAll ? decisions : decisions.slice(0, 5)).map(renderCase)
      )}
      {decisions.length > 5 && (
        <Button variant="secondary" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Fewer Cases' : `Show ${decisions.length - 5} More Cases`}
        </Button>
      )}
      {suggestionsOnly && awaiting.length > 0 && (
        <Disclosure title={`Follow-Ups Already Sent (${awaiting.length})`}>{awaiting.map(renderCase)}</Disclosure>
      )}
    </div>
  )
}
