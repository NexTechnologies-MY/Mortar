/**
 * Landing page tests. jsdom lacks matchMedia, which the scroll cue's click
 * handler reads for prefers-reduced-motion, so the hoisted block stubs it —
 * matchMedia answers false, meaning full motion.
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
})

const renderLanding = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <LandingPage />
    </MemoryRouter>
  )

describe('landing page', () => {
  // The theme switch lives in the app shell only; the public pages fix the
  // reader's theme at the system preference.
  it('carries no theme switch', () => {
    renderLanding()
    expect(screen.queryByRole('button', { name: /theme/i })).toBeNull()
  })

  it('names the three desks in the desk index', () => {
    const { container } = renderLanding()
    const desks = within(container.querySelector<HTMLElement>('.land-desks')!)
    expect(desks.getByRole('heading', { name: 'Chase List' })).toBeTruthy()
    expect(desks.getByRole('heading', { name: 'Bookings' })).toBeTruthy()
    expect(desks.getByRole('heading', { name: 'Forecast' })).toBeTruthy()
  })

  it('keeps the page to a single primary action', () => {
    renderLanding()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('leads to sign-in as the only way in', () => {
    renderLanding()
    expect(screen.getByRole('link', { name: 'Open Mortar' }).getAttribute('href')).toBe('/sign-in')
  })

  it('offers a scroll cue past the one-viewport hero', () => {
    renderLanding()
    expect(screen.getByRole('button', { name: 'Scroll' })).toBeTruthy()
  })

  it('marks the sample ledger as an illustration so its figures are not read as the real book', () => {
    renderLanding()
    expect(screen.getByText(/These figures are illustrative/i)).toBeTruthy()
  })
})
