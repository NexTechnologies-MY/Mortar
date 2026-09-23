import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Booking, CaseSummary, LoanApplication } from '@mortar/core'
import { RecordUpdateForm } from '@/components/bookings/RecordUpdateForm'
import { postEvent } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  postEvent: vi.fn(async () => ({})),
  postApplication: vi.fn(async () => ({}))
}))

// The date fields open inline: Radix's popover positioning stalls jsdom (see inlinePopover).
vi.mock('@/components/ui/popover', () => import('@/components/bookings/__tests__/inlinePopover'))

// Radix places the select menu with floating-ui, which needs observers,
// pointer capture and scrolling that jsdom lacks.
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
Element.prototype.scrollIntoView = () => {}
Element.prototype.hasPointerCapture = () => false
Element.prototype.releasePointerCapture = () => {}

const BOOKING: Booking = {
  id: 'BK-9001',
  project: 'Aster Heights',
  unit: 'A-12-03',
  priceRm: 550000,
  bookingDate: '2026-09-02',
  buyer: {
    name: 'Raymond Tan Wei Hong',
    ic: '••••••-••-9001',
    phone: '+•• ••-••• 9001',
    age: 31,
    grossMonthlyIncomeRm: 9500,
    monthlyCommitmentsRm: 600,
    propertiesOwned: 0
  },
  salesOwner: 'Nurul Aina',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Khor & Associates'
}

const MALAYAN: LoanApplication = { id: 'APP-1', bookingId: 'BK-9001', bank: 'Malayan Trust Bank', banker: 'Siti' }
const CREST: LoanApplication = { id: 'APP-2', bookingId: 'BK-9001', bank: 'Crestline Bank', banker: 'Aida' }

function summary(applications: CaseSummary['applications']): CaseSummary {
  return {
    bookingId: 'BK-9001',
    stage: applications.length ? 'loan_applied' : 'booked',
    unknown: false,
    bookingAgeDays: 16,
    daysSinceEvidence: 2,
    daysSinceLoIssued: null,
    daysSinceSpaSet: null,
    applications,
    outstandingDocuments: [],
    buyerWithdrew: false,
    risk: { level: 'low', loanRm: 0, instalmentRm: 0, debtServiceRatio: 0.2, marginOfFinancing: 0.9, reasons: [] },
    stallReasons: [],
    openTasks: 0
  }
}

function renderForm(applications: LoanApplication[], statuses: CaseSummary['applications']) {
  const onRecorded = vi.fn(async () => {})
  render(
    <RecordUpdateForm
      booking={BOOKING}
      applications={applications}
      summary={summary(statuses)}
      referenceDate="2026-09-18"
      reportedBy="Tan Mei Ling"
      onRecorded={onRecorded}
    />
  )
  return { onRecorded }
}

async function choose(label: string, option: string | RegExp) {
  fireEvent.click(screen.getByRole('combobox', { name: label }))
  fireEvent.click(await screen.findByRole('option', { name: option }))
}

const recordButton = () => screen.getByRole('button', { name: 'Record Update' }) as HTMLButtonElement

describe('RecordUpdateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('asks for a submission first when a decision has no bank to name', async () => {
    renderForm([], [])

    await choose('What Happened', 'Loan Approved (LO Issued)')
    expect(screen.getByText('Record Submitted To A Bank First')).toBeTruthy()
    expect(recordButton().disabled).toBe(true)
  })

  it('lets documents be requested before any bank, naming the document', async () => {
    const { onRecorded } = renderForm([], [])

    await choose('What Happened', 'Documents Requested')
    expect(screen.queryByText('Record Submitted To A Bank First')).toBeNull()
    expect(recordButton().disabled).toBe(true)
    await choose('Document', 'Payslip')
    fireEvent.click(recordButton())

    await waitFor(() =>
      expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
        bookingId: 'BK-9001',
        track: 'loan',
        kind: 'documents_requested',
        document: 'payslip',
        occurredOn: '2026-09-18',
        reportedBy: 'Tan Mei Ling'
      })
    )
    await waitFor(() => expect(onRecorded).toHaveBeenCalledTimes(1))
    // The form clears for the next update.
    expect(screen.getByRole('combobox', { name: 'What Happened' }).textContent).toContain('Choose What Happened')
  })

  it('offers only the undecided bank for a decision, and picks it when it is the only one', async () => {
    renderForm(
      [MALAYAN, CREST],
      [
        { id: 'APP-1', bank: 'Malayan Trust Bank', status: 'rejected' },
        { id: 'APP-2', bank: 'Crestline Bank', status: 'submitted' }
      ]
    )

    await choose('What Happened', 'Loan Approved (LO Issued)')
    const bank = screen.getByRole('combobox', { name: 'Which Bank' })
    expect(bank.textContent).toContain('Crestline Bank')
    fireEvent.click(bank)
    const rejected = await screen.findByRole('option', { name: /Malayan Trust Bank/ })
    expect(rejected.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(await screen.findByRole('option', { name: /Crestline Bank/ }))
    fireEvent.click(recordButton())

    await waitFor(() =>
      expect(vi.mocked(postEvent)).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'loan_approved', applicationId: 'APP-2' })
      )
    )
  })

  it('picks the day an update happened from the calendar, never after today', async () => {
    renderForm([MALAYAN], [{ id: 'APP-1', bank: 'Malayan Trust Bank', status: 'submitted' }])

    await choose('What Happened', 'Buyer Contacted')
    fireEvent.click(screen.getByLabelText('When It Happened', { selector: 'button' }))
    expect((await screen.findByLabelText('Saturday, September 19th, 2026')).hasAttribute('disabled')).toBe(true)
    expect(screen.getByLabelText('Tuesday, September 1st, 2026').hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByLabelText('Thursday, September 10th, 2026'))
    expect(screen.getByLabelText('When It Happened, 10 Sep 2026')).toBeTruthy()
    fireEvent.click(recordButton())

    await waitFor(() =>
      expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
        bookingId: 'BK-9001',
        track: 'sales',
        kind: 'buyer_contacted',
        occurredOn: '2026-09-10',
        reportedBy: 'Tan Mei Ling'
      })
    )
  })
})
