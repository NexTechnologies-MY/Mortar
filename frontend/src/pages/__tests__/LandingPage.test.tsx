/**
 * Landing page tests. jsdom lacks matchMedia (the theme hook calls it) and
 * requestAnimationFrame (the theme's class flip), so the hoisted block stubs
 * the browser floor before the imports evaluate — matchMedia answers false, so
 * the resolved theme is light.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import { LandingPage } from '@/pages/LandingPage'

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

const renderLanding = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    </MemoryRouter>
  )

describe('landing page', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('offers the theme switch on the landing page, named for the theme it will set', () => {
    renderLanding()
    expect(screen.getByRole('button', { name: 'Switch to the dark theme' })).toBeTruthy()
  })

  it('names the three surfaces as the three features', () => {
    const { container } = renderLanding()
    const desks = within(container.querySelector<HTMLElement>('.land-desks')!)
    expect(desks.getByRole('heading', { name: 'Chase List' })).toBeTruthy()
    expect(desks.getByRole('heading', { name: 'Bookings' })).toBeTruthy()
    expect(desks.getByRole('heading', { name: 'Forecast' })).toBeTruthy()
  })

  it('keeps the page to a single primary action, which sits below the claim rather than in the header', () => {
    const { container } = renderLanding()
    const head = within(container.querySelector<HTMLElement>('.land-head')!)
    expect(head.queryAllByRole('link')).toHaveLength(0)
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('leads to sign-in as the only way in', () => {
    renderLanding()
    expect(screen.getByRole('link', { name: 'Open Mortar' }).getAttribute('href')).toBe('/sign-in')
  })

  it('marks the sample ledger as an illustration so its figures are not read as the real book', () => {
    renderLanding()
    expect(screen.getByText(/These figures are illustrative/i)).toBeTruthy()
  })
})
