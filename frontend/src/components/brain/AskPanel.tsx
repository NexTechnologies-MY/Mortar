/**
 * Ask — the panel that answers a set list of questions by counting today's
 * bookings. It calls no model: `askBrain` matches the typed question to a
 * scripted answer that computes its numbers from the same snapshot the screens
 * render, and every booking it names links through to that case.
 *
 * Answers are frozen when asked. Raising a task refreshes the snapshot, and an
 * answer rewriting itself under someone mid-read is worse than a stale one.
 */
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CornerDownLeft } from 'lucide-react'
import type { AskAction, AskReply, Booking, DocumentKind } from '@mortar/core'
import { askBrain, buildAskContext, suggestedQuestions } from '@mortar/core'
import { useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { postTask } from '@/lib/api'
import { addDays, ownerName, taskTitle } from '@/components/chase/chase'
import { notify } from '@/components/ui/toastConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusPill } from '@/components/ui/status-pill'
import { Skeleton } from '@/components/ui/skeleton'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/** One exchange, frozen at the moment it was asked. */
type Turn = { id: number; question: string; reply: AskReply | null }

/** Questions offered before anything is typed, and again after one misses. */
const CHIP_LIMIT = 4

/** Tasks Ask raises fall due in two days: soon, without claiming an urgency it cannot judge. */
const DUE_IN_DAYS = 2

function Mascot({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/ai-mascot-avatar.png"
      alt=""
      aria-hidden="true"
      className="shrink-0 rounded-md bg-white object-cover"
      style={{ width: size, height: size }}
    />
  )
}

export function AskPanel({ onNavigate }: { onNavigate: () => void }) {
  const { snapshot, loading, refresh } = useSnapshot()
  const { persona } = usePersona()
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [acted, setActed] = useState<ReadonlySet<number>>(new Set())
  const [working, setWorking] = useState(false)

  // The forecast inside the context is a Monte Carlo; build it once per snapshot.
  const context = useMemo(() => (snapshot ? buildAskContext(snapshot) : null), [snapshot])
  const chips = useMemo(() => suggestedQuestions(persona).slice(0, CHIP_LIMIT), [persona])

  const ask = useCallback(
    (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || !context) return
      setTurns((prev) => [...prev, { id: prev.length, question: trimmed, reply: askBrain(trimmed, context) }])
      setDraft('')
    },
    [context]
  )

  const runAction = useCallback(
    async (turnId: number, action: AskAction) => {
      if (!snapshot) return
      const bookings = new Map<string, Booking>(snapshot.bookings.map((b) => [b.id, b]))
      // `POST /api/tasks` mints a fresh id every call, so a second click would
      // duplicate. Skip anything already on the list for this action.
      const queued = new Set(
        snapshot.tasks.filter((t) => t.status === 'open' && t.action === action.action).map((t) => t.bookingId)
      )
      const todo = action.bookingIds.filter((id) => !queued.has(id))
      setActed((prev) => new Set(prev).add(turnId))
      if (todo.length === 0) {
        notify.info('Those are already on the chase list.')
        return
      }
      setWorking(true)
      let done = 0
      // One at a time: the server re-derives every case per write, and a
      // sequential run can report exactly how far it got.
      for (const bookingId of todo) {
        const booking = bookings.get(bookingId)
        if (!booking) continue
        const document: DocumentKind | undefined = context?.cases.find((c) => c.bookingId === bookingId)
          ?.outstandingDocuments[0]
        try {
          await postTask({
            bookingId,
            action: action.action,
            title: taskTitle(action.action, booking, document),
            ownerRole: action.ownerRole,
            ownerName: ownerName(action.ownerRole, booking),
            dueOn: addDays(snapshot.meta.referenceDate, DUE_IN_DAYS),
            // `origin` records who proposed the task, not which service ran.
            // Jev's panel proposed this one and a person accepted it, the same
            // shape as a chase card. That no model was consulted is said where
            // it belongs, on the answer itself.
            origin: 'jev'
          })
          done += 1
        } catch {
          // Counted below: one failure must not abandon the rest.
        }
      }
      setWorking(false)
      if (done === todo.length) notify.success(`${done} added to the chase list.`)
      else if (done > 0) notify.warning(`${done} of ${todo.length} added. Try the rest again.`)
      else notify.error('Could not add those to the chase list.')
      if (done > 0) await refresh()
    },
    [snapshot, context, refresh]
  )

  const lastMissed = turns.length > 0 && !turns[turns.length - 1].reply

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <Mascot />
          <div className="min-w-0">
            <DialogTitle>Ask Jev</DialogTitle>
            <DialogDescription>
              Answers a set list of questions by counting today&apos;s bookings. It does not write new answers.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {loading && !snapshot ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="flex max-h-[50vh] flex-col gap-5 overflow-y-auto">
          {turns.map((turn) => (
            <div key={turn.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">{turn.question}</p>
              <div className="flex gap-3">
                <Mascot size={28} />
                <div className="flex min-w-0 flex-col items-start gap-2">
                  {turn.reply ? (
                    <>
                      <p className="text-sm leading-6 text-muted-foreground">{turn.reply.text}</p>
                      {turn.reply.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {turn.reply.citations.map((id) => (
                            <Link
                              key={id}
                              to={`/bookings/${id}`}
                              onClick={onNavigate}
                              className="rounded-sm border border-border px-2 py-0.5 font-mono text-xs text-foreground no-underline transition-colors hover:bg-accent"
                            >
                              {id}
                            </Link>
                          ))}
                        </div>
                      )}
                      <StatusPill tone="neutral">Counted From Your Bookings</StatusPill>
                      {turn.reply.action && !acted.has(turn.id) && (
                        <Button
                          type="button"
                          disabled={working}
                          onClick={() => {
                            const action = turn.reply?.action
                            if (action) void runAction(turn.id, action)
                          }}
                        >
                          {working ? 'Adding…' : turn.reply.action.label}
                        </Button>
                      )}
                      {turn.reply.action && acted.has(turn.id) && (
                        <StatusPill tone="positive">On The Chase List</StatusPill>
                      )}
                    </>
                  ) : (
                    <p className="text-sm leading-6 text-muted-foreground">
                      I cannot answer that one yet. Here is what I can answer.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(turns.length === 0 || lastMissed) && (
            <div className="flex flex-wrap gap-2">
              {chips.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => ask(q.question)}
                  className="rounded-sm border border-border px-2.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {q.question}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          ask(draft)
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your bookings"
          aria-label="Ask about your bookings"
          disabled={!context}
        />
        <Button type="submit" disabled={!context || draft.trim().length === 0}>
          <CornerDownLeft className="h-4 w-4" />
          Ask
        </Button>
      </form>
    </>
  )
}
