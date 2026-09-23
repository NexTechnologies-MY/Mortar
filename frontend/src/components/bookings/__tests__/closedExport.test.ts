import { describe, expect, it, vi } from 'vitest'
import type { Booking, CaseEvent, CaseSummary } from '@mortar/core'
import { buildClosedExportRows } from '../closedExport'

vi.mock('write-excel-file/browser', () => ({
  default: vi.fn(() => ({ toFile: vi.fn().mockResolvedValue(undefined) }))
}))

const RISK: CaseSummary['risk'] = {
  level: 'low',
  loanRm: 400_000,
  instalmentRm: 2_000,
  debtServiceRatio: 0.3,
  marginOfFinancing: 0.8,
  reasons: []
}

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'BK-0001',
    project: 'Kiara Residences',
    unit: 'D-05-01',
    priceRm: 548_000,
    bookingDate: '2026-01-05',
    buyer: {
      name: 'Siti Hajar Binti Omar',
      ic: '920311-00-0001',
      phone: '+60 00-000 0101',
      age: 34,
      grossMonthlyIncomeRm: 7_200,
      monthlyCommitmentsRm: 0,
      propertiesOwned: 0
    },
    salesOwner: 'Farah Izzati',
    loanOwner: 'Aiman Rizal',
    legalFirm: 'Wong Rahman Chambers',
    ...overrides
  }
}

function summary(overrides: Partial<CaseSummary> = {}): CaseSummary {
  return {
    bookingId: 'BK-0001',
    stage: 'disbursed',
    spaSigned: true,
    unknown: false,
    bookingAgeDays: 120,
    daysSinceEvidence: 5,
    daysSinceLoIssued: 90,
    daysSinceSpaSet: 80,
    applications: [],
    outstandingDocuments: [],
    buyerWithdrew: false,
    risk: RISK,
    stallReasons: [],
    openTasks: 0,
    ...overrides
  }
}

function event(overrides: Partial<CaseEvent> = {}): CaseEvent {
  return {
    id: 'EV-1',
    bookingId: 'BK-0001',
    applicationId: null,
    track: 'loan',
    kind: 'disbursed',
    occurredAt: '2026-06-01T09:00:00+08:00',
    recordedAt: '2026-06-01T09:05:00+08:00',
    reportedBy: 'Aiman Rizal',
    verifiedBy: null,
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...overrides
  }
}

describe('buildClosedExportRows', () => {
  it('builds one row with Booking, Unit, Project, Buyer and Final Stage', () => {
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary() }], [])
    expect(rows).toEqual([
      expect.objectContaining({
        booking: 'BK-0001',
        unit: 'D-05-01',
        project: 'Kiara Residences',
        buyer: 'Siti Hajar Binti Omar',
        finalStage: 'Disbursed',
        valueRm: 548_000
      })
    ])
  })

  it('never includes the buyer IC or phone', () => {
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary() }], [])
    expect(rows[0]).not.toHaveProperty('ic')
    expect(rows[0]).not.toHaveProperty('phone')
    expect(JSON.stringify(rows)).not.toContain('920311-00-0001')
    expect(JSON.stringify(rows)).not.toContain('+60 00-000 0101')
  })

  it('reads Closed On from the confirmed exit event matching the final stage', () => {
    const events: CaseEvent[] = [
      event({ id: 'EV-provisional', status: 'provisional', occurredAt: '2026-06-05T00:00:00+08:00' }),
      event({ id: 'EV-other-booking', bookingId: 'BK-9999', occurredAt: '2026-06-09T00:00:00+08:00' }),
      event({ id: 'EV-confirmed', status: 'confirmed', occurredAt: '2026-06-01T09:00:00+08:00' })
    ]
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary({ stage: 'disbursed' }) }], events)
    expect(rows[0].closedOn).toBe('2026-06-01')
  })

  it('picks the latest confirmed exit event when more than one is on the log', () => {
    const events: CaseEvent[] = [
      event({ id: 'EV-a', occurredAt: '2026-06-01T09:00:00+08:00' }),
      event({ id: 'EV-b', occurredAt: '2026-06-20T09:00:00+08:00' })
    ]
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary() }], events)
    expect(rows[0].closedOn).toBe('2026-06-20')
  })

  it('leaves Closed On null when no confirmed exit event is on the log', () => {
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary() }], [])
    expect(rows[0].closedOn).toBeNull()
  })

  it('matches the exit event kind to the stage, so a cancelled case is not dated by a disbursed event', () => {
    const events: CaseEvent[] = [
      event({ kind: 'disbursed', occurredAt: '2026-06-01T09:00:00+08:00' }),
      event({ id: 'EV-cancel', kind: 'cancelled', occurredAt: '2026-07-15T09:00:00+08:00' })
    ]
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary({ stage: 'cancelled' }) }], events)
    expect(rows[0].closedOn).toBe('2026-07-15')
    expect(rows[0].finalStage).toBe('Cancelled')
  })

  it('credits the approved application bank over a merely submitted one', () => {
    const rows = buildClosedExportRows(
      [
        {
          booking: booking(),
          summary: summary({
            applications: [
              { id: 'APP-1', bank: 'First Declined Bank', status: 'rejected' },
              { id: 'APP-2', bank: 'Maybank', status: 'approved' },
              { id: 'APP-3', bank: 'Last Submitted Bank', status: 'submitted' }
            ]
          })
        }
      ],
      []
    )
    expect(rows[0].bank).toBe('Maybank')
  })

  it('falls back to the last application when none is approved', () => {
    const rows = buildClosedExportRows(
      [
        {
          booking: booking(),
          summary: summary({
            applications: [
              { id: 'APP-1', bank: 'First Bank', status: 'rejected' },
              { id: 'APP-2', bank: 'Second Bank', status: 'rejected' }
            ]
          })
        }
      ],
      []
    )
    expect(rows[0].bank).toBe('Second Bank')
  })

  it('leaves the bank blank when the case never had an application', () => {
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary({ applications: [] }) }], [])
    expect(rows[0].bank).toBe('')
  })

  it('carries Solicitor, Sales Agent and Loan Officer from the booking', () => {
    const rows = buildClosedExportRows([{ booking: booking(), summary: summary() }], [])
    expect(rows[0].solicitor).toBe('Wong Rahman Chambers')
    expect(rows[0].salesAgent).toBe('Farah Izzati')
    expect(rows[0].loanOfficer).toBe('Aiman Rizal')
  })

  it('builds rows in the order the closed cases are given', () => {
    const a = booking({ id: 'BK-0001', unit: 'A-01-01' })
    const b = booking({ id: 'BK-0002', unit: 'B-02-02' })
    const rows = buildClosedExportRows(
      [
        { booking: b, summary: summary({ bookingId: 'BK-0002', stage: 'cancelled' }) },
        { booking: a, summary: summary({ bookingId: 'BK-0001', stage: 'lapsed' }) }
      ],
      []
    )
    expect(rows.map((r) => r.booking)).toEqual(['BK-0002', 'BK-0001'])
  })
})

describe('downloadClosedExport', () => {
  it('formats Closed On as "d mmm yyyy" to match the house date format, not 31/05/2026 (issue L11)', async () => {
    const { downloadClosedExport } = await import('../closedExport')
    const { default: writeXlsxFile } = await import('write-excel-file/browser')
    const rows = buildClosedExportRows(
      [{ booking: booking(), summary: summary() }],
      [event({ status: 'confirmed', occurredAt: '2026-05-31T09:00:00+08:00' })]
    )
    expect(rows[0].closedOn).toBe('2026-05-31')

    await downloadClosedExport(rows, '2026-09-18')

    const options = vi.mocked(writeXlsxFile).mock.calls[0][1] as {
      columns: { header: { value: string }; cell: (r: (typeof rows)[number]) => { format?: string } }[]
    }
    const closedOnColumn = options.columns.find((c) => c.header.value === 'Closed On')!
    const cell = closedOnColumn.cell(rows[0])
    expect(cell.format).toBe('d mmm yyyy')
  })
})
