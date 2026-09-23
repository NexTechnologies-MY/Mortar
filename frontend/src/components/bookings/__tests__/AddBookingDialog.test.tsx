import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { unitKey, type SheetDefaults } from '@mortar/core'
import { importBookings } from '@/lib/api'
import { AddBookingDialog } from '../AddBookingDialog'

// Radix's popover positioning stalls jsdom for many seconds per open; the
// inline stand-in keeps open, close and content, and the Calendar stays real.
vi.mock('@/components/ui/popover', () => import('./inlinePopover'))

vi.mock('@/lib/api', () => ({
  importBookings: vi.fn()
}))

// `useNavigate` is mocked rather than exercised through a real MemoryRouter:
// in the real app a successful add navigates to /bookings/:id, which
// unmounts AddBookingDialog's own route mid-submit — a route-unmount race
// BookingsPage.test.tsx exercises for real. Isolated here, the dialog's own
// logic only needs to prove it calls navigate with the right path.
const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}))

const REFERENCE_DATE = '2026-09-18'

const DEFAULTS: SheetDefaults = {
  project: 'Kiara Residences',
  salesOwner: 'Unassigned',
  loanOwner: 'Aiman Rizal',
  legalFirm: 'Unassigned'
}

function renderDialog(props: Partial<React.ComponentProps<typeof AddBookingDialog>> = {}) {
  const onOpenChange = vi.fn()
  const onImported = vi.fn(async () => {})
  render(
    <AddBookingDialog
      open
      onOpenChange={onOpenChange}
      referenceDate={REFERENCE_DATE}
      defaults={DEFAULTS}
      held={new Map()}
      persona="loan-admin"
      onImported={onImported}
      {...props}
    />
  )
  return { onOpenChange, onImported }
}

// Required fields carry a visible "*" in a nested span, so the label's full
// text is "Unit *" rather than "Unit" — a leading-anchored pattern matches
// both required and optional fields without needing the marker spelled out.
const label = (text: string) => new RegExp(`^${text.replace(/[()]/g, '\\$&')}`)

const fillRequiredFields = (overrides: Partial<Record<string, string>> = {}) => {
  fireEvent.change(screen.getByLabelText(label('Unit')), { target: { value: overrides.unit ?? 'D-05-01' } })
  fireEvent.change(screen.getByLabelText(label('Buyer Name')), {
    target: { value: overrides.buyerName ?? 'Siti Hajar Binti Omar' }
  })
  fireEvent.change(screen.getByLabelText(label('IC')), { target: { value: overrides.ic ?? '920311-00-0001' } })
  fireEvent.change(screen.getByLabelText(label('Phone')), { target: { value: overrides.phone ?? '+60 00-000 0101' } })
  fireEvent.change(screen.getByLabelText(label('Price (RM)')), { target: { value: overrides.priceRm ?? '548000' } })
  fireEvent.change(screen.getByLabelText(label('Gross Monthly Income (RM)')), {
    target: { value: overrides.income ?? '7200' }
  })
}

/** Opens the date picker and clicks day 9 of the reference month — inside the grid, never a padding day, and before the 18th reference date. */
const pickBookingDate = () => {
  fireEvent.click(screen.getByLabelText(label('Booking Date')))
  const day9 = screen.getAllByText('9').find((el) => el.tagName === 'BUTTON')!
  fireEvent.click(day9)
}

describe('AddBookingDialog', () => {
  beforeEach(() => {
    vi.mocked(importBookings).mockReset()
    navigateMock.mockReset()
  })

  it('shows nothing wrong before the form is touched', () => {
    renderDialog()
    expect(screen.queryByText('Unit Missing')).toBeNull()
    expect(screen.queryByText('Buyer Name Missing')).toBeNull()
  })

  it('shows the required-field errors once the form is touched, exactly as the import check would', () => {
    renderDialog()
    // A wholly untouched, wholly blank row reads as a blank spreadsheet line
    // and is skipped rather than flagged (readBookingSheet's own rule), so
    // Unit carries a value here — the point is the *other* missing fields.
    fireEvent.change(screen.getByLabelText(label('Unit')), { target: { value: 'D-05-01' } })
    fireEvent.blur(screen.getByLabelText(label('Unit')))
    expect(screen.queryByText('Unit Missing')).toBeNull()
    expect(screen.getByText('Buyer Name Missing')).toBeTruthy()
    expect(screen.getByText('IC Number Missing')).toBeTruthy()
    expect(screen.getByText('Phone Missing')).toBeTruthy()
    expect(screen.getByText('Price Missing')).toBeTruthy()
    expect(screen.getByText('Booking Date Missing')).toBeTruthy()
    expect(screen.getByText('Gross Monthly Income Missing')).toBeTruthy()
  })

  it('refuses a unit an open booking already holds, the same way an import refuses it', () => {
    const held = new Map([[unitKey(DEFAULTS.project, 'D-05-01'), 'BK-0042']])
    renderDialog({ held })
    fillRequiredFields()
    pickBookingDate()
    fireEvent.blur(screen.getByLabelText(label('Unit')))
    expect(screen.getByText('Unit Already Held By BK-0042')).toBeTruthy()
  }, 20_000)

  it('clears the missing-field errors as each required text field is filled, leaving only the date', () => {
    renderDialog()
    fillRequiredFields()
    fireEvent.blur(screen.getByLabelText(label('Gross Monthly Income (RM)')))
    expect(screen.queryByText('Unit Missing')).toBeNull()
    expect(screen.queryByText('Buyer Name Missing')).toBeNull()
    expect(screen.queryByText('IC Number Missing')).toBeNull()
    expect(screen.queryByText('Phone Missing')).toBeNull()
    expect(screen.queryByText('Price Missing')).toBeNull()
    expect(screen.queryByText('Gross Monthly Income Missing')).toBeNull()
    // The date still has to be picked — this test never opens the calendar.
    expect(screen.getByText('Booking Date Missing')).toBeTruthy()
  })

  // Submitting a ready draft is slow under jsdom (tens of real seconds, not a
  // hang — it always resolves): once the calendar popover has been opened
  // and a day picked, the Popover's Presence-based exit stays mounted (no
  // animationend event ever fires under jsdom), so every further re-render
  // the click triggers keeps re-rendering the 42-cell Calendar underneath.
  // Longer per-test timeouts absorb it rather than fighting jsdom's default
  // one; nothing here is asserting on time.
  it('submits the ready draft to importBookings, toasts, refreshes and navigates to the new case', async () => {
    vi.mocked(importBookings).mockResolvedValue({
      importId: 'IMP-1',
      bookings: [
        {
          id: 'BK-0099',
          project: DEFAULTS.project,
          unit: 'D-05-01',
          priceRm: 548_000,
          bookingDate: '2026-09-09',
          buyer: {
            name: 'Siti Hajar Binti Omar',
            ic: '920311-00-0001',
            phone: '+60 00-000 0101',
            age: 34,
            grossMonthlyIncomeRm: 7_200,
            monthlyCommitmentsRm: 0,
            propertiesOwned: 0
          },
          salesOwner: 'Unassigned',
          loanOwner: 'Aiman Rizal',
          legalFirm: 'Unassigned'
        }
      ]
    })
    const { onImported } = renderDialog()
    fillRequiredFields()
    console.time('DIAG pickBookingDate')
    pickBookingDate()
    console.timeEnd('DIAG pickBookingDate')

    console.time('DIAG submit click')
    fireEvent.click(screen.getByRole('button', { name: 'Add Booking' }))
    console.timeEnd('DIAG submit click')
    console.log('DIAG immediately after click, calls=', vi.mocked(importBookings).mock.calls.length)
    console.time('DIAG waitFor importBookings')
    await waitFor(() => expect(importBookings).toHaveBeenCalledTimes(1))
    console.timeEnd('DIAG waitFor importBookings')

    const call = vi.mocked(importBookings).mock.calls[0][0]
    // reportedBy names the signed-in staff member (PERSONA_STAFF), not the booking's own Loan Officer default.
    expect(call.reportedBy).toBe('Tan Mei Ling')
    expect(call.source).toBe('Entered By Hand')
    expect(call.bookings).toHaveLength(1)
    expect(call.bookings[0]).toMatchObject({
      project: DEFAULTS.project,
      unit: 'D-05-01',
      priceRm: 548_000,
      bookingDate: '2026-09-09',
      salesOwner: DEFAULTS.salesOwner,
      loanOwner: DEFAULTS.loanOwner,
      legalFirm: DEFAULTS.legalFirm,
      buyer: expect.objectContaining({
        name: 'Siti Hajar Binti Omar',
        ic: '920311-00-0001',
        phone: '+60 00-000 0101',
        grossMonthlyIncomeRm: 7_200
      })
    })
    await waitFor(() => expect(onImported).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/bookings/BK-0099'))
  }, 90_000)

  it('shows the server error and keeps the form filled when the server refuses the booking', async () => {
    vi.mocked(importBookings).mockRejectedValue(new Error('Unit already held by BK-0042'))
    renderDialog()
    fillRequiredFields()
    pickBookingDate()

    fireEvent.click(screen.getByRole('button', { name: 'Add Booking' }))

    expect(await screen.findByText('Unit already held by BK-0042')).toBeTruthy()
    // The form keeps what was typed so the desk does not have to redo it.
    expect((screen.getByLabelText(label('Unit')) as HTMLInputElement).value).toBe('D-05-01')
    expect((screen.getByLabelText(label('Buyer Name')) as HTMLInputElement).value).toBe('Siti Hajar Binti Omar')
  }, 90_000)
})
