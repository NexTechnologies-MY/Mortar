import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { postTask } from '@/lib/api'
import { BookingsPage } from '@/pages/BookingsPage'

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
    updateTask: vi.fn(async () => ({}))
  }
})

function LocationEcho() {
  return <div data-testid="location">{useLocation().pathname}</div>
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

  it('renders the stats and the first page of booking rows', async () => {
    renderBookings()

    expect(await screen.findByRole('heading', { name: 'Bookings' })).toBeTruthy()
    expect(screen.getByText('Live Bookings')).toBeTruthy()
    // The explanatory second line moved into a tooltip on the figure.
    expect(screen.queryByText('Unresolved, Booked Within 30 Days')).toBeNull()
    expect(screen.getByText('Stalled')).toBeTruthy()
    expect(screen.getAllByText('SPA Signed').length).toBeGreaterThan(0)
    expect(screen.getByText('BK-9001')).toBeTruthy()
    expect(screen.getByText('A-12-03')).toBeTruthy()
    expect(screen.getByText('Raymond Tan Wei Hong')).toBeTruthy()
    expect(screen.getByText('28 Bookings')).toBeTruthy()
    expect(screen.getByText('Showing 1 To 25 Of 28')).toBeTruthy()
  })

  it('pages the table and returns to page one when a filter changes', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByText('Showing 26 To 28 Of 28')).toBeTruthy()
    expect(document.querySelectorAll('tbody tr')).toHaveLength(3)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Unknown Only' }))
    expect(screen.getByText(/Showing 1 To/)).toBeTruthy()
    expect(screen.getByText('BK-9007')).toBeTruthy()
  })

  it('sorts stalled bookings first', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    const firstRow = document.querySelector('tbody tr')!
    expect(firstRow.children[3].className).toContain('text-status-danger-fg')
  })

  it('keeps only unknown cases when the filter is on', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    fireEvent.click(screen.getByRole('checkbox', { name: 'Unknown Only' }))

    await waitFor(() => expect(screen.queryByText('BK-9001')).toBeNull())
    expect(screen.getByText('BK-9007')).toBeTruthy()
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
