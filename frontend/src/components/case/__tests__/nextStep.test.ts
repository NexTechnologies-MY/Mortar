import { describe, expect, it } from 'vitest'
import { ballInCourt } from '@mortar/core'
import type { Booking, CaseSummary, NextAction, NextActionSuggestion } from '@mortar/core'
import { MOVE_OWNER } from '@/components/case/ball'
import { NEXT_ACTION_LABELS, documentStepLabel } from '@/components/chase/chase'
import { nextStepFor, stepToTask } from '../nextStep'

const BOOKING: Booking = {
  id: 'BK-9001',
  project: 'Residensi Ujian',
  unit: 'B-15-08',
  priceRm: 750000,
  bookingDate: '2026-08-01',
  buyer: {
    name: 'Nur Aisyah',
    ic: '000000-00-0001',
    phone: '+60 00-000 0001',
    age: 34,
    grossMonthlyIncomeRm: 8500,
    monthlyCommitmentsRm: 1200
  },
  salesOwner: 'Nurul Aina',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Teh & Partners'
}

const RISK: CaseSummary['risk'] = {
  level: 'low',
  loanRm: 675000,
  instalmentRm: 2900,
  debtServiceRatio: 0.34,
  marginOfFinancing: 0.9,
  reasons: []
}

function summary(overrides: Partial<CaseSummary> = {}): CaseSummary {
  return {
    bookingId: BOOKING.id,
    stage: 'loan_applied',
    spaSigned: false,
    unknown: false,
    bookingAgeDays: 40,
    daysSinceEvidence: 12,
    daysSinceLoIssued: null,
    daysSinceSpaSet: null,
    applications: [],
    outstandingDocuments: [],
    buyerWithdrew: false,
    risk: RISK,
    stallReasons: ['Bank Has Not Decided After 9 Working Days'],
    openTasks: 0,
    ...overrides
  }
}

/** A bank is holding the application, so the rule engine says `chase_banker`. */
const WITH_BANK = summary({ applications: [{ id: 'APP-1', bank: 'Crestline Bank', status: 'submitted' }] })

function suggestion(action: NextAction, owner = 'sales'): NextActionSuggestion {
  return {
    bookingId: BOOKING.id,
    action: { value: action, probabilities: { [action]: 0.8 }, confidence: 0.8 },
    owner: { value: owner as NextActionSuggestion['owner']['value'], probabilities: {}, confidence: 0.8 },
    urgency: { score: 2, confidence: 0.8 },
    meta: { source: 'cache', stale: false, latencyMs: null }
  }
}

function next(s: CaseSummary, jev?: NextActionSuggestion) {
  return nextStepFor(BOOKING, s, NEXT_ACTION_LABELS, jev)
}

describe('nextStepFor', () => {
  it('defaults to the rule-based move and its MOVE_OWNER desk', () => {
    const result = next(WITH_BANK)

    expect(result.defaultStep.action).toBe('chase_banker')
    expect(result.defaultStep.label).toBe('Call The Banker')
    expect(result.defaultStep.ownerRole).toBe(MOVE_OWNER.chase_banker)
    expect(result.waitingOnNobody).toBe(false)
  })

  it('offers no alternative when Jev agrees with the rule', () => {
    const result = next(WITH_BANK, suggestion('chase_banker', 'loan_admin'))

    expect(result.alternativeStep).toBeUndefined()
  })

  it('offers Jev’s move as the alternative only where the two differ', () => {
    // The rule says chase the banker; Jev says ring the buyer instead.
    const result = next(WITH_BANK, suggestion('call_buyer', 'sales'))

    expect(result.defaultStep.action).toBe('chase_banker')
    expect(result.alternativeStep).toEqual({
      action: 'call_buyer',
      label: 'Call The Buyer',
      ownerRole: 'sales',
      document: undefined
    })
  })

  it('offers no alternative when Jev has not looked at the case', () => {
    expect(next(WITH_BANK, undefined).alternativeStep).toBeUndefined()
  })

  it('carries the outstanding document onto a request step', () => {
    const result = next(summary({ outstandingDocuments: ['payslip'] }))

    expect(result.defaultStep.action).toBe('request_document')
    expect(result.defaultStep.label).toBe('Ask For The Missing Document')
    // The step keeps the generic label; `documentStepLabel` is what turns it
    // into the sentence a screen shows, so both forms cannot drift apart.
    expect(documentStepLabel(result.defaultStep.label, result.defaultStep.document)).toBe('Ask For Payslip')
    expect(result.defaultStep.document).toBe('payslip')
  })

  it('reports nobody to chase once the SPA is signed, and keeps Jev’s read as the alternative', () => {
    const signed = summary({ spaSigned: true })
    expect(ballInCourt(signed).nextMove).toBeNull()
    expect(next(signed).waitingOnNobody).toBe(true)
    expect(next(signed, suggestion('call_buyer')).alternativeStep?.action).toBe('call_buyer')
  })

  it('is the same answer whichever screen asks, since only the suggestion moves it', () => {
    // The rule-based step is what the chase card, Waiting On and the table
    // all lead with, so one click on any of them raises the same task.
    const fromCard = nextStepFor(BOOKING, WITH_BANK, NEXT_ACTION_LABELS)
    const fromWaitingOn = nextStepFor(BOOKING, WITH_BANK, NEXT_ACTION_LABELS)

    expect(stepToTask(fromCard.defaultStep, BOOKING, '2026-09-18')).toEqual(
      stepToTask(fromWaitingOn.defaultStep, BOOKING, '2026-09-18')
    )
  })
})

describe('stepToTask', () => {
  it('builds the task payload for the step, owned by that step’s desk', () => {
    const step = next(WITH_BANK).defaultStep

    expect(stepToTask(step, BOOKING, '2026-09-18', { daysUntilDue: 0 })).toEqual({
      bookingId: 'BK-9001',
      action: 'chase_banker',
      title: 'Call The Banker About B-15-08',
      ownerRole: 'loan_admin',
      ownerName: 'Tan Mei Ling',
      dueOn: '2026-09-18',
      origin: 'staff'
    })
  })

  it('names the document in a request step’s title', () => {
    const step = next(summary({ outstandingDocuments: ['payslip'] })).defaultStep

    expect(stepToTask(step, BOOKING, '2026-09-18').title).toBe('Ask Nur Aisyah For Payslip')
  })

  it('carries Jev’s name only when the step came from him', () => {
    const step = next(WITH_BANK, suggestion('call_buyer')).alternativeStep!

    expect(stepToTask(step, BOOKING, '2026-09-18', { origin: 'jev' }).origin).toBe('jev')
  })

  it('falls due two days out unless the caller says the case is stuck', () => {
    const step = next(WITH_BANK).defaultStep

    expect(stepToTask(step, BOOKING, '2026-09-18').dueOn).toBe('2026-09-20')
    expect(stepToTask(step, BOOKING, '2026-09-18', { daysUntilDue: 0 }).dueOn).toBe('2026-09-18')
  })
})
