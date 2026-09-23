import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Booking, CaseSummary, Task } from '@mortar/core'
import { ChaseCard } from '@/components/chase/ChaseCard'

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
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
    legalFirm: 'Wong & Partners',
    ...overrides
  }
}

function summary(overrides: Partial<CaseSummary> = {}): CaseSummary {
  return {
    bookingId: 'BK-9001',
    stage: 'loan_applied',
    unknown: false,
    bookingAgeDays: 16,
    daysSinceEvidence: 6,
    daysSinceLoIssued: null,
    daysSinceSpaSet: null,
    applications: [],
    outstandingDocuments: [],
    buyerWithdrew: false,
    risk: {
      level: 'low',
      loanRm: 495000,
      instalmentRm: 2100,
      debtServiceRatio: 0.39,
      marginOfFinancing: 0.9,
      reasons: []
    },
    stallReasons: ['Application Undecided For 10 Working Days'],
    openTasks: 0,
    ...overrides
  }
}

function openTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'TASK-1',
    bookingId: 'BK-9001',
    action: 'request_document',
    title: 'Request Payslip From Raymond Tan Wei Hong',
    ownerRole: 'sales',
    ownerName: 'Nurul Aina',
    dueOn: '2026-09-20',
    status: 'open',
    origin: 'jev',
    createdAt: '2026-09-16T00:00:00+08:00',
    completedAt: null,
    ...overrides
  }
}

function renderCard(task: Task | null) {
  return render(
    <MemoryRouter>
      <ChaseCard booking={booking()} summary={summary()} openTask={task} onSuggest={vi.fn()} onCreateTask={vi.fn()} />
    </MemoryRouter>
  )
}

describe('ChaseCard', () => {
  it('shows Task Open with its due date and owner, and no Create Task button, when the booking has an open task', () => {
    renderCard(openTask())

    expect(screen.getByText('Task Open')).toBeTruthy()
    expect(screen.getByText('Due 20 Sep 2026 · Nurul Aina')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Create Task' })).toBeNull()
  })

  it('offers Create Task when the booking has no open task', () => {
    renderCard(null)

    expect(screen.getByRole('button', { name: 'Create Task' })).toBeTruthy()
    expect(screen.queryByText('Task Open')).toBeNull()
  })
})
