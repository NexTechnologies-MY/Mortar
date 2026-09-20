import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SiteShell } from '../SiteShell'

const FIGMA_URL =
  'https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1'
const GITHUB_URL = 'https://github.com/NexTechnologies-MY/mortar'

// Mirrors App.tsx: only `/` and `/faq` sit inside SiteShell. `/chase` stands
// in for the app desks, and it, `/sign-in` and the catch-all are mounted
// outside it. Route elements are stubs; the pages are covered by their own tests.
function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<SiteShell />}>
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

describe('SiteShell', () => {
  it('pins the site bar with the brand and the way in — no FAQ link', () => {
    renderAt('/')
    const bar = screen.getByRole('banner')

    expect(within(bar).getByRole('link', { name: 'Mortar home' }).getAttribute('href')).toBe('/')
    expect(within(bar).getByRole('link', { name: 'Open Mortar' }).getAttribute('href')).toBe('/sign-in')
    // The FAQ stays reachable from the footer and the questions section.
    expect(within(bar).queryByRole('link', { name: 'FAQ' })).toBeNull()
  })

  it('keeps the footer to labelled columns of real destinations', () => {
    renderAt('/')
    const footer = screen.getByRole('contentinfo')
    const href = (name: string) => within(footer).getByRole('link', { name }).getAttribute('href')

    expect(href('Mortar home')).toBe('/')
    expect(href('Chase List')).toBe('/chase')
    expect(href('Bookings')).toBe('/bookings')
    expect(href('Legal')).toBe('/legal')
    expect(href('Forecast')).toBe('/forecast')
    expect(href('FAQ')).toBe('/faq')
    expect(href('Dashboard')).toBe('/app')
    expect(href('Design')).toBe(FIGMA_URL)
    expect(href('GitHub')).toBe(GITHUB_URL)

    // Membership and order, not just presence: a column losing or reordering a
    // destination is the failure worth catching.
    const labels = (column: string) =>
      within(within(footer).getByRole('navigation', { name: column }))
        .getAllByRole('link')
        .map((a) => a.textContent)

    expect(labels('Product')).toEqual(['Chase List', 'Bookings', 'Legal', 'Forecast'])
    expect(labels('Company')).toEqual(['FAQ', 'Dashboard', 'Design'])
    expect(labels('Code')).toEqual(['GitHub'])
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

  it('sets the year line directly under the brand lockup, with no bottom bar', () => {
    renderAt('/')
    const footer = screen.getByRole('contentinfo')

    const lockup = within(footer).getByRole('link', { name: 'Mortar home' })
    const copy = within(footer).getByText(`© ${new Date().getFullYear()} Mortar`)
    expect(lockup.nextElementSibling).toBe(copy)
    expect(within(footer).queryByText(/Internal Tool|Simulated Data/)).toBeNull()
  })

  it('lays the fixed footer under the opaque page column', () => {
    const { container } = renderAt('/')
    const page = container.querySelector<HTMLElement>('.site-page')
    const footer = container.querySelector<HTMLElement>('.site-foot')

    expect(page).toBeTruthy()
    expect(footer?.tagName).toBe('FOOTER')
    expect(page!.compareDocumentPosition(footer!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('renders the bar and footer on /faq', () => {
    renderAt('/faq')
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  // The chrome is for the public pages only. `/chase` is the regression this
  // locks: the footer used to sit under the app desks, clipped by the sidebar.
  it.each(['/chase', '/sign-in', '/nowhere'])('renders no footer or bar on %s', (route) => {
    renderAt(route)
    expect(screen.queryByRole('contentinfo')).toBeNull()
    expect(screen.queryByRole('banner')).toBeNull()
  })
})
