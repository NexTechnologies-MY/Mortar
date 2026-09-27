/**
 * Ask Mortar knows the case page it was opened from.
 *
 * `AskPanel` takes an optional `bookingId`; the trigger reads it off the route.
 * The panel is mocked here because what is under test is the one prop crossing
 * that boundary, not the panel's own grounding (covered in `AskPanel.test.tsx`).
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ bookingId: undefined as string | undefined }))

vi.mock('../AskPanel', () => ({
  AskPanel: (props: { onNavigate: () => void; bookingId?: string }) => {
    mocks.bookingId = props.bookingId
    return <div>Ask Mortar</div>
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
    fireEvent.click(screen.getByRole('button', { name: 'Ask Mortar' }))

    // Radix mounts the dialog content only once it opens, so the prop is read
    // after the click rather than on render.
    expect(mocks.bookingId).toBe('BK-9001')
  })

  it('passes no case on a route that has none', () => {
    renderAt('/chase')
    fireEvent.click(screen.getByRole('button', { name: 'Ask Mortar' }))

    expect(mocks.bookingId).toBeUndefined()
  })

  it('still renders its own trigger, so nothing about the top bar changes', () => {
    renderAt('/bookings/BK-9001')

    expect(screen.getByRole('button', { name: 'Ask Mortar' })).toBeTruthy()
    expect(document.querySelector('[data-tour="ask-mortar"]')).toBeTruthy()
  })
})
