/**
 * Landing page tests. The page carries no interactive chrome — the theme
 * switch lives in the app shell only — so it renders under MemoryRouter alone.
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'

const renderLanding = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <LandingPage />
    </MemoryRouter>
  )

describe('landing page', () => {
  it('states the claim', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1, name: /Booked Is Not Sold/ })).toBeTruthy()
  })

  it('carries no buttons — the theme switch lives in the app shell only', () => {
    renderLanding()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('walks the three moments: the stall, the update, the forecast', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: 'The Stuck Booking, Found' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'A Message Becomes A Confirmed Update' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'A Number Finance Can Sign Off' })).toBeTruthy()
  })

  it('anchors the hero and each moment to a real screenshot, captioned as simulated data', () => {
    const { container } = renderLanding()
    const shots = [...container.querySelectorAll<HTMLElement>('.land-shot')]

    expect(shots).toHaveLength(4)
    for (const shot of shots) {
      // Every capture ships in both themes; CSS paints the active one.
      expect(shot.querySelectorAll('img').length).toBeGreaterThanOrEqual(2)
      expect(shot.querySelector('.land-cap')?.textContent).toMatch(/Simulated data/i)
    }
  })

  it('keeps the hero to exactly one viewport and gives a deliberate cue past it', () => {
    const { container } = renderLanding()

    expect(container.querySelector('.land-hero')).toBeTruthy()
    expect(container.querySelector('#land-story')).toBeTruthy()
    const cue = screen.getByRole('link', { name: 'The Work' })
    expect(cue.getAttribute('href')).toBe('#land-story')
  })

  it('leads to sign-in as the only call to action', () => {
    renderLanding()
    const ctas = screen.getAllByRole('link', { name: 'Open Mortar' })

    expect(ctas).toHaveLength(2)
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('/sign-in')
    }
    expect(screen.getByRole('link', { name: 'Read The FAQ' }).getAttribute('href')).toBe('/faq')
  })
})
