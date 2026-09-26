import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Booking, CaseSummary, NextActionSuggestion } from '@mortar/core'
import { WaitingOnPanel, waitingOnTask } from '@/components/bookings/WaitingOn'
import { postTask } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  postTask: vi.fn(async () => ({}))
}))

const BOOKING: Booking = {
  id: 'BK-TEST-1',
  project: 'Test Heights',
  unit: 'T-01-01',
  priceRm: 500000,
  bookingDate: '2026-01-01',
  buyer: {
    name: 'Test Buyer',
    ic: '000000-00-0001',
    phone: '+60 00-000 0001',
    age: 30,
    grossMonthlyIncomeRm: 8000,
    monthlyCommitmentsRm: 1000
  },
  salesOwner: 'Test Sales',
  loanOwner: 'Test Loan',
  legalFirm: 'Test Legal LLP'
}

const RISK: CaseSummary['risk'] = {
  level: 'low',
  loanRm: 400000,
  instalmentRm: 2000,
  debtServiceRatio: 0.3,
  marginOfFinancing: 0.8,
  reasons: []
}

/** Buyer owes a payslip: `ballInCourt` reads this as holder `buyer`, next move `request_document`. */
const AWAITING_DOCUMENTS: CaseSummary = {
  bookingId: BOOKING.id,
  stage: 'loan_applied',
  unknown: false,
  bookingAgeDays: 10,
  daysSinceEvidence: 2,
  daysSinceLoIssued: null,
  daysSinceSpaSet: null,
  applications: [{ id: 'APP-TEST-1', bank: 'Test Bank', status: 'documents_pending' }],
  outstandingDocuments: ['payslip'],
  buyerWithdrew: false,
  risk: RISK,
  stallReasons: [],
  openTasks: 0
}

/** The payslip is in and the same bank is now deciding: holder `bank`, next move `chase_banker`. */
const WITH_BANK: CaseSummary = {
  ...AWAITING_DOCUMENTS,
  applications: [{ id: 'APP-TEST-1', bank: 'Test Bank', status: 'submitted' }],
  outstandingDocuments: []
}

const noop = async () => {}

describe('WaitingOnPanel', () => {
  it('re-enables Add Task once the next move changes, instead of staying on Task Added', async () => {
    const { rerender } = render(
      <WaitingOnPanel booking={BOOKING} summary={AWAITING_DOCUMENTS} referenceDate="2026-09-18" onChanged={noop} />
    )

    const addButton = () => screen.getByRole('button', { name: /Add Task|Adding…|Task Added/ })
    expect(addButton().textContent).toBe('Add Task')

    fireEvent.click(addButton())
    await waitFor(() => expect(addButton().textContent).toBe('Task Added'))
    expect(addButton().hasAttribute('disabled')).toBe(true)
    expect(vi.mocked(postTask)).toHaveBeenCalledWith(
      expect.objectContaining({ bookingId: BOOKING.id, action: 'request_document' })
    )

    // Recording the update the button just proposed changes the next move —
    // same booking, so the panel keeps its React state (it is keyed by
    // booking id in BookingDetailPage), but the task on offer is a new one.
    rerender(<WaitingOnPanel booking={BOOKING} summary={WITH_BANK} referenceDate="2026-09-18" onChanged={noop} />)

    expect(addButton().textContent).toBe('Add Task')
    expect(addButton().hasAttribute('disabled')).toBe(false)
  })

  it('keeps Task Added when re-rendered with the same next move', async () => {
    const { rerender } = render(
      <WaitingOnPanel booking={BOOKING} summary={AWAITING_DOCUMENTS} referenceDate="2026-09-18" onChanged={noop} />
    )

    const addButton = () => screen.getByRole('button', { name: /Add Task|Adding…|Task Added/ })
    fireEvent.click(addButton())
    await waitFor(() => expect(addButton().textContent).toBe('Task Added'))

    rerender(
      <WaitingOnPanel
        booking={BOOKING}
        summary={{ ...AWAITING_DOCUMENTS, daysSinceEvidence: 3 }}
        referenceDate="2026-09-18"
        onChanged={noop}
      />
    )

    expect(addButton().textContent).toBe('Task Added')
    expect(addButton().hasAttribute('disabled')).toBe(true)
  })
})

/** Jev's cached answer for the case, naming a different move to the rule's. */
function jevSuggests(action: NextActionSuggestion['action']['value']): NextActionSuggestion {
  return {
    bookingId: BOOKING.id,
    action: { value: action, probabilities: {}, confidence: 0.8 },
    owner: { value: 'sales', probabilities: {}, confidence: 0.8 },
    urgency: { score: 2, confidence: 0.8 },
    meta: { source: 'cache', stale: false, latencyMs: null }
  }
}

describe('WaitingOnPanel next step', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('leads with the rule-based move, not Jev’s, and offers Jev’s as one line', () => {
    render(
      <WaitingOnPanel
        booking={BOOKING}
        summary={WITH_BANK}
        referenceDate="2026-09-18"
        onChanged={noop}
        suggestion={jevSuggests('call_buyer')}
      />
    )

    expect(screen.getByText('Call The Banker')).toBeTruthy()
    expect(screen.getByText('Jev Suggests: Call The Buyer Instead')).toBeTruthy()
  })

  it('offers no alternative when Jev names the same move as the rule', () => {
    render(
      <WaitingOnPanel
        booking={BOOKING}
        summary={WITH_BANK}
        referenceDate="2026-09-18"
        onChanged={noop}
        suggestion={jevSuggests('chase_banker')}
      />
    )

    expect(screen.queryByText(/Jev Suggests/)).toBeNull()
  })

  it('raises the step the person picked, not always the default', async () => {
    render(
      <WaitingOnPanel
        booking={BOOKING}
        summary={WITH_BANK}
        referenceDate="2026-09-18"
        onChanged={noop}
        suggestion={jevSuggests('call_buyer')}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Do That Instead' }))

    await waitFor(() => expect(vi.mocked(postTask)).toHaveBeenCalledTimes(1))
    expect(vi.mocked(postTask)).toHaveBeenCalledWith(
      expect.objectContaining({ bookingId: BOOKING.id, action: 'call_buyer', ownerRole: 'sales' })
    )
  })

  it('raises the same default task the chase card and the table raise', async () => {
    render(<WaitingOnPanel booking={BOOKING} summary={WITH_BANK} referenceDate="2026-09-18" onChanged={noop} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

    await waitFor(() =>
      expect(vi.mocked(postTask)).toHaveBeenCalledWith(waitingOnTask(BOOKING, WITH_BANK, '2026-09-18'))
    )
  })

  it('names the outstanding document in the next step, not after it', () => {
    // AWAITING_DOCUMENTS owes a payslip, so the step reads as a sentence.
    render(
      <WaitingOnPanel booking={BOOKING} summary={AWAITING_DOCUMENTS} referenceDate="2026-09-18" onChanged={noop} />
    )

    expect(screen.getByText('Ask For Payslip')).toBeTruthy()
    expect(screen.queryByText('Ask For The Missing Document')).toBeNull()
  })

  it('says the missing document when the case does not name one', () => {
    // A bank waiting on paperwork names no document, so the step cannot.
    const undocumented = {
      ...AWAITING_DOCUMENTS,
      outstandingDocuments: [] as CaseSummary['outstandingDocuments']
    }
    render(<WaitingOnPanel booking={BOOKING} summary={undocumented} referenceDate="2026-09-18" onChanged={noop} />)

    expect(screen.getByText('Ask For The Missing Document')).toBeTruthy()
  })
})
