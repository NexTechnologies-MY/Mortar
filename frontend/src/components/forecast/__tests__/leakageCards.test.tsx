import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Leakage } from '@mortar/core'
import { LeakageCard } from '../LeakageCard'
import { RecoveryCard } from '../RecoveryCard'

// Radix tooltips position with floating-ui, which needs observers jsdom lacks.
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

const LEAKAGE: Leakage = {
  asOf: '2026-09-18',
  deadUnits: 25,
  deadValueRm: 13632000,
  unitDaysHeld: 706,
  medianDaysHeld: 21,
  causes: [
    { cause: 'Loan Rejected', units: 17, valueRm: 8988000, share: 8988000 / 13632000 },
    { cause: 'Buyer Went Hesitant', units: 4, valueRm: 2615000, share: 2615000 / 13632000 },
    { cause: 'Buyer Withdrew', units: 4, valueRm: 2029000, share: 2029000 / 13632000 }
  ],
  recovery: {
    missedUnits: 14,
    missedValueRm: 7594000,
    secondBankRate: 2 / 3,
    secondBankSample: 9,
    rateLow: 0.35,
    rateHigh: 0.88,
    recoverableUnits: 9.3,
    recoverableValueRm: 5062667,
    recoverableUnitsLow: 4.9,
    recoverableUnitsHigh: 12.3,
    recoverableValueLowRm: 2657900,
    recoverableValueHighRm: 6682720,
    liveBookingIds: ['BK-0016', 'BK-0022'],
    liveValueRm: 1871000
  }
}

const renderIn = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('LeakageCard', () => {
  it('lists causes in order of value lost', () => {
    renderIn(<LeakageCard leakage={LEAKAGE} />)
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual([
      'Loan Rejected',
      'Buyer Went Hesitant',
      'Buyer Withdrew'
    ])
  })

  it('states the inventory those dead bookings held off the market', () => {
    renderIn(<LeakageCard leakage={LEAKAGE} />)
    expect(screen.getByText(/706 unit-days/)).toBeTruthy()
    expect(screen.getByText(/median of 21 days/)).toBeTruthy()
  })

  it('says how a rejection followed by a withdrawal is attributed', () => {
    renderIn(<LeakageCard leakage={LEAKAGE} />)
    expect(screen.getByText(/counted against the rejection/)).toBeTruthy()
  })

  it('prints each cause’s share once, not twice (issue L9)', () => {
    renderIn(<LeakageCard leakage={LEAKAGE} />)
    // Loan Rejected's share is 8,988,000 / 13,632,000 ≈ 66%.
    const row = screen.getAllByRole('row')[1]
    expect(within(row).getAllByText('66%')).toHaveLength(1)
  })
})

describe('RecoveryCard', () => {
  it('shows the estimate with its range, never as a bare figure', () => {
    renderIn(<RecoveryCard leakage={LEAKAGE} />)
    expect(screen.getByText('9.3 units')).toBeTruthy()
    expect(screen.getByText(/4\.9 to 12\.3 units/)).toBeTruthy()
  })

  it('shows the sample the rate came from and warns that it is small', () => {
    renderIn(<RecoveryCard leakage={LEAKAGE} />)
    expect(screen.getByText(/67% of 9/)).toBeTruthy()
    expect(screen.getByText(/small\s+sample/)).toBeTruthy()
  })

  it('shows the arithmetic rather than asserting the conclusion', () => {
    renderIn(<RecoveryCard leakage={LEAKAGE} />)
    expect(screen.getByText(/14 × 67% = 9\.3 units/)).toBeTruthy()
  })

  it('links every live case straight to its case file', () => {
    renderIn(<RecoveryCard leakage={LEAKAGE} />)
    expect(screen.getByRole('link', { name: /BK-0016/ }).getAttribute('href')).toBe('/bookings/BK-0016')
    expect(screen.getByRole('link', { name: /BK-0022/ }).getAttribute('href')).toBe('/bookings/BK-0022')
  })

  it('says so plainly when nothing was lost for want of a second bank', () => {
    renderIn(<RecoveryCard leakage={{ ...LEAKAGE, recovery: { ...LEAKAGE.recovery, missedUnits: 0 } }} />)
    expect(screen.getByText(/Nothing was lost for want of a second application/)).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('does not offer work when no live case qualifies', () => {
    renderIn(<RecoveryCard leakage={{ ...LEAKAGE, recovery: { ...LEAKAGE.recovery, liveBookingIds: [] } }} />)
    expect(screen.getByText(/No live booking is sitting on a rejection/)).toBeTruthy()
  })
})
