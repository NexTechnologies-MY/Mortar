import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { CaseEvent, Snapshot } from '@mortar/core'
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

function renderPage() {
  return render(
    <MemoryRouter>
      <ForecastPage />
    </MemoryRouter>
  )
}

describe('ForecastPage', () => {
  it('renders the headline, stage rates, backtest and assumptions', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Forecast' })).toBeTruthy()
    expect(screen.getByText('Expected Signings In 30 Days')).toBeTruthy()
    expect(screen.getByText('Forecast Range')).toBeTruthy()
    expect(screen.getByText('Unsigned And Under 30 Days Old')).toBeTruthy()
    expect(screen.getByText('Stage Conversion Rates')).toBeTruthy()
    expect(screen.getByText('A Backtest On Simulated Data Proves The Method, Not The Business.')).toBeTruthy()
    expect(screen.getByText('Assumptions')).toBeTruthy()
    expect(screen.getByText(/Placeholder To Calibrate On Company Data/)).toBeTruthy()
  })

  it('Try Another Seed adds a browser-only run beside the canonical forecast', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Try Another Seed' }))
    await waitFor(() => expect(screen.getByText('20260919')).toBeTruthy())
    expect(screen.getByText('Canonical')).toBeTruthy()
    expect(screen.getByText('Regenerated In The Browser Only; The Saved Simulation Is Untouched.')).toBeTruthy()
  })
})
