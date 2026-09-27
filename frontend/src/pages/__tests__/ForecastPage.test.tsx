import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaseEvent, Snapshot } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { booking, snapshot } from './mockSnapshot'

const evidence = (id: string, bookingId: string, kind: CaseEvent['kind'], occurredAt: string): CaseEvent => ({
  id,
  bookingId,
  applicationId: null,
  track: kind === 'spa_signed' ? 'legal' : 'loan',
  kind,
  occurredAt: `${occurredAt}T10:00:00+08:00`,
  recordedAt: `${occurredAt}T10:05:00+08:00`,
  reportedBy: 'Fixture',
  verifiedBy: 'Nurul Aina',
  status: 'confirmed',
  source: 'generator',
  messageId: null,
  document: null,
  note: null
})

const SNAP: Snapshot = snapshot({
  bookings: [
    booking('BK-9001'),
    booking('BK-0040', { unit: 'A-15-05', priceRm: 756000 }),
    booking('BK-0001', { unit: 'B-01-01', priceRm: 480000, bookingDate: '2026-07-10' })
  ],
  events: [evidence('EV-1', 'BK-0001', 'booked', '2026-07-10'), evidence('EV-2', 'BK-0001', 'spa_signed', '2026-07-28')]
})

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: SNAP, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => []
}))

import { ForecastPage } from '@/pages/ForecastPage'

for (const observer of ['ResizeObserver', 'IntersectionObserver'] as const) {
  vi.stubGlobal(
    observer,
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
}

function renderPage(profile = 'sales-nurul-aina') {
  window.localStorage.setItem('mortar.profile', profile)
  return render(
    <MemoryRouter>
      <PersonaProvider>
        <ForecastPage />
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('ForecastPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows the forecast answer and folds detail into disclosures', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Forecast' })).toBeTruthy()
    expect(screen.getByText('Expected Signings In 30 Days')).toBeTruthy()
    expect(screen.getByText('Forecast Range')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Where Bookings Leak' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Stage Conversion Rates' })).toBeTruthy()
    expect(screen.queryByText('Booking Leakage')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Run It Again' })).toBeNull()
  })

  it('opens forecast details in place without a document stack or dialog', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Stage Conversion Rates' }))
    expect(screen.getByText('Signed / Resolved')).toBeTruthy()
    expect(screen.getByText('Likely Range')).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps the assumptions table folded until its own control is opened', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }))
    const toggle = screen.getByRole('button', { name: /Show \d+ Assumptions/ })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Hide \d+ Assumptions/ })).toBeTruthy()
    expect(screen.getByText('1 working day')).toBeTruthy()
  })

  it('shows the manager suggestions desk only for the manager profile', () => {
    const { unmount } = renderPage()
    expect(screen.queryByRole('tab', { name: 'Suggestions' })).toBeNull()
    unmount()
    renderPage('manager')
    expect(screen.getByRole('tab', { name: 'Suggestions' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Suggestions' }).getAttribute('aria-selected')).toBe('false')
  })

  it('lets the manager run another browser-only seed beside the canonical run', async () => {
    renderPage('manager')
    fireEvent.click(screen.getByRole('button', { name: 'Seed Spread' }))
    fireEvent.click(screen.getByRole('button', { name: 'Run It Again' }))
    expect(await screen.findByText('20260919')).toBeTruthy()
    expect(screen.getByText('This Run')).toBeTruthy()
    expect(screen.getByText('Regenerated In The Browser Only; The Saved Simulation Is Untouched.')).toBeTruthy()
  })
})
