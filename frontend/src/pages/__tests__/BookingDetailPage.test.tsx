import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { summarizeCases } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { BookingDetailPage } from '@/pages/BookingDetailPage'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import {
  fetchSignals,
  fetchSnapshot,
  postApplication,
  postEvent,
  postMessage,
  reviewEvent,
  updateTask
} from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  const snapshot = fixture.buildSnapshot()
  return {
    fetchSnapshot: vi.fn(async () => snapshot),
    fetchSignals: vi.fn(async () => fixture.SIGNALS_9001),
    fetchPlaybooks: vi.fn(async () => fixture.RANKING_9001),
    reviewEvent: vi.fn(async () => ({})),
    extractMessage: vi.fn(async () => ({})),
    postMessage: vi.fn(async () => ({ message: {}, extraction: fixture.EXTRACTION_9001, event: null })),
    postEvent: vi.fn(async () => ({})),
    postApplication: vi.fn(async () => ({})),
    updateTask: vi.fn(async () => ({}))
  }
})

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

/** Opens a Mortar Select by its label and picks an option. */
async function choose(label: string, option: string | RegExp) {
  fireEvent.click(screen.getByRole('combobox', { name: label }))
  fireEvent.click(await screen.findByRole('option', { name: option }))
}

/** Opens a date field by its label and picks a day, named as the calendar reads it. */
async function pickDay(label: string, day: string) {
  fireEvent.click(screen.getByLabelText(label, { selector: 'button' }))
  fireEvent.click(await screen.findByLabelText(day, { selector: 'button' }))
}

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
    expect(screen.getByText('Case History')).toBeTruthy()
  })

  it("shows the banker's message with Jev's proposal and confirms it", async () => {
    renderDetail()

    expect(await screen.findByText(/Still need latest 3 months slip gaji/)).toBeTruthy()
    expect(screen.getAllByText('Jev Suggests').length).toBeGreaterThan(0)
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

  it('keeps the case on screen with a Try Again notice when the save lands but the refresh after it fails', async () => {
    renderDetail()

    expect(await screen.findByText('Request Latest Three Months Payslips From Buyer')).toBeTruthy()
    // The task update itself succeeds; only the follow-up snapshot read fails.
    vi.mocked(fetchSnapshot).mockRejectedValueOnce(new Error('network down'))
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))

    expect(await screen.findByText('Could Not Refresh. Showing The Last Loaded Data.')).toBeTruthy()
    // The case stays on screen — it does not vanish behind a blocking error.
    expect(screen.getByText('A-12-03')).toBeTruthy()
    expect(screen.getByText('Case History')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    await waitFor(() => expect(screen.queryByText('Could Not Refresh. Showing The Last Loaded Data.')).toBeNull())
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
    // The no-update read collapses to one muted line — no proposal panel.
    expect(within(item).queryByText('Jev Suggests')).toBeNull()
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

  describe('Record An Update', () => {
    it('records Loan Approved against its bank on the day chosen, then re-reads the case', async () => {
      renderDetail()
      expect(await screen.findByText('Record An Update')).toBeTruthy()

      await choose('What Happened', 'Loan Approved (LO Issued)')
      // Apex Bank holds the one open application, so it is chosen already.
      expect(screen.getByRole('combobox', { name: 'Which Bank' }).textContent).toContain('Apex Bank')
      await pickDay('When It Happened', 'Wednesday, September 16th, 2026')
      fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'LO received by email' } })
      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))

      await waitFor(() =>
        expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          track: 'loan',
          kind: 'loan_approved',
          applicationId: 'APP-9001-1',
          occurredOn: '2026-09-16',
          note: 'LO received by email',
          reportedBy: 'Nurul Aina'
        })
      )
      await waitFor(() => expect(vi.mocked(fetchSnapshot)).toHaveBeenCalledTimes(2))
      expect(vi.mocked(postApplication)).not.toHaveBeenCalled()
    })

    it('writes an SPA appointment into the note the Legal desk reads', async () => {
      renderDetail()
      await screen.findByText('Record An Update')

      await choose('What Happened', 'SPA Appointment Set')
      // The appointment day is required.
      const record = screen.getByRole('button', { name: 'Record Update' }) as HTMLButtonElement
      expect(record.disabled).toBe(true)
      await pickDay('Appointment Date', 'Friday, September 25th, 2026')
      fireEvent.click(record)

      await waitFor(() =>
        expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          track: 'legal',
          kind: 'spa_appointment_set',
          occurredOn: '2026-09-18',
          note: 'Appointment On 2026-09-25',
          reportedBy: 'Nurul Aina'
        })
      )
    })

    it('records Submitted To A Bank as a new application', async () => {
      renderDetail()
      await screen.findByText('Record An Update')

      await choose('What Happened', 'Submitted To A Bank')
      fireEvent.change(screen.getByLabelText('Bank'), { target: { value: 'Harbour Bank' } })
      fireEvent.change(screen.getByLabelText('Banker'), { target: { value: 'Lim Wei Jie' } })
      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))

      await waitFor(() =>
        expect(vi.mocked(postApplication)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          bank: 'Harbour Bank',
          banker: 'Lim Wei Jie',
          occurredOn: '2026-09-18',
          reportedBy: 'Nurul Aina'
        })
      )
      expect(vi.mocked(postEvent)).not.toHaveBeenCalled()
    })

    it('asks before recording a cancellation, with Cancel focused', async () => {
      renderDetail()
      await screen.findByText('Record An Update')

      await choose('What Happened', 'Cancelled')
      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))
      let dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByText('Record This Booking As Cancelled?')).toBeTruthy()
      await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' })))

      // Backing out records nothing.
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(vi.mocked(postEvent)).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))
      dialog = await screen.findByRole('dialog')
      fireEvent.click(within(dialog).getByRole('button', { name: 'Record Cancellation' }))
      await waitFor(() =>
        expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          track: 'sales',
          kind: 'cancelled',
          occurredOn: '2026-09-18',
          reportedBy: 'Nurul Aina'
        })
      )
    })

    it('is not offered on a closed case', async () => {
      const snapshot = buildSnapshot()
      const closed = summarizeCases(snapshot, snapshot.meta.referenceDate).find(
        (c) => c.stage === 'cancelled' || c.stage === 'lapsed'
      )
      expect(closed).toBeTruthy()
      renderDetail(closed!.bookingId)

      expect(await screen.findByText('Case History')).toBeTruthy()
      // Messages can still be logged; only updates stop.
      expect(screen.getByLabelText('Sender Role')).toBeTruthy()
      expect(screen.queryByText('Record An Update')).toBeNull()
    })
  })

  describe('Add Message Sent At', () => {
    it('sends the day and time the message was sent', async () => {
      renderDetail()

      fireEvent.change(await screen.findByLabelText('Message'), { target: { value: 'Payslip sent last night' } })
      await pickDay('Sent At', 'Thursday, September 17th, 2026')
      fireEvent.change(screen.getByLabelText('Time'), { target: { value: '21:05' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Message' }))

      await waitFor(() =>
        expect(vi.mocked(postMessage)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          senderRole: 'buyer',
          senderName: 'Raymond Tan Wei Hong',
          body: 'Payslip sent last night',
          sentAt: '2026-09-17T21:05:00+08:00'
        })
      )
    })

    it('defaults to now on the desks’ today', async () => {
      renderDetail()

      fireEvent.change(await screen.findByLabelText('Message'), { target: { value: 'Noted, thanks' } })
      expect(screen.getByLabelText('Sent At, 18 Sep 2026')).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: 'Add Message' }))

      await waitFor(() => expect(vi.mocked(postMessage)).toHaveBeenCalledTimes(1))
      expect(vi.mocked(postMessage).mock.calls[0][0].sentAt).toMatch(/^2026-09-18T\d{2}:\d{2}:00\+08:00$/)
    })

    it('will not send a time that is not a time', async () => {
      renderDetail()

      fireEvent.change(await screen.findByLabelText('Message'), { target: { value: 'Noted, thanks' } })
      fireEvent.change(screen.getByLabelText('Time'), { target: { value: '25:00' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Message' }))

      expect(await screen.findByText('Enter The Time As HH:MM, For Example 09:30.')).toBeTruthy()
      expect(vi.mocked(postMessage)).not.toHaveBeenCalled()
    })
  })
})
