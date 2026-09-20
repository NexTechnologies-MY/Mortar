import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PublicShell } from '../PublicShell'

const FIGMA_URL =
  'https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1'
const GITHUB_URL = 'https://github.com/NexTechnologies-MY/mortar'

// Mirrors App.tsx: only `/` and `/faq` sit inside PublicShell. `/chase` stands
// in for the app desks, and it, `/sign-in` and the catch-all are mounted
// outside it. Route elements are stubs; the pages are covered by their own tests.
function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<div>Landing page</div>} />
          <Route path="/faq" element={<div>FAQ page</div>} />
        </Route>
        <Route path="/chase" element={<div>Chase page</div>} />
        <Route path="/sign-in" element={<div>Sign in page</div>} />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PublicShell', () => {
  it('groups the footer links under Product, Company and Code', () => {
    renderAt('/')
    const footer = screen.getByRole('contentinfo')

    const labels = (name: string) =>
      within(within(footer).getByRole('navigation', { name }))
        .getAllByRole('link')
        .map((a) => a.textContent)

    expect(labels('Product')).toEqual(['Chase List', 'Bookings', 'Forecast'])
    expect(labels('Company')).toEqual(['FAQ', 'Dashboard', 'Design'])
    expect(labels('Code')).toEqual(['GitHub'])
  })

  it('points every footer link at a real destination', () => {
    renderAt('/')
    const footer = screen.getByRole('contentinfo')
    const href = (name: string) => within(footer).getByRole('link', { name }).getAttribute('href')

    expect(href('Chase List')).toBe('/chase')
    expect(href('Bookings')).toBe('/bookings')
    expect(href('Forecast')).toBe('/forecast')
    expect(href('FAQ')).toBe('/faq')
    expect(href('Dashboard')).toBe('/app')
    expect(href('Design')).toBe(FIGMA_URL)
    expect(href('GitHub')).toBe(GITHUB_URL)
    expect(href('Mortar home')).toBe('/')
  })

  it('opens the two off-site links in a new tab, safely', () => {
    renderAt('/')
    const footer = screen.getByRole('contentinfo')

    for (const name of ['Design', 'GitHub']) {
      const link = within(footer).getByRole('link', { name })
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }
  })

  it('closes with the year line and the simulated-data note', () => {
    renderAt('/')
    const footer = screen.getByRole('contentinfo')

    expect(within(footer).getByText(`© ${new Date().getFullYear()} Mortar`)).toBeTruthy()
    expect(within(footer).getByText('Internal Tool · Simulated Data')).toBeTruthy()
  })

  it('renders the footer on /faq', () => {
    renderAt('/faq')
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  // The footer is for the public pages only. `/chase` is the regression this
  // locks: it used to sit under the app desks, clipped by the sidebar.
  it.each(['/chase', '/sign-in', '/nowhere'])('renders no footer on %s', (route) => {
    renderAt(route)
    expect(screen.queryByRole('contentinfo')).toBeNull()
  })
})
