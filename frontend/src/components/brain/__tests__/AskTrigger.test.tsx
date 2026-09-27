/**
 * Copilot knows the case page it was opened from.
 *
 * `AskPanel` takes an optional `bookingId`; the trigger reads it off the route.
 * The panel is mocked here because what is under test is the one prop crossing
 * that boundary, not the panel's own grounding (covered in `AskPanel.test.tsx`).
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_PROFILES } from '@mortar/core'
import { PersonaProvider, usePersona } from '@/lib/persona'

const mocks = vi.hoisted(() => ({ bookingId: undefined as string | undefined }))

vi.mock('../AskPanel', () => ({
  AskPanel: (props: { onNavigate: () => void; bookingId?: string }) => {
    mocks.bookingId = props.bookingId
    const [draft, setDraft] = useState('')
    return (
      <div>
        <div>Copilot</div>
        <input aria-label="Copilot draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      </div>
    )
  }
}))

import { AskTrigger } from '../AskTrigger'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/bookings/:id" element={<AskTrigger />} />
        <Route path="/chase" element={<AskTrigger />} />
        <Route path="/" element={<AskTrigger />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AskTrigger', () => {
  beforeEach(() => {
    mocks.bookingId = undefined
  })

  it('passes the open case id to Ask, so a person asking from a case gets that case', () => {
    renderAt('/bookings/BK-9001')
    fireEvent.click(screen.getByRole('button', { name: 'Copilot' }))

    // Radix mounts the dialog content only once it opens, so the prop is read
    // after the click rather than on render.
    expect(mocks.bookingId).toBe('BK-9001')
  })

  it('passes no case on a route that has none', () => {
    renderAt('/chase')
    fireEvent.click(screen.getByRole('button', { name: 'Copilot' }))

    expect(mocks.bookingId).toBeUndefined()
  })

  it('still renders its own trigger, so nothing about the top bar changes', () => {
    renderAt('/bookings/BK-9001')

    expect(screen.getByRole('button', { name: 'Copilot' })).toBeTruthy()
    expect(document.querySelector('[data-tour="ask-mortar"]')).toBeTruthy()
  })

  it('clears the open conversation when the active profile changes', () => {
    function SwitchProfile() {
      const { setProfile } = usePersona()
      return (
        <button onClick={() => setProfile(DEMO_PROFILES.find((profile) => profile.id === 'loan-tan-mei-ling')!)}>
          Use Loan Profile
        </button>
      )
    }
    render(
      <PersonaProvider>
        <MemoryRouter initialEntries={['/chase']}>
          <Routes>
            <Route path="/chase" element={<AskTrigger />} />
          </Routes>
          <SwitchProfile />
        </MemoryRouter>
      </PersonaProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copilot' }))
    fireEvent.change(screen.getByLabelText('Copilot draft'), { target: { value: 'A private question' } })

    fireEvent.click(screen.getByText('Use Loan Profile'))

    expect((screen.getByLabelText('Copilot draft') as HTMLInputElement).value).toBe('')
  })
})
