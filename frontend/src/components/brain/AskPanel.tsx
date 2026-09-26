/**
 * Ask Mortar — the panel that answers a question about today's bookings, from
 * any app screen. The server runs a model grounded in Mortar's own data: it
 * asks for facts through read-only tools, never writes, and cites every booking
 * it names. When no model is configured, or a call fails, the panel falls back
 * to the scripted `askBrain` answers, which count the same snapshot.
 *
 * Answers are frozen when asked. Raising a task refreshes the snapshot, and an
 * answer rewriting itself under someone mid-read is worse than a stale one.
 */
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CornerDownLeft, Paperclip, X } from 'lucide-react'
import type { AskAction, AskReply, Booking, DocumentKind } from '@mortar/core'
import { askBrain, buildAskContext, suggestedQuestions } from '@mortar/core'
import { useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { askAssistant, postTask, type AssistantImage } from '@/lib/api'
import { addDays, ownerName, taskTitle } from '@/components/chase/chase'
import { notify } from '@/components/ui/toastConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusPill } from '@/components/ui/status-pill'
import { Skeleton } from '@/components/ui/skeleton'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/** One exchange, frozen at the moment it was asked. */
type Turn = {
  id: number
  question: string
  /** The model answered, with the bookings it named. */
  answer: { text: string; citations: string[] } | null
  /** A scripted answer, used when the model could not be reached. */
  reply: AskReply | null
  /** Which of the two answered, so the panel says where the words came from. */
  source: 'assistant' | 'scripted'
}

/** Questions offered before anything is typed, and again after one misses. */
const CHIP_LIMIT = 4

/** Tasks Ask raises fall due in two days: soon, without claiming an urgency it cannot judge. */
const DUE_IN_DAYS = 2

/** A photographed bank letter. Matched on the declared type and re-checked against the bytes. */
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const ACCEPT = 'image/png,image/jpeg,image/webp'

function readableSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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

/** The BK ids inside an answer, each already a link to its case. */
function Citations({ ids, onNavigate }: { ids: string[]; onNavigate: () => void }) {
  if (ids.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
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
  )
}

export function AskPanel({ onNavigate, bookingId }: { onNavigate: () => void; bookingId?: string }) {
  const { snapshot, loading, refresh } = useSnapshot()
  const { persona } = usePersona()
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [acted, setActed] = useState<ReadonlySet<number>>(new Set())
  const [working, setWorking] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [image, setImage] = useState<{ name: string; preview: string; data: AssistantImage } | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // The forecast inside the context is a Monte Carlo; build it once per snapshot.
  const context = useMemo(() => (snapshot ? buildAskContext(snapshot) : null), [snapshot])
  const chips = useMemo(() => suggestedQuestions(persona).slice(0, CHIP_LIMIT), [persona])

  const attach = useCallback((file: File | null) => {
    if (!file) return
    const mime = IMAGE_TYPES.find((type) => type === file.type)
    if (!mime) {
      setImageError('That File Is Not An Image. Attach A Photo Or A Scan.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(`That Image Is ${readableSize(file.size)}. The Limit Is 4 MB.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const data = String(reader.result ?? '').split(',')[1] ?? ''
      if (data.length === 0) {
        setImageError('That Image Could Not Be Read. Try Another One.')
        return
      }
      setImageError(null)
      // The data URL the reader already produced previews the image, so nothing
      // is held in an object URL that has to be revoked.
      setImage({ name: file.name, preview: reader.result as string, data: { mimeType: mime, data } })
    }
    reader.onerror = () => setImageError('That Image Could Not Be Read. Try Another One.')
    reader.readAsDataURL(file)
  }, [])

  const dropImage = useCallback(() => {
    setImage(null)
    setImageError(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || !context || thinking) return
      setDraft('')
      const turnId = turns.length
      setThinking(true)
      // The model reads the last few exchanges, so "what about the other one?"
      // still knows which one. Answers are the only text carried back; the
      // question is already in the transcript the server can see.
      const history = turns
        .slice(-6)
        .map((t) => ({ question: t.question, answer: t.answer?.text ?? t.reply?.text ?? '' }))
      let turn: Turn
      try {
        const result = await askAssistant({
          question: trimmed,
          persona,
          ...(bookingId ? { bookingId } : {}),
          history,
          ...(image ? { image: image.data } : {})
        })
        turn = {
          id: turnId,
          question: trimmed,
          answer: { text: result.answer, citations: result.citations },
          reply: null,
          source: 'assistant'
        }
      } catch {
        // No model key, a model that could not answer, or a dropped request.
        // The scripted answers count the same snapshot, so the panel still
        // says something true.
        const reply = askBrain(trimmed, context)
        turn = { id: turnId, question: trimmed, answer: null, reply, source: 'scripted' }
      }
      setTurns((prev) => [...prev, turn])
      setThinking(false)
      if (image) dropImage()
    },
    [context, thinking, turns, persona, bookingId, image, dropImage]
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
        notify.info("Those Are Already On Today's List.")
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
            // `origin` records who proposed the task, and only a scripted
            // answer offers one: a task the panel raises from it is Jev's, in
            // the same shape as a chase card's. A model answer suggests a next
            // step in words, and a person acts on it themselves.
            origin: 'jev'
          })
          done += 1
        } catch {
          // Counted below: one failure must not abandon the rest.
        }
      }
      setWorking(false)
      if (done === todo.length) notify.success(`${done} Added To Today.`)
      else if (done > 0) notify.warning(`${done} of ${todo.length} Added. Try The Rest Again.`)
      else notify.error('Could Not Add Those To Today.')
      if (done > 0) await refresh()
    },
    [snapshot, context, refresh]
  )

  const lastMissed = turns.length > 0 && !turns[turns.length - 1].answer && !turns[turns.length - 1].reply

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <Mascot />
          <div className="min-w-0">
            <DialogTitle>Ask Mortar</DialogTitle>
            <DialogDescription>
              Answers from Mortar&apos;s own bookings, on the desk you are working. It does not change anything.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {loading && !snapshot ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="flex max-h-[50vh] flex-col gap-5 overflow-y-auto">
          {turns.map((turn) => {
            const text = turn.answer?.text ?? turn.reply?.text
            const citations = turn.answer?.citations ?? turn.reply?.citations ?? []
            return (
              <div key={turn.id} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">{turn.question}</p>
                <div className="flex gap-3">
                  <Mascot size={28} />
                  <div className="flex min-w-0 flex-col items-start gap-2">
                    {text ? (
                      <>
                        <p className="text-sm leading-6 text-muted-foreground">{text}</p>
                        <Citations ids={citations} onNavigate={onNavigate} />
                        {turn.source === 'scripted' ? (
                          <StatusPill tone="neutral">Counted From Your Bookings</StatusPill>
                        ) : (
                          <StatusPill tone="neutral">From Mortar&apos;s Data</StatusPill>
                        )}
                        {turn.reply?.action && !acted.has(turn.id) && (
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
                        {turn.reply?.action && acted.has(turn.id) && (
                          <StatusPill tone="positive">On Today&apos;s List</StatusPill>
                        )}
                      </>
                    ) : (
                      <p className="text-sm leading-6 text-muted-foreground">
                        Mortar&apos;s bookings do not hold the answer to that. Here is what it can answer.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {thinking && (
            <div className="flex gap-3">
              <Mascot size={28} />
              <Skeleton className="h-6 w-48" />
            </div>
          )}

          {(turns.length === 0 || lastMissed) && !thinking && (
            <div className="flex flex-wrap gap-2">
              {chips.map((q) => (
                <Button
                  key={q.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void ask(q.question)}
                  className="h-auto max-w-full justify-start whitespace-normal py-1.5 text-left text-xs font-normal text-muted-foreground hover:text-foreground"
                >
                  {q.question}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void ask(draft)
        }}
      >
        {image && (
          <div className="flex items-center gap-3 rounded-md border border-border p-2">
            <img src={image.preview} alt="" className="size-10 shrink-0 rounded-sm object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{image.name}</p>
              <p className="text-[13px] text-muted-foreground">Ready To Send With The Next Question</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={dropImage} aria-label={`Remove ${image.name}`}>
              <X aria-hidden="true" />
              Remove
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={!context}
            aria-label="Attach A Photo Or A Scan"
          >
            <Paperclip aria-hidden="true" />
            Attach
          </Button>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about your bookings"
            aria-label="Ask about your bookings"
            disabled={!context}
          />
          <Button type="submit" disabled={!context || thinking || draft.trim().length === 0}>
            <CornerDownLeft className="h-4 w-4" />
            Ask
          </Button>
        </div>
        {/* The browser cannot open a file picker without one; it is the mechanism
            the Attach button triggers, never a control in its own right. */}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => attach(e.target.files?.[0] ?? null)}
        />

        {imageError && <p className="text-[13px] text-status-danger-fg">{imageError}</p>}
        <p className="text-[13px] text-muted-foreground">Answers Come From Mortar&apos;s Data. Check Before Acting.</p>
      </form>
    </>
  )
}
