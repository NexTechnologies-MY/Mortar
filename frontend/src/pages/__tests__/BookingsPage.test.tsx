import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import {
  DEFAULT_SEED,
  PLAYBOOKS,
  REFERENCE_DATE,
  generate,
  summarizeCases,
  type CaseEvent,
  type Booking,
  type Snapshot
} from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { fetchSnapshot, importBookings, postTask } from '@/lib/api'
import { BookingsPage } from '@/pages/BookingsPage'

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
    updateTask: vi.fn(async () => ({})),
    importBookings: vi.fn(async () => ({ importId: 'IMP-TEST', bookings: [] }))
  }
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
      freshEvent('disbursed', '2026-09-12T09:00:00+08:00')
    ]
  }
}

function LocationEcho() {
  return <div data-testid="location">{useLocation().pathname}</div>
}

/** Radix Tabs activates on `mousedown`, not `click` — a plain `fireEvent.click` never switches the tab. */
function clickTab(el: HTMLElement) {
  fireEvent.mouseDown(el, { button: 0 })
  fireEvent.click(el)
}

function renderBookings() {
  return render(
    <MemoryRouter initialEntries={['/bookings']}>
      <PersonaProvider>
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

describe('BookingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the stats, the Active/Closed tabs and the first page of booking rows', async () => {
    renderBookings()

    expect(await screen.findByRole('heading', { name: 'Bookings' })).toBeTruthy()
    expect(screen.getByText('Live Bookings')).toBeTruthy()
    // The explanatory second line moved into a tooltip on the figure.
    expect(screen.queryByText('Unresolved, Booked Within 30 Days')).toBeNull()
    expect(screen.getByText('Stalled')).toBeTruthy()
    // The renamed stat label and the renamed checkbox both read "No Update 10+ Days" (issue #22).
    expect(screen.getAllByText('No Update 10+ Days').length).toBe(2)
    expect(screen.getAllByText('SPA Signed').length).toBeGreaterThan(0)
    expect(screen.getByText('BK-9001')).toBeTruthy()
    expect(screen.getByText('A-12-03')).toBeTruthy()
    expect(screen.getByText('Raymond Tan Wei Hong')).toBeTruthy()
    // 28 bookings in the fixture split 20 Active / 8 Closed (issue #23); the
    // ledger and its count default to the Active tab.
    expect(screen.getByRole('tab', { name: 'Active (20)' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Closed (8)' })).toBeTruthy()
    expect(screen.getByText('20 Bookings')).toBeTruthy()
    expect(screen.getByText('Showing 1 To 20 Of 20')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add Booking' })).toBeTruthy()
  })

  it('sorts stalled bookings first', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    const firstRow = document.querySelector('tbody tr')!
    expect(firstRow.children[3].className).toContain('text-status-danger-fg')
  })

  it('keeps only unknown cases when the renamed filter is on (issue #22)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    fireEvent.click(screen.getByRole('checkbox', { name: 'No Update 10+ Days' }))

    await waitFor(() => expect(screen.queryByText('BK-9001')).toBeNull())
    expect(screen.getByText('BK-9007')).toBeTruthy()
  })

  it('shows muted "No Messages Yet" instead of a dash for a booking with no buyer signals (issue #21)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // Only BK-9001 carries a signals fixture; every other visible row falls back to this text.
    expect(screen.getAllByText('No Messages Yet').length).toBeGreaterThan(0)
  })

  it('keeps a closed booking off the Active list until Closed is selected (issue #23)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // BK-0002 is cancelled in the fixture, so it is Closed from the start.
    expect(screen.queryByText('BK-0002')).toBeNull()

    clickTab(screen.getByRole('tab', { name: 'Closed (8)' }))
    expect(await screen.findByText('BK-0002')).toBeTruthy()
    expect(screen.queryByText('BK-9001')).toBeNull()
  })

  it('paginates Active and Closed separately, and switching views returns to page one (issue #23)', async () => {
    vi.mocked(fetchSnapshot).mockResolvedValueOnce(buildLargeSnapshot())
    renderBookings()

    expect(await screen.findByRole('tab', { name: 'Active (27)' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Closed (18)' })).toBeTruthy()
    expect(screen.getByText('Showing 1 To 25 Of 27')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByText('Showing 26 To 27 Of 27')).toBeTruthy()

    clickTab(screen.getByRole('tab', { name: 'Closed (18)' }))
    expect(screen.getByText('Showing 1 To 18 Of 18')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export To Excel' })).toBeTruthy()

    clickTab(screen.getByRole('tab', { name: 'Active (27)' }))
    expect(screen.getByText('Showing 1 To 25 Of 27')).toBeTruthy()
  })

  it('offers only the current tab’s stages, and resets Stage to All when switching tabs (issue M10)', async () => {
    vi.mocked(fetchSnapshot).mockResolvedValueOnce(buildLargeSnapshot())
    renderBookings()
    await screen.findByRole('tab', { name: 'Active (27)' })

    // Active: Booked is a real Active-tab stage — filtering by it narrows, not empties.
    fireEvent.click(screen.getByLabelText('Filter By Stage'))
    fireEvent.click(screen.getByRole('option', { name: 'Booked' }))
    expect(await screen.findByText('1 Of 27 Bookings')).toBeTruthy()

    // Switching to Closed must not carry Booked over — it would show "0 Of 18",
    // same shape as the reported bug, since no closed booking is ever Booked.
    clickTab(screen.getByRole('tab', { name: 'Closed (18)' }))
    expect(await screen.findByText('18 Bookings')).toBeTruthy()
    expect(screen.getByLabelText('Filter By Stage').textContent).toContain('All Stages')

    // And Closed's own Stage options never include an Active-only stage.
    fireEvent.click(screen.getByLabelText('Filter By Stage'))
    expect(screen.queryByRole('option', { name: 'Booked' })).toBeNull()
    expect(screen.getByRole('option', { name: 'Disbursed' })).toBeTruthy()
  })

  it('does not count a booking disbursed within 30 days as both Live and Closed (issue L13)', async () => {
    const augmented = buildFreshDisbursedSnapshot()
    // The ground truth: disbursed is resolved regardless of age, same as spa_signed/cancelled/lapsed.
    const trulyResolved = new Set(['spa_signed', 'disbursed', 'cancelled', 'lapsed'])
    const expectedLive = summarizeCases(
      { bookings: augmented.bookings, applications: augmented.applications, events: augmented.events, tasks: [] },
      augmented.meta.referenceDate
    ).filter((c) => !trulyResolved.has(c.stage) && c.bookingAgeDays < 30).length

    vi.mocked(fetchSnapshot).mockResolvedValueOnce(augmented)
    renderBookings()
    await screen.findByRole('tab', { name: 'Closed (19)' })

    const liveFigure = screen.getByText('Live Bookings').closest('div')!.querySelector('p.text-3xl')!.textContent
    expect(liveFigure).toBe(String(expectedLive))
  })

  it('opens Add Booking and checks a typed unit against the real held units (issue #24)', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    fireEvent.click(screen.getByRole('button', { name: 'Add Booking' }))
    expect(await screen.findByRole('heading', { name: 'Add Booking' })).toBeTruthy()

    // BK-0001 holds C-24-05 under the fixture's main project; typing it in must
    // read the page's real held-unit map, not an empty one.
    const unitField = screen.getByLabelText(/^Unit/)
    fireEvent.change(unitField, { target: { value: 'C-24-05' } })
    fireEvent.blur(unitField)
    expect(await screen.findByText('Unit Already Held By BK-0001')).toBeTruthy()

    expect(importBookings).not.toHaveBeenCalled()
  })

  it('opens the case page when a row is clicked', async () => {
    renderBookings()
    fireEvent.click(await screen.findByText('BK-9001'))

    expect(screen.getByTestId('location').textContent).toBe('/bookings/BK-9001')
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
    expect(within(sheet).getByText('Next Move')).toBeTruthy()
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
    expect(container.parentElement!.className).toContain('overflow-hidden')
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
    // The row opens the case page; the button must not.
    expect(screen.queryByTestId('location')).toBeNull()
  })
})
