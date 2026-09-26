import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PERSONA_STORAGE_KEY, PersonaProvider } from '@/lib/persona'
import { PersonaSwitch } from '../PersonaSwitch'

function LocationProbe() {
  return <p data-testid="location">{useLocation().pathname}</p>
}

function renderSwitch(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PersonaProvider>
        <PersonaSwitch />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </PersonaProvider>
    </MemoryRouter>
  )
}

function openMenu() {
  fireEvent.keyDown(screen.getByRole('button', { name: 'Switch persona' }), { key: 'ArrowDown' })
}

describe('PersonaSwitch', () => {
  it('marks the active persona with a check icon and persists a new choice', () => {
    renderSwitch()
    openMenu()

    const active = screen.getByRole('menuitem', { name: /Sales Admin/ })
    expect(active.querySelector('svg.lucide-check')).toBeTruthy()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Legal Admin' }))
    expect(window.localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('legal-admin')
    window.localStorage.clear()
  })

  it("opens the new persona's home desk instead of staying on the old page", () => {
    renderSwitch('/import')
    openMenu()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Legal Admin' }))
    expect(screen.getByTestId('location').textContent).toBe('/legal')
    window.localStorage.clear()
  })

  it('stays on the page when the active persona is picked again', () => {
    renderSwitch('/import')
    openMenu()

    fireEvent.click(screen.getByRole('menuitem', { name: /Sales Admin/ }))
    expect(screen.getByTestId('location').textContent).toBe('/import')
    window.localStorage.clear()
  })
})
