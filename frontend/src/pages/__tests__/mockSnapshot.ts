/**
 * Mock snapshot builders for page tests — a tiny canonical-shaped dataset:
 * BK-9001 stalled with Jev's request-payslip suggestion, one loan-admin-owned
 * stall, and the seed/reference metadata the pages render.
 */
import type {
  Booking,
  CaseSummary,
  NextAction,
  NextActionSuggestion,
  OwnerRole,
  RiskLevel,
  Snapshot
} from '@mortar/core'

export const REFERENCE_DATE = '2026-09-18'

export function booking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    project: 'Residensi Ujian',
    unit: 'A-12-03',
    priceRm: 550000,
    bookingDate: '2026-09-02',
    buyer: {
      name: 'Raymond Tan Wei Hong',
      ic: '000000-00-0001',
      phone: '+60 00-000 0001',
      age: 34,
      grossMonthlyIncomeRm: 8500,
      monthlyCommitmentsRm: 1200,
      propertiesOwned: 0
    },
    salesOwner: 'Nurul Aina',
    loanOwner: 'Tan Mei Ling',
    legalFirm: 'Wong & Partners',
    ...overrides
  }
}

export function stalledCase(id: string, overrides: Partial<CaseSummary> = {}): CaseSummary {
  return {
    bookingId: id,
    stage: 'loan_applied',
    unknown: false,
    bookingAgeDays: 16,
    daysSinceEvidence: 6,
    daysSinceLoIssued: null,
    daysSinceSpaSet: null,
    applications: [],
    outstandingDocuments: [],
    buyerWithdrew: false,
    risk: {
      level: 'low' satisfies RiskLevel,
      loanRm: 495000,
      instalmentRm: 2100,
      debtServiceRatio: 0.39,
      marginOfFinancing: 0.9,
      reasons: []
    },
    stallReasons: ['Application Undecided For 10 Working Days'],
    openTasks: 0,
    ...overrides
  }
}

export function nextAction(
  bookingId: string,
  action: NextAction,
  owner: OwnerRole,
  urgency = 1.8
): NextActionSuggestion {
  return {
    bookingId,
    action: { value: action, probabilities: { [action]: 0.9 }, confidence: 0.9 },
    owner: { value: owner, probabilities: { [owner]: 0.9 }, confidence: 0.9 },
    urgency: { score: urgency, confidence: 0.9 },
    meta: { source: 'cache', stale: false, latencyMs: null }
  }
}

export function snapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    meta: { seed: 20260918, referenceDate: REFERENCE_DATE, resetAt: '2026-09-18T04:11:00+08:00' },
    bookings: [booking('BK-9001'), booking('BK-0040', { unit: 'A-15-05', priceRm: 756000 })],
    applications: [],
    events: [],
    messages: [],
    playbooks: [],
    tasks: [],
    extractions: [],
    signals: [],
    nextActions: [],
    ...overrides
  }
}
