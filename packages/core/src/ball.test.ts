import { describe, expect, it } from 'vitest'
import { ballInCourt } from './ball'
import { DEFAULT_SEED, REFERENCE_DATE, generate, summarizeCases } from './sim'
import { STORIES } from './fixtures/stories'
import type { CaseSummary } from './types'

function summary(overrides: Partial<CaseSummary> = {}): CaseSummary {
  return {
    bookingId: 'BK-0001',
    stage: 'booked',
    unknown: false,
    bookingAgeDays: 4,
    daysSinceEvidence: 1,
    daysSinceLoIssued: null,
    daysSinceSpaSet: null,
    applications: [],
    outstandingDocuments: [],
    risk: { level: 'low', loanRm: 0, instalmentRm: 0, debtServiceRatio: 0.2, marginOfFinancing: 0.9, reasons: [] },
    stallReasons: [],
    openTasks: 0,
    ...overrides
  }
}

describe('ballInCourt', () => {
  it('leaves a fresh booking with the developer to collect loan documents', () => {
    expect(ballInCourt(summary())).toEqual({
      holder: 'developer',
      waitingFor: 'The Loan Documents To Be Collected',
      nextMove: 'request_document',
      stalled: false
    })
  })

  it('puts outstanding documents on the buyer, naming each one', () => {
    const ball = ballInCourt(
      summary({
        stage: 'loan_applied',
        applications: [{ id: 'A', bank: 'Apex Bank', status: 'documents_pending' }],
        outstandingDocuments: ['payslip', 'epf_statement', 'ic_copy'],
        stallReasons: ['Payslip Still Outstanding After 9 Days']
      })
    )
    expect(ball.holder).toBe('buyer')
    expect(ball.waitingFor).toBe('Payslip, EPF Statement And IC Copy From The Buyer')
    expect(ball.nextMove).toBe('request_document')
    expect(ball.stalled).toBe(true)
  })

  it('hands a submitted application to the bank', () => {
    const ball = ballInCourt(
      summary({ stage: 'loan_applied', applications: [{ id: 'A', bank: 'Apex Bank', status: 'submitted' }] })
    )
    expect(ball).toMatchObject({
      holder: 'bank',
      waitingFor: 'Apex Bank To Decide On The Loan',
      nextMove: 'chase_banker'
    })
  })

  it('hands an approved loan to the solicitor, to schedule and then to sign', () => {
    const approved = [{ id: 'A', bank: 'Apex Bank', status: 'approved' as const }]
    expect(ballInCourt(summary({ stage: 'lo_issued', applications: approved, daysSinceLoIssued: 3 }))).toMatchObject({
      holder: 'solicitor',
      nextMove: 'schedule_spa'
    })
    expect(
      ballInCourt(summary({ stage: 'lo_issued', applications: approved, daysSinceLoIssued: 9, daysSinceSpaSet: 4 }))
    ).toMatchObject({
      holder: 'solicitor',
      waitingFor: 'The Solicitor To Get The SPA Signed',
      nextMove: 'escalate_legal'
    })
  })

  it('gives a case every bank declined back to the developer to resubmit', () => {
    const ball = ballInCourt(
      summary({ stage: 'loan_applied', applications: [{ id: 'A', bank: 'Apex Bank', status: 'rejected' }] })
    )
    expect(ball).toMatchObject({ holder: 'developer', nextMove: 'submit_another_bank' })
  })

  it('gives a withdrawn buyer to the developer to release, ahead of documents they still owe', () => {
    const ball = ballInCourt(
      summary({
        stage: 'loan_applied',
        applications: [{ id: 'A', bank: 'Apex Bank', status: 'withdrawn' }],
        outstandingDocuments: ['payslip']
      })
    )
    expect(ball).toMatchObject({ holder: 'developer', nextMove: 'review_release' })
  })

  it('names nobody once the SPA is signed or the booking has closed', () => {
    for (const stage of ['spa_signed', 'disbursed', 'cancelled', 'lapsed'] as const) {
      expect(ballInCourt(summary({ stage, stallReasons: ['No Update For 30 Days'] }))).toMatchObject({
        holder: null,
        nextMove: null,
        stalled: false
      })
    }
  })

  it('names a holder for every open case in the seeded dataset', () => {
    const dataset = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })
    const bookings = [...dataset.bookings, ...STORIES.map((s) => s.booking)]
    const applications = [...dataset.applications, ...STORIES.flatMap((s) => s.applications)]
    const events = [...dataset.events, ...STORIES.flatMap((s) => s.events)]
    const summaries = summarizeCases({ bookings, applications, events, tasks: [] }, REFERENCE_DATE)
    const open = summaries.filter(
      (s) => !['spa_signed', 'loan_agreement', 'disbursed', 'cancelled', 'lapsed'].includes(s.stage)
    )
    expect(open.length).toBeGreaterThan(0)
    for (const s of open) expect(ballInCourt(s).holder).not.toBeNull()
    // Every stalled open case must say who to chase.
    for (const s of open.filter((x) => x.stallReasons.length > 0)) expect(ballInCourt(s).nextMove).not.toBeNull()
  })
})
