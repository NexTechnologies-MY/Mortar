import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Backtest } from '@mortar/core'
import { BacktestCard } from '../BacktestCard'

const EMPTY: Backtest = {
  cutoff: '2026-09-01',
  predicted: 0,
  observed: 0,
  brier: 0,
  calibration: [],
  support: 'insufficient-history'
}

describe('BacktestCard', () => {
  it('does not present an empty evaluation as perfect accuracy', () => {
    render(<BacktestCard backtest={EMPTY} />)
    expect(screen.getByText(/No historical bookings are available to validate/)).toBeTruthy()
    expect(screen.queryByText(/matched actual signings exactly/i)).toBeNull()
  })
})
