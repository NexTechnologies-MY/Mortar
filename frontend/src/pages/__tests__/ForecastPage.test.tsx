import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

// Radix positions tooltip content with floating-ui, which needs observers jsdom lacks.
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

function renderPage() {
  return render(
    <MemoryRouter>
      <ForecastPage />
    </MemoryRouter>
  )
}

/** The (i) trigger inside the element holding `label`. */
function infoTrigger(label: string) {
  const host = screen.getAllByText(label).find((el) => el.querySelector('button'))!
  return within(host).getByRole('button')
}

describe('ForecastPage', () => {
  it('opens on the answer: headline tiles, stage rates and the backtest', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Forecast' })).toBeTruthy()
    expect(screen.getByText('Expected Signings In 30 Days')).toBeTruthy()
    expect(screen.getByText('Forecast Range')).toBeTruthy()
    expect(screen.getAllByText('Live Bookings').length).toBeGreaterThan(0)
    expect(screen.getByText('Stage Conversion Rates')).toBeTruthy()
    expect(screen.getByText('A Backtest On Simulated Data Proves The Method, Not The Business.')).toBeTruthy()
    expect(screen.getByText('Assumptions')).toBeTruthy()
    expect(screen.getByText('Placeholder To Calibrate On Company Data')).toBeTruthy()
  })

  it('folds the assumptions table behind one control that names the count', () => {
    renderPage()
    const toggle = screen.getByRole('button', { name: /Show \d+ Assumptions/ })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('1 working day')).toBeNull()

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Hide \d+ Assumptions/ })).toBeTruthy()
    expect(screen.getByText('1 working day')).toBeTruthy()
  })

  it('renders singular units for assumption values of one once expanded', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Show \d+ Assumptions/ }))
    expect(screen.queryByText('1 days')).toBeNull()
    expect(screen.queryByText('1 working days')).toBeNull()
    expect(screen.getByText('1 working day')).toBeTruthy()
  })

  it('moves tile second lines and notes into info tooltips beside their labels', () => {
    renderPage()
    expect(screen.queryByText('Unsigned And Under 30 Days Old')).toBeNull()
    expect(screen.queryByText('Mean Squared Error, Lower Is Better')).toBeNull()
    expect(screen.queryByText(/Approval Falls As The Debt Service Ratio Rises/)).toBeNull()

    for (const label of ['Live Bookings', 'Forecast Range', 'Brier Score', 'Rate', '95% Interval']) {
      expect(infoTrigger(label)).toBeTruthy()
    }
  })

  it('Try Another Seed adds a browser-only run beside the canonical forecast', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Try Another Seed' }))
    await waitFor(() => expect(screen.getByText('20260919')).toBeTruthy())
    expect(screen.getByText('Canonical')).toBeTruthy()
    expect(screen.getByText('Regenerated In The Browser Only; The Saved Simulation Is Untouched.')).toBeTruthy()
  })

  it('opens the info tooltip on keyboard focus, like every other tooltip', () => {
    renderPage()
    // React delegates onFocus to the bubbling focusin event; Radix opens on it.
    fireEvent.focusIn(infoTrigger('Live Bookings'))
    expect(screen.getByText('Unsigned and under 30 days old.')).toBeTruthy()
  })
})
