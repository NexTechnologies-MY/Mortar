import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Snapshot } from '@mortar/core'
import { nextAction, snapshot, stalledCase } from './mockSnapshot'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  postTask: vi.fn(),
  updateTask: vi.fn(),
  fetchNextAction: vi.fn()
}))

const SNAP: Snapshot = snapshot({
  events: [
    {
      id: 'EV-1',
      bookingId: 'BK-9001',
      applicationId: null,
      track: 'loan',
      kind: 'documents_requested',
      occurredAt: '2026-09-16T15:30:00+08:00',
      recordedAt: '2026-09-16T15:31:00+08:00',
      reportedBy: 'Jev',
      verifiedBy: null,
      status: 'provisional',
      source: 'jev',
      messageId: 'MSG-1',
      document: 'payslip',
      note: null
    }
  ],
  nextActions: [
    nextAction('BK-9001', 'request_document', 'sales'),
    nextAction('BK-0040', 'chase_banker', 'loan_admin', 1.95)
  ]
})

const CASES = [
  stalledCase('BK-9001'),
  stalledCase('BK-0040', { daysSinceEvidence: 1, stallReasons: ['Application Undecided For 10 Working Days'] })
]

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: SNAP, loading: false, error: null, refresh: mocks.refresh }),
  useCases: () => CASES
}))

vi.mock('@/lib/api', () => ({
  postTask: mocks.postTask,
  updateTask: mocks.updateTask,
  fetchNextAction: mocks.fetchNextAction
}))

vi.mock('@/components/ui/toastConfig', () => ({
  notify: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}))

import { ChasePage } from '@/pages/ChasePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ChasePage />
    </MemoryRouter>
  )
}

describe('ChasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists BK-9001 first with Jev’s request-payslip suggestion', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Chase List' })).toBeTruthy()

    const cards = screen.getAllByTestId(/chase-card-/)
    expect(cards[0].getAttribute('data-testid')).toBe('chase-card-BK-9001')
    expect(cards[0].textContent).toContain('Request Document · Payslip')
    expect(cards[0].textContent).toContain('Sales · Nurul Aina')
    expect(cards[0].textContent).toContain('Application Undecided For 10 Working Days')
  })

  it('creates the suggested task with one click', async () => {
    mocks.postTask.mockResolvedValue({})
    renderPage()

    const card = screen.getByTestId('chase-card-BK-9001')
    fireEvent.click(card.querySelector('button:last-child')!)

    await waitFor(() => expect(mocks.postTask).toHaveBeenCalledTimes(1))
    expect(mocks.postTask).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'BK-9001',
        action: 'request_document',
        ownerRole: 'sales',
        ownerName: 'Nurul Aina',
        origin: 'jev'
      })
    )
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
  })

  it('shows the empty state when filters match nothing', () => {
    renderPage()
    fireEvent.click(screen.getByText('High Risk'))
    expect(screen.getByText('Nothing To Chase')).toBeTruthy()
    expect(screen.getByText('No Stalled Booking Matches These Filters.')).toBeTruthy()
  })
})
