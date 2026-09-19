import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { BuyerSignals } from '@mortar/core'
import { SignalsPanel } from '@/components/bookings/SignalsPanel'

// Radix positions tooltip content with floating-ui, which needs observers jsdom lacks.
for (const observer of ['ResizeObserver', 'IntersectionObserver'] as const) {
  vi.stubGlobal(
    observer,
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
}

const SIGNALS: BuyerSignals = {
  bookingId: 'BK-9001',
  responsiveness: { score: 2, confidence: 0.9 },
  hesitation: { score: 0, confidence: 0.85 },
  meta: { source: 'cache', stale: false, latencyMs: null }
}

describe('SignalsPanel', () => {
  it('flags Needs Review when either confidence is under the threshold', () => {
    render(
      <SignalsPanel signals={{ ...SIGNALS, responsiveness: { score: 1, confidence: 0.13 } }} hasBuyerMessages={true} />
    )

    expect(screen.getByText('Needs Review')).toBeTruthy()
  })

  it('omits Needs Review when both confidences clear the threshold', () => {
    render(<SignalsPanel signals={SIGNALS} hasBuyerMessages={true} />)

    expect(screen.queryByText('Needs Review')).toBeNull()
  })

  it('keeps the confidence sentence in a tooltip beside the heading', () => {
    render(<SignalsPanel signals={SIGNALS} hasBuyerMessages={true} />)

    expect(screen.queryByText(/Responsiveness Confidence 90%/)).toBeNull()
    fireEvent.focusIn(screen.getByLabelText('Buyer signal confidences'))

    const tooltip = screen.getByRole('tooltip')
    expect(within(tooltip).getByText(/Responsiveness Confidence 90%/)).not.toBeNull()
    expect(within(tooltip).getByText(/Hesitation Confidence 85%/)).not.toBeNull()
  })

  it('shows the empty state without signals', () => {
    render(<SignalsPanel signals={null} hasBuyerMessages={true} />)

    expect(screen.getByText('No Signal Read Yet.')).toBeTruthy()
    expect(screen.queryByText('Needs Review')).toBeNull()
    expect(screen.queryByLabelText('Buyer signal confidences')).toBeNull()
  })

  it('says no buyer messages have arrived instead of faking a signal read', () => {
    render(<SignalsPanel signals={null} hasBuyerMessages={false} />)

    expect(screen.getByText('No Buyer Messages Have Arrived Yet.')).toBeTruthy()
    expect(screen.queryByText('Unresponsive')).toBeNull()
  })
})
