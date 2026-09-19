import type {
  Booking,
  CaseEvent,
  Dataset,
  DocumentKind,
  EvidenceStatus,
  EventKind,
  IsoDate,
  LoanApplication,
  Track
} from '../types'
import type { GeneratorOptions } from '../sim'
import { assumptionValue, DEFAULT_ASSUMPTIONS } from './assumptions'
import { addDays, addWorkDays, diffDays, stamp } from './dates'
import { drawBuyer, pickBank, pickBanker, pickLawFirm, pickSalesAgent, pickSolicitor, PROJECT_NAME } from './names'
import { computeFinancingRisk } from './risk'
import { createRng, weighted, type Rng } from './random'

interface PlannedEvent {
  day: number
  kind: EventKind
  track: Track
  reportedBy: string
  applicationId: string | null
  document: DocumentKind | null
  note: string | null
}

const DOCUMENT_POOL: readonly (readonly [DocumentKind, number])[] = [
  ['payslip', 45],
  ['bank_statement', 20],
  ['epf_statement', 15],
  ['employment_letter', 10],
  ['tax_form', 6],
  ['ic_copy', 4]
]

const PRICE_BANDS: readonly (readonly [number, number, number])[] = [
  [350, 450, 0.3],
  [450, 600, 0.35],
  [600, 750, 0.2],
  [750, 900, 0.15]
]

const REJECTION_NOTES = ['Income Below Requirement', 'Credit History', 'Documents Incomplete'] as const
const HESITANT_NOTES = ['Comparing Another Project', 'Reconsidering Finances'] as const

/** Kinds a reviewer could plausibly dispute without breaking the funnel story. */
const DISPUTABLE: ReadonlySet<EventKind> = new Set([
  'buyer_contacted',
  'buyer_hesitant',
  'documents_received',
  'valuation_shortfall'
])

const clamp01 = (lo: number, hi: number, x: number) => Math.min(hi, Math.max(lo, x))

function drawPrice(rng: Rng): number {
  const [lo, hi] = weighted(
    rng,
    PRICE_BANDS.map(([lo, hi, w]) => [[lo, hi], w] as const)
  )
  return Math.round((rng.int(lo, hi) * 1000) / 500) * 500
}

function drawUnit(rng: Rng): string {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${rng.pick(['A', 'B', 'C'] as const)}-${p(rng.int(3, 28))}-${p(rng.int(1, 8))}`
}

/** Working-day offset measured in calendar days after `day`. */
function workDayOffset(base: IsoDate, day: number, workDays: number): number {
  return diffDays(base, addWorkDays(addDays(base, day), workDays))
}

/** Seeded stage-transition Monte Carlo: the same options always give the same dataset. */
export function generateDataset(options: GeneratorOptions): Dataset {
  const { seed, referenceDate, bookings: count, assumptions: overrides } = options
  const value = (key: string) => overrides?.[key] ?? assumptionValue(DEFAULT_ASSUMPTIONS, key)
  const rng = createRng(seed)
  const bookings: Booking[] = []
  const applications: LoanApplication[] = []
  const events: CaseEvent[] = []
  let seq = 0

  for (let i = 1; i <= count; i += 1) {
    const id = `BK-${String(i).padStart(4, '0')}`
    // Bookings spread over the 120 days before the reference date, skewed recent:
    // sales picked up as the project ramped. A quarter land in the 15–30 day
    // band so a believable share of live bookings can genuinely stall.
    const roll = rng.next()
    const bookedAgo =
      roll < 0.25 ? 15 + Math.floor((roll / 0.25) * 16) : Math.floor(119 * Math.pow((roll - 0.25) / 0.75, 1.4))
    const bookingDate = addDays(referenceDate, -bookedAgo)
    const priceRm = drawPrice(rng)
    const buyer = drawBuyer(rng, i, priceRm, value)
    const salesOwner = pickSalesAgent(rng)
    const legalFirm = pickLawFirm(rng)
    const solicitor = pickSolicitor(rng)
    bookings.push({
      id,
      project: PROJECT_NAME,
      unit: drawUnit(rng),
      priceRm,
      bookingDate,
      buyer,
      salesOwner,
      loanOwner: 'Tan Mei Ling',
      legalFirm
    })

    const plan: PlannedEvent[] = []
    const at = (
      day: number,
      kind: EventKind,
      track: Track,
      reportedBy: string,
      extra: Partial<Pick<PlannedEvent, 'applicationId' | 'document' | 'note'>> = {}
    ) => {
      plan.push({ day, kind, track, reportedBy, applicationId: null, document: null, note: null, ...extra })
    }

    // Approval falls as the debt service ratio rises, so the risk flag carries signal.
    const risk = computeFinancingRisk(
      {
        priceRm,
        age: buyer.age,
        grossMonthlyIncomeRm: buyer.grossMonthlyIncomeRm,
        monthlyCommitmentsRm: buyer.monthlyCommitmentsRm,
        propertiesOwned: buyer.propertiesOwned
      },
      value
    )
    const pApprove = clamp01(
      0.05,
      0.97,
      (value('approvalRate') - value('approvalDsrStep') * (risk.debtServiceRatio * 100 - value('dsrCap'))) / 100
    )

    at(0, 'booked', 'sales', salesOwner)

    // ---- Loan track: one to three sequential applications.
    let day = rng.int(0, Math.round(value('submissionLagMaxDays')))
    let approvedDay: number | null = null
    let terminalDay: number | null = null
    let approvedApp: LoanApplication | null = null
    let appsDone = 0
    while (approvedDay === null && terminalDay === null && appsDone < 3) {
      appsDone += 1
      const app: LoanApplication = {
        id: `LA-${String(i).padStart(4, '0')}-${appsDone}`,
        bookingId: id,
        bank: pickBank(rng),
        banker: pickBanker(rng)
      }
      applications.push(app)
      const submittedDay = day
      at(submittedDay, 'loan_submitted', 'loan', app.banker, { applicationId: app.id })
      let bankDay = submittedDay
      if (rng.chance(value('valuationShortfallRate') / 100)) {
        const shortfall = Math.round((priceRm * (0.05 + rng.next() * 0.1)) / 1000) * 1000
        at(submittedDay + rng.int(1, 4), 'valuation_shortfall', 'loan', app.banker, {
          applicationId: app.id,
          note: `Valuation RM ${shortfall.toLocaleString('en-US')} Below Price`
        })
        bankDay += rng.int(2, Math.round(value('valuationDelayMaxDays')))
      }
      if (rng.chance(value('missingDocumentRate') / 100)) {
        const document = weighted(rng, DOCUMENT_POOL)
        const reqDay = submittedDay + rng.int(1, 3)
        const span = rng.chance(value('slowDocumentRate') / 100)
          ? rng.int(Math.round(value('documentResponseMaxDays')) + 1, Math.round(value('documentResponseMaxDays')) + 12)
          : rng.int(Math.round(value('documentResponseMinDays')), Math.round(value('documentResponseMaxDays')))
        const recDay = reqDay + span
        at(reqDay, 'documents_requested', 'loan', app.banker, { applicationId: app.id, document })
        at(recDay, 'documents_received', 'loan', app.banker, { applicationId: app.id, document })
        bankDay = Math.max(bankDay, recDay)
      }
      const approved = rng.next() < pApprove
      const workLag = approved
        ? rng.int(Math.round(value('decisionMinWorkDays')), Math.round(value('decisionMaxWorkDays')))
        : rng.int(Math.round(value('rejectionMinWorkDays')), Math.round(value('rejectionMaxWorkDays')))
      let decisionDay = workDayOffset(bookingDate, bankDay, workLag)
      if (rng.chance(value('slowDecisionRate') / 100)) {
        decisionDay += rng.int(4, Math.round(value('slowDecisionExtraDays')))
      }
      if (approved) {
        at(decisionDay, 'loan_approved', 'loan', app.banker, {
          applicationId: app.id,
          note: 'Letter Of Offer Issued'
        })
        approvedDay = decisionDay
        approvedApp = app
      } else {
        at(decisionDay, 'loan_rejected', 'loan', app.banker, {
          applicationId: app.id,
          note: rng.pick(REJECTION_NOTES)
        })
        const retryRate = appsDone === 1 ? value('secondApplicationRate') : value('thirdApplicationRate')
        if (appsDone < 3 && rng.chance(retryRate / 100)) {
          day = decisionDay + rng.int(1, Math.max(1, Math.round(value('retryLagMaxDays'))))
          continue
        }
        if (rng.chance(value('rejectedCancelRate') / 100)) {
          const cDay = decisionDay + rng.int(1, Math.max(1, Math.round(value('cancelLagMaxDays'))))
          at(cDay, 'cancelled', 'sales', salesOwner, { note: 'Loan Rejected' })
          terminalDay = cDay
        }
        break
      }
    }

    // ---- Legal track after approval.
    let signedDay: number | null = null
    if (approvedDay !== null && approvedApp !== null) {
      const apptLag =
        rng.int(Math.round(value('spaAppointmentMinDays')), Math.round(value('spaAppointmentMaxDays'))) +
        (rng.chance(value('slowSpaRate') / 100) ? rng.int(4, Math.round(value('slowSpaExtraDays'))) : 0)
      const apptDay = approvedDay + apptLag
      const sDay = apptDay + rng.int(Math.round(value('signingLagMinDays')), Math.round(value('signingLagMaxDays')))
      const sDate = addDays(bookingDate, sDay)
      at(apptDay, 'spa_appointment_set', 'legal', solicitor, { note: `Appointment On ${sDate}` })
      signedDay = sDay
    }

    // ---- Buyer track: hesitation, withdrawal, lapse.
    const hesitates = rng.chance(value('hesitationRate') / 100)
    // A hesitant buyer who goes cold never shows up to sign; the booking lingers and lapses.
    const goneCold = hesitates && rng.chance(value('hesitantColdRate') / 100)
    const withdraws = rng.chance(value('withdrawalRate') / 100)
    const hesitantDay = rng.int(3, 18)
    const withdrawDay = hesitantDay + rng.int(2, Math.max(3, Math.round(value('withdrawalLagMaxDays'))))
    if (hesitates) {
      at(hesitantDay, 'buyer_hesitant', 'sales', salesOwner, {
        note: rng.chance(0.6) ? rng.pick(HESITANT_NOTES) : null
      })
    }
    if (withdraws && (signedDay === null || withdrawDay < signedDay)) {
      at(withdrawDay, 'buyer_withdrew', 'sales', salesOwner)
      signedDay = null
      if (rng.chance(0.7)) {
        const cDay = withdrawDay + rng.int(1, Math.max(1, Math.round(value('cancelLagMaxDays'))))
        at(cDay, 'cancelled', 'sales', salesOwner, { note: 'Buyer Withdrew' })
        terminalDay = terminalDay === null ? cDay : Math.min(terminalDay, cDay)
      } else {
        const lDay = withdrawDay + rng.int(20, 40)
        at(lDay, 'lapsed', 'sales', salesOwner, { note: 'Buyer Withdrew' })
        terminalDay = terminalDay === null ? lDay : Math.min(terminalDay, lDay)
      }
    }
    if (goneCold) signedDay = null
    if (signedDay !== null && approvedApp !== null) {
      at(signedDay, 'spa_signed', 'legal', solicitor)
      const laDay = signedDay + rng.int(1, Math.max(1, Math.round(value('loanAgreementLagMaxDays'))))
      at(laDay, 'loan_agreement_signed', 'loan', approvedApp.banker, { applicationId: approvedApp.id })
      at(
        laDay + rng.int(Math.round(value('disbursementMinDays')), Math.round(value('disbursementMaxDays'))),
        'disbursed',
        'loan',
        approvedApp.banker,
        { applicationId: approvedApp.id }
      )
    }
    if (terminalDay === null && signedDay === null) {
      const lapseDay = rng.int(Math.round(value('lapsedMinDays')), Math.round(value('lapsedMaxDays')))
      at(lapseDay, 'lapsed', 'sales', salesOwner, { note: 'Booking Lapsed' })
      terminalDay = lapseDay
    }

    // ---- Routine sales touches keep some cases fresh.
    if (rng.chance(value('contactedRate') / 100)) {
      const touches = rng.int(1, 3)
      const cap = Math.min(terminalDay ?? 60, 60)
      for (let k = 0; k < touches; k += 1) {
        at(rng.int(1, Math.max(1, cap)), 'buyer_contacted', 'sales', salesOwner, {
          note: rng.chance(0.3) ? 'Routine Follow Up' : null
        })
      }
    }

    // ---- Emit: nothing after a terminal event or the reference date.
    plan.sort((a, b) => a.day - b.day)
    for (const p of plan) {
      if (terminalDay !== null && p.day > terminalDay) continue
      const date = addDays(bookingDate, p.day)
      if (date > referenceDate) continue
      const hour = p.track === 'sales' ? rng.int(8, 21) : rng.int(9, 17)
      const occurredAt = stamp(date, hour, rng.int(0, 59))
      const lagRoll = rng.next()
      const lagDays = lagRoll < 0.7 ? 0 : lagRoll < 0.9 ? 1 : 2
      let recDate = addDays(date, lagDays)
      if (recDate > referenceDate) recDate = referenceDate
      const recHour = recDate === date ? Math.min(23, hour + rng.int(0, 4)) : rng.int(9, 19)
      const recordedAt = stamp(recDate, recHour, rng.int(0, 59))
      let status: EvidenceStatus = 'confirmed'
      if (p.kind !== 'booked') {
        const roll = rng.next()
        const age = diffDays(date, referenceDate)
        if (age <= 7 && roll < value('provisionalRate') / 100) status = 'provisional'
        else if (roll < value('disputedRate') / 100 && DISPUTABLE.has(p.kind)) status = 'disputed'
      }
      events.push({
        id: `EV-${String((seq += 1)).padStart(6, '0')}`,
        bookingId: id,
        applicationId: p.applicationId,
        track: p.track,
        kind: p.kind,
        occurredAt,
        recordedAt,
        reportedBy: p.reportedBy,
        verifiedBy: status === 'confirmed' ? (p.track === 'loan' ? 'Tan Mei Ling' : 'Nurul Aina') : null,
        status,
        source: 'generator',
        messageId: null,
        document: p.document,
        note: p.note
      })
    }
  }

  return { bookings, applications, events }
}
