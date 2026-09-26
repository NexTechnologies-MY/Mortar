import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaseSummary, Snapshot, Task } from '@mortar/core'
import { PERSONA_STORAGE_KEY, PersonaProvider } from '@/lib/persona'
import { booking, nextAction, snapshot, stalledCase } from './mockSnapshot'

// Radix Select scrolls the highlighted item into view on open; jsdom has no layout engine.
Element.prototype.scrollIntoView = vi.fn()

function task(bookingId: string, overrides: Partial<Task> = {}): Task {
  return {
    id: `TASK-${bookingId}`,
    bookingId,
    action: 'chase_banker',
    title: `Call The Banker About ${bookingId}`,
    ownerRole: 'loan_admin',
    ownerName: 'Tan Mei Ling',
    dueOn: '2026-09-20',
    status: 'open',
    origin: 'staff',
    createdAt: '2026-09-16T00:00:00+08:00',
    completedAt: null,
    ...overrides
  }
}

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
      // Jev disagrees with the rule on BK-9001: the rule says call the banker,
      // Jev says ask the buyer for the payslip.
      nextAction('BK-9001', 'request_document', 'sales'),
      nextAction('BK-0040', 'chase_banker', 'loan_admin', 1.95)
    ]
  })

  CASES = [
    stalledCase('BK-9001', { applications: [{ id: 'APP-1', bank: 'Crestline Bank', status: 'submitted' }] }),
    stalledCase('BK-0040', {
      daysSinceEvidence: 1,
      applications: [{ id: 'APP-2', bank: 'Crestline Bank', status: 'submitted' }],
      stallReasons: ['Application Undecided For 10 Working Days']
    })
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
      <PersonaProvider>
        <ChasePage />
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('ChasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    defaultData()
  })

  it('opens on the Today title and one sentence with the two counts', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeTruthy()
    // Sales Admin is the default seat; both cases sit with Loan Admin, so the
    // count is 0 rather than a number from another desk.
    expect(screen.getByText(/Bookings? Need A Move From You/)).toBeTruthy()
    expect(screen.getByText(/0 Tasks Due Today/)).toBeTruthy()
  })

  it('counts the two cards it is showing under the headline figure', () => {
    renderPage()
    // Sales Admin owns neither stall, so the tile reads 0 and the owner
    // filter has already narrowed the queue to nothing.
    expect(screen.getByText('Nothing To Chase')).toBeTruthy()
    expect(screen.getByText('No Stalled Booking Matches These Filters.')).toBeTruthy()
  })

  it('lists a card leading with the rule-based move, with Jev’s differing move beneath it', () => {
    renderPage()
    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by owner' }))
    fireEvent.click(screen.getByRole('option', { name: 'Loan Admin' }))

    const card = screen.getByTestId('chase-card-BK-9001')
    expect(card.textContent).toContain('Call The Banker')
    expect(card.textContent).toContain('Application Undecided For 10 Working Days')
    expect(card.textContent).toContain('Jev Suggests: Ask For The Document Instead')
  })

  it('creates the default step’s task with one click, not Jev’s', async () => {
    mocks.postTask.mockResolvedValue({})
    SNAP = { ...SNAP, tasks: [], nextActions: [] }
    CASES = [stalledCase('BK-9001', { applications: [{ id: 'APP-1', bank: 'Crestline', status: 'submitted' }] })]
    renderPage()
    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by owner' }))
    fireEvent.click(screen.getByRole('option', { name: 'Loan Admin' }))

    fireEvent.click(within(screen.getByTestId('chase-card-BK-9001')).getByRole('button', { name: 'Create Task' }))

    await waitFor(() => expect(mocks.postTask).toHaveBeenCalledTimes(1))
    expect(mocks.postTask).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'BK-9001',
        action: 'chase_banker',
        ownerRole: 'loan_admin',
        ownerName: 'Tan Mei Ling',
        origin: 'staff'
      })
    )
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
  })

  it('raises Jev’s step when the person picks the alternative', async () => {
    mocks.postTask.mockResolvedValue({})
    renderPage()
    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by owner' }))
    fireEvent.click(screen.getByRole('option', { name: 'Loan Admin' }))

    const card = screen.getByTestId('chase-card-BK-9001')
    fireEvent.click(within(card).getByRole('button', { name: 'Do That Instead' }))

    await waitFor(() => expect(mocks.postTask).toHaveBeenCalledTimes(1))
    expect(mocks.postTask).toHaveBeenCalledWith(
      expect.objectContaining({ bookingId: 'BK-9001', action: 'request_document', ownerRole: 'loan_admin' })
    )
  })

  it('ranks by how long each case has sat still, and pills only the overdue one', () => {
    SNAP = snapshot({
      events: SNAP.events,
      bookings: [booking('BK-9001'), booking('BK-0040'), booking('BK-OD')],
      nextActions: []
    })
    CASES = [
      stalledCase('BK-9001', { daysSinceEvidence: 3, applications: [{ id: 'A1', bank: 'B', status: 'submitted' }] }),
      stalledCase('BK-0040', {
        daysSinceEvidence: 1,
        applications: [{ id: 'A2', bank: 'B', status: 'submitted' }],
        stallReasons: ['Application Undecided For 10 Working Days']
      }),
      stalledCase('BK-OD', {
        daysSinceEvidence: 14,
        applications: [{ id: 'A3', bank: 'B', status: 'submitted' }],
        stallReasons: ['Application Undecided For 10 Working Days']
      })
    ]
    renderPage()
    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by owner' }))
    fireEvent.click(screen.getByRole('option', { name: 'Loan Admin' }))

    const cards = screen.getAllByTestId(/chase-card-/)
    expect([...cards].map((c) => c.getAttribute('data-testid'))).toEqual([
      'chase-card-BK-OD',
      'chase-card-BK-9001',
      'chase-card-BK-0040'
    ])

    // Due Today is the norm, so it carries no pill; an overdue card does.
    expect(screen.getByTestId('chase-card-BK-OD').textContent).toContain('Overdue 14 d')
    expect(screen.getByTestId('chase-card-BK-9001').textContent).not.toContain('Overdue')
  })

  it('previews nine cards and unfolds the rest behind one counted control', () => {
    const ids = Array.from({ length: 12 }, (_, i) => `BK-${String(i + 1).padStart(4, '0')}`)
    SNAP = snapshot({ bookings: ids.map((id) => booking(id)) })
    CASES = ids.map((id) => stalledCase(id, { daysSinceEvidence: 3 }))
    renderPage()
    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by owner' }))
    fireEvent.click(screen.getByRole('option', { name: 'All Owners' }))

    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(9)

    fireEvent.click(screen.getByRole('button', { name: 'Show 3 More' }))
    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(12)

    fireEvent.click(screen.getByRole('button', { name: 'Show Fewer' }))
    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(9)
  })

  it('shows the empty state when filters match nothing', () => {
    renderPage()
    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by risk' }))
    fireEvent.click(screen.getByRole('option', { name: 'High Risk' }))
    expect(screen.getByText('Nothing To Chase')).toBeTruthy()
    expect(screen.getByText('No Stalled Booking Matches These Filters.')).toBeTruthy()
  })

  it('keeps the queue grid to one column below sm so cards cannot force sideways scroll (issue H5)', () => {
    SNAP = snapshot({ bookings: SNAP.bookings, nextActions: [] })
    CASES = [stalledCase('BK-9001', { applications: [{ id: 'A1', bank: 'B', status: 'submitted' }] })]
    renderPage()
    fireEvent.click(screen.getByRole('combobox', { name: 'Filter by owner' }))
    fireEvent.click(screen.getByRole('option', { name: 'Loan Admin' }))

    const grid = screen.getByTestId('chase-card-BK-9001').parentElement!
    expect(grid.className).toContain('grid-cols-1')
  })

  describe('Open Tasks', () => {
    it('defaults to the active persona’s own tasks and widens to every owner', () => {
      SNAP = snapshot({
        bookings: SNAP.bookings,
        nextActions: [],
        tasks: [task('BK-9001'), task('BK-0040', { id: 'TASK-2', ownerName: 'Arvind Raj', ownerRole: 'legal' })]
      })
      renderPage()

      // Sales Admin’s seat is Nurul Aina, who owns none of these two.
      expect(screen.getByText('No Open Tasks For Nurul Aina.')).toBeTruthy()

      fireEvent.click(screen.getByRole('button', { name: 'Show All Owners' }))
      expect(screen.getByText('Call The Banker About BK-9001')).toBeTruthy()
      expect(screen.getByText('Call The Banker About BK-0040')).toBeTruthy()
    })

    it('counts a task due on the reference date as due today', () => {
      SNAP = snapshot({
        bookings: SNAP.bookings,
        nextActions: [],
        tasks: [task('BK-9001', { ownerName: 'Nurul Aina', dueOn: '2026-09-18' })]
      })
      renderPage()

      expect(screen.getByText(/1 Task Due Today/)).toBeTruthy()
    })
  })

  describe('persona presets', () => {
    it('opens Loan Admin on the cases waiting on their own desk', () => {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
      renderPage()

      expect(screen.getByText('2 Bookings Need A Move From You · 0 Tasks Due Today')).toBeTruthy()
      expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(2)
    })

    it('opens Sales Admin on their own desk, which is empty on this data', () => {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, 'sales-admin')
      renderPage()

      expect(screen.getByText('0 Bookings Need A Move From You · 0 Tasks Due Today')).toBeTruthy()
    })
  })
})
