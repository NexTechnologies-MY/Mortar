/**
 * Add Message form — paste a new message onto the case (sender role, name,
 * body). Posting runs Jev live-first; the reply panel shows the extraction,
 * its source tag and latency before the snapshot refreshes.
 */

import { useState } from 'react'
import type { Booking, CaseEvent, Extraction, Message, SenderRole } from '@mortar/core'
import { JevTag } from '@/components/case/JevTag'
import { DOCUMENT_LABELS, EXTRACTED_EVENT_LABELS, SENDER_ROLE_LABELS } from './labels'
import { postMessage } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ROLES: SenderRole[] = ['buyer', 'banker', 'solicitor', 'sales_agent']

function defaultName(role: SenderRole, booking: Booking, banker?: string): string {
  if (role === 'buyer') return booking.buyer.name
  if (role === 'banker') return banker ?? ''
  if (role === 'solicitor') return booking.legalFirm
  return booking.salesOwner
}

export function AddMessageForm({
  booking,
  banker,
  onAdded
}: {
  booking: Booking
  /** The latest application's banker, used to prefill the sender name. */
  banker?: string
  onAdded: () => Promise<void>
}) {
  const [role, setRole] = useState<SenderRole>('buyer')
  const [name, setName] = useState(() => booking.buyer.name)
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ message: Message; extraction: Extraction; event: CaseEvent | null } | null>(
    null
  )

  const submit = async () => {
    if (!name.trim() || !body.trim()) return
    setPending(true)
    try {
      const posted = await postMessage({ bookingId: booking.id, senderRole: role, senderName: name, body })
      setResult(posted)
      setBody('')
      const ms = posted.extraction.meta.latencyMs
      notify.success(ms != null ? `Message added — Jev answered live in ${ms.toLocaleString()} ms.` : 'Message added.')
      await onAdded()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'The message could not be added.')
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
