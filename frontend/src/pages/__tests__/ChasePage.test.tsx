import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaseSummary, Snapshot } from '@mortar/core'
import { booking, nextAction, snapshot, stalledCase } from './mockSnapshot'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  postTask: vi.fn(),
  updateTask: vi.fn(),
  fetchNextAction: vi.fn()
}))

let SNAP: Snapshot
let CASES: CaseSummary[]

function defaultData() {
  SNAP = snapshot({
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

  CASES = [
    stalledCase('BK-9001'),
    stalledCase('BK-0040', { daysSinceEvidence: 1, stallReasons: ['Application Undecided For 10 Working Days'] })
  ]
}

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
    defaultData()
  })

  it('lists BK-9001 first with Jev’s request-payslip suggestion', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Chase List' })).toBeTruthy()

    const cards = screen.getAllByTestId(/chase-card-/)
    expect(cards[0].getAttribute('data-testid')).toBe('chase-card-BK-9001')
    expect(cards[0].textContent).toContain('Request Document · Payslip')
    expect(cards[0].textContent).toContain('Sales · Nurul Aina')
    expect(cards[0].textContent).toContain('Application Undecided For 10 Working Days')
    expect(cards[0].textContent).toContain('Re-Run Jev')
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

  it('ranks by urgency and shows a due chip only when it differs from the norm', () => {
    SNAP = snapshot({
      events: SNAP.events,
      bookings: [booking('BK-9001'), booking('BK-0040'), booking('BK-OD')],
      nextActions: [
        nextAction('BK-9001', 'request_document', 'sales'),
        nextAction('BK-0040', 'chase_banker', 'loan_admin', 1)
      ]
    })
    CASES = [
      stalledCase('BK-9001'),
      stalledCase('BK-0040', { daysSinceEvidence: 1, stallReasons: ['Application Undecided For 10 Working Days'] }),
      stalledCase('BK-OD', { daysSinceEvidence: 14 })
    ]
    renderPage()

    const cards = screen.getAllByTestId(/chase-card-/)
    expect([...cards].map((c) => c.getAttribute('data-testid'))).toEqual([
      'chase-card-BK-9001',
      'chase-card-BK-OD',
      'chase-card-BK-0040'
    ])

    // Due Today is the norm, so it carries no chip; overdue and later-than-today do.
    expect(screen.getByTestId('chase-card-BK-9001').textContent).not.toContain('Due Today')
    expect(screen.getByTestId('chase-card-BK-0040').textContent).toContain('In 2 Days')
    expect(screen.getByTestId('chase-card-BK-OD').textContent).toContain('Overdue 14 d')
  })

  it('previews six cards and unfolds the rest behind one counted control', () => {
    const ids = Array.from({ length: 8 }, (_, i) => `BK-${String(i + 1).padStart(4, '0')}`)
    SNAP = snapshot({ bookings: ids.map((id) => booking(id)) })
    CASES = ids.map((id) => stalledCase(id, { daysSinceEvidence: 3 }))
    renderPage()

    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(6)

    fireEvent.click(screen.getByRole('button', { name: 'Show 2 More Stalled Bookings' }))
    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(8)

    fireEvent.click(screen.getByRole('button', { name: 'Show Fewer' }))
    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(6)

    // A changed filter re-folds the queue; here it empties it entirely.
    fireEvent.click(screen.getByRole('button', { name: 'Show 2 More Stalled Bookings' }))
    fireEvent.click(screen.getByText('High Risk'))
    expect(screen.queryAllByTestId(/chase-card-/)).toHaveLength(0)
    expect(screen.getByText('Nothing To Chase')).toBeTruthy()
  })

  it('keeps the tile explanations in tooltips, not as second lines', () => {
    renderPage()
    expect(screen.queryByText('Live Bookings With A Stall Reason')).toBeNull()
    expect(screen.queryByText('Across Every Owner Below')).toBeNull()
  })

  it('shows the empty state when filters match nothing', () => {
    renderPage()
    fireEvent.click(screen.getByText('High Risk'))
    expect(screen.getByText('Nothing To Chase')).toBeTruthy()
    expect(screen.getByText('No Stalled Booking Matches These Filters.')).toBeTruthy()
  })
})
