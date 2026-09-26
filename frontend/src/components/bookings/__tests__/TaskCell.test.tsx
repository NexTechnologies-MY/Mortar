import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Booking, CaseSummary, Task } from '@mortar/core'
import { TaskCell } from '../TaskCell'

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

const RISK: CaseSummary['risk'] = {
  level: 'low',
  loanRm: 400_000,
  instalmentRm: 2_000,
  debtServiceRatio: 0.3,
  marginOfFinancing: 0.8,
  reasons: []
}

const BOOKING: Booking = {
  id: 'BK-0001',
  project: 'Kiara Residences',
  unit: 'D-05-01',
  priceRm: 548_000,
  bookingDate: '2026-01-05',
  buyer: {
    name: 'Siti Hajar Binti Omar',
    ic: '920311-00-0001',
    phone: '+60 00-000 0101',
    age: 34,
    grossMonthlyIncomeRm: 7_200,
    monthlyCommitmentsRm: 0,
    propertiesOwned: 0
  },
  salesOwner: 'Farah Izzati',
  loanOwner: 'Aiman Rizal',
  legalFirm: 'Wong Rahman Chambers'
}

const SUMMARY: CaseSummary = {
  bookingId: 'BK-0001',
  stage: 'loan_applied',
  unknown: false,
  bookingAgeDays: 16,
  daysSinceEvidence: 6,
  daysSinceLoIssued: null,
  daysSinceSpaSet: null,
  applications: [],
  outstandingDocuments: [],
  buyerWithdrew: false,
  risk: RISK,
  stallReasons: [],
  openTasks: 1
}

const TASK: Task = {
  id: 'TSK-1',
  bookingId: 'BK-0001',
  action: 'request_document',
  title: 'Request Payslip From Buyer',
  ownerRole: 'loan_admin',
  ownerName: 'Aiman Rizal',
  dueOn: '2026-09-20',
  status: 'open',
  origin: 'staff',
  createdAt: '2026-09-16T00:00:00+08:00',
  completedAt: null
}

describe('TaskCell', () => {
  it('gives the Task Open trigger enough padding for a 24px tap target without resizing the pill (issue L10)', () => {
    render(
      <TaskCell booking={BOOKING} summary={SUMMARY} openTask={TASK} referenceDate="2026-09-18" onChanged={vi.fn()} />
    )

    const trigger = screen.getByRole('button', { name: /Task Open:/ })
    // The pill itself stays the spec's 22px; the trigger's own padding, not the
    // pill, gets the clickable area to the 24px accessible tap-target floor.
    expect(trigger.className).toMatch(/\bp-0\.5\b/)
    expect(screen.getByText('Task Open')).toBeTruthy()
  })
})
