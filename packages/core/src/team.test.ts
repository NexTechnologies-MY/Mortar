import { describe, expect, it } from 'vitest'
import { teamSummary } from './team'
import { DEMO_PROFILES } from './profiles'
import { STORIES } from './fixtures/stories'
import { summarizeCases } from './sim'
import type { Booking, CaseEvent, Snapshot, Task } from './types'

const baseBooking: Booking = { ...STORIES[0].booking, bookingDate: '2026-09-01', priceRm: 500_000 }

function makeEvent(
  kind: CaseEvent['kind'],
  date: string,
  bookingId = baseBooking.id,
  overrides: Partial<CaseEvent> = {}
): CaseEvent {
  return {
    id: `${bookingId}-${kind}-${date}`,
    bookingId,
    applicationId: null,
    kind,
    track: 'sales',
    occurredAt: `${date}T09:00:00+08:00`,
    recordedAt: `${date}T09:00:00+08:00`,
    reportedBy: 'Test',
    verifiedBy: 'Test',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...overrides
  }
}

function makeSnapshot(
  today: string,
  bookings: Booking[] = [baseBooking],
  extraEvents: CaseEvent[] = [],
  extraTasks: Task[] = []
): Snapshot {
  return {
    meta: { seed: 1, referenceDate: today, resetAt: null },
    bookings,
    applications: [],
    events: [...bookings.map((b) => makeEvent('booked', b.bookingDate, b.id)), ...extraEvents],
    tasks: extraTasks,
    messages: [],
    playbooks: [],
    extractions: [],
    signals: [],
    nextActions: []
  }
}

describe('teamSummary', () => {
  it('covers exactly the non-manager DEMO_PROFILES', () => {
    const data = makeSnapshot('2026-09-02')
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    const expectedProfiles = DEMO_PROFILES.filter((p) => p.persona !== 'manager')
    expect(result.rows.map((r) => r.profileId)).toEqual(expect.arrayContaining(expectedProfiles.map((p) => p.id)))
    expect(result.rows).toHaveLength(expectedProfiles.length)
    expect(result.rows.some((r) => (r.persona as string) === 'manager')).toBe(false)
  })

  it('counts a buyer-held or bank-held case toward the loan admin who owns it', () => {
    const buyerBooking = { ...baseBooking, id: 'BK-BUYER', loanOwner: 'Tan Mei Ling' }
    const buyerEvent = makeEvent('documents_requested', '2026-09-02', 'BK-BUYER', {
      document: 'payslip',
      track: 'loan'
    })

    const bankBooking = { ...baseBooking, id: 'BK-BANK', loanOwner: 'Tan Mei Ling' }
    const bankEvent = makeEvent('loan_submitted', '2026-09-02', 'BK-BANK', {
      applicationId: 'APP-1',
      track: 'loan'
    })

    const data = makeSnapshot('2026-09-03', [buyerBooking, bankBooking], [buyerEvent, bankEvent])
    data.applications = [{ id: 'APP-1', bookingId: 'BK-BANK', bank: 'Maybank', banker: 'Demo Banker' }]
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    const loanAdminRow = result.rows.find((r) => r.profileId === 'loan-tan-mei-ling')
    expect(loanAdminRow?.waiting).toBe(2)
  })

  it('counts a solicitor-held case toward Arvind Raj (legal-admin)', () => {
    const legalBooking = { ...baseBooking, id: 'BK-LEGAL', loanOwner: 'Tan Mei Ling' }
    const approvedEvent = makeEvent('loan_approved', '2026-09-02', 'BK-LEGAL', {
      applicationId: 'APP-1',
      track: 'loan'
    })

    const data = makeSnapshot('2026-09-03', [legalBooking], [approvedEvent])
    data.applications = [{ id: 'APP-1', bookingId: 'BK-LEGAL', bank: 'Maybank', banker: 'Demo Banker' }]
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    const legalRow = result.rows.find((r) => r.profileId === 'legal-admin')
    expect(legalRow?.waiting).toBe(1)
  })

  it('counts a developer-held case toward its sales owner', () => {
    const salesBooking = { ...baseBooking, id: 'BK-DEV', salesOwner: 'Nurul Aina' }
    const data = makeSnapshot('2026-09-03', [salesBooking])
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    const salesRow = result.rows.find((r) => r.name === 'Nurul Aina')
    expect(salesRow?.waiting).toBe(1)
  })

  it('excludes a signed booking everywhere', () => {
    const signedBooking = {
      ...baseBooking,
      id: 'BK-SIGNED',
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      priceRm: 600_000
    }
    const signedEvent = makeEvent('spa_signed', '2026-09-05', 'BK-SIGNED')

    const data = makeSnapshot('2026-09-20', [signedBooking], [signedEvent])
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    expect(result.openBookings).toBe(0)
    expect(result.unassigned).toBe(0)
    expect(result.overdue).toBe(0)
    expect(result.valueAtRisk).toBe(0)
    for (const row of result.rows) {
      expect(row.waiting).toBe(0)
      expect(row.stalled).toBe(0)
      expect(row.overdue).toBe(0)
      expect(row.longestWait).toBeNull()
      expect(row.valueAtRisk).toBe(0)
    }
  })

  it('shows an overdue case in overdue and longestWait', () => {
    const overdueBooking = { ...baseBooking, id: 'BK-OVERDUE', salesOwner: 'Nurul Aina' }
    const data = makeSnapshot('2026-09-25', [overdueBooking])
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    expect(result.overdue).toBe(1)
    const salesRow = result.rows.find((r) => r.name === 'Nurul Aina')
    expect(salesRow?.overdue).toBe(1)
    expect(salesRow?.longestWait).toMatchObject({
      elapsed: 24,
      unit: 'days'
    })
  })

  it('counts only that persons open tasks in their department', () => {
    const tasks: Task[] = [
      {
        id: 'T1',
        bookingId: baseBooking.id,
        action: 'call_buyer',
        title: 'Call buyer',
        ownerRole: 'sales',
        ownerName: 'Nurul Aina',
        dueOn: '2026-09-05',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-01T09:00:00+08:00',
        completedAt: null
      },
      {
        id: 'T2',
        bookingId: baseBooking.id,
        action: 'call_buyer',
        title: 'Call buyer 2',
        ownerRole: 'sales_admin',
        ownerName: 'Nurul Aina',
        dueOn: '2026-09-05',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-01T09:00:00+08:00',
        completedAt: null
      },
      {
        id: 'T3',
        bookingId: baseBooking.id,
        action: 'call_buyer',
        title: 'Done task',
        ownerRole: 'sales',
        ownerName: 'Nurul Aina',
        dueOn: '2026-09-05',
        status: 'done',
        origin: 'staff',
        createdAt: '2026-09-01T09:00:00+08:00',
        completedAt: '2026-09-02T09:00:00+08:00'
      },
      {
        id: 'T4',
        bookingId: baseBooking.id,
        action: 'chase_banker',
        title: 'Wrong role task',
        ownerRole: 'loan_admin',
        ownerName: 'Nurul Aina',
        dueOn: '2026-09-05',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-01T09:00:00+08:00',
        completedAt: null
      },
      {
        id: 'T5',
        bookingId: baseBooking.id,
        action: 'chase_banker',
        title: 'Loan task',
        ownerRole: 'loan_admin',
        ownerName: 'Tan Mei Ling',
        dueOn: '2026-09-05',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-01T09:00:00+08:00',
        completedAt: null
      },
      {
        id: 'T6',
        bookingId: baseBooking.id,
        action: 'schedule_spa',
        title: 'Legal task for Tan',
        ownerRole: 'legal',
        ownerName: 'Tan Mei Ling',
        dueOn: '2026-09-05',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-01T09:00:00+08:00',
        completedAt: null
      },
      {
        id: 'T7',
        bookingId: baseBooking.id,
        action: 'schedule_spa',
        title: 'Legal task for Arvind',
        ownerRole: 'legal',
        ownerName: 'Arvind Raj',
        dueOn: '2026-09-05',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-01T09:00:00+08:00',
        completedAt: null
      }
    ]

    const data = makeSnapshot('2026-09-02', [baseBooking], [], tasks)
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    const nurulRow = result.rows.find((r) => r.name === 'Nurul Aina')
    expect(nurulRow?.openTasks).toBe(2)

    const tanRow = result.rows.find((r) => r.name === 'Tan Mei Ling')
    expect(tanRow?.openTasks).toBe(1)

    const arvindRow = result.rows.find((r) => r.name === 'Arvind Raj')
    expect(arvindRow?.openTasks).toBe(1)
  })

  it('counts sales ownership in owned and returns null for loan and legal', () => {
    const b1 = { ...baseBooking, id: 'BK-1', salesOwner: 'Nurul Aina' }
    const b2 = { ...baseBooking, id: 'BK-2', salesOwner: 'Nurul Aina' }
    const b3 = { ...baseBooking, id: 'BK-3', salesOwner: 'Farah Izzati' }

    const data = makeSnapshot('2026-09-02', [b1, b2, b3])
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    const nurulRow = result.rows.find((r) => r.name === 'Nurul Aina')
    expect(nurulRow?.owned).toBe(2)

    const farahRow = result.rows.find((r) => r.name === 'Farah Izzati')
    expect(farahRow?.owned).toBe(1)

    const loanRow = result.rows.find((r) => r.persona === 'loan-admin')
    expect(loanRow?.owned).toBeNull()

    const legalRow = result.rows.find((r) => r.persona === 'legal-admin')
    expect(legalRow?.owned).toBeNull()
  })

  it('handles unassigned bookings and valueAtRisk', () => {
    // Unassigned: developer-held but salesOwner not in DEMO_PROFILES
    const unassignedBooking = {
      ...baseBooking,
      id: 'BK-UNASSIGNED',
      salesOwner: 'Unknown Sales Agent',
      priceRm: 750_000
    }
    // 20 days since evidence -> stalled
    const data = makeSnapshot('2026-09-21', [unassignedBooking])
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    expect(result.openBookings).toBe(1)
    expect(result.unassigned).toBe(1)
    expect(result.valueAtRisk).toBe(750_000)
    // No staff row holds this valueAtRisk
    expect(result.rows.reduce((sum, r) => sum + r.valueAtRisk, 0)).toBe(0)
  })

  it('sorts rows by overdue desc, stalled desc, waiting desc, then name asc', () => {
    const b1 = { ...baseBooking, id: 'BK-1', salesOwner: 'Nurul Aina' }
    const b2 = { ...baseBooking, id: 'BK-2', salesOwner: 'Farah Izzati' }
    const b3 = { ...baseBooking, id: 'BK-3', loanOwner: 'Tan Mei Ling' }

    // BK-1 is overdue (24 days) -> Nurul has overdue: 1
    // BK-2 is stalled (8 days, >= 7 and < 10.5) -> Farah has stalled: 1, overdue: 0, waiting: 1
    // BK-3 is buyer-held fresh (1 day) -> Tan Mei Ling has stalled: 0, overdue: 0, waiting: 1
    const data = makeSnapshot(
      '2026-09-25',
      [b1, b2, b3],
      [
        makeEvent('buyer_contacted', '2026-09-17', 'BK-2'),
        makeEvent('documents_requested', '2026-09-24', 'BK-3', {
          document: 'payslip',
          track: 'loan'
        })
      ]
    )
    const cases = summarizeCases(data, data.meta.referenceDate)
    const result = teamSummary(data, cases)

    const nurulIndex = result.rows.findIndex((r) => r.name === 'Nurul Aina')
    const farahIndex = result.rows.findIndex((r) => r.name === 'Farah Izzati')
    const tanIndex = result.rows.findIndex((r) => r.name === 'Tan Mei Ling')

    expect(nurulIndex).toBeGreaterThanOrEqual(0)
    expect(farahIndex).toBeGreaterThanOrEqual(0)
    expect(tanIndex).toBeGreaterThanOrEqual(0)

    expect(nurulIndex).toBeLessThan(farahIndex)
    expect(farahIndex).toBeLessThan(tanIndex)
  })
})
