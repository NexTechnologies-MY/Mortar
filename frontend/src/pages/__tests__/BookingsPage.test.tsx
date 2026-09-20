import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
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

  it('keeps the table scrollable with compact cells so the last column cannot clip', async () => {
    renderBookings()
    await screen.findByText('BK-9001')

    // Nine columns overflowed the 1280px container; the fix pairs compact
    // cell padding with a scrollable container and a clipping card wrapper.
    const container = document.querySelector('[data-slot="table-container"]')!
    expect(container.className).toContain('overflow-x-auto')
    expect(container.parentElement!.className).toContain('overflow-hidden')
    const table = document.querySelector('[data-slot="table"]')!
    expect(table.className).toContain('[&_td]:px-3')
  })
})
