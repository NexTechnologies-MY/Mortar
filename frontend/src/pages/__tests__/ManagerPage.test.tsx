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

  it('opens on the all-department overview with counts and folded details', () => {
    render(
      <MemoryRouter>
        <PersonaProvider>
          <ManagerPage />
        </PersonaProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeTruthy()
    expect(screen.getByText('The bookings that need your attention, across every department.')).toBeTruthy()
    expect(screen.getByText('Manager Tasks Open')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Suggestions' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Bookings Needing A Move (0)' })).toBeTruthy()
    expect(screen.queryByText('No Bookings Need A Move.')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Bookings Needing A Move (0)' }))
    expect(screen.getByText('No Bookings Need A Move.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Forecast Detail' }))
    expect(screen.getByRole('link', { name: 'Open Forecast' }).getAttribute('href')).toBe('/forecast')
  })
})
