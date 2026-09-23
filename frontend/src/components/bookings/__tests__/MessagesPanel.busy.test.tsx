import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { CaseEvent, Extraction, Message } from '@mortar/core'
import { MessagesPanel } from '@/components/bookings/MessagesPanel'
import { extractMessage, reviewEvent } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  extractMessage: vi.fn(),
  reviewEvent: vi.fn()
}))

const MESSAGE: Message = {
  id: 'MSG-1',
  bookingId: 'BK-1',
  senderRole: 'buyer',
  senderName: 'Test Buyer',
  language: 'en',
  sentAt: '2026-09-17T10:00:00+08:00',
  body: 'Here is my payslip.',
  origin: 'fixture'
}

const EXTRACTION: Extraction = {
  messageId: MESSAGE.id,
  event: { value: 'documents_received', probabilities: { documents_received: 0.9 }, confidence: 0.9 },
  document: { value: 'payslip', probabilities: { payslip: 0.9 }, confidence: 0.9 },
  owner: { value: 'loan_admin', probabilities: { loan_admin: 0.9 }, confidence: 0.9 },
  withdrawalRisk: 0.02,
  needsAction: 0.4,
  meta: { source: 'cache', stale: false, latencyMs: null }
}

const PROPOSAL: CaseEvent = {
  id: 'EV-1',
  bookingId: 'BK-1',
  applicationId: null,
  track: 'loan',
  kind: 'documents_received',
  occurredAt: '2026-09-17T10:00:00+08:00',
  recordedAt: '2026-09-17T10:01:00+08:00',
  reportedBy: 'Jev',
  verifiedBy: null,
  status: 'provisional',
  source: 'jev',
  messageId: MESSAGE.id,
  document: 'payslip',
  note: null
}

/** A promise the test resolves by hand, so the pending state can be observed mid-flight. */
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('MessagesPanel', () => {
  it('says Asking Jev… for a first read, not a stale Ask Jev label, while it runs', async () => {
    const gate = deferred<{ extraction: Extraction; event: CaseEvent | null }>()
    vi.mocked(extractMessage).mockReturnValue(gate.promise)

    render(
      <MessagesPanel
        messages={[MESSAGE]}
        extractions={new Map()}
        events={[]}
        reviewer="Nurul Aina"
        onChanged={vi.fn(async () => {})}
      />
    )

    const button = screen.getByRole('button', { name: 'Ask Jev' })
    fireEvent.click(button)

    expect(await screen.findByRole('button', { name: 'Asking Jev…' })).toBeTruthy()

    gate.resolve({ extraction: EXTRACTION, event: null })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ask Jev' })).toBeTruthy())
    expect(vi.mocked(extractMessage)).toHaveBeenCalledWith(MESSAGE.id)
  })

  it('says Asking Jev… for a re-read, so Ask Jev Again does not sit frozen during the 2–30s call', async () => {
    const gate = deferred<{ extraction: Extraction; event: CaseEvent | null }>()
    vi.mocked(extractMessage).mockReturnValue(gate.promise)

    render(
      <MessagesPanel
        messages={[MESSAGE]}
        extractions={new Map([[MESSAGE.id, EXTRACTION]])}
        events={[]}
        reviewer="Nurul Aina"
        onChanged={vi.fn(async () => {})}
      />
    )

    const button = screen.getByRole('button', { name: 'Ask Jev Again' })
    fireEvent.click(button)

    expect(await screen.findByRole('button', { name: 'Asking Jev…' })).toBeTruthy()

    gate.resolve({ extraction: EXTRACTION, event: null })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ask Jev Again' })).toBeTruthy())
  })

  it('does not mislabel Ask Jev Again as busy while a Confirm on the same message is running', async () => {
    const gate = deferred<CaseEvent>()
    vi.mocked(reviewEvent).mockReturnValue(gate.promise)

    render(
      <MessagesPanel
        messages={[MESSAGE]}
        extractions={new Map([[MESSAGE.id, EXTRACTION]])}
        events={[PROPOSAL]}
        reviewer="Nurul Aina"
        onChanged={vi.fn(async () => {})}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    // Confirm disables the Ask Jev button (only one action per message at a
    // time) but must not borrow its "Asking Jev…" label for a review action.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ask Jev Again' })).toHaveProperty('disabled', true))
    expect(screen.queryByRole('button', { name: 'Asking Jev…' })).toBeNull()

    gate.resolve(PROPOSAL)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ask Jev Again' })).toHaveProperty('disabled', false))
  })
})
