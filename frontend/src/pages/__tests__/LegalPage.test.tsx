import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaseEvent, CaseSummary, Snapshot } from '@mortar/core'
import { booking, snapshot, stalledCase } from './mockSnapshot'
import { postEvent } from '@/lib/api'

const appointmentFor = (bookingId: string, note: string): CaseEvent => ({
  id: `EV-${bookingId}`,
  bookingId,
  applicationId: null,
  track: 'legal',
  kind: 'spa_appointment_set',
  occurredAt: '2026-08-28T10:00:00+08:00',
  recordedAt: '2026-08-28T10:05:00+08:00',
  reportedBy: 'Fixture',
  verifiedBy: 'Nurul Aina',
  status: 'confirmed',
  source: 'generator',
  messageId: null,
  document: null,
  note
})

const SNAP: Snapshot = snapshot({
  bookings: [
    booking('BK-0024', { unit: 'A-12-03', priceRm: 820000, legalFirm: 'Kuan & Teh Advocates' }),
    booking('BK-0113', { unit: 'B-04-01', priceRm: 610000, legalFirm: 'Kuan & Teh Advocates' }),
    booking('BK-0500', { unit: 'C-08-02', priceRm: 430000, legalFirm: 'Lim Yap & Associates' }),
    booking('BK-0600', { unit: 'E-01-04', priceRm: 470000, legalFirm: 'Kuan & Teh Advocates' }),
    booking('BK-0900', { unit: 'D-02-02', priceRm: 390000 })
  ],
  events: [
    appointmentFor('BK-0024', 'Appointment On 2026-07-29'),
    // A date still to come, so the row reads as a date rather than as passed.
    appointmentFor('BK-0113', 'Appointment On 2026-10-05')
  ]
})

const CASES: CaseSummary[] = [
  stalledCase('BK-0024', {
    stage: 'lo_issued',
    daysSinceLoIssued: 67,
    daysSinceSpaSet: 57,
    stallReasons: ['SPA Set 57 Days Ago, Still Unsigned']
  }),
  stalledCase('BK-0113', { stage: 'lo_issued', daysSinceLoIssued: 65, daysSinceSpaSet: 12, stallReasons: [] }),
  stalledCase('BK-0500', { stage: 'lo_issued', daysSinceLoIssued: 4, daysSinceSpaSet: null, stallReasons: [] }),
  stalledCase('BK-0600', { stage: 'lo_issued', daysSinceLoIssued: 2, daysSinceSpaSet: null, stallReasons: [] }),
  // Not in the legal waiting room: it must not reach the queue.
  stalledCase('BK-0900', { stage: 'loan_applied' })
]

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: SNAP, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => CASES
}))

// The Legal page records under the signed-in persona's own name.
vi.mock('@/lib/persona', () => ({
  usePersona: () => ({ persona: 'legal-admin' })
}))

vi.mock('@/lib/api', () => ({
  postEvent: vi.fn(async () => ({})),
  postApplication: vi.fn(async () => ({}))
}))

// The preset dialog opens a real date field: Radix's popover positioning
// stalls jsdom (see inlinePopover), so it opens inline instead.
vi.mock('@/components/ui/popover', () => import('@/components/bookings/__tests__/inlinePopover'))

import { LegalPage } from '@/pages/LegalPage'

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
// Radix places the select menu with floating-ui, which needs observers,
// pointer capture and scrolling that jsdom lacks.
Element.prototype.scrollIntoView = () => {}
Element.prototype.hasPointerCapture = () => false
Element.prototype.releasePointerCapture = () => {}

function renderPage() {
  return render(
    <MemoryRouter>
      <LegalPage />
    </MemoryRouter>
  )
}

/** The figure rendered in the stat tile carrying `label`. */
const stat = (label: string) => screen.getByText(label).closest('div')!.parentElement!.textContent ?? ''

describe('LegalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('counts only the cases sitting between approval and signing', () => {
    renderPage()
    expect(document.querySelector('[data-tour="legal-header"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="legal-no-appointment"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="legal-appointment-set"]')).toBeTruthy()
    expect(document.querySelector('[data-tour="legal-panel-load"]')).toBeTruthy()
    expect(stat('Awaiting SPA')).toContain('4')
    expect(stat('Past The Threshold')).toContain('1')
    expect(stat('Longest Wait')).toContain('67 d')
  })

  it('lists the waiting cases across the two sections and leaves the loan-stage one out', () => {
    renderPage()
    const rows = screen.getAllByRole('row', { name: /Open Booking/ })
    const ids = rows.map((r) => within(r).getAllByRole('cell')[0].textContent)
    // The no-appointment section comes first on the page, then the set-but-unsigned one.
    expect(ids).toEqual(['BK-0500', 'BK-0600', 'BK-0024', 'BK-0113'])
    expect(ids).not.toContain('BK-0900')
  })

  it('shows a passed appointment as the date it was, and a date still to come as itself', () => {
    renderPage()
    // A set appointment whose date has gone by with nothing signed is the case
    // to chase, so the cell says what happened rather than reading as a plan.
    const passed = within(screen.getByRole('row', { name: /BK-0024/ })).getByText('Was On 29 Jul 2026')
    expect(passed.className).toContain('text-status-danger-fg')
    expect(within(screen.getByRole('row', { name: /BK-0024/ })).queryByText('29 Jul 2026')).toBeNull()

    const upcoming = within(screen.getByRole('row', { name: /BK-0113/ })).getByText('5 Oct 2026')
    expect(upcoming.className).not.toContain('text-status-danger-fg')
  })

  it('carries the appointment date alone, never the note it was written into', () => {
    renderPage()
    // The column header already says SPA Appointment, so repeating it in the
    // cell only ever left less room for the date.
    const appointmentCells = screen
      .getAllByRole('row', { name: /Open Booking/ })
      .map((row) => within(row).getAllByRole('cell')[5].textContent)
    expect(appointmentCells).toEqual(['Not Set', 'Not Set', 'Was On 29 Jul 2026', '5 Oct 2026'])
  })

  it('sizes the columns so no cell text truncates at 1280 or 1440', () => {
    renderPage()
    const table = screen.getAllByRole('columnheader', { name: 'Booking' })[0].closest('table') as HTMLTableElement

    // Every fixed column is declared, and the widths are the ones the longest
    // real cell in each column needs: the slack lands on Buyer rather than
    // truncating somebody else's text.
    const widths = [...table.querySelectorAll('col')].map((col) => parseInt((col as HTMLTableElement).style.width, 10))
    expect(widths.slice(0, 2)).toEqual([88, 88])
    expect(widths[3]).toBe(200) // Firm: "Kuan & Teh Advocates", 172px of 14px text
    expect(widths[5]).toBe(176) // Appointment: "Was On 29 Jul 2026"
    expect(widths[6]).toBe(208) // Record: "Record Appointment", 152px plus the button's 24px
    expect(200 - 24).toBeGreaterThanOrEqual(172)
    expect(176 - 24).toBeGreaterThanOrEqual(124)
    expect(208 - 24).toBeGreaterThanOrEqual(152)
    // The table is no wider than the narrowest desktop it has to fit, so
    // nothing scrolls sideways at 1280 either.
    expect(parseInt(table.style.minWidth, 10)).toBeLessThanOrEqual(1184)
  })

  it('splits the queue into No Appointment Yet and Appointment Set, Not Signed sections', () => {
    renderPage()
    expect(screen.getByText(/No Appointment Yet \(2\)/)).toBeTruthy()
    expect(screen.getByText(/Appointment Set, Not Signed \(2\)/)).toBeTruthy()
  })

  it('puts each queue table on a solid card surface', () => {
    renderPage()
    const sections = [
      screen.getByText(/No Appointment Yet/).closest('section'),
      screen.getByText(/Appointment Set, Not Signed/).closest('section')
    ]
    for (const section of sections) {
      const table = section?.querySelector('table')
      expect(table).toBeTruthy()
      const surface = table?.closest('[data-slot="table-container"]')?.parentElement
      expect(surface?.className).toContain('bg-card')
      expect(surface?.className).toContain('border-card-border')
      expect(surface?.className).toContain('shadow-card')
    }
  })

  it('renders Days Since Loan Approved column header instead of Days Since LO', () => {
    renderPage()
    expect(screen.getAllByRole('columnheader', { name: 'Days Since Loan Approved' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('columnheader', { name: 'Days Since LO' })).toBeNull()
  })

  it('groups the panel load by firm and refuses to read it as performance', () => {
    renderPage()
    const load = screen.getByRole('columnheader', { name: 'Awaiting' }).closest('table')!
    const firms = within(load)
      .getAllByRole('row')
      .slice(1)
      .map((r) =>
        within(r)
          .getAllByRole('cell')
          .map((c) => c.textContent)
      )
    // Two cases with Kuan & Teh, two with Lim Yap; the median of a pair is
    // their mean.
    expect(firms).toEqual([
      ['Kuan & Teh Advocates', '3', '65 d', 'RM 1.9m'],
      ['Lim Yap & Associates', '1', '4 d', 'RM 430.0k']
    ])
    expect(screen.getByText(/Load, not performance/)).toBeTruthy()
  })

  it('sorts queue by firm ascending, descending, and back to default across clicks', () => {
    renderPage()
    const queueTable = screen.getAllByRole('columnheader', { name: 'Booking' })[0].closest('table')!
    const firmHeader = within(queueTable).getByRole('columnheader', { name: 'Firm' })
    const firmButton = within(firmHeader).getByRole('button', { name: 'Firm' })

    const queueRows = () => within(queueTable).getAllByRole('row', { name: /Open Booking/ })
    const rowIds = () => queueRows().map((r) => within(r).getAllByRole('cell')[0].textContent)
    const firmCells = () => queueRows().map((r) => within(r).getAllByRole('cell')[3].textContent)

    fireEvent.click(firmButton)
    expect(firmHeader.getAttribute('aria-sort')).toBe('ascending')
    expect(firmCells()).toEqual(['Kuan & Teh Advocates', 'Lim Yap & Associates'])
    expect(rowIds()).toEqual(['BK-0600', 'BK-0500'])

    fireEvent.click(firmButton)
    expect(firmHeader.getAttribute('aria-sort')).toBe('descending')
    expect(firmCells()).toEqual(['Lim Yap & Associates', 'Kuan & Teh Advocates'])
    expect(rowIds()).toEqual(['BK-0500', 'BK-0600'])

    fireEvent.click(firmButton)
    expect(firmHeader.getAttribute('aria-sort')).toBe('none')
    expect(rowIds()).toEqual(['BK-0500', 'BK-0600'])
  })

  it('offers each section the update a legal admin makes on it, without the case page', () => {
    renderPage()
    // Two queues, two different actions, and every row in a queue gets the same
    // one: never a filled button on the first row only.
    const buttons = screen.getAllByRole('button', { name: /Record (Appointment|Signing)/ })
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Record Appointment',
      'Record Appointment',
      'Record Signing',
      'Record Signing'
    ])
    for (const button of buttons) expect(button.className).toContain('border-input')
  })

  it('records an SPA appointment from the row, preset, without opening the case', async () => {
    renderPage()

    const row = screen.getByRole('row', { name: /BK-0500/ })
    fireEvent.click(within(row).getByRole('button', { name: 'Record Appointment' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Record The SPA Appointment')).toBeTruthy()
    // Preset, so the reader writes down the call they already took.
    expect(within(dialog).getByRole('combobox', { name: 'What Happened' }).textContent).toContain('SPA Appointment Set')

    // The form needs the appointment date before it will save.
    fireEvent.click(within(dialog).getByLabelText('Appointment Date', { selector: 'button' }))
    fireEvent.click(await within(dialog).findByLabelText('Monday, September 21st, 2026'))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Record Update' }))

    await waitFor(() =>
      expect(vi.mocked(postEvent)).toHaveBeenCalledWith(
        expect.objectContaining({ bookingId: 'BK-0500', track: 'legal', kind: 'spa_appointment_set' })
      )
    )
    // Saved, so the dialog stands down and the queue re-reads.
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('records an SPA signing from the row, preset, without opening the case', async () => {
    renderPage()

    const row = screen.getByRole('row', { name: /BK-0113/ })
    fireEvent.click(within(row).getByRole('button', { name: 'Record Signing' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Record The SPA Signing')).toBeTruthy()
    expect(within(dialog).getByRole('combobox', { name: 'What Happened' }).textContent).toContain('SPA Signed')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Record Update' }))

    await waitFor(() =>
      expect(vi.mocked(postEvent)).toHaveBeenCalledWith(
        expect.objectContaining({ bookingId: 'BK-0113', track: 'legal', kind: 'spa_signed' })
      )
    )
  })
})
