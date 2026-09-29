import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildForecastModel, type CaseEvent, type Snapshot } from '@mortar/core'
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
let current: Snapshot = SNAP

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: current, loading: false, error: null, refresh: vi.fn() }),
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
  beforeEach(() => {
    window.localStorage.clear()
    current = SNAP
  })

  it('shows the forecast answer, then the documents as a stack with their chips', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Forecast' })).toBeTruthy()
    expect(screen.getByText('Expected Signings In 30 Days')).toBeTruthy()
    expect(screen.getByText('Forecast Range')).toBeTruthy()
    expect(screen.getByText('Bookings In The Forecast')).toBeTruthy()
    const chips = screen.getByRole('group', { name: 'Choose a forecast document' })
    expect(
      within(chips)
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['Where Bookings Leak', 'Stage Conversion Rates', 'How Well The Method Backtests', 'Assumptions'])
    expect(screen.getByRole('group', { name: 'Forecast documents' })).toBeTruthy()
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('folds the rate refresh date into the lead line as one sentence', () => {
    renderPage()
    expect(screen.getByText('Expected SPA signings within 30 days of booking.')).toBeTruthy()

    current = {
      ...SNAP,
      forecastModel: buildForecastModel(
        SNAP,
        SNAP.meta.referenceDate,
        '2026-09-28T09:00:00+08:00',
        '2026-10-05T09:00:00+08:00'
      )
    }
    renderPage()
    expect(
      screen.getByText('Expected SPA signings within 30 days of booking, based on past bookings up to 28 Sep 2026.')
    ).toBeTruthy()
    expect(screen.queryByText(/Historical rates updated/)).toBeNull()
  })

  it('opens the chosen document in a dialog and restores focus after Escape', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Stage Conversion Rates' }))
    const trigger = screen.getByRole('button', { name: 'Open Document' })
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Signed / Resolved')).toBeTruthy()
    expect(within(dialog).getByText('Likely Range')).toBeTruthy()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('moves through the stack with its buttons and the arrow keys', () => {
    renderPage()
    const stack = screen.getByRole('group', { name: 'Forecast documents' })
    expect(within(stack).getByText('Document 1 Of 4')).toBeTruthy()
    fireEvent.click(screen.getAllByRole('button', { name: 'Next document' })[0]!)
    expect(within(stack).getByText('Document 2 Of 4')).toBeTruthy()
    fireEvent.keyDown(stack, { key: 'ArrowLeft' })
    fireEvent.keyDown(stack, { key: 'ArrowLeft' })
    expect(within(stack).getByText('Document 4 Of 4')).toBeTruthy()
  })

  it('asks MortarAI about the document on screen', () => {
    const asked: string[] = []
    const listen = (event: Event) => asked.push((event as CustomEvent<{ question: string }>).detail.question)
    window.addEventListener('mortar:ask', listen)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Ask MortarAI' }))
    window.removeEventListener('mortar:ask', listen)
    expect(asked).toHaveLength(1)
    expect(asked[0]).toMatch(/leaking/)
  })

  it('keeps the assumptions table folded until its own control is opened', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Assumptions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open Document' }))
    const toggle = screen.getByRole('button', { name: /Show \d+ Assumptions/ })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Hide \d+ Assumptions/ })).toBeTruthy()
    expect(screen.getByText('1 working day')).toBeTruthy()
  })

  it('adds the Seed Spread document for the Manager only', () => {
    const { unmount } = renderPage()
    expect(screen.queryByRole('button', { name: 'Seed Spread' })).toBeNull()
    unmount()
    renderPage('manager')
    expect(screen.getByRole('button', { name: 'Seed Spread' })).toBeTruthy()
    expect(screen.queryByRole('tab', { name: 'Suggestions' })).toBeNull()
  })

  it('lets the manager run another browser-only seed beside the canonical run', async () => {
    renderPage('manager')
    fireEvent.click(screen.getByRole('button', { name: 'Seed Spread' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open Document' }))
    fireEvent.click(screen.getByRole('button', { name: 'Run It Again' }))
    expect(await screen.findByText('20260919')).toBeTruthy()
    expect(screen.getByText('This Run')).toBeTruthy()
    expect(screen.getByText('Regenerated In The Browser Only; The Saved Simulation Is Untouched.')).toBeTruthy()
  })
})
