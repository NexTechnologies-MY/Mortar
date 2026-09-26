import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
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

describe('EvidenceLog', () => {
  it('lists updates at the same time newest entry first, whatever their ids', () => {
    const { container } = render(
      <EvidenceLog
        events={[
          event({ id: 'EV-f0000000', kind: 'documents_requested', seq: 1 }),
          event({ id: 'EV-00000000', kind: 'documents_received', seq: 2 }),
          event({ id: 'EV-80000000', kind: 'buyer_contacted', occurredAt: '2026-09-15T12:00:00+08:00', seq: 3 })
        ]}
      />
    )
    const rows = [...container.querySelectorAll('tbody tr')].map((row) => row.children[2]?.textContent)
    expect(rows).toEqual(['Documents Received · Payslip', 'Documents Requested · Payslip', 'Buyer Contacted · Payslip'])
  })
})
