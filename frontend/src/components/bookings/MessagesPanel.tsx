/**
 * Messages panel — the case's message log, each message with Jev's proposal:
 * the extracted event, document and owner with probability, confidence and
 * the Needs Review marker under the 0.6 threshold, the JevTag source line,
 * and Confirm, Dispute and Dismiss actions on the pending proposal event.
 * A `no_update` read collapses to one muted line; the full panel is reserved
 * for proposals that need a decision. Re-Run Jev re-extracts any message
 * live and supersedes the old proposal.
 */

import { useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { CaseEvent, EventKind, Extraction, ExtractedEvent, Message } from '@mortar/core'
import { JEV_REVIEW_THRESHOLD } from '@mortar/core'
import { JevTag } from '@/components/case/JevTag'
import { ProbabilityBar } from '@/components/case/ProbabilityBar'
import { EvidencePill } from '@/components/case/EvidencePill'
import { formatPercent } from '@/components/case/format'
import { DOCUMENT_LABELS, EXTRACTED_EVENT_LABELS, SENDER_ROLE_LABELS, formatDateTime } from './labels'
import { OWNER_ROLE_LABELS } from '@/components/case/OwnerBadge'
import { extractMessage, reviewEvent } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'

type Decision = 'confirm' | 'dispute' | 'dismiss'

const DECISION_TOASTS: Record<Decision, string> = {
  confirm: 'Proposal confirmed.',
  dispute: 'Proposal marked as disputed.',
  dismiss: 'Proposal dismissed.'
}

/** The event kind an extraction records, mirroring `proposalFromExtraction`; `no_update` records nothing. */
const EXTRACTED_EVENT_KIND: Partial<Record<ExtractedEvent, EventKind>> = {
  loan_approved: 'loan_approved',
  loan_rejected: 'loan_rejected',
  documents_requested: 'documents_requested',
  documents_received: 'documents_received',
  valuation_shortfall: 'valuation_shortfall',
  buyer_hesitant: 'buyer_hesitant',
  buyer_withdrawing: 'buyer_withdrew',
  spa_appointment: 'spa_appointment_set',
  spa_signed: 'spa_signed'
}

/**
 * The proposal event attached to a message: the newest one still standing that
 * records Jev's extraction. An event linked to the message but recording a
 * different claim — say a story `booked` — never passes for its proposal, so
 * the extraction is not dressed in another event's status.
 */
function currentProposal(events: CaseEvent[], messageId: string, extraction: Extraction | null): CaseEvent | null {
  const kind = extraction && EXTRACTED_EVENT_KIND[extraction.event.value]
  if (!extraction || !kind) return null
  const document = extraction.document.value === 'none' ? null : extraction.document.value
  const linked = events
    .filter((e) => e.messageId === messageId && e.kind === kind && e.document === document)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt) || b.id.localeCompare(a.id))
  return linked.find((e) => e.status !== 'superseded') ?? linked[0] ?? null
}

function ProposalBlock({
  extraction,
  proposal,
  pending,
  onReview
}: {
  extraction: Extraction
  proposal: CaseEvent | null
  pending: boolean
  onReview: (eventId: string, decision: Decision) => void
}) {
  const { event, document, owner, meta } = extraction
  const probability = event.probabilities[event.value] ?? 0
  const needsReview = event.confidence < JEV_REVIEW_THRESHOLD
  if (event.value === 'no_update') {
    return (
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
        <JevTag meta={meta} />
        <span>No Case Update In This Message.</span>
        {needsReview && <StatusPill tone="warning">Needs Review</StatusPill>}
      </p>
    )
  }
  return (
    <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Jev Proposal
        </span>
        <JevTag meta={meta} />
        {needsReview && <StatusPill tone="warning">Needs Review</StatusPill>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
        <span className="font-medium">{EXTRACTED_EVENT_LABELS[event.value]}</span>
        {document.value !== 'none' && <span>{DOCUMENT_LABELS[document.value]}</span>}
        {owner.value !== 'none' && <span className="text-muted-foreground">{OWNER_ROLE_LABELS[owner.value]}</span>}
        <ProbabilityBar probability={probability} />
        <span className="text-[13px] text-muted-foreground">Confidence {formatPercent(event.confidence)}</span>
      </div>
      {proposal && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {proposal.status === 'provisional' || proposal.status === 'disputed' ? (
            <>
              {proposal.status === 'disputed' && <EvidencePill status="disputed" />}
              <Button size="sm" variant="secondary" disabled={pending} onClick={() => onReview(proposal.id, 'confirm')}>
                <Check className="size-4" />
                Confirm
              </Button>
              {proposal.status === 'provisional' && (
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => onReview(proposal.id, 'dispute')}>
                  Dispute
                </Button>
              )}
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => onReview(proposal.id, 'dismiss')}>
                Dismiss
              </Button>
            </>
          ) : (
            <EvidencePill status={proposal.status} />
          )}
        </div>
      )}
    </div>
  )
}

function MessageItem({
  message,
  extraction,
  proposal,
  reviewer,
  onChanged
}: {
  message: Message
  extraction: Extraction | null
  proposal: CaseEvent | null
  reviewer: string
  onChanged: () => Promise<void>
}) {
  const [pending, setPending] = useState(false)

  const run = async (work: () => Promise<unknown>, toast: string) => {
    setPending(true)
    try {
      await work()
      notify.success(toast)
      await onChanged()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'The request failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <li className="group py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-medium">{message.senderName}</span>
        <Badge variant="secondary">{SENDER_ROLE_LABELS[message.senderRole]}</Badge>
        <span className="text-[13px] text-muted-foreground tabular-nums">{formatDateTime(message.sentAt)}</span>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-7 px-2 text-xs text-muted-foreground transition-opacity duration-[var(--motion-fast)] group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
          disabled={pending}
          onClick={() => void run(() => extractMessage(message.id), 'Jev re-ran on this message.')}
        >
          {extraction ? 'Re-Run Jev' : 'Run Jev'}
        </Button>
      </div>
      <p className="mt-1.5 max-w-3xl text-sm">{message.body}</p>
      {extraction ? (
        <ProposalBlock
          extraction={extraction}
          proposal={proposal}
          pending={pending}
          onReview={(eventId, decision) =>
            void run(() => reviewEvent(eventId, { decision, reviewer }), DECISION_TOASTS[decision])
          }
        />
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">Not Analysed By Jev Yet.</p>
      )}
    </li>
  )
}

export function MessagesPanel({
  messages,
  extractions,
  events,
  reviewer,
  onChanged,
  footer
}: {
  messages: Message[]
  extractions: Map<string, Extraction>
  events: CaseEvent[]
  reviewer: string
  onChanged: () => Promise<void>
  /** Rendered under the list — the Add Message form. */
  footer?: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Messages · {messages.length}
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Messages Yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {messages.map((message) => {
              const extraction = extractions.get(message.id) ?? null
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  extraction={extraction}
                  proposal={currentProposal(events, message.id, extraction)}
                  reviewer={reviewer}
                  onChanged={onChanged}
                />
              )
            })}
          </ul>
        )}
        {footer}
      </CardContent>
    </Card>
  )
}
