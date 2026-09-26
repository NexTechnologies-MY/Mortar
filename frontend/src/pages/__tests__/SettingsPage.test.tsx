import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Snapshot } from '@mortar/core'
import { snapshot } from './mockSnapshot'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  resetDemo: vi.fn(),
  fetchHealth: vi.fn()
}))

const SNAP: Snapshot = snapshot()

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: SNAP, loading: false, error: null, refresh: mocks.refresh }),
  useCases: () => []
}))

vi.mock('@/lib/api', () => ({
  resetDemo: mocks.resetDemo,
  fetchHealth: mocks.fetchHealth
}))

vi.mock('@/components/ui/toastConfig', () => ({
  notify: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}))

import { SettingsPage } from '@/pages/SettingsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  )
}

describe('SettingsPage', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.fetchHealth.mockResolvedValue({ ok: true, db: true, jev: true, assistant: true, jevAnswers: 87 })
    mocks.resetDemo.mockResolvedValue({
      seed: 20260918,
      referenceDate: '2026-09-18',
      resetAt: '2026-09-18T05:00:00+08:00'
    })
  })

  it('shows the demo-data identity, record counts and Jev status', async () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy()
    expect(screen.getByText('Demo Data')).toBeTruthy()
    expect(screen.getByText('20260918')).toBeTruthy()
    expect(screen.getByText('18 Sep 2026')).toBeTruthy()
    expect(screen.getByText('Bookings')).toBeTruthy()
    expect(screen.getByText('Jev Answers')).toBeTruthy()
    await waitFor(() => expect(mocks.fetchHealth).toHaveBeenCalled())
  })

  it('states the simulated-data fact plainly beside the seed and reference date', () => {
    renderPage()
    expect(screen.getByText('Simulated Data')).toBeTruthy()
    expect(screen.getByText('Seed')).toBeTruthy()
    expect(screen.getByText('Reference Date')).toBeTruthy()
  })

  it('reports the stored jev_answers count from health, not the snapshot views', async () => {
    renderPage()
    // The snapshot carries zero extractions/signals/nextActions; the stored
    // count of 87 must come from /api/health, and the row shows '—' until then.
    const row = (await screen.findByText('Jev Answers')).closest('div')!
    await waitFor(() => expect(within(row).getByText('87')).toBeTruthy())
  })

  it('words the Jev line as a configured key, not a live connection', async () => {
    renderPage()
    const note = await screen.findByText('Whether A TypeSafe API Key Is Configured')
    const row = note.closest('div')!.parentElement!
    expect(within(row).getByText('Configured')).toBeTruthy()
    expect(within(row).queryByText('Connected')).toBeNull()
  })

  it('says whether Ask Mortar has a Gemini key, in the Jev row’s own words', async () => {
    renderPage()
    const note = await screen.findByText('Whether A Gemini Key Is Configured')
    const row = note.closest('div')!.parentElement!
    // The panel falls back to its own answers without a key, so the row says
    // so rather than reporting a failure.
    expect(within(row).getByText('Configured')).toBeTruthy()
    expect(within(row).queryByText('Connected')).toBeNull()
  })

  it('reports a missing Gemini key as Missing, beside a working Jev', async () => {
    mocks.fetchHealth.mockResolvedValue({ ok: true, db: true, jev: true, assistant: false, jevAnswers: 87 })
    renderPage()

    const jevRow = (await screen.findByText('Whether A TypeSafe API Key Is Configured')).closest('div')!.parentElement!
    const askRow = (await screen.findByText('Whether A Gemini Key Is Configured')).closest('div')!.parentElement!
    expect(within(jevRow).getByText('Configured')).toBeTruthy()
    expect(within(askRow).getByText('Missing')).toBeTruthy()
  })

  it('re-checks health after a reset', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Reset Demo Data' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset Demo Data' }))
    await waitFor(() => expect(mocks.fetchHealth).toHaveBeenCalledTimes(2))
  })

  it('resets the demo behind a confirm dialog, then refreshes', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Reset Demo Data' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('Reset Demo Data?')
    expect(mocks.resetDemo).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset Demo Data' }))
    await waitFor(() => expect(mocks.resetDemo).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
  })
})
