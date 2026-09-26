import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { FinancingRisk } from '@mortar/core'
import { RiskChip } from '../RiskChip'
import { PersonaProvider } from '@/lib/persona'

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

const RISK: FinancingRisk = {
  level: 'high',
  loanRm: 315_000,
  instalmentRm: 1_580,
  debtServiceRatio: 0.52,
  marginOfFinancing: 0.9,
  reasons: ['Debt Service Exceeds The Cap', 'Income Document Outstanding']
}

describe('RiskChip', () => {
  it('shows the level word with the danger tone on a focusable trigger', () => {
    render(<RiskChip risk={RISK} />)
    const trigger = screen.getByRole('button', { name: 'High Risk' })
    expect(trigger.querySelector('span')?.className).toContain('bg-status-danger-bg')
  })

  it('explains the risk in plain words on keyboard focus', () => {
    render(<RiskChip risk={RISK} />)
    // React delegates onFocus to the bubbling focusin event; Radix opens instantly on it.
    fireEvent.focusIn(screen.getByRole('button', { name: 'High Risk' }))

    const tooltip = screen.getByRole('tooltip')
    // "DSR" and "instalment" are loan-desk shorthand, not office words.
    expect(within(tooltip).getByText(/Monthly Repayments Compared With Income: 52%/)).not.toBeNull()
    expect(within(tooltip).getByText(/Loan Against The Property Value: 90%/)).not.toBeNull()
    expect(within(tooltip).getByText(/Monthly Repayment RM 1,580/)).not.toBeNull()
    expect(within(tooltip).getByText(/Debt Service Exceeds The Cap/)).not.toBeNull()
    expect(within(tooltip).getByText(/Income Document Outstanding/)).not.toBeNull()
  })

  it('carries no lock glyph and no privacy claim, and shows every persona the same figures', () => {
    for (const persona of ['legal-admin', 'sales-admin', 'loan-admin'] as const) {
      const { unmount } = render(
        <PersonaProvider initialPersona={persona}>
          <RiskChip risk={RISK} />
        </PersonaProvider>
      )
      const trigger = screen.getByRole('button', { name: 'High Risk' })
      expect(trigger.querySelector('svg')).toBeNull()

      fireEvent.focusIn(trigger)
      const tooltip = screen.getByRole('tooltip')
      expect(within(tooltip).getByText(/Monthly Repayments Compared With Income: 52%/)).not.toBeNull()
      // Nothing on the server masks buyer data, so the chip claims no masking.
      expect(within(tooltip).queryByText(/PDPA/)).toBeNull()
      expect(within(tooltip).queryByText(/Restricted/)).toBeNull()
      unmount()
    }
  })

  it('says so in words when nothing has flagged the case', () => {
    render(<RiskChip risk={{ ...RISK, reasons: [] }} />)
    fireEvent.focusIn(screen.getByRole('button', { name: 'High Risk' }))

    expect(within(screen.getByRole('tooltip')).getByText(/No Specific Risk Flags Recorded/)).not.toBeNull()
  })
})
