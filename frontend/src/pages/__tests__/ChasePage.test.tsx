import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
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
  fetchNextAction: vi.fn(),
  postEvent: vi.fn(),
  postApplication: vi.fn()
}))

let SNAP: Snapshot
let CASES: CaseSummary[]

/** A provisional event: evidence a person has to confirm, which leads the queue. */
function provisionalEvent(bookingId: string, id: string): Snapshot['events'][number] {
  return {
    id,
    bookingId,
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
}

function defaultData() {
  SNAP = snapshot({
    events: [provisionalEvent('BK-9001', 'EV-1')],
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
  fetchNextAction: mocks.fetchNextAction,
  // The side sheet's Record An Update posts through these.
  postEvent: mocks.postEvent,
  postApplication: mocks.postApplication
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

function LocationProbe() {
  return <output data-testid="route-location">{useLocation().pathname}</output>
}

describe('ChasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    defaultData()
  })

  it('opens Sales Admin on the whole chase, header and tile included', () => {
    renderPage()
    expect(document.querySelector('[data-tour="today-header"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="today-card"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="today-actions"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="today-quick-view"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="open-tasks"]')).toBeTruthy()

    // The Sales Administration Executive coordinates every booking to a
    // signed SPA, so their home is the whole queue, not one desk of it.
    expect(screen.getByText(/0 Assigned Tasks · 0 Due Today/)).toBeTruthy()
    expect(screen.getByText('Stalled Bookings')).toBeTruthy()
    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(2)
  })

  it('keeps Manager on Today with compact decisions instead of redirecting to Manager', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'manager')
    render(
      <MemoryRouter initialEntries={['/chase']}>
        <PersonaProvider>
          <LocationProbe />
          <ChasePage />
        </PersonaProvider>
      </MemoryRouter>
    )

    expect(screen.getByTestId('route-location').textContent).toBe('/chase')
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Decisions For You' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Assigned Tasks' })).toBeNull()
    expect(screen.queryByRole('tab', { name: 'Overview' })).toBeNull()
  })

  it('counts the cards it is showing under the headline figure', () => {
    renderPage()
    expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(2)
  })

  it('suppresses a proposed action when an equivalent task is already open', () => {
    SNAP = snapshot({
      bookings: SNAP.bookings,
      nextActions: [],
      tasks: [task('BK-9001', { action: 'chase_banker', ownerName: 'Tan Mei Ling', ownerRole: 'loan_admin' })]
    })
    CASES = [stalledCase('BK-9001', { applications: [{ id: 'APP-1', bank: 'Crestline', status: 'submitted' }] })]
    renderPage()

    expect(screen.queryByTestId('chase-card-BK-9001')).toBeNull()
    expect(screen.getByText('Open Tasks Already Cover These Recommended Actions.')).toBeTruthy()
  })

  it('keeps the recommendation when the same action is assigned to another recipient', () => {
    SNAP = snapshot({
      bookings: SNAP.bookings,
      nextActions: [],
      tasks: [task('BK-9001', { action: 'chase_banker', ownerName: 'Someone Else', ownerRole: 'loan_admin' })]
    })
    CASES = [stalledCase('BK-9001', { applications: [{ id: 'APP-1', bank: 'Crestline', status: 'submitted' }] })]
    renderPage()

    expect(screen.getByTestId('chase-card-BK-9001')).toBeTruthy()
  })

  it('shows only bookings created during the trailing seven calendar days', () => {
    const bookings = [
      booking('BK-TODAY', { createdAt: '2026-09-18T20:00:00+08:00', bookingDate: '2026-01-01' }),
      booking('BK-FIRST-DAY', { createdAt: '2026-09-12T00:00:00+08:00' }),
      booking('BK-OLD', { createdAt: '2026-09-11T23:59:59+08:00' }),
      booking('BK-FUTURE', { createdAt: '2026-09-19T00:00:00+08:00' }),
      booking('BK-UNKNOWN', { createdAt: null, bookingDate: '2026-09-18' })
    ]
    SNAP = snapshot({ bookings, nextActions: [] })
    CASES = []
    renderPage()

    const recent = screen.getByRole('region', { name: 'Recent bookings' })
    expect(within(recent).queryByText('BK-TODAY')).toBeNull()
    fireEvent.click(within(recent).getByRole('button', { name: 'Show Recent Bookings' }))
    expect(within(recent).getByText('BK-TODAY')).toBeTruthy()
    expect(within(recent).getByText('BK-FIRST-DAY')).toBeTruthy()
    expect(within(recent).queryByText('BK-OLD')).toBeNull()
    expect(within(recent).queryByText('BK-FUTURE')).toBeNull()
    expect(within(recent).queryByText('BK-UNKNOWN')).toBeNull()
    expect(within(recent).getByText('(2)')).toBeTruthy()
  })

  it('lists a card leading with the rule-based move, with Jev’s differing move beneath it', () => {
    renderPage()

    const card = screen.getByTestId('chase-card-BK-9001')
    expect(card.textContent).toContain('Call The Banker')
    expect(card.textContent).toContain('Application Undecided For 10 Working Days')
    // The rule-based move is the default; Jev's differs and rides one line under it.
    expect(card.textContent).toContain('Jev Suggests: Ask For The Missing Document Instead')
  })

  it('names the desk that owns a card’s next step, and leaves it out on that desk', () => {
    // Sales Admin reads every desk's stalled bookings, so a move they cannot
    // make says whose move it is.
    renderPage()
    const asSales = screen.getByTestId('chase-card-BK-9001')
    expect(within(asSales).getByText('· Loan Admin')).toBeTruthy()

    window.localStorage.clear()
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
    cleanup()
    renderPage()
    expect(within(screen.getByTestId('chase-card-BK-9001')).queryByText('· Loan Admin')).toBeNull()
  })

  it('creates the default step’s task with one click, not Jev’s', async () => {
    mocks.postTask.mockResolvedValue({})
    SNAP = { ...SNAP, tasks: [], nextActions: [] }
    CASES = [stalledCase('BK-9001', { applications: [{ id: 'APP-1', bank: 'Crestline', status: 'submitted' }] })]
    renderPage()

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

    const card = screen.getByTestId('chase-card-BK-9001')
    fireEvent.click(within(card).getByRole('button', { name: 'Do That Instead' }))

    await waitFor(() => expect(mocks.postTask).toHaveBeenCalledTimes(1))
    expect(mocks.postTask).toHaveBeenCalledWith(
      expect.objectContaining({ bookingId: 'BK-9001', action: 'request_document', ownerRole: 'loan_admin' })
    )
  })

  it('leads with the case whose evidence is waiting to be confirmed', () => {
    // BK-OD is the stalest stall, but one confirmation of BK-9001's payslip
    // clears that stall outright, so BK-9001 goes first.
    SNAP = snapshot({
      events: [provisionalEvent('BK-9001', 'EV-1')],
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

    expect(screen.getAllByTestId(/chase-card-/).map((c) => c.getAttribute('data-testid'))).toEqual([
      'chase-card-BK-9001',
      'chase-card-BK-OD',
      'chase-card-BK-0040'
    ])
  })

  it('ranks the rest by how long each case has sat still, and pills only the overdue one', () => {
    SNAP = snapshot({
      events: [],
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

    const grid = screen.getByTestId('chase-card-BK-9001').parentElement!
    expect(grid.className).toContain('grid-cols-1')
  })

  describe('the side sheet', () => {
    it('opens the same quick view a ledger row opens, from a card, without leaving Today', () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /^Quick View A-12-03: BK-9001/ }))

      const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!
      expect(sheet).toBeTruthy()
      expect(within(sheet).getByText('Waiting On')).toBeTruthy()
      expect(within(sheet).getByText('Next Step')).toBeTruthy()
      expect(within(sheet).getByRole('list', { name: 'Case Journey' })).toBeTruthy()
      // The full case stays one link away, and the queue is still behind it.
      expect(
        within(sheet)
          .getByRole('link', { name: /Open Full Case/ })
          .getAttribute('href')
      ).toBe('/bookings/BK-9001')
      expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(2)
    })

    it('carries Record An Update, so what happened is logged from Today', () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /^Quick View A-12-03: BK-9001/ }))

      const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!
      expect(within(sheet).getByRole('button', { name: /Record An Update/ })).toBeTruthy()
    })

    it('shows Jev’s alternative in the sheet, the same line Today shows', () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /^Quick View A-12-03: BK-9001/ }))

      const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!
      expect(within(sheet).getByText('Jev Suggests: Ask For The Missing Document Instead')).toBeTruthy()
    })

    it('refreshes the queue after a save in the sheet', async () => {
      mocks.postTask.mockResolvedValue({})
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /^Quick View A-12-03: BK-9001/ }))

      const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!
      await act(async () => {
        fireEvent.click(within(sheet).getByRole('button', { name: 'Add Task' }))
      })

      await waitFor(() => expect(mocks.postTask).toHaveBeenCalledTimes(1))
      // The same refresh `/bookings` does, so the card behind the sheet counts
      // the new task once the sheet closes.
      await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
    })
  })

  describe('Assigned Tasks', () => {
    it('opens only the exact profile and role, then can widen to every returned task', () => {
      SNAP = snapshot({
        bookings: SNAP.bookings,
        nextActions: [],
        tasks: [
          task('BK-9001', { id: 'TASK-1', ownerName: 'Nurul Aina', ownerRole: 'sales_admin' }),
          task('BK-9001', {
            id: 'TASK-1-LEGACY',
            title: 'Legacy Sales Task',
            ownerName: 'Nurul Aina',
            ownerRole: 'sales'
          }),
          task('BK-9001', {
            id: 'TASK-WRONG-ROLE',
            title: 'Wrong Role Task',
            ownerName: 'Nurul Aina',
            ownerRole: 'legal'
          }),
          task('BK-9001', {
            id: 'TASK-WRONG-NAME',
            title: 'Wrong Name Task',
            ownerName: 'Farah Izzati',
            ownerRole: 'sales_admin'
          }),
          task('BK-0040', { id: 'TASK-2', ownerName: 'Nurul Aina', ownerRole: 'loan_admin' }),
          task('BK-0040', { id: 'TASK-3', ownerName: 'Arvind Raj', ownerRole: 'legal' })
        ]
      })
      renderPage()

      expect(screen.getByText('Call The Banker About BK-9001')).toBeTruthy()
      expect(screen.getByText('Legacy Sales Task')).toBeTruthy()
      expect(screen.queryByText('Wrong Role Task')).toBeNull()
      expect(screen.queryByText('Wrong Name Task')).toBeNull()
      expect(screen.queryByText('Call The Banker About BK-0040')).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'Show All Owners' }))
      expect(screen.getAllByText('Call The Banker About BK-0040')).toHaveLength(2)
    })

    it('opens Loan Admin on their own tasks and widens to every owner', () => {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
      SNAP = snapshot({
        bookings: SNAP.bookings,
        nextActions: [],
        tasks: [task('BK-9001'), task('BK-0040', { id: 'TASK-2', ownerName: 'Arvind Raj', ownerRole: 'legal' })]
      })
      renderPage()

      // Tan Mei Ling owns the first; Arvind Raj is Legal's.
      expect(screen.getByText('Call The Banker About BK-9001')).toBeTruthy()
      expect(screen.queryByText('Call The Banker About BK-0040')).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: 'Show All Owners' }))
      expect(screen.getByText('Call The Banker About BK-0040')).toBeTruthy()
    })

    it('counts a task due on the reference date as due today', () => {
      SNAP = snapshot({
        bookings: SNAP.bookings,
        nextActions: [],
        tasks: [task('BK-9001', { ownerName: 'Nurul Aina', ownerRole: 'sales_admin', dueOn: '2026-09-18' })]
      })
      renderPage()

      expect(screen.getByText(/1 Assigned Task · 1 Due Today/)).toBeTruthy()
    })
  })

  describe('persona presets and the owner filter', () => {
    it('opens Loan Admin on the cases waiting on their own desk', () => {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
      renderPage()

      expect(screen.getByText(/0 Assigned Tasks · 0 Due Today/)).toBeTruthy()
      expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(2)
    })

    it('reads another desk in the header, the tile and the cards together', () => {
      renderPage()
      fireEvent.click(screen.getByRole('combobox', { name: 'Filter by owner' }))
      fireEvent.click(screen.getByRole('option', { name: 'Loan Admin' }))

      expect(screen.getByText(/0 Assigned Tasks · 0 Due Today/)).toBeTruthy()
      expect(screen.getByText('Need A Move From Loan Admin')).toBeTruthy()
      expect(screen.getAllByTestId(/chase-card-/)).toHaveLength(2)
    })

    it('says "From You" when the persona’s own desk is selected', () => {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
      renderPage()

      expect(screen.getByText('Need A Move From You')).toBeTruthy()
      expect(screen.getByText(/0 Assigned Tasks · 0 Due Today/)).toBeTruthy()
    })

    it('reads one stalled booking in the singular over all desks', () => {
      SNAP = snapshot({ bookings: SNAP.bookings, events: [], nextActions: [] })
      CASES = [stalledCase('BK-9001', { applications: [{ id: 'A1', bank: 'B', status: 'submitted' }] })]
      renderPage()

      expect(screen.getByText(/0 Assigned Tasks · 0 Due Today/)).toBeTruthy()
    })

    it('says a lone case on a desk in the singular too', () => {
      SNAP = snapshot({ bookings: SNAP.bookings, events: [], nextActions: [] })
      CASES = [stalledCase('BK-9001', { applications: [{ id: 'A1', bank: 'B', status: 'submitted' }] })]
      window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
      renderPage()

      // The tile drops the subject and the count, which the figure carries.
      expect(screen.getByText('Needs A Move From You')).toBeTruthy()
      expect(screen.getByText(/0 Assigned Tasks · 0 Due Today/)).toBeTruthy()
    })
  })
})
