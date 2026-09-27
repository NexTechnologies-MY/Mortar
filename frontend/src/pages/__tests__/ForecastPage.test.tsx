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

describe('ForecastPage', () => {
  it('keeps the forecast answer visible above the document stack', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Forecast' })).toBeTruthy()
    expect(screen.getByText('Expected Signings In 30 Days')).toBeTruthy()
    expect(screen.getByText('Forecast Range')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Forecast Documents' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Expected Signings' })).toBeTruthy()
    expect(screen.queryByText('How Often Each Stage Reaches Signing')).toBeNull()
  })

  it('opens a selected document in a labelled paper dialog and closes it with Escape', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Where Bookings Leak/ }))
    expect(screen.getByRole('dialog', { name: 'Where Bookings Leak' })).toBeTruthy()
    expect(screen.getByText(/bookings worth/)).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('moves the selected document with arrow keys and swipe gestures', () => {
    renderPage()
    const stack = screen.getByRole('group', { name: 'Forecast documents' })
    const expected = within(stack).getByRole('button')
    fireEvent.keyDown(stack, { key: 'ArrowRight' })
    expect(within(stack).getByRole('button').getAttribute('aria-label')).toContain('Where Bookings Leak')
    fireEvent.keyDown(stack, { key: 'ArrowLeft' })
    expect(expected.getAttribute('aria-current')).toBe('true')
    fireEvent.touchStart(stack, { touches: [{ clientX: 220 }] })
    fireEvent.touchEnd(stack, { changedTouches: [{ clientX: 40 }] })
    expect(within(stack).getByRole('button').getAttribute('aria-label')).toContain('Where Bookings Leak')
  })

  it('opens the expected-signings document with its range and live booking count', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Expected Signings' }))
    const dialog = screen.getByRole('dialog', { name: 'Expected Signings' })
    expect(within(dialog).getByText('Bookings In The Forecast')).toBeTruthy()
    expect(within(dialog).getByText(/\d+ – \d+/)).toBeTruthy()
  })

  it('keeps metric explanations available by keyboard inside documents', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Expected Signings' }))
    const dialog = screen.getByRole('dialog', { name: 'Expected Signings' })
    const label = within(dialog).getByText('Bookings In The Forecast')
    fireEvent.focusIn(within(label).getByRole('button'))
    expect(screen.getByText('Unsigned and under 30 days old.')).toBeTruthy()
  })

  it('folds the assumptions table behind one control that names the count', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }))
    const toggle = screen.getByRole('button', { name: /Show \d+ Assumptions/ })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('1 working day')).toBeNull()

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Hide \d+ Assumptions/ })).toBeTruthy()
    expect(screen.getByText('1 working day')).toBeTruthy()
  })

  it('renders singular units for assumption values of one once expanded', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }))
    fireEvent.click(screen.getByRole('button', { name: /Show \d+ Assumptions/ }))
    expect(screen.queryByText('1 days')).toBeNull()
    expect(screen.queryByText('1 working days')).toBeNull()
    expect(screen.getByText('1 working day')).toBeTruthy()
  })

  it('displays a plain-language accuracy sentence on how close the forecast came', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'How Well The Method Backtests' }))
    expect(
      screen.getByText(/(The forecast matched actual signings exactly|The forecast came within \d+ signing)/)
    ).toBeTruthy()
    expect(screen.queryByText(/Accuracy Score/)).toBeNull()
  })

  it('Run It Again adds a browser-only run beside the canonical forecast', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Seed Spread' }))
    fireEvent.click(screen.getByRole('button', { name: 'Run It Again' }))
    await waitFor(() => expect(screen.getByText('20260919')).toBeTruthy())
    expect(screen.getByText('This Run')).toBeTruthy()
    expect(screen.getByText('Regenerated In The Browser Only; The Saved Simulation Is Untouched.')).toBeTruthy()
  })
})
