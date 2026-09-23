/**
 * Stage and SPA rules for updates staff record by hand: back-dated, in any
 * order, and not always in the order the generator writes them.
 */
import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent, EventKind, IsoDate, LoanApplication } from '../types'
import { ballInCourt } from '../ball'
import { DEFAULT_ASSUMPTIONS } from './assumptions'
import { deriveCase, summarizeCases } from './cases'

const REF = '2026-09-18'

const BOOKING: Booking = {
  id: 'BK-T100',
  project: 'Test Project',
  unit: 'A-01-01',
  priceRm: 500000,
  bookingDate: '2026-08-25',
  buyer: {
    name: 'Test Buyer',
    ic: '000000-00-9100',
    phone: '+60 00-000 9100',
    age: 36,
    grossMonthlyIncomeRm: 20000,
    monthlyCommitmentsRm: 0,
    propertiesOwned: 0
  },
  salesOwner: 'Test Agent',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Test Chambers'
}

const APEX: LoanApplication = { id: 'APP-T100', bookingId: BOOKING.id, bank: 'Apex Bank', banker: 'Kelvin Teo' }

let seq = 0
/** What `POST /api/events` stores: noon on the chosen day, confirmed, recorded that evening. */
function ev(kind: EventKind, on: IsoDate, extra: Partial<CaseEvent> = {}): CaseEvent {
  seq += 1
  return {
    id: `EV-T${String(seq).padStart(3, '0')}`,
    bookingId: BOOKING.id,
    applicationId: null,
    track: 'loan',
    kind,
    occurredAt: `${on}T12:00:00+08:00`,
    recordedAt: `${on}T18:00:00+08:00`,
    reportedBy: 'Tan Mei Ling',
    verifiedBy: 'Tan Mei Ling',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...extra
  }
}

const summarize = (events: CaseEvent[], asOf: IsoDate = REF) =>
  summarizeCases({ bookings: [BOOKING], applications: [APEX], events, tasks: [] }, asOf, DEFAULT_ASSUMPTIONS)[0]
const facts = (events: CaseEvent[], asOf: IsoDate = REF) => deriveCase(BOOKING, [APEX], events, asOf)
const legalReasons = (reasons: string[]) => reasons.filter((r) => r.startsWith('SPA '))

const booked = ev('booked', '2026-08-25', { track: 'sales' })
const submitted = ev('loan_submitted', '2026-08-27', { applicationId: APEX.id })
const approved = ev('loan_approved', '2026-09-01', { applicationId: APEX.id })

describe('a loan agreement or disbursement with no signed SPA', () => {
  const agreement = ev('loan_agreement_signed', '2026-09-03', { applicationId: APEX.id })

  it('leaves the case at its letter of offer, open and waiting on the solicitor', () => {
    const out = summarize([booked, submitted, approved, agreement])
    expect(out.stage).toBe('lo_issued')
    expect(out.spaSigned).toBe(false)
    expect(out.daysSinceLoIssued).toBe(17)
    expect(ballInCourt(out)).toMatchObject({
      holder: 'solicitor',
      waitingFor: 'The Solicitor To Schedule The SPA',
      nextMove: 'schedule_spa'
    })
    expect(legalReasons(out.stallReasons)).toEqual(['SPA Not Scheduled 17 Days After LO'])
    const f = facts([booked, submitted, approved, agreement])
    expect(f.open).toBe(true)
    // The forecast reads the funnel rank: it stays at the letter of offer.
    expect(f.funnelRank).toBe(2)
    expect(f.enteredAges.slice(3)).toEqual([null, null, null])
  })

  it('moves nothing when nothing before it is on the log either', () => {
    const disbursed = ev('disbursed', '2026-09-01')
    const out = summarize([booked, disbursed])
    expect(out.stage).toBe('booked')
    expect(ballInCourt(out).waitingFor).not.toContain('SPA Is Signed')
    expect(facts([booked, disbursed]).open).toBe(true)
  })

  it('counts once the signing is recorded, entering its rank no earlier than the signing', () => {
    // The signing is recorded after the agreement and dated after it too.
    const signed = ev('spa_signed', '2026-09-05', { track: 'legal' })
    const out = summarize([booked, submitted, approved, agreement, signed])
    expect(out.stage).toBe('loan_agreement')
    expect(out.spaSigned).toBe(true)
    expect(out.stallReasons).toEqual([])
    expect(ballInCourt(out)).toMatchObject({ holder: null, waitingFor: 'Nothing, The SPA Is Signed' })
    const f = facts([booked, submitted, approved, agreement, signed])
    expect(f.open).toBe(false)
    expect(f.enteredAges[3]).toBe(11)
    expect(f.enteredAges[4]).toBe(11)
  })
})

describe('an SPA appointment set before any approval', () => {
  const appointment = ev('spa_appointment_set', '2026-09-01', { track: 'legal', note: 'Appointment On 2026-09-10' })

  it('keeps the case with the bank that still owes a decision', () => {
    const out = summarize([booked, submitted, appointment])
    expect(out.stage).toBe('loan_applied')
    expect(out.daysSinceLoIssued).toBeNull()
    expect(ballInCourt(out)).toMatchObject({
      holder: 'bank',
      waitingFor: 'Apex Bank To Decide On The Loan',
      nextMove: 'chase_banker'
    })
    expect(legalReasons(out.stallReasons)).toEqual([])
    expect(facts([booked, submitted, appointment]).enteredAges[2]).toBeNull()
  })

  it('stays on the case, so the approval that follows goes straight to getting it signed', () => {
    expect(summarize([booked, submitted, appointment]).daysSinceSpaSet).toBe(17)
    const out = summarize([
      booked,
      submitted,
      appointment,
      ev('loan_approved', '2026-09-05', { applicationId: APEX.id })
    ])
    expect(out.stage).toBe('lo_issued')
    expect(ballInCourt(out)).toMatchObject({ holder: 'solicitor', waitingFor: 'The Solicitor To Get The SPA Signed' })
  })
})

describe('the SPA signing stall', () => {
  const early = ev('loan_approved', '2026-08-30', { applicationId: APEX.id })
  const set = (on: IsoDate, appointmentOn: IsoDate) =>
    ev('spa_appointment_set', on, { track: 'legal', note: `Appointment On ${appointmentOn}` })

  it('runs from the latest appointment after a reschedule', () => {
    const out = summarize([booked, submitted, early, set('2026-08-31', '2026-09-05'), set('2026-09-15', '2026-09-25')])
    expect(out.daysSinceSpaSet).toBe(3)
    expect(legalReasons(out.stallReasons)).toEqual([])
  })

  it('waits for an appointment set weeks ahead to pass', () => {
    const events = [booked, submitted, early, set('2026-09-01', '2026-10-20')]
    expect(summarize(events).daysSinceSpaSet).toBe(17)
    expect(legalReasons(summarize(events).stallReasons)).toEqual([])
    expect(legalReasons(summarize(events, '2026-10-20').stallReasons)).toEqual([])
    expect(legalReasons(summarize(events, '2026-10-21').stallReasons)).toEqual(['SPA Set 50 Days Ago, Still Unsigned'])
  })

  it('still stalls an appointment whose note names no day, once it has sat past the threshold', () => {
    const out = summarize([booked, submitted, early, ev('spa_appointment_set', '2026-09-01', { track: 'legal' })])
    expect(legalReasons(out.stallReasons)).toEqual(['SPA Set 17 Days Ago, Still Unsigned'])
  })
})
