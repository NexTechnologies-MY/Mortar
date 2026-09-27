import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PersonaProvider } from '@/lib/persona'
import { snapshot } from './mockSnapshot'

const SNAP = snapshot()
vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: SNAP, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => []
}))
vi.mock('@/lib/api', () => ({ postTask: vi.fn() }))

import { ManagerPage } from '@/pages/ManagerPage'

describe('ManagerPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem('mortar.profile', 'manager')
  })

  it('opens Suggestions first and keeps Overview cases visible without forecast detail', () => {
    render(
      <MemoryRouter>
        <PersonaProvider>
          <ManagerPage />
        </PersonaProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Manager' })).toBeTruthy()
    expect(screen.getByText('The bookings that need your attention, across every department.')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Suggestions' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Overview' }), { button: 0, ctrlKey: false })
    expect(screen.getByText('Manager Tasks Open')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Bookings Needing A Move (0)' })).toBeTruthy()
    expect(screen.getByText('No Bookings Need A Move.')).toBeTruthy()
    expect(screen.queryByText('Forecast Detail')).toBeNull()
  })
})
