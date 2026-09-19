import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { BookingDetailPage } from '@/pages/BookingDetailPage'
import { fetchSignals, reviewEvent, updateTask } from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  const snapshot = fixture.buildSnapshot()
  return {
    fetchSnapshot: vi.fn(async () => snapshot),
    fetchSignals: vi.fn(async () => fixture.SIGNALS_9001),
    fetchPlaybooks: vi.fn(async () => fixture.RANKING_9001),
    reviewEvent: vi.fn(async () => ({})),
    extractMessage: vi.fn(async () => ({})),
    postMessage: vi.fn(async () => ({})),
    updateTask: vi.fn(async () => ({}))
  }
})

function renderDetail(id = 'BK-9001') {
  return render(
    <MemoryRouter initialEntries={[`/bookings/${id}`]}>
      <PersonaProvider>
        <SnapshotProvider>
          <Routes>
            <Route path="/bookings/:id" element={<BookingDetailPage />} />
          </Routes>
        </SnapshotProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('BookingDetailPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the case header, tracks and applications', async () => {
    renderDetail()

    expect(await screen.findByText('A-12-03')).toBeTruthy()
    expect(screen.getAllByText('Raymond Tan Wei Hong').length).toBeGreaterThan(0)
    expect(screen.getByText(/RM 550,000/)).toBeTruthy()
    expect(screen.getByText('Loan Track')).toBeTruthy()
    expect(screen.getByText('Legal Track')).toBeTruthy()
    expect(screen.getByText('Apex Bank')).toBeTruthy()
    expect(screen.getByText('Evidence Log')).toBeTruthy()
  })

  it("shows the banker's message with Jev's proposal and confirms it", async () => {
    renderDetail()

    expect(await screen.findByText(/Still need latest 3 months slip gaji/)).toBeTruthy()
    expect(screen.getAllByText('Jev Proposal').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Documents Requested').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Payslip').length).toBeGreaterThan(0)
    expect(screen.getByText('Confidence 91%')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(vi.mocked(reviewEvent)).toHaveBeenCalledWith('EV-9001-J1', {
        decision: 'confirm',
        reviewer: 'Nurul Aina'
      })
    )
  })

  it('ranks the missing-documents playbook first by Jev fit', async () => {
    renderDetail()

    expect(await screen.findByText(/Missing Income Documents/)).toBeTruthy()
    expect(screen.getAllByText('Direct Fit').length).toBeGreaterThan(0)
  })

  it('lists the open task and completes it', async () => {
    renderDetail()

    expect(await screen.findByText('Request Latest Three Months Payslips From Buyer')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))

    await waitFor(() => expect(vi.mocked(updateTask)).toHaveBeenCalledWith('TSK-9001-1', 'done'))
  })

  it('renders the add message form', async () => {
    renderDetail()

    expect(await screen.findByText('Sender Role')).toBeTruthy()
    expect(screen.getByText('Sender Name')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add Message' })).toBeTruthy()
  })

  it('does not dress an extraction in the status of an event recording a different claim', async () => {
    renderDetail('BK-9002')

    // MSG-9002-1: Jev read documents_received, but the message only carries the confirmed `booked`.
    const body = await screen.findByText(/Passing my payslips and bank statement/)
    const item = body.closest('li')!
    expect(within(item).getByText('Documents Received')).toBeTruthy()
    expect(within(item).getByText('Payslip')).toBeTruthy()
    expect(within(item).queryByText('Confirmed')).toBeNull()
    expect(within(item).queryByRole('button', { name: 'Confirm' })).toBeNull()
  })

  it('shows no status pill for a no_update read beside a confirmed event', async () => {
    renderDetail('BK-9001')

    // MSG-9001-3: the linked buyer_contacted is confirmed, but Jev read no update.
    const body = await screen.findByText(/Very keen to sign once the loan is approved/)
    const item = body.closest('li')!
    expect(within(item).getByText('No Case Update In This Message.')).toBeTruthy()
    expect(within(item).queryByText('Confirmed')).toBeNull()
  })

  it('asks Jev for signals once the buyer has messaged', async () => {
    renderDetail('BK-9001')

    expect(await screen.findByText('Prompt Replies')).toBeTruthy()
    await waitFor(() => expect(vi.mocked(fetchSignals)).toHaveBeenCalledWith('BK-9001'))
  })

  it('never asks Jev for signals when the buyer has not messaged', async () => {
    renderDetail('BK-0001')

    expect(await screen.findByText('No Buyer Messages Have Arrived Yet.')).toBeTruthy()
    await waitFor(() => expect(vi.mocked(fetchSignals)).not.toHaveBeenCalled())
  })

  it('does not fetch signals for a booking missing from the snapshot', async () => {
    renderDetail('BK-9999')

    expect(await screen.findByText('Booking Not Found')).toBeTruthy()
    await waitFor(() => expect(vi.mocked(fetchSignals)).not.toHaveBeenCalled())
  })
})
