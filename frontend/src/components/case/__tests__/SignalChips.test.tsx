import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { BuyerSignals } from '@mortar/core'
import { SignalChips } from '../SignalChips'

const META = { source: 'cache' as const, stale: false, latencyMs: 380 }

const signals = (responsiveness: number, hesitation: number): BuyerSignals => ({
  bookingId: 'BK-9001',
  responsiveness: { score: responsiveness, confidence: 0.9 },
  hesitation: { score: hesitation, confidence: 0.9 },
  meta: META
})

describe('SignalChips', () => {
  it('renders both signal words for a keen buyer', () => {
    render(<SignalChips signals={signals(2, 0)} />)
    const group = screen.getByRole('group', { name: 'Buyer response' })
    expect(group.textContent).toContain('Prompt Replies')
    expect(group.textContent).toContain('Committed')
  })

  it('renders the doubtful end of the scale', () => {
    render(<SignalChips signals={signals(0, 2)} />)
    const group = screen.getByRole('group', { name: 'Buyer response' })
    expect(group.textContent).toContain('Unresponsive')
    expect(group.textContent).toContain('Strong Doubts')
  })

  it('clamps out-of-range scores into the 0–2 bands', () => {
    render(<SignalChips signals={signals(7, -3)} />)
    const group = screen.getByRole('group', { name: 'Buyer response' })
    expect(group.textContent).toContain('Prompt Replies')
    expect(group.textContent).toContain('Committed')
  })

  it('shows muted text instead of a dash when there are no signals', () => {
    render(<SignalChips signals={null} />)
    expect(screen.getByText('No Messages Yet')).not.toBeNull()
  })

  it('names the source of the read in a tooltip on the chips', () => {
    render(<SignalChips signals={signals(2, 0)} />)
    const trigger = screen.getByRole('group', { name: 'Buyer response' }).closest('button')!
    // React delegates onFocus to the bubbling focusin event; Radix opens instantly on it.
    fireEvent.focusIn(trigger)
    const tooltip = screen.getByRole('tooltip')
    expect(
      within(tooltip).getByText(
        "Jev's Read Of This Buyer's Messages: Reply Speed And Any Doubts. Log Messages On The Case Page To Update It."
      )
    ).not.toBeNull()
  })
})
