import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { BuyerSignals } from '@mortar/core'
import { SignalsPanel } from '@/components/bookings/SignalsPanel'

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
    expect(screen.getByText(/Responsiveness Confidence 13%/)).toBeTruthy()
  })

  it('omits Needs Review when both confidences clear the threshold', () => {
    render(<SignalsPanel signals={SIGNALS} hasBuyerMessages={true} />)

    expect(screen.queryByText('Needs Review')).toBeNull()
    expect(screen.getByText(/Responsiveness Confidence 90%/)).toBeTruthy()
  })

  it('shows the empty state without signals', () => {
    render(<SignalsPanel signals={null} hasBuyerMessages={true} />)

    expect(screen.getByText('No Signal Read Yet.')).toBeTruthy()
    expect(screen.queryByText('Needs Review')).toBeNull()
  })

  it('says no buyer messages have arrived instead of faking a signal read', () => {
    render(<SignalsPanel signals={null} hasBuyerMessages={false} />)

    expect(screen.getByText('No Buyer Messages Have Arrived Yet.')).toBeTruthy()
    expect(screen.queryByText('Unresponsive')).toBeNull()
  })
})
