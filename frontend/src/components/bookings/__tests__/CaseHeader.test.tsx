import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Booking, CaseSummary, RiskLevel } from '@mortar/core'
import { CaseHeader } from '@/components/bookings/CaseHeader'

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

const booking: Booking = {
  id: 'BK-9001',
  project: 'Residensi Ujian',
  unit: 'A-12-03',
  priceRm: 550000,
  bookingDate: '2026-09-02',
  buyer: {
    name: 'Raymond Tan Wei Hong',
    ic: '000000-00-0001',
    phone: '+60 00-000 0001',
    age: 34,
    grossMonthlyIncomeRm: 8500,
    monthlyCommitmentsRm: 1200,
    propertiesOwned: 0
  },
  salesOwner: 'Nurul Aina',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Wong Rahman Chambers'
}

function summary(risk: RiskLevel): CaseSummary {
  return {
    bookingId: 'BK-9001',
    stage: 'loan_applied',
    spaSigned: false,
    unknown: false,
    bookingAgeDays: 16,
    daysSinceEvidence: 6,
    daysSinceLoIssued: null,
    daysSinceSpaSet: null,
    applications: [{ id: 'APP-1', bank: 'Crestline Bank', status: 'submitted' }],
    outstandingDocuments: [],
    buyerWithdrew: false,
    risk: {
      level: risk,
      loanRm: 495000,
      instalmentRm: 2100,
      debtServiceRatio: 0.39,
      marginOfFinancing: 0.9,
      reasons: []
    },
    stallReasons: ['Application Undecided For 10 Working Days'],
    openTasks: 0
  }
}

const riskLabel = (level: RiskLevel) => `${level[0].toUpperCase()}${level.slice(1)} Risk`

describe('CaseHeader', () => {
  it.each(['low', 'medium', 'high'] as const)('states the financing risk at %s, never nothing at all', (level) => {
    render(<CaseHeader booking={booking} summary={summary(level)} />)

    // Practitioners rank financing the most useful signal on a case, so a
    // Low case says so rather than showing no risk at all.
    const label = screen.getByText(riskLabel(level))
    expect(label).toBeTruthy()
  })

  it('carries the explanation on a risk that is not Low, as the table’s chip does', () => {
    render(<CaseHeader booking={booking} summary={summary('high')} />)

    // The pill is a tooltip trigger, so keyboard focus reaches the figures
    // behind the word: repayments against income, the margin, the instalment.
    expect(screen.getByText('High Risk').closest('button')).toBeTruthy()
  })

  it('states a Low risk as the muted word the Bookings table uses, with no chip', () => {
    render(<CaseHeader booking={booking} summary={summary('low')} />)

    const label = screen.getByText('Low Risk')
    expect(label.className).toContain('text-muted-foreground')
    expect(label.closest('button')).toBeNull()
  })
})
