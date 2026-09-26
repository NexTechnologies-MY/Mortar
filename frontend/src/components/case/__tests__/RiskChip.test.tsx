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

  it('reveals the ratio, instalment, margin and reasons on keyboard focus', () => {
    render(<RiskChip risk={RISK} />)
    // React delegates onFocus to the bubbling focusin event; Radix opens instantly on it.
    fireEvent.focusIn(screen.getByRole('button', { name: 'High Risk' }))

    const tooltip = screen.getByRole('tooltip')
    expect(within(tooltip).getByText(/Debt Service 52% · Margin 90%/)).not.toBeNull()
    expect(within(tooltip).getByText(/Instalment RM 1,580\/mo/)).not.toBeNull()
    expect(within(tooltip).getByText(/Debt Service Exceeds The Cap/)).not.toBeNull()
    expect(within(tooltip).getByText(/Income Document Outstanding/)).not.toBeNull()
  })

  it('shows the lock icon on the status pill for legal admin per Malaysian PDPA', () => {
    render(
      <PersonaProvider initialPersona="legal-admin">
        <RiskChip risk={RISK} />
      </PersonaProvider>
    )
    const trigger = screen.getByRole('button', { name: /High Risk/ })
    expect(trigger.querySelector('svg')).not.toBeNull()
  })
})
