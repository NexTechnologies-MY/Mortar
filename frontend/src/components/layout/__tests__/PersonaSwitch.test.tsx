import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PERSONA_STORAGE_KEY, PersonaProvider } from '@/lib/persona'
import { PersonaSwitch } from '../PersonaSwitch'

function renderSwitch() {
  return render(
    <MemoryRouter>
      <PersonaProvider>
        <PersonaSwitch />
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('PersonaSwitch', () => {
  it('marks the active persona with a check icon and persists a new choice', () => {
    renderSwitch()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Switch persona' }), { key: 'ArrowDown' })

    const active = screen.getByRole('menuitem', { name: /Sales Admin/ })
    expect(active.querySelector('svg.lucide-check')).toBeTruthy()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Legal Admin' }))
    expect(window.localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('legal-admin')
    window.localStorage.clear()
  })
})
