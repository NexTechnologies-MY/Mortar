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
    const links = container.querySelectorAll('nav a')

    expect(links[0].getAttribute('href')).toBe('/legal')
    window.localStorage.clear()
  })
})
