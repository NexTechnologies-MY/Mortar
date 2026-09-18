/**
 * Landing page tests — ported from Perch's Landing.test.tsx to Vitest + jsdom.
 * jsdom lacks matchMedia (the theme hook and the film's reduced-motion check
 * both call it), requestAnimationFrame (the theme's class flip) and
 * HTMLMediaElement.play, so the hoisted block stubs the browser floor before
 * the imports evaluate — matchMedia answers false, so the resolved theme is
 * light and the film renders its videos.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  window.HTMLMediaElement.prototype.play = () => Promise.resolve()
})

const css = readFileSync(join(__dirname, '../LandingPage.css'), 'utf8')

const renderLanding = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    </MemoryRouter>
  )

/** The declaration block following a selector in LandingPage.css. */
const blockAfter = (selector: string) => {
  const open = css.indexOf('{', css.indexOf(selector))
  return css.slice(open, css.indexOf('}', open))
}

describe('landing page', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('offers the theme switch on the landing page, named for the theme it will set', () => {
    renderLanding()
    expect(screen.getByRole('button', { name: 'Switch to the dark theme' })).toBeTruthy()
  })

  it('names the three surfaces as the three features', () => {
    renderLanding()
    expect(screen.getByText('Chase List')).toBeTruthy()
    expect(screen.getByText('Bookings')).toBeTruthy()
    expect(screen.getByText('Forecast')).toBeTruthy()
  })

  it('keeps the theme switch beside the one call to action in the header row', () => {
    const { container } = renderLanding()
    const head = container.querySelector<HTMLElement>('.land-head')!
    const controls = within(head)
    expect(controls.getByRole('button', { name: 'Switch to the dark theme' })).toBeTruthy()
    expect(controls.getAllByRole('link')).toHaveLength(1)
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('anchors the three facts one per track on the content column', () => {
    expect(blockAfter('.land-facts > div:nth-child(1)')).toContain('justify-self: start')
    expect(blockAfter('.land-facts > div:nth-child(2)')).toContain('justify-self: center')
    expect(blockAfter('.land-facts > div:nth-child(3)')).toContain('justify-self: end')
  })

  it('leads to sign-in as the only way in', () => {
    renderLanding()
    expect(screen.getByRole('link', { name: 'Open Mortar' }).getAttribute('href')).toBe('/sign-in')
  })
})
