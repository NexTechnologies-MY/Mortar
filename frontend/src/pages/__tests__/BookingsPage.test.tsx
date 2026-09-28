import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import {
  DEFAULT_SEED,
  PLAYBOOKS,
  REFERENCE_DATE,
  currentCaseAssignee,
  generate,
  summarizeCases,
  type CaseEvent,
  type Booking,
  type Snapshot
} from '@mortar/core'
import { PersonaProvider, type Persona } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { deleteBooking, fetchSnapshot, importBookings, postTask } from '@/lib/api'
import type { ClosedExportRow } from '@/components/bookings/closedExport'
import { BookingsPage } from '@/pages/BookingsPage'

const exportMocks = vi.hoisted(() => ({
  download: vi.fn<(rows: readonly ClosedExportRow[], date: string) => Promise<void>>(async () => {})
}))

// Radix Select scrolls the highlighted item into view on open; jsdom has no layout engine.
Element.prototype.scrollIntoView = vi.fn()

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  const snapshot = fixture.buildSnapshot()
  return {
    fetchSnapshot: vi.fn(async () => snapshot),
    fetchSignals: vi.fn(async () => fixture.SIGNALS_9001),
    fetchPlaybooks: vi.fn(async () => fixture.RANKING_9001),
    reviewEvent: vi.fn(async () => ({})),
    extractMessage: vi.fn(async () => ({})),
    postMessage: vi.fn(async () => ({})),
    postTask: vi.fn(async () => ({})),
    deleteBooking: vi.fn(async () => ({})),
    updateTask: vi.fn(async () => ({})),
    importBookings: vi.fn(async () => ({ importId: 'IMP-TEST', bookings: [] }))
  }
})

vi.mock('@/components/bookings/closedExport', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/bookings/closedExport')>()
  return { ...actual, downloadClosedExport: exportMocks.download }
})

/**
 * A bigger, story-free snapshot: enough generated bookings that Active alone
 * spans two pages (25 per page), so the view-switch-resets-to-page-one
 * behaviour (issue #23) can be exercised without touching the smaller,
 * shared `buildSnapshot()` fixture other bookings tests rely on.
 */
function buildLargeSnapshot(): Snapshot {
  const generated = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 45 })
  return {
    bookings: generated.bookings,
    applications: generated.applications,
    events: generated.events,
    messages: [],
    playbooks: PLAYBOOKS,
    tasks: [],
    extractions: [],
    signals: [],
    nextActions: [],
    meta: { seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, resetAt: null }
  }
}

/**
 * `buildLargeSnapshot()` plus one booking booked 8 days ago and disbursed
 * immediately after: young enough to be "Live" by age, but disbursed is a
 * Closed-tab stage. A regression fixture for issue L13, where `RESOLVED_STAGES`
 * used to omit `disbursed` and so double-counted a booking like this as both.
 */
function buildFreshDisbursedSnapshot(): Snapshot {
  const base = buildLargeSnapshot()
  const freshBooking: Booking = { ...base.bookings[0], id: 'BK-FRESH', unit: 'Z-99-09', bookingDate: '2026-09-10' }
  const freshEvent = (kind: CaseEvent['kind'], occurredAt: string): CaseEvent => ({
    id: `EV-FRESH-${kind}`,
    bookingId: freshBooking.id,
    applicationId: null,
    track: 'loan',
    kind,
    occurredAt,
    recordedAt: occurredAt,
    reportedBy: 'Staff',
    verifiedBy: null,
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null
  })
  return {
    ...base,
    bookings: [...base.bookings, freshBooking],
    events: [
      ...base.events,
      freshEvent('booked', '2026-09-10T09:00:00+08:00'),
      // A disbursement only counts once the SPA is signed (issue H2).
      freshEvent('spa_signed', '2026-09-11T09:00:00+08:00'),
      freshEvent('disbursed', '2026-09-12T09:00:00+08:00')
    ]
  }
}

function LocationEcho() {
  return <div data-testid="location">{useLocation().pathname}</div>
}

function renderBookings(initialPersona: Persona = 'loan-admin') {
  return render(
    <MemoryRouter initialEntries={['/bookings']}>
      <PersonaProvider initialPersona={initialPersona}>
        <SnapshotProvider>
          <Routes>
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/:id" element={<LocationEcho />} />
          </Routes>
        </SnapshotProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
}

function ensureFiltersOpen() {
  if (!screen.queryByText('Filter Bookings')) fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
}

describe('BookingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the stat tiles, one filter menu, collapsed holder strip and booking rows', async () => {
    renderBookings()

    expect(await screen.findByRole('heading', { name: 'Bookings' })).toBeTruthy()
    expect(document.querySelector('[data-tour="booking-holder"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="booking-filters"]')).toBeTruthy()
    // Live Bookings and SPA Signed tiles are removed (Change 2)
    expect(screen.queryByText('Live Bookings')).toBeNull()
    // Stalled and No Update 10+ Days tiles remain
    expect(screen.getByText('Stalled')).toBeTruthy()
    expect(screen.getAllByText('No Update 10+ Days').length).toBe(1)
    // Collapsed strip keeps counts visible and exposes its caption only as tooltip.
    expect(screen.getByText('Who Holds Each Booking')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Who Holds Each Booking/i }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByLabelText('Signed: 1')).toBeTruthy()

    expect(screen.getByText('BK-9001')).toBeTruthy()
    expect(screen.getByText('A-12-03')).toBeTruthy()
    expect(screen.getByText('Raymond Tan Wei Hong')).toBeTruthy()

    // 28 bookings in fixture: 20 Active / 8 Closed
    ensureFiltersOpen()
    expect(screen.getByRole('checkbox', { name: 'Active (20)' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Closed (8)' })).toBeTruthy()
    ensureFiltersOpen()

    // Under Loan Admin preset (Bank), 13 of 20 bookings match
    expect(screen.getByText('13 Of 20 Bookings')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Add Booking' })).toBeNull()
  })

  it('narrows Active to the bookings waiting on the person a Team row names, then clears', async () => {
    const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
    const snapshot = fixture.buildSnapshot()
    const cases = summarizeCases(snapshot, snapshot.meta.referenceDate)
    const held = snapshot.bookings.filter((b) => {
      const summary = cases.find((c) => c.bookingId === b.id)
      return summary && currentCaseAssignee(b, summary)?.id === 'loan-tan-mei-ling'
    })
    render(
      <MemoryRouter initialEntries={['/bookings?waitingOn=loan-tan-mei-ling']}>
        <PersonaProvider initialPersona="manager">
          <SnapshotProvider>
            <Routes>
              <Route path="/bookings" element={<BookingsPage />} />
            </Routes>
          </SnapshotProvider>
        </PersonaProvider>
      </MemoryRouter>
    )

    const clear = await screen.findByRole('button', { name: 'Clear' })
    expect(screen.getAllByText('Tan Mei Ling').length).toBeGreaterThan(0)
    expect(held.length).toBeGreaterThan(0)
    expect(screen.getByText(`${held.length} Of 20 Bookings`)).toBeTruthy()

    fireEvent.click(clear)
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
  })

  it('searches unit, buyer and booking id and removes the duplicate Add Booking entry point', async () => {
    renderBookings()
    await screen.findByText('BK-9001')
    expect(screen.queryByRole('button', { name: 'Add Booking' })).toBeNull()
    const search = screen.getByRole('textbox', { name: 'Search bookings' })
    fireEvent.change(search, { target: { value: 'Raymond Tan' } })
    await waitFor(() => expect(screen.getByText('BK-9001')).toBeTruthy())
    expect(screen.queryByText('BK-9007')).toBeNull()
    fireEvent.change(search, { target: { value: 'does not match' } })
    await waitFor(() => expect(screen.queryByText('BK-9001')).toBeNull())
  })

  it('selects a row without opening its quick view and offers bulk actions', async () => {
    renderBookings()
    await screen.findByText('BK-9001')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select BK-9001' }))
    expect(screen.getByRole('region', { name: 'Selected bookings actions' }).textContent).toContain('1 Selected')
    expect(screen.getByRole('button', { name: 'Create Tasks' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export To Excel' })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('deletes only after confirmation, leaves selection on cancel, then clears it after delete', async () => {
    renderBookings()
    await screen.findByText('BK-9001')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select BK-9001' }))
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Selected bookings actions' })).getByRole('button', { name: 'Delete' })
    )
    const dialog = await screen.findByRole('dialog', { name: 'Delete Selected Bookings?' })
    expect(deleteBooking).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(deleteBooking).not.toHaveBeenCalled()
    expect(screen.getByRole('region', { name: 'Selected bookings actions' }).textContent).toContain('1 Selected')

    fireEvent.click(
      within(screen.getByRole('region', { name: 'Selected bookings actions' })).getByRole('button', { name: 'Delete' })
    )
    const confirmation = await screen.findByRole('dialog', { name: 'Delete Selected Bookings?' })
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Delete Bookings' }))
    await waitFor(() => expect(deleteBooking).toHaveBeenCalledWith('BK-9001', 'loan-admin'))
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Selected bookings actions' })).toBeNull())
  })

  it('creates tasks for selected rows only and clears the selection', async () => {
    renderBookings()
    await screen.findByText('BK-9001')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select BK-9002' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Tasks' }))

    await waitFor(() => expect(postTask).toHaveBeenCalled())
    expect(vi.mocked(postTask).mock.calls.every(([task]) => task.bookingId === 'BK-9002')).toBe(true)
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Selected bookings actions' })).toBeNull())
  })

  it('exports only selected bookings', async () => {
    renderBookings()
    await screen.findByText('BK-9001')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select BK-9002' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select BK-9003' }))
    fireEvent.click(screen.getByRole('button', { name: 'Export To Excel' }))

    await waitFor(() => expect(exportMocks.download).toHaveBeenCalledTimes(1))
    const rows = exportMocks.download.mock.calls[0][0]
    expect(rows.map((row) => row.booking)).toEqual(['BK-9002', 'BK-9003'])
  })

  it('sorts stalled bookings first and keeps Age calm when Waiting On is red (Change 7)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    const firstRow = document.querySelector('tbody tr')!
    // Stalled booking BK-9007 sorts first
    expect(firstRow.textContent).toContain('BK-9007')
    // Waiting On has the red danger status pill
    expect(within(firstRow).getByText(/12 d/)).toBeTruthy()
    // Age does not turn red because Waiting On is already red
    expect(firstRow.children[2].className).not.toContain('text-status-danger-fg')
  })

  it('keeps only unknown cases when the renamed filter is on (issue #22)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    ensureFiltersOpen()
    fireEvent.click(screen.getByRole('checkbox', { name: 'No Update 10+ Days' }))

    await waitFor(() => expect(screen.queryByText('BK-9001')).toBeNull())
    expect(screen.getByText('BK-9007')).toBeTruthy()
  })

  it('consolidates booking ID under unit and removed buyer responses column per streamlined design', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // Booking ID is shown neatly under the unit name
    expect(screen.getByText('BK-9001')).toBeTruthy()
    // Buyer Response column is no longer in the table header
    expect(screen.queryByText('Buyer Response')).toBeNull()
  })

  it('keeps a closed booking off the Active list until Closed is selected (issue #23)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // BK-0002 is cancelled in the fixture, so it is Closed from the start.
    expect(screen.queryByText('BK-0002')).toBeNull()

    ensureFiltersOpen()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Closed (8)' }))
    expect(await screen.findByText('BK-0002')).toBeTruthy()
    expect(screen.queryByText('BK-9001')).toBeNull()
  })

  it('paginates Active and Closed separately, and switching views returns to page one (issue #23)', async () => {
    vi.mocked(fetchSnapshot).mockResolvedValueOnce(buildLargeSnapshot())
    renderBookings()

    await screen.findByRole('button', { name: 'Filters' })
    ensureFiltersOpen()
    expect(await screen.findByRole('checkbox', { name: 'Active (27)' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Closed (18)' })).toBeTruthy()
    ensureFiltersOpen()

    // Clear the Loan Admin's preset Bank holder to show all Active bookings.
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))
    fireEvent.click(screen.getByRole('button', { name: /Filter by Bank/i }))
    expect(screen.getByText('Showing 1 To 25 Of 27')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByText('Showing 26 To 27 Of 27')).toBeTruthy()

    ensureFiltersOpen()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Closed (18)' }))
    expect(screen.getByText('Showing 1 To 18 Of 18')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export To Excel' })).toBeTruthy()

    ensureFiltersOpen()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active (27)' }))
    expect(screen.getByText('Showing 1 To 25 Of 27')).toBeTruthy()
  })

  it('offers only the current tab’s stages, and resets Stage to All when switching tabs (issue M10)', async () => {
    vi.mocked(fetchSnapshot).mockResolvedValueOnce(buildLargeSnapshot())
    renderBookings()
    await screen.findByRole('button', { name: 'Filters' })

    // Clear the Bank holder preset to see all active stages.
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))
    fireEvent.click(screen.getByRole('button', { name: /Filter by Bank/i }))
    ensureFiltersOpen()
    expect(await screen.findByText('27 Bookings')).toBeTruthy()

    // Active: Booked is a real Active-tab stage — filtering by it narrows, not empties.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Booked' }))
    expect(await screen.findByText('1 Of 27 Bookings')).toBeTruthy()

    // Switching to Closed must not carry Booked over — it would show "0 Of 18",
    // same shape as the reported bug, since no closed booking is ever Booked.
    ensureFiltersOpen()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Closed (18)' }))
    expect(await screen.findByText('18 Bookings')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'All Stages' })).toBeTruthy()

    // And Closed's own Stage options never include an Active-only stage.
    expect(screen.queryByRole('checkbox', { name: 'Booked' })).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Disbursed' })).toBeTruthy()
  })

  it('does not count a booking disbursed within 30 days on the Active tab (issue L13)', async () => {
    const augmented = buildFreshDisbursedSnapshot()

    vi.mocked(fetchSnapshot).mockResolvedValueOnce(augmented)
    renderBookings()
    await screen.findByRole('button', { name: 'Filters' })

    ensureFiltersOpen()
    expect(screen.getByRole('checkbox', { name: 'Active (27)' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Closed (19)' })).toBeTruthy()
  })

  it('keeps Add Bookings on the dedicated import route', async () => {
    renderBookings()
    await screen.findByText('BK-9001')
    expect(screen.queryByRole('button', { name: 'Add Booking' })).toBeNull()
    expect(screen.queryByRole('dialog', { name: 'Add Booking' })).toBeNull()
    expect(importBookings).not.toHaveBeenCalled()
  })

  it('opens the quick view when a row is clicked (Change 7)', async () => {
    renderBookings()
    fireEvent.click(await screen.findByText('BK-9001'))

    const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!
    expect(sheet).toBeTruthy()
    expect(within(sheet).getByText('Waiting On')).toBeTruthy()
    expect(screen.queryByTestId('location')).toBeNull()
  })

  it('opens a quick view from the Waiting On cell and stays on the table', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // The sheet opens synchronously; a label query keeps the lookup cheap
    // across the whole ledger, where a role query is slow under jsdom.
    fireEvent.click(screen.getByLabelText(/^Quick View A-12-03: Waiting On/))

    const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!
    expect(sheet).toBeTruthy()
    expect(screen.queryByTestId('location')).toBeNull()
    expect(within(sheet).getByText('Waiting On')).toBeTruthy()
    expect(within(sheet).getByText('Next Step')).toBeTruthy()
    expect(within(sheet).getByRole('list', { name: 'Case Journey' })).toBeTruthy()
    expect(
      within(sheet)
        .getByRole('link', { name: /Open Full Case/ })
        .getAttribute('href')
    ).toBe('/bookings/BK-9001')
  })

  it('puts the next move on the task list from the quick view', async () => {
    renderBookings()
    await screen.findByText('BK-9001')
    fireEvent.click(screen.getByLabelText(/^Quick View A-12-03: Waiting On/))

    const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!
    await act(async () => {
      fireEvent.click(within(sheet).getByRole('button', { name: 'Add Task' }))
    })

    expect(postTask).toHaveBeenCalledTimes(1)
    expect(vi.mocked(postTask).mock.calls[0][0]).toMatchObject({ bookingId: 'BK-9001', origin: 'staff' })
  })

  it('keeps the table scrollable with compact cells so the last column cannot clip', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // Nine columns overflowed the 1280px container; the fix pairs compact
    // cell padding with a scrollable container and a clipping card wrapper.
    const container = document.querySelector('[data-slot="table-container"]')!
    expect(container.className).toContain('overflow-x-auto')
    expect(container.parentElement!.className).toContain('overflow-x-auto')
    const table = document.querySelector('[data-slot="table"]')!
    expect(table.className).toContain('[&_td]:px-2')
  })

  it('fixes the column widths, so a filter never slides the headers (issue #12)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    const table = document.querySelector('[data-slot="table"]')!
    expect(table.className).toContain('table-fixed')
    expect(table.className).toMatch(/min-w-\[\d+px\]/)
    const cols = [...table.querySelectorAll('colgroup col')] as HTMLElement[]
    expect(cols).toHaveLength(document.querySelectorAll('thead th').length)
    // Buyer alone takes the leftover width; every other column is set.
    expect(cols.filter((col) => !col.style.width)).toHaveLength(1)
  })

  it('says Task Open on a booking someone is chasing, and adds a task from the row without leaving the table', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    const chased = screen.getByLabelText(/^Task Open: Request Latest Three Months Payslips From Buyer/)
    expect(chased.closest('tr')!.textContent).toContain('BK-9001')
    expect(screen.queryByLabelText(/^Add Task For BK-9001/)).toBeNull()

    vi.mocked(postTask).mockClear()
    const add = screen.getAllByLabelText(/^Add Task For BK-/)[0]
    const bookingId = /Add Task For (BK-\d+)/.exec(add.getAttribute('aria-label')!)![1]
    await act(async () => {
      fireEvent.click(add)
    })

    expect(postTask).toHaveBeenCalledTimes(1)
    expect(vi.mocked(postTask).mock.calls[0][0]).toMatchObject({ bookingId, origin: 'staff' })
    // The row click opens quick view; the button must not.
    expect(screen.queryByTestId('location')).toBeNull()
  })

  it('renders the Who Holds Each Booking pipeline tracker under the stat cards', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    expect(screen.getByTestId('booking-pipeline-flow')).toBeTruthy()
    expect(screen.getByText('Who Holds Each Booking')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))
    expect(screen.getByRole('button', { name: /Filter by Buyer/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Bank/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Solicitor/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Signed/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Us/i })).toBeTruthy()
  })

  it('clicking a step filters by that holder, and a second click clears it (Change 3)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // Starts preset on Bank for Loan Admin (13 bookings)
    expect(screen.getByText('13 Of 20 Bookings')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    // Second click on Bank clears the filter back to all 20 active bookings
    const bankStep = screen.getByRole('button', { name: /Filter by Bank/i })
    fireEvent.click(bankStep)
    expect(await screen.findByText('20 Bookings')).toBeTruthy()

    // Clicking Buyer filters to Buyer cases (3 bookings)
    const buyerStep = screen.getByRole('button', { name: /Filter by Buyer/i })
    fireEvent.click(buyerStep)
    expect(await screen.findByText('3 Of 20 Bookings')).toBeTruthy()
    expect(screen.getByText('BK-0003')).toBeTruthy()
    expect(screen.queryByText('BK-9001')).toBeNull()
  })

  it('presets the holder filter to Buyer for Sales Admin and Solicitor for Legal Admin (Change 6)', async () => {
    const { unmount } = renderBookings('sales-admin')
    expect(await screen.findByText('3 Of 20 Bookings')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))
    expect(screen.getByRole('button', { name: /Filter by Buyer/i }).getAttribute('aria-pressed')).toBe('true')
    unmount()

    renderBookings('legal-admin')
    expect(await screen.findByText('1 Of 20 Bookings')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))
    expect(screen.getByRole('button', { name: /Filter by Solicitor/i }).getAttribute('aria-pressed')).toBe('true')
  })

  it('sums the 5 pipeline step counts to equal the Active tab count (Change 4)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // The collapsed strip displays the five holder counts: Buyer (3), Bank (13), Solicitor (1), Signed (1), Us (2)
    // 3 + 13 + 1 + 1 + 2 = 20, exactly matching Active (20)
    expect(screen.getByLabelText('Buyer: 3')).toBeTruthy()
    expect(screen.getByLabelText('Bank: 13')).toBeTruthy()
    expect(screen.getByLabelText('Solicitor: 1')).toBeTruthy()
    expect(screen.getByLabelText('Signed: 1')).toBeTruthy()
    expect(screen.getByLabelText('Us: 2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))
    expect(screen.getByRole('button', { name: /Filter by Buyer: 3/i })).toBeTruthy()
  })

  it('renders Low Risk as muted text rather than a pill (Change 7)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // Find Low Risk cells
    const lowRiskElements = screen.getAllByText('Low Risk')
    expect(lowRiskElements.length).toBeGreaterThan(0)
    for (const el of lowRiskElements) {
      expect(el.className).toContain('text-muted-foreground')
      // Must not be inside a StatusPill
      expect(el.closest('[data-tone]')).toBeNull()
    }
  })
})
