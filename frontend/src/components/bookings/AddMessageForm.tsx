/**
 * Add Message form — paste a new message onto the case (sender role, name,
 * when it was sent, body). Posting runs Jev live-first; the reply panel shows
 * the extraction, its source tag and latency before the snapshot refreshes.
 *
 * Sent At is when the message was sent, not when it was pasted in: Jev reads
 * the buyer's reply speed from the gaps between messages, and a proposal it
 * makes is dated from it. It defaults to now (the desks' today, at the current
 * Malaysia time); left untouched, it is read afresh when the message is added.
 */

import { useState } from 'react'
import { simNow, type Booking, type CaseEvent, type Extraction, type Message, type SenderRole } from '@mortar/core'
import { JevTag } from '@/components/case/JevTag'
import { DOCUMENT_LABELS, EXTRACTED_EVENT_LABELS, SENDER_ROLE_LABELS } from './labels'
import { DateField } from './DateField'
import { ApiError, postMessage } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ROLES: SenderRole[] = ['buyer', 'banker', 'solicitor', 'sales_agent']

/** `9:05` or `09:05`, on the 24-hour clock. */
const TIME = /^([01]?\d|2[0-3]):([0-5]\d)$/

function defaultName(role: SenderRole, booking: Booking, banker?: string): string {
  if (role === 'buyer') return booking.buyer.name
  if (role === 'banker') return banker ?? ''
  if (role === 'solicitor') return booking.legalFirm
  return booking.salesOwner
}

/** The current Malaysia time as `HH:MM`, on the desks' today. */
function timeNow(referenceDate: string): string {
  return simNow(referenceDate).slice(11, 16)
}

/** `9:05` → `09:05`; `null` when the text is not a time. */
function normalTime(text: string): string | null {
  const match = TIME.exec(text.trim())
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null
}

export function AddMessageForm({
  booking,
  banker,
  referenceDate,
  onAdded
}: {
  booking: Booking
  /** The latest application's banker, used to prefill the sender name. */
  banker?: string
  /** The desks' today: Sent At defaults to it and cannot run past it. */
  referenceDate: string
  onAdded: () => Promise<void>
}) {
  const [role, setRole] = useState<SenderRole>('buyer')
  const [name, setName] = useState(() => booking.buyer.name)
  const [body, setBody] = useState('')
  const [sentOn, setSentOn] = useState(referenceDate)
  const [sentTime, setSentTime] = useState(() => timeNow(referenceDate))
  /** Whether the reader changed Sent At; until then it follows the clock. */
  const [sentAtChosen, setSentAtChosen] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ message: Message; extraction: Extraction; event: CaseEvent | null } | null>(
    null
  )

  const time = normalTime(sentTime)

  const submit = async () => {
    if (!name.trim() || !body.trim()) return
    let day = sentOn
    let at = time
    if (!sentAtChosen) {
      // Untouched, Sent At means now: read the clock at the moment of adding.
      day = referenceDate
      at = timeNow(referenceDate)
      setSentOn(day)
      setSentTime(at)
    }
    if (at === null) {
      setTimeError('Enter The Time As HH:MM, For Example 09:30.')
      return
    }
    if (day === referenceDate && at > timeNow(referenceDate)) {
      setTimeError('That Time Has Not Come Yet Today.')
      return
    }
    setTimeError(null)
    setPending(true)
    try {
      const posted = await postMessage({
        bookingId: booking.id,
        senderRole: role,
        senderName: name,
        body,
        sentAt: `${day}T${at}:00+08:00`
      })
      setResult(posted)
      setBody('')
      setSentOn(referenceDate)
      setSentTime(timeNow(referenceDate))
      setSentAtChosen(false)
      const ms = posted.extraction.meta.latencyMs
      notify.success(ms != null ? `Message added — Jev answered live in ${ms.toLocaleString()} ms.` : 'Message added.')
      await onAdded()
    } catch (e) {
      // The server's own words for a refusal it wants read (4xx); a plain sentence
      // for anything else, never a raw status or technical wording (DESIGN.md).
      notify.error(e instanceof ApiError ? e.message : 'The Message Could Not Be Added. Try Again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Add Message</h3>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-message-role">Sender Role</Label>
          <Select
            value={role}
            onValueChange={(next) => {
              const senderRole = next as SenderRole
              setRole(senderRole)
              setName(defaultName(senderRole, booking, banker))
            }}
          >
            <SelectTrigger id="add-message-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {SENDER_ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-message-name">Sender Name</Label>
          <Input id="add-message-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[180px_120px]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-message-sent-on">Sent At</Label>
          <DateField
            id="add-message-sent-on"
            label="Sent At"
            value={sentOn}
            onChange={(next) => {
              setSentOn(next)
              setSentAtChosen(true)
              setTimeError(null)
            }}
            min={booking.bookingDate}
            max={referenceDate}
            today={referenceDate}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-message-sent-time">Time</Label>
          <Input
            id="add-message-sent-time"
            value={sentTime}
            onChange={(e) => {
              setSentTime(e.target.value)
              setSentAtChosen(true)
              setTimeError(null)
            }}
            inputMode="numeric"
            autoComplete="off"
            maxLength={5}
            placeholder="HH:MM"
            aria-invalid={timeError !== null || (sentAtChosen && time === null) || undefined}
            aria-describedby={timeError ? 'add-message-sent-error' : undefined}
            className="tabular-nums"
          />
        </div>
        {timeError && (
          <p id="add-message-sent-error" className="text-[13px] text-status-danger-fg sm:col-span-2">
            {timeError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-message-body">Message</Label>
        <textarea
          id="add-message-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Paste the buyer, banker or solicitor message here."
          className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm transition-colors duration-[var(--motion-fast)] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={pending || !name.trim() || !body.trim()}
          onClick={() => void submit()}
        >
          {pending ? 'Sending…' : 'Add Message'}
        </Button>
        {result && (
          <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            <JevTag meta={result.extraction.meta} />
            <span>
              {EXTRACTED_EVENT_LABELS[result.extraction.event.value]}
              {result.extraction.document.value !== 'none'
                ? ` · ${DOCUMENT_LABELS[result.extraction.document.value]}`
                : ''}
              {result.event ? ' — Review The Proposal Above.' : ''}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
