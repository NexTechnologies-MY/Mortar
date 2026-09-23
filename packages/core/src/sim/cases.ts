import type {
  ApplicationStatus,
  Assumption,
  Booking,
  CaseEvent,
  CaseSummary,
  Dataset,
  DocumentKind,
  EventKind,
  IsoDate,
  LoanApplication,
  Stage,
  Task
} from '../types'
import { assumptionValue } from './assumptions'
import { computeFinancingRisk } from './risk'
import { dateOf, diffDays, workDaysBetween } from './dates'
import { HORIZON_DAYS } from './constants'

export const FUNNEL_STAGES: Stage[] = [
  'booked',
  'loan_applied',
  'lo_issued',
  'spa_signed',
  'loan_agreement',
  'disbursed'
]

export const STAGE_RANK: Record<Stage, number> = {
  booked: 0,
  loan_applied: 1,
  lo_issued: 2,
  spa_signed: 3,
  loan_agreement: 4,
  disbursed: 5,
  cancelled: 6,
  lapsed: 6
}

const EXIT_RANK = 6

/** Stage rank each event kind advances the case to; `null` never moves the case. */
const KIND_RANK: Record<EventKind, number | null> = {
  booked: 0,
  buyer_contacted: null,
  buyer_hesitant: null,
  buyer_withdrew: null,
  cancelled: EXIT_RANK,
  lapsed: EXIT_RANK,
  loan_submitted: 1,
  documents_requested: 1,
  documents_received: 1,
  valuation_shortfall: 1,
  loan_approved: 2,
  loan_rejected: null,
  loan_agreement_signed: 4,
  disbursed: 5,
  spa_appointment_set: 2,
  spa_signed: 3
}

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  payslip: 'Payslip',
  epf_statement: 'EPF Statement',
  bank_statement: 'Bank Statement',
  ic_copy: 'IC Copy',
  employment_letter: 'Employment Letter',
  tax_form: 'Tax Form'
}

const INCOME_DOCUMENTS: DocumentKind[] = ['payslip', 'epf_statement', 'bank_statement', 'employment_letter', 'tax_form']

const byOccurred = (a: CaseEvent, b: CaseEvent) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id)

export interface ApplicationFacts {
  id: string
  bank: string
  status: ApplicationStatus
  /**
   * When the bank's clock started: the submission or the latest documents that
   * reached the bank, whichever is later. `null` while the bank cannot act
   * (documents pending), once decided, or once withdrawn.
   */
  pendingSince: IsoDate | null
}

export interface CaseFacts {
  booking: Booking
  /** Derived from confirmed events only. */
  stage: Stage
  /** Highest funnel rank reached (exits excluded), -1 with no confirmed events. */
  funnelRank: number
  terminal: 'cancelled' | 'lapsed' | null
  /** Age in days when the terminal event was confirmed; `null` while running. */
  terminalAge: number | null
  signedOn: IsoDate | null
  /** First confirmed `loan_approved`: when the case entered the legal waiting room. */
  loIssuedOn: IsoDate | null
  /** First confirmed `spa_appointment_set`; `null` while no appointment is on record. */
  spaAppointmentSetOn: IsoDate | null
  /** Age in days when each funnel rank was first reached; `null` = never. */
  enteredAges: (number | null)[]
  /** Latest confirmed event's recordedAt; `null` when nothing is confirmed. */
  lastEvidenceOn: IsoDate | null
  daysSinceEvidence: number
  ageDays: number
  exists: boolean
  live: boolean
  /**
   * The buyer's last word is a withdrawal: a confirmed `buyer_withdrew`, whatever
   * the banks decided, with no bank submitted on a later day. A later submission
   * means the buyer is back in.
   */
  buyerWithdrew: boolean
  /**
   * Still in play: booked, not signed, not exited. Unlike `live` there is no
   * age ceiling, so a case that has sat past the horizon stays visible. Stall
   * rules read this; the forecast reads `live`.
   */
  open: boolean
  resolved: boolean
  signedWithinHorizon: boolean
  applications: ApplicationFacts[]
  outstandingDocuments: { document: DocumentKind; sinceDays: number }[]
  disputedCount: number
}

/** An open documents_requested: the bank that asked (`null`: not for one bank) and what for (`null`: unnamed). */
interface OpenRequest {
  applicationId: string | null
  document: DocumentKind | null
  since: IsoDate
}

interface DocumentLedger {
  open: OpenRequest[]
  /** The last day documents reached each application. */
  receivedOn: Map<string, IsoDate>
}

/**
 * The case's one document ledger, keyed by (application or none, document), so
 * each bank's status and the case's outstanding list read the same entries. A
 * request opens its key once. A receipt clears, by its scope:
 * - one bank, one document: that bank's request for it and a request for it not for one bank;
 * - one bank, all outstanding: every request that bank made, and nothing else;
 * - not for one bank, one document: that document on every bank and on none;
 * - not for one bank, all outstanding: everything.
 * A named receipt never clears an unnamed request. Documents reach a bank with
 * any receipt for it, or a receipt not for one bank that cleared one of its requests.
 */
function documentLedger(events: CaseEvent[]): DocumentLedger {
  const open = new Map<string, OpenRequest>()
  const receivedOn = new Map<string, IsoDate>()
  for (const e of events) {
    const day = dateOf(e.occurredAt)
    if (e.kind === 'documents_requested') {
      const key = `${e.applicationId ?? ''}|${e.document ?? ''}`
      if (!open.has(key)) open.set(key, { applicationId: e.applicationId, document: e.document, since: day })
    } else if (e.kind === 'documents_received') {
      if (e.applicationId !== null) receivedOn.set(e.applicationId, day)
      for (const [key, r] of open) {
        const sameDocument = e.document === null || r.document === e.document
        const sameBank =
          e.applicationId === null ||
          r.applicationId === e.applicationId ||
          (r.applicationId === null && e.document !== null)
        if (!sameDocument || !sameBank) continue
        open.delete(key)
        if (e.applicationId === null && r.applicationId !== null) receivedOn.set(r.applicationId, day)
      }
    }
  }
  return { open: [...open.values()], receivedOn }
}

function deriveApplication(
  app: LoanApplication,
  events: CaseEvent[],
  ledger: DocumentLedger,
  closed: boolean,
  withdrewOn: IsoDate | null
): ApplicationFacts {
  let submittedOn: IsoDate | null = null
  let decidedKind: 'approved' | 'rejected' | null = null
  for (const e of events) {
    if (e.applicationId !== app.id) continue
    if (e.kind === 'loan_submitted' && submittedOn === null) submittedOn = dateOf(e.occurredAt)
    else if (e.kind === 'loan_approved' && decidedKind === null) decidedKind = 'approved'
    else if (e.kind === 'loan_rejected' && decidedKind === null) decidedKind = 'rejected'
  }
  // The latest withdrawal covers every application submitted on or before its
  // day; one submitted later is the buyer coming back.
  const withdrawn = closed || (withdrewOn !== null && (submittedOn === null || submittedOn <= withdrewOn))
  let status: ApplicationStatus
  if (decidedKind !== null) status = decidedKind
  else if (withdrawn) status = 'withdrawn'
  else if (ledger.open.some((r) => r.applicationId === app.id)) status = 'documents_pending'
  else status = 'submitted'
  // A receipt back-dated before the submission cannot start the clock early.
  const receivedOn = ledger.receivedOn.get(app.id) ?? null
  const since = submittedOn === null || (receivedOn !== null && receivedOn > submittedOn) ? receivedOn : submittedOn
  return { id: app.id, bank: app.bank, status, pendingSince: status === 'submitted' ? since : null }
}

/**
 * The documents holding the case up, oldest request first: those asked for not
 * for one bank, and those of a bank still in play. Before any approval that is
 * every bank not declined or withdrawn; once a loan is approved, only the
 * approving bank, so a declined, withdrawn or other bank's request stops
 * driving Waiting On and the stalls. An unnamed request shows on its bank's
 * status only.
 */
function outstandingDocs(
  ledger: DocumentLedger,
  applications: ApplicationFacts[],
  approved: boolean,
  asOf: IsoDate
): { document: DocumentKind; sinceDays: number }[] {
  const statusOf = new Map(applications.map((a) => [a.id, a.status]))
  const inPlay = (applicationId: string | null) => {
    if (applicationId === null) return true
    const status = statusOf.get(applicationId)
    return approved ? status === 'approved' : status !== 'rejected' && status !== 'withdrawn'
  }
  const since = new Map<DocumentKind, IsoDate>()
  for (const r of ledger.open) {
    if (r.document === null || !inPlay(r.applicationId)) continue
    const first = since.get(r.document)
    if (first === undefined || r.since < first) since.set(r.document, r.since)
  }
  return [...since.entries()]
    .map(([document, day]) => ({ document, sinceDays: diffDays(day, asOf) }))
    .sort((a, b) => b.sinceDays - a.sinceDays)
}

/** Day of the latest confirmed event of `kind`; `null` when there is none. */
function lastDayOf(events: CaseEvent[], kind: EventKind): IsoDate | null {
  let last: IsoDate | null = null
  for (const e of events) {
    const day = dateOf(e.occurredAt)
    if (e.kind === kind && (last === null || day > last)) last = day
  }
  return last
}

/** Derive a booking's case state at `asOf` from its events. Confirmed events only move a case. */
export function deriveCase(
  booking: Booking,
  applications: LoanApplication[],
  events: CaseEvent[],
  asOf: IsoDate,
  horizonDays = HORIZON_DAYS
): CaseFacts {
  const confirmed = events
    .filter((e) => e.status === 'confirmed' && dateOf(e.occurredAt) <= asOf && dateOf(e.recordedAt) <= asOf)
    .sort(byOccurred)
  const enteredAges: (number | null)[] = FUNNEL_STAGES.map(() => null)
  let rank = -1
  let funnelRank = -1
  let terminal: 'cancelled' | 'lapsed' | null = null
  let terminalAge: number | null = null
  let signedOn: IsoDate | null = null
  let loIssuedOn: IsoDate | null = null
  let spaAppointmentSetOn: IsoDate | null = null
  let lastEvidenceOn: IsoDate | null = null
  for (const e of confirmed) {
    const day = dateOf(e.occurredAt)
    const r = KIND_RANK[e.kind]
    if (r !== null) {
      if (r < EXIT_RANK) {
        // A lower-rank event can sort after a higher one taken on the same day
        // (booked at 20:00 after loan_submitted at 10:00); the rank was still
        // reached, so record its entry age independently of the advance.
        if (enteredAges[r] === null) enteredAges[r] = diffDays(booking.bookingDate, day)
        if (r > funnelRank) funnelRank = r
      }
      if (r > rank) rank = r
    }
    if (e.kind === 'spa_signed' && signedOn === null) signedOn = day
    if (e.kind === 'loan_approved' && loIssuedOn === null) loIssuedOn = day
    if (e.kind === 'spa_appointment_set' && spaAppointmentSetOn === null) spaAppointmentSetOn = day
    if ((e.kind === 'cancelled' || e.kind === 'lapsed') && terminal === null) {
      terminal = e.kind
      terminalAge = diffDays(booking.bookingDate, day)
    }
    const recorded = dateOf(e.recordedAt)
    if (lastEvidenceOn === null || recorded > lastEvidenceOn) lastEvidenceOn = recorded
  }
  const ageDays = diffDays(booking.bookingDate, asOf)
  const exists = ageDays >= 0
  const stage: Stage = rank === EXIT_RANK ? (terminal ?? 'cancelled') : FUNNEL_STAGES[Math.max(0, funnelRank)]
  const withdrewOn = lastDayOf(confirmed, 'buyer_withdrew')
  const lastSubmittedOn = lastDayOf(confirmed, 'loan_submitted')
  const buyerWithdrew = withdrewOn !== null && (lastSubmittedOn === null || lastSubmittedOn <= withdrewOn)
  const ledger = documentLedger(confirmed)
  const applicationFacts = applications.map((app) =>
    deriveApplication(app, confirmed, ledger, terminal !== null, withdrewOn)
  )
  const daysSinceEvidence = lastEvidenceOn === null ? Math.max(0, ageDays) : diffDays(lastEvidenceOn, asOf)
  const signedWithinHorizon = signedOn !== null && diffDays(booking.bookingDate, signedOn) <= horizonDays
  const open = exists && signedOn === null && terminal === null
  const live = open && ageDays < horizonDays
  const resolved = exists && !live
  return {
    booking,
    stage,
    funnelRank,
    terminal,
    terminalAge,
    signedOn,
    loIssuedOn,
    spaAppointmentSetOn,
    enteredAges,
    lastEvidenceOn,
    daysSinceEvidence,
    ageDays,
    exists,
    live,
    buyerWithdrew,
    open,
    resolved,
    signedWithinHorizon,
    applications: applicationFacts,
    outstandingDocuments: outstandingDocs(ledger, applicationFacts, loIssuedOn !== null, asOf),
    disputedCount: events.filter((e) => e.status === 'disputed' && dateOf(e.recordedAt) <= asOf).length
  }
}

export type CaseDataInput = Dataset & { tasks: Task[] }

/** Stage, evidence recency, applications, outstanding documents, risk and stall reasons per booking. */
export function summarizeCases(data: CaseDataInput, asOf: IsoDate, assumptions: Assumption[]): CaseSummary[] {
  const appsByBooking = groupBy(data.applications, (x) => x.bookingId)
  const eventsByBooking = groupBy(data.events, (x) => x.bookingId)
  const openTasks = new Map<string, number>()
  for (const t of data.tasks) {
    if (t.status === 'open') openTasks.set(t.bookingId, (openTasks.get(t.bookingId) ?? 0) + 1)
  }
  const value = (key: string) => assumptionValue(assumptions, key)
  const staleDays = value('staleEvidenceDays')
  const docStallDays = value('documentStallDays')
  const undecidedWorkDays = value('undecidedStallWorkDays')
  const spaScheduleDays = value('spaSchedulingStallDays')
  const spaSignDays = value('spaSigningStallDays')
  const unknownDays = value('unknownAfterDays')
  return data.bookings.map((booking) => {
    const facts = deriveCase(booking, appsByBooking.get(booking.id) ?? [], eventsByBooking.get(booking.id) ?? [], asOf)
    const daysSinceLoIssued = facts.loIssuedOn === null ? null : diffDays(facts.loIssuedOn, asOf)
    const daysSinceSpaSet = facts.spaAppointmentSetOn === null ? null : diffDays(facts.spaAppointmentSetOn, asOf)
    // Stalls read `open`, not `live`: a case that has sat past the horizon is
    // the one most worth chasing, and gating on `live` hid it entirely.
    const stallReasons: string[] = []
    if (facts.open) {
      if (facts.daysSinceEvidence >= staleDays) {
        stallReasons.push(`No Update For ${facts.daysSinceEvidence} Days`)
      }
      for (const d of facts.outstandingDocuments) {
        if (d.sinceDays >= docStallDays) {
          stallReasons.push(`${DOCUMENT_LABELS[d.document]} Still Outstanding After ${d.sinceDays} Days`)
        }
      }
      // Once a loan is approved the case waits on the solicitor, not on the other banks.
      for (const app of facts.loIssuedOn === null ? facts.applications : []) {
        if (app.pendingSince !== null) {
          const wd = workDaysBetween(app.pendingSince, asOf)
          if (wd >= undecidedWorkDays) stallReasons.push(`Bank Has Not Decided After ${wd} Working Days`)
        }
      }
      // The legal waiting room: approved, unsigned, and either never scheduled
      // or scheduled and left sitting.
      if (facts.stage === 'lo_issued') {
        if (daysSinceSpaSet !== null) {
          if (daysSinceSpaSet >= spaSignDays) {
            stallReasons.push(`SPA Set ${daysSinceSpaSet} Days Ago, Still Unsigned`)
          }
        } else if (daysSinceLoIssued !== null && daysSinceLoIssued >= spaScheduleDays) {
          stallReasons.push(`SPA Not Scheduled ${daysSinceLoIssued} Days After LO`)
        }
      }
      if (facts.disputedCount > 0) stallReasons.push('Disputed Evidence Awaits Review')
    }
    let risk = computeFinancingRisk(
      {
        priceRm: booking.priceRm,
        age: booking.buyer.age,
        grossMonthlyIncomeRm: booking.buyer.grossMonthlyIncomeRm,
        monthlyCommitmentsRm: booking.buyer.monthlyCommitmentsRm,
        propertiesOwned: booking.buyer.propertiesOwned
      },
      value
    )
    if (facts.outstandingDocuments.some((d) => INCOME_DOCUMENTS.includes(d.document))) {
      const level = risk.level === 'high' ? 'high' : 'medium'
      risk = { ...risk, level, reasons: [...risk.reasons, 'Income Document Outstanding'] }
    }
    return {
      bookingId: booking.id,
      stage: facts.stage,
      unknown: facts.live && facts.daysSinceEvidence >= unknownDays,
      bookingAgeDays: facts.ageDays,
      daysSinceEvidence: facts.daysSinceEvidence,
      daysSinceLoIssued,
      daysSinceSpaSet,
      applications: facts.applications.map((a) => ({ id: a.id, bank: a.bank, status: a.status })),
      outstandingDocuments: facts.outstandingDocuments.map((d) => d.document),
      buyerWithdrew: facts.buyerWithdrew,
      risk,
      stallReasons,
      openTasks: openTasks.get(booking.id) ?? 0
    }
  })
}

export function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const list = map.get(k)
    if (list) list.push(item)
    else map.set(k, [item])
  }
  return map
}
