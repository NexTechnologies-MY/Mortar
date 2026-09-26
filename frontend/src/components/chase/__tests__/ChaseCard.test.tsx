import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Booking, CaseSummary, NextAction, Task } from '@mortar/core'
import { ChaseCard } from '@/components/chase/ChaseCard'
import { NEXT_ACTION_LABELS } from '@/components/chase/chase'
import { nextStepFor, type NextStep } from '@/components/case/nextStep'
import { PersonaProvider, type Persona } from '@/lib/persona'

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
    action: 'chase_banker',
    title: 'Call The Banker About A-12-03',
    ownerRole: 'loan_admin',
    ownerName: 'Tan Mei Ling',
    dueOn: '2026-09-20',
    status: 'open',
    origin: 'staff',
    createdAt: '2026-09-16T00:00:00+08:00',
    completedAt: null,
    ...overrides
  }
}

/** The rule says call the banker; the optional alternative is Jev's differing move. */
function jevMove(action: NextAction) {
  return {
    bookingId: 'BK-9001',
    action: { value: action, probabilities: {}, confidence: 0.8 },
    owner: { value: 'sales' as const, probabilities: {}, confidence: 0.8 },
    urgency: { score: 2, confidence: 0.8 },
    meta: { source: 'cache' as const, stale: false, latencyMs: null }
  }
}

function renderCard(task: Task | null, alternative?: NextStep, caseSummary = summary(), persona?: Persona) {
  const next = nextStepFor(booking(), caseSummary, NEXT_ACTION_LABELS, jevMove('call_buyer'))
  const onCreateTask = vi.fn()
  render(
    <MemoryRouter>
      <PersonaProvider initialPersona={persona}>
        <ChaseCard
          booking={booking()}
          summary={caseSummary}
          step={next.defaultStep}
          alternativeStep={alternative ?? next.alternativeStep}
          openTask={task}
          onInspect={vi.fn()}
          onSuggest={vi.fn()}
          onCreateTask={onCreateTask}
        />
      </PersonaProvider>
    </MemoryRouter>
  )
  return onCreateTask
}

describe('ChaseCard', () => {
  it('shows Task Open with its due date and owner, and no Create Task button, when the booking has an open task', () => {
    renderCard(openTask())

    expect(screen.getByText('Task Open')).toBeTruthy()
    expect(screen.getByText('Due 20 Sep 2026 · Tan Mei Ling')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Create Task' })).toBeNull()
  })

  it('offers Create Task for the default step when the booking has no open task', () => {
    renderCard(null, undefined)

    expect(screen.getByRole('button', { name: 'Create Task' })).toBeTruthy()
    expect(screen.queryByText('Task Open')).toBeNull()
  })

  it('leads with the rule-based move, not Jev’s', () => {
    renderCard(null)

    expect(screen.getByText('Call The Banker')).toBeTruthy()
  })

  it('names the desk that owns the step whenever it is not the reader’s own', () => {
    // Today is read as Sales Admin, and "Call The Banker" is Loan Admin's move.
    renderCard(null, undefined, summary(), 'sales-admin')

    const step = screen.getByText('Call The Banker').parentElement!
    const desk = within(step).getByText('· Loan Admin')
    expect(desk.className).toContain('text-muted-foreground')
  })

  it('leaves the desk out when the step is the reader’s own to make', () => {
    renderCard(null, undefined, summary(), 'loan-admin')

    const step = screen.getByText('Call The Banker').parentElement!
    expect(within(step).queryByText(/Loan Admin/)).toBeNull()
  })

  it('reads the viewer’s own desk as the Sales desk, not the Sales Agent’s', () => {
    // A closed case owes nobody a move, so the step is the wait: Loan Admin's
    // by the rules, and named as such for someone reading as Sales Admin.
    const caseSummary = summary({ stage: 'spa_signed', spaSigned: true, stallReasons: [] })
    renderCard(null, undefined, caseSummary, 'sales-admin')

    const step = screen.getByText('Wait For The Bank').parentElement!
    expect(within(step).getByText('· Loan Admin')).toBeTruthy()
  })

  it('offers Jev’s differing move as one muted line with its own button', () => {
    const onCreateTask = renderCard(null)

    const line = screen.getByText('Jev Suggests: Call The Buyer Instead')
    // One muted line, not a second block of equal weight.
    expect(line.parentElement!.className).toContain('text-muted-foreground')

    fireEvent.click(within(line.parentElement!).getByRole('button', { name: 'Do That Instead' }))
    expect(onCreateTask).toHaveBeenCalledWith(expect.objectContaining({ action: 'call_buyer' }))
  })

  it('shows one pill at most: the overdue date, and no risk chip below High', () => {
    renderCard(null)

    // Six days stale is the queue's norm, so the card carries no pill at all,
    // and a Low-risk booking earns no risk chip.
    expect(screen.queryByText(/Overdue/)).toBeNull()
    expect(screen.queryByText('Low Risk')).toBeNull()
  })

  it('shows the overdue pill and the risk chip only when each earns its place', () => {
    const caseSummary = summary({ daysSinceEvidence: 14, risk: { ...summary().risk, level: 'high' } })
    render(
      <MemoryRouter>
        <PersonaProvider>
          <ChaseCard
            booking={booking()}
            summary={caseSummary}
            step={nextStepFor(booking(), caseSummary, NEXT_ACTION_LABELS).defaultStep}
            onSuggest={vi.fn()}
            onCreateTask={vi.fn()}
          />
        </PersonaProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Overdue 14 d')).toBeTruthy()
    expect(screen.getByText('High Risk')).toBeTruthy()
  })

  it('keeps Ask Jev Again as an icon button carrying its own label and tooltip', () => {
    renderCard(null)

    // An icon-only button needs its own label; the "checked earlier" note is
    // the tooltip's job rather than a pill on every card.
    const button = screen.getByRole('button', { name: 'Ask Jev Again' })
    expect(button.textContent).toBe('')
    expect(button.className).toContain('size-8')
  })

  it('names the missing document in the step itself, not as a tail after it', () => {
    // The buyer owes a payslip, so the step reads as the sentence a person says.
    renderCard(null, undefined, summary({ outstandingDocuments: ['payslip'] }))

    expect(screen.getByText('Ask For Payslip')).toBeTruthy()
    expect(screen.queryByText(/Ask For The Missing Document/)).toBeNull()
  })

  it('falls back to the missing document when the case names none', () => {
    // A bank waiting on paperwork names no document, so the step cannot.
    renderCard(
      null,
      undefined,
      summary({ applications: [{ id: 'APP-1', bank: 'Crestline Bank', status: 'documents_pending' }] })
    )

    expect(screen.getByText('Ask For The Missing Document')).toBeTruthy()
    expect(screen.queryByText(/Ask For Payslip/)).toBeNull()
  })

  it('opens the case quick view from the unit and buyer, keeping the full case one click away', () => {
    const onInspect = vi.fn()
    const caseSummary = summary()
    render(
      <MemoryRouter>
        <PersonaProvider>
          <ChaseCard
            booking={booking()}
            summary={caseSummary}
            step={nextStepFor(booking(), caseSummary, NEXT_ACTION_LABELS).defaultStep}
            onInspect={onInspect}
            onSuggest={vi.fn()}
            onCreateTask={vi.fn()}
          />
        </PersonaProvider>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Quick View A-12-03: BK-9001 · Raymond Tan Wei Hong' }))
    expect(onInspect).toHaveBeenCalledTimes(1)
  })
})
