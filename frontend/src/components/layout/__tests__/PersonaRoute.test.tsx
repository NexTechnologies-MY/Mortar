import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PERSONA_STORAGE_KEY, PersonaProvider } from '@/lib/persona'
import { PersonaRoute } from '../PersonaRoute'

const mocks = vi.hoisted(() => ({ warning: vi.fn() }))

vi.mock('@/components/ui/toastConfig', () => ({
  notify: { warning: mocks.warning, success: vi.fn(), error: vi.fn(), info: vi.fn() }
}))

function LocationEcho() {
  return <div data-testid="location">{useLocation().pathname}</div>
}

/** Mirrors how `App.tsx` mounts the guard: one wrapper route over the desks. */
function renderGuarded(path: string, persona?: string) {
  if (persona) window.localStorage.setItem(PERSONA_STORAGE_KEY, persona)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PersonaProvider>
        <LocationEcho />
        <Routes>
          <Route
            path="*"
            element={
              <PersonaRoute>
                <div data-testid="guarded">The Page</div>
              </PersonaRoute>
            }
          />
        </Routes>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('PersonaRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it.each([
    ['/chase', 'sales-admin'],
    ['/bookings', 'loan-admin'],
    ['/legal', 'legal-admin'],
    ['/forecast', 'sales-admin'],
    ['/settings', 'legal-admin']
  ])('lets %s through for %s', (path, persona) => {
    renderGuarded(path, persona)

    expect(screen.getByTestId('guarded')).toBeTruthy()
    expect(mocks.warning).not.toHaveBeenCalled()
  })

  it('sends Sales Admin from the Legal desk to their own home and says why', () => {
    renderGuarded('/legal', 'sales-admin')

    // Sales Admin's own home is Today, which they are allowed to open, so the
    // redirect lands there rather than on a dead route.
    expect(screen.getByTestId('location').textContent).toBe('/chase')
    expect(mocks.warning).toHaveBeenCalledWith('Legal Is On The Sales Admin Desk')
  })

  it('keeps Add Bookings to Sales Admin', () => {
    renderGuarded('/import', 'loan-admin')

    expect(screen.getByTestId('location').textContent).toBe('/bookings')
    expect(mocks.warning).toHaveBeenCalledWith('Add Bookings Is On The Loan Admin Desk')
  })

  it('lets a Loan Admin see Legal’s home, since both roles share Today and Forecast', () => {
    renderGuarded('/chase', 'loan-admin')
    expect(screen.getByTestId('guarded')).toBeTruthy()
  })
})
