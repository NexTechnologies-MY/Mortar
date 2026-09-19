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
    mocks.fetchHealth.mockResolvedValue({ ok: true, db: true, jev: true })
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
