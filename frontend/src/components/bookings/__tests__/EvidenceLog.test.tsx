import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaseEvent } from '@mortar/core'
import { EvidenceLog } from '@/components/bookings/EvidenceLog'

const event = (over: Partial<CaseEvent>): CaseEvent => ({
  id: 'EV-T000',
  bookingId: 'BK-T001',
  applicationId: null,
  track: 'loan',
  kind: 'documents_requested',
  // Two updates back-dated to one day land at the same time.
  occurredAt: '2026-09-16T12:00:00+08:00',
  recordedAt: '2026-09-18T10:00:00+08:00',
  reportedBy: 'Tan Mei Ling',
  verifiedBy: 'Tan Mei Ling',
  status: 'confirmed',
  source: 'staff',
  messageId: null,
  document: 'payslip',
  note: null,
  ...over
})

const EVENTS = [
  event({ id: 'EV-f0000000', kind: 'documents_requested', seq: 1 }),
  event({ id: 'EV-00000000', kind: 'documents_received', seq: 2 }),
  event({ id: 'EV-80000000', kind: 'buyer_contacted', occurredAt: '2026-09-15T12:00:00+08:00', seq: 3 })
]

describe('EvidenceLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('folds the table behind a control that names how many updates it hides', () => {
    render(<EvidenceLog events={EVENTS} />)

    // The track timelines above carry the story; the full table waits.
    expect(screen.queryByRole('table')).toBeNull()
    const control = screen.getByRole('button', { name: 'Show Full History (3)' })
    expect(control.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(control)
    expect(screen.getByRole('table')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hide Full History' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('offers nothing to unfold when the case has no updates yet', () => {
    render(<EvidenceLog events={[]} />)

    expect(screen.getByText('No Updates Yet.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Show Full History/ })).toBeNull()
  })

  it('lists updates at the same time newest entry first, whatever their ids', () => {
    const { container } = render(<EvidenceLog events={EVENTS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Show Full History (3)' }))

    const rows = [...container.querySelectorAll('tbody tr')].map((row) => row.children[2]?.textContent)
    expect(rows).toEqual(['Documents Received · Payslip', 'Documents Requested · Payslip', 'Buyer Contacted · Payslip'])
  })

  it('reads the demo generator and the story fixtures as Demo, and staff and Jev as they are', () => {
    const { container } = render(
      <EvidenceLog
        events={[
          event({ id: 'EV-1', source: 'generator' }),
          event({ id: 'EV-2', source: 'story' }),
          event({ id: 'EV-3', source: 'jev' })
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Full History (3)' }))

    const sources = [...container.querySelectorAll('tbody tr')].map((row) => row.children[6]?.textContent)
    expect(sources).toEqual(['Jev', 'Demo', 'Demo'])
  })
})
