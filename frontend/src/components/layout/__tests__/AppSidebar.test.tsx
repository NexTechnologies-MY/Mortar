import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PERSONA_STORAGE_KEY, PersonaProvider } from '@/lib/persona'
import { AppSidebar } from '../AppSidebar'

function renderSidebar(mobileOpen: boolean) {
  return render(
    <MemoryRouter initialEntries={['/chase']}>
      <PersonaProvider>
        <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => {}} />
      </PersonaProvider>
    </MemoryRouter>
  )
}

/** The desktop rail's links. The drawer renders the same list, so pick the first nav. */
function desktopNav(container: Element) {
  return container.querySelector('aside nav')!
}

describe('AppSidebar', () => {
  it('keeps the closed mobile scrim inert so it cannot swallow taps', () => {
    const { container } = renderSidebar(false)
    const scrim = container.querySelector('.drawer-scrim')!

    // globals.css gates pointer events on data-open="true"; the closed wrapper
    // must stay pointer-events-none or the invisible scrim eats every tap.
    expect(scrim.getAttribute('data-open')).toBe('false')
    expect(scrim.parentElement!.className).toContain('pointer-events-none')
  })

  it('opens the scrim and drawer when mobileOpen is set', () => {
    const { container } = renderSidebar(true)
    const scrim = container.querySelector('.drawer-scrim')!

    expect(scrim.getAttribute('data-open')).toBe('true')
    expect(scrim.parentElement!.className).not.toContain('pointer-events-none')
  })

  it("hoists the active persona's home to the top of the nav", () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'legal-admin')
    const { container } = renderSidebar(true)
    const links = desktopNav(container).querySelectorAll('a')

    expect(links[0].getAttribute('href')).toBe('/legal')
    window.localStorage.clear()
  })

  it('shows only the pages the active persona can open', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'sales-admin')
    const { container } = renderSidebar(true)
    const hrefs = [...desktopNav(container).querySelectorAll('a')].map((a) => a.getAttribute('href'))

    expect(hrefs).toEqual(['/chase', '/bookings', '/import', '/forecast', '/settings'])
    expect(hrefs).not.toContain('/legal')
    window.localStorage.clear()
  })

  it('keeps Forecast and Settings under a More heading below the desks', () => {
    const { container } = renderSidebar(true)
    const nav = desktopNav(container)
    const headings = [...nav.querySelectorAll('p')].map((p) => p.textContent)

    expect(headings).toEqual(['Primary', 'More'])
    const more = [...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(more.slice(0, 3)).toEqual(['/chase', '/bookings', '/import'])
    expect(more.slice(3)).toEqual(['/forecast', '/settings'])
  })

  it('drops Add Bookings for Loan Admin, whose desks are Bookings and Today', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
    const { container } = renderSidebar(true)
    const labels = [...desktopNav(container).querySelectorAll('a')].map((a) => a.textContent)

    expect(labels).toEqual(['Bookings', 'Today', 'Forecast', 'Settings'])
    window.localStorage.clear()
  })
})
