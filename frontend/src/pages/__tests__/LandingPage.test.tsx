/**
 * Landing page tests. The page's interactive chrome is the FAQ accordion, the
 * waitlist form and the back-to-top control — the theme switch lives in the
 * app shell only — so it renders under MemoryRouter alone. jsdom has no
 * matchMedia, so the pointer-bloom effect simply stands down.
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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

  it('carries no theme switcher — that lives in the app shell only', () => {
    renderLanding()
    expect(screen.queryByRole('button', { name: /theme/i })).toBeNull()
    expect(screen.queryByRole('radio')).toBeNull()
  })

  it('centres the claim on the ledger plate', () => {
    const { container } = renderLanding()
    const plate = container.querySelector('.land-plate')

    expect(plate).toBeTruthy()
    expect(plate?.querySelector('figcaption')?.textContent).toMatch(/illustrative/i)
    expect(screen.getByText('Bookings')).toBeTruthy()
  })

  it('walks the four moments: the stall, the message, the task, the forecast', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: 'How It Works' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'The Stall Is Named' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'A Message Becomes A Proposal' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'The Task Has An Owner' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'A Number Finance Can Sign Off' })).toBeTruthy()
  })

  it('anchors each moment to a real screenshot, captioned as simulated data', () => {
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
    expect(container.querySelector('#land-how')).toBeTruthy()
    const cue = screen.getByRole('link', { name: 'Scroll' })
    expect(cue.getAttribute('href')).toBe('#land-how')
  })

  it('leads to sign-in as the only call to action', () => {
    renderLanding()
    const ctas = screen.getAllByRole('link', { name: 'Open Mortar' })

    expect(ctas).toHaveLength(2)
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('/sign-in')
    }
    expect(screen.getByRole('link', { name: 'View All' }).getAttribute('href')).toBe('/faq')
  })

  it('expands a question on click and collapses it again', () => {
    renderLanding()
    const question = screen.getByRole('button', { name: 'What Does Jev Do?' })

    expect(question.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(question)
    expect(question.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(question)
    expect(question.getAttribute('aria-expanded')).toBe('false')
  })
})
