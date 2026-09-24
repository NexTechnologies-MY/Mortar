import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { CaseEvent, Extraction, Message } from '@mortar/core'
import { MessagesPanel } from '@/components/bookings/MessagesPanel'
import { ApiError, reviewEvent } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'

// Keep the real ApiError: the panel shows the server's words only for an ApiError (a 4xx refusal).
vi.mock('@/lib/api', async (importOriginal) => ({
  ApiError: (await importOriginal<typeof import('@/lib/api')>()).ApiError,
  extractMessage: vi.fn(async () => ({})),
  reviewEvent: vi.fn(async () => ({}))
}))

vi.mock('@/components/ui/toastConfig', () => ({
  notify: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }
}))

const MESSAGE: Message = {
  id: 'MSG-9001-9',
  bookingId: 'BK-9001',
  senderRole: 'buyer',
  senderName: 'Raymond Tan Wei Hong',
  language: 'en',
  sentAt: '2026-09-17T21:05:00+08:00',
  body: 'Payslip sent just now.',
  origin: 'live'
}

const EXTRACTION: Extraction = {
  messageId: 'MSG-9001-9',
  event: { value: 'documents_received', probabilities: { documents_received: 0.94 }, confidence: 0.9 },
  document: { value: 'payslip', probabilities: { payslip: 0.97 }, confidence: 0.95 },
  owner: { value: 'loan_admin', probabilities: { loan_admin: 0.8 }, confidence: 0.8 },
  withdrawalRisk: 0.1,
  needsAction: 0.9,
  meta: { source: 'live', stale: false, latencyMs: 420 }
}

const PROPOSAL: CaseEvent = {
  id: 'EV-9001-9',
  bookingId: 'BK-9001',
  applicationId: 'APP-9001-1',
  track: 'loan',
  kind: 'documents_received',
  occurredAt: '2026-09-17T21:05:00+08:00',
  recordedAt: '2026-09-18T12:00:00+08:00',
  reportedBy: 'Jev',
  verifiedBy: null,
  status: 'provisional',
  source: 'jev',
  messageId: 'MSG-9001-9',
  document: 'payslip',
  note: '94% Probability'
}

function renderPanel() {
  const onChanged = vi.fn(async () => {})
  render(
    <MessagesPanel
      messages={[MESSAGE]}
      extractions={new Map([[MESSAGE.id, EXTRACTION]])}
      events={[PROPOSAL]}
      reviewer="Nurul Aina"
      onChanged={onChanged}
    />
  )
  return onChanged
}

describe('MessagesPanel review', () => {
  beforeEach(() => {
    vi.mocked(reviewEvent).mockReset()
    vi.mocked(notify.error).mockReset()
    vi.mocked(notify.success).mockReset()
  })

  it('confirms the proposal and re-reads the case', async () => {
    vi.mocked(reviewEvent).mockResolvedValue({ ...PROPOSAL, status: 'confirmed', verifiedBy: 'Nurul Aina' })
    const onChanged = renderPanel()

    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
    expect(reviewEvent).toHaveBeenCalledWith('EV-9001-9', { decision: 'confirm', reviewer: 'Nurul Aina' })
    expect(notify.success).toHaveBeenCalledWith('Proposal confirmed.')
  })

  it('shows why a review was refused and re-reads the case, so a stale proposal is replaced', async () => {
    vi.mocked(reviewEvent).mockRejectedValue(new ApiError('This update was already reviewed and confirmed.', 409))
    const onChanged = renderPanel()

    fireEvent.click(screen.getByText('Dismiss'))

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
    expect(notify.error).toHaveBeenCalledWith('This update was already reviewed and confirmed.')
    expect(notify.success).not.toHaveBeenCalled()
  })
})
