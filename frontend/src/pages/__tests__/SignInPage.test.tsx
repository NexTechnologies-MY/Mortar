import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PERSONA_STORAGE_KEY, PersonaProvider } from '@/lib/persona'
import { SignInPage } from '@/pages/SignInPage'

function LocationEcho() {
  return <div data-testid="location">{useLocation().pathname}</div>
}

function renderSignIn() {
  return render(
    <MemoryRouter initialEntries={['/sign-in']}>
      <PersonaProvider>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="*" element={<LocationEcho />} />
        </Routes>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('SignInPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('disables the email and password fields and the dead sign-in button', () => {
    renderSignIn()

    expect((screen.getByLabelText('Email') as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByLabelText('Password') as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Sign In' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('signs in as the chosen persona and navigates to its home', () => {
    renderSignIn()

    fireEvent.click(screen.getByRole('radio', { name: 'Finance' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sign In As Guest' }))

    expect(window.localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('finance')
    expect(screen.getByTestId('location').textContent).toBe('/forecast')
  })

  it('makes the live guest button the primary action and the dead button transparent', () => {
    renderSignIn()

    expect(screen.getByRole('button', { name: 'Sign In As Guest' }).className).toContain('bg-primary')
    const dead = screen.getByRole('button', { name: 'Sign In' })
    expect(dead.className).toContain('disabled:bg-transparent')
    expect(dead.className).toContain('disabled:border-input')
  })

  it('renders the joinery mark on the selected ground in the hero plate', () => {
    const { container } = renderSignIn()

    const aside = container.querySelector('aside')!
    expect(aside.className).toContain('bg-selected')
    expect(aside.querySelector('svg')).toBeTruthy()
  })
})
