import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { CaseEvent, CaseSummary, Snapshot } from '@mortar/core'
import { booking, snapshot, stalledCase } from './mockSnapshot'

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
    booking('BK-0900', { unit: 'D-02-02', priceRm: 390000 })
  ],
  events: [appointmentFor('BK-0024', 'Appointment On 2026-07-29')]
})

const CASES: CaseSummary[] = [
  stalledCase('BK-0024', {
    stage: 'lo_issued',
    daysSinceLoIssued: 67,
    daysSinceSpaSet: 57,
    stallReasons: ['SPA Set 57 Days Ago, Still Unsigned']
  }),
  stalledCase('BK-0113', { stage: 'lo_issued', daysSinceLoIssued: 65, daysSinceSpaSet: null, stallReasons: [] }),
  stalledCase('BK-0500', { stage: 'lo_issued', daysSinceLoIssued: 4, daysSinceSpaSet: null, stallReasons: [] }),
  // Not in the legal waiting room: it must not reach the queue.
  stalledCase('BK-0900', { stage: 'loan_applied' })
]

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: SNAP, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => CASES
}))

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
  it('counts only the cases sitting between approval and signing', () => {
    renderPage()
    expect(stat('Awaiting SPA')).toContain('3')
    expect(stat('Past The Threshold')).toContain('1')
    expect(stat('Longest Wait')).toContain('67 d')
  })

  it('lists the waiting cases longest first and leaves the loan-stage one out', () => {
    renderPage()
    const rows = screen.getAllByRole('row', { name: /Open Booking/ })
    const ids = rows.map((r) => within(r).getAllByRole('cell')[0].textContent)
    expect(ids).toEqual(['BK-0024', 'BK-0113', 'BK-0500'])
    expect(ids).not.toContain('BK-0900')
  })

  it('shows the appointment note when there is one and says so when there is not', () => {
    renderPage()
    const row = screen.getByRole('row', { name: /BK-0024/ })
    expect(within(row).getByText('Appointment On 2026-07-29')).toBeTruthy()
    expect(within(screen.getByRole('row', { name: /BK-0113/ })).getByText('Not Set')).toBeTruthy()
  })

  it('says how many have no appointment on the log at all', () => {
    renderPage()
    expect(screen.getByText('2 of these have no SPA appointment on the log at all.')).toBeTruthy()
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
    // Two cases with Kuan & Teh, one with Lim Yap; the median of the pair is their mean.
    expect(firms).toEqual([
      ['Kuan & Teh Advocates', '2', '66 d', 'RM 1.4m'],
      ['Lim Yap & Associates', '1', '4 d', 'RM 430.0k']
    ])
    expect(screen.getByText(/Load, not performance/)).toBeTruthy()
  })
})
