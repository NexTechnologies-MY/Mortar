import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PersonaProvider } from '@/lib/persona'
import { ThemeProvider } from '@/hooks/useTheme'
import { AppNav } from '../AppNav'

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: null, loading: false, error: null, refresh: vi.fn() })
}))

// jsdom lacks matchMedia, which the theme hook calls for the system theme.
vi.hoisted(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }) as unknown as MediaQueryList
  window.requestAnimationFrame = (callback: FrameRequestCallback) => window.setTimeout(callback, 0)
})

function renderNav(path = '/bookings/BK-9001') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PersonaProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/bookings/:id" element={<AppNav onMenuClick={() => {}} />} />
            <Route path="*" element={<AppNav onMenuClick={() => {}} />} />
          </Routes>
        </ThemeProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('AppNav', () => {
  it('shows the bare booking id as the mobile crumb so it never truncates', () => {
    renderNav()

    // The sm:hidden crumb renders `BK-9001`; the full `Booking BK-9001`
    // stays in the desktop breadcrumb row.
    expect(screen.getByText('BK-9001')).toBeTruthy()
    expect(screen.getByText('Booking BK-9001')).toBeTruthy()
  })

  it('keeps the route label as the mobile crumb on plain routes', () => {
    renderNav('/bookings')

    expect(screen.getAllByText('Bookings').length).toBeGreaterThan(0)
  })

  it('does not carry the simulated-data badge; the seed and date live on /settings', () => {
    renderNav()

    expect(screen.queryByText(/Simulated Data/)).toBeNull()
  })
})
