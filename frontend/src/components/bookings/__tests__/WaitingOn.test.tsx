import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Booking, CaseSummary } from '@mortar/core'
import { WaitingOnPanel } from '@/components/bookings/WaitingOn'
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
