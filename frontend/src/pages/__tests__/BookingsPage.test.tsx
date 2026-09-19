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

  it('renders the stats and every booking row', async () => {
    renderBookings()

    expect(await screen.findByRole('heading', { name: 'Bookings' })).toBeTruthy()
    expect(screen.getByText('Live Bookings')).toBeTruthy()
    expect(screen.getByText('Stalled')).toBeTruthy()
    expect(screen.getAllByText('SPA Signed').length).toBeGreaterThan(0)
    expect(screen.getByText('BK-9001')).toBeTruthy()
    expect(screen.getByText('A-12-03')).toBeTruthy()
    expect(screen.getByText('Raymond Tan Wei Hong')).toBeTruthy()
    expect(screen.getByText('28 Bookings')).toBeTruthy()
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
})
