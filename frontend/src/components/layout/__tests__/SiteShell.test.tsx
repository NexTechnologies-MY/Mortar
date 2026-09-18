import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SiteShell } from '../SiteShell'

// Mirrors App.tsx's route table: `/sign-in` is the one route outside SiteShell.
// The landing and sign-in pages are written by other workers, so App.tsx's
// imports can't resolve yet — routes here carry stubs instead of the pages.
function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path="/" element={<div>Landing page</div>} />
          <Route path="*" element={<div>Not found</div>} />
        </Route>
        <Route path="/sign-in" element={<div>Sign in page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SiteShell', () => {
  it('renders the four footer links with their targets', () => {
    renderAt('/')
    const footer = screen.getByRole('contentinfo')

    expect(within(footer).getByRole('link', { name: 'Landing' }).getAttribute('href')).toBe('/')
    expect(within(footer).getByRole('link', { name: 'Your Desk' }).getAttribute('href')).toBe('/app')

    const figma = within(footer).getByRole('link', { name: 'Figma, The Design System' })
    expect(figma.getAttribute('href')).toBe(
      'https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1'
    )
    expect(figma.getAttribute('target')).toBe('_blank')
    expect(figma.getAttribute('rel')).toBe('noopener noreferrer')

    const github = within(footer).getByRole('link', { name: 'NexTechnologies' })
    expect(github.getAttribute('href')).toBe('https://github.com/NexTechnologies-MY/mortar')
    expect(github.getAttribute('target')).toBe('_blank')
  })

  it('renders no footer on /sign-in', () => {
    renderAt('/sign-in')
    expect(screen.queryByRole('contentinfo')).toBeNull()
  })
})
