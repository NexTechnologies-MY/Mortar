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
   * When the bank's clock started: the latest documents_received, or the
   * submission when no documents are pending. `null` while the bank cannot act
   * (documents pending) or once decided.
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
  /** Age in days when each funnel rank was first reached; `null` = never. */
  enteredAges: (number | null)[]
  /** Latest confirmed event's recordedAt; `null` when nothing is confirmed. */
  lastEvidenceOn: IsoDate | null
  daysSinceEvidence: number
  ageDays: number
  exists: boolean
  live: boolean
  resolved: boolean
  signedWithinHorizon: boolean
  applications: ApplicationFacts[]
  outstandingDocuments: { document: DocumentKind; sinceDays: number }[]
  disputedCount: number
}

/**
 * Pair documents_requested/received per document kind, in order. A received
 * with no `document` clears everything outstanding.
 */
function outstandingDocs(events: CaseEvent[], asOf: IsoDate): { document: DocumentKind; sinceDays: number }[] {
  const open = new Map<DocumentKind, IsoDate>()
  for (const e of events) {
    if (e.kind === 'documents_requested') {
      if (e.document !== null && !open.has(e.document)) open.set(e.document, dateOf(e.occurredAt))
    } else if (e.kind === 'documents_received') {
      if (e.document === null) open.clear()
      else open.delete(e.document)
    }
  }
  return [...open.entries()]
    .map(([document, since]) => ({ document, sinceDays: diffDays(since, asOf) }))
    .sort((a, b) => b.sinceDays - a.sinceDays)
}

function deriveApplication(app: LoanApplication, events: CaseEvent[], withdrawn: boolean): ApplicationFacts {
  const own = events.filter((e) => e.applicationId === app.id)
  let submittedOn: IsoDate | null = null
  let decided = false
  let decidedKind: 'approved' | 'rejected' | null = null
  let lastReceivedOn: IsoDate | null = null
  const open = new Set<DocumentKind>()
  let openAny = false
  for (const e of own) {
    const day = dateOf(e.occurredAt)
    if (e.kind === 'loan_submitted' && submittedOn === null) submittedOn = day
    else if (e.kind === 'loan_approved' && !decided) {
      decided = true
      decidedKind = 'approved'
    } else if (e.kind === 'loan_rejected' && !decided) {
      decided = true
      decidedKind = 'rejected'
    } else if (e.kind === 'documents_requested') {
      if (e.document === null) openAny = true
      else open.add(e.document)
    } else if (e.kind === 'documents_received') {
      lastReceivedOn = day
      if (e.document === null) {
        open.clear()
        openAny = false
      } else open.delete(e.document)
    }
  }
  const pending = open.size + (openAny ? 1 : 0)
  let status: ApplicationStatus
  if (decidedKind === 'approved') status = 'approved'
  else if (decidedKind === 'rejected') status = 'rejected'
  else if (withdrawn) status = 'withdrawn'
  else if (pending > 0) status = 'documents_pending'
  else status = 'submitted'
  const pendingSince = decided || pending > 0 ? null : (lastReceivedOn ?? submittedOn)
  return { id: app.id, bank: app.bank, status, pendingSince }
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
  let lastEvidenceOn: IsoDate | null = null
  for (const e of confirmed) {
    const day = dateOf(e.occurredAt)
    const r = KIND_RANK[e.kind]
    if (r !== null && r > funnelRank) {
      if (r < EXIT_RANK) {
        funnelRank = r
        enteredAges[r] = diffDays(booking.bookingDate, day)
      }
      if (r > rank) rank = r
    }
    if (e.kind === 'spa_signed' && signedOn === null) signedOn = day
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
  const withdrawn = terminal !== null || confirmed.some((e) => e.kind === 'buyer_withdrew')
  const daysSinceEvidence = lastEvidenceOn === null ? Math.max(0, ageDays) : diffDays(lastEvidenceOn, asOf)
  const signedWithinHorizon = signedOn !== null && diffDays(booking.bookingDate, signedOn) <= horizonDays
  const live = exists && signedOn === null && terminal === null && ageDays < horizonDays
  const resolved = exists && !live
  return {
    booking,
    stage,
    funnelRank,
    terminal,
    terminalAge,
    signedOn,
    enteredAges,
    lastEvidenceOn,
    daysSinceEvidence,
    ageDays,
    exists,
    live,
    resolved,
    signedWithinHorizon,
    applications: applications.map((app) => deriveApplication(app, confirmed, withdrawn)),
    outstandingDocuments: outstandingDocs(confirmed, asOf),
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
  const unknownDays = value('unknownAfterDays')
  return data.bookings.map((booking) => {
    const facts = deriveCase(booking, appsByBooking.get(booking.id) ?? [], eventsByBooking.get(booking.id) ?? [], asOf)
    const stallReasons: string[] = []
    if (facts.live) {
      if (facts.daysSinceEvidence >= staleDays) {
        stallReasons.push(`No Evidence For ${facts.daysSinceEvidence} Days`)
      }
      for (const d of facts.outstandingDocuments) {
        if (d.sinceDays >= docStallDays) {
          stallReasons.push(`${DOCUMENT_LABELS[d.document]} Outstanding For ${d.sinceDays} Days`)
        }
      }
      for (const app of facts.applications) {
        if (app.pendingSince !== null) {
          const wd = workDaysBetween(app.pendingSince, asOf)
          if (wd >= undecidedWorkDays) stallReasons.push(`Application Undecided For ${wd} Working Days`)
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
      applications: facts.applications.map((a) => ({ id: a.id, bank: a.bank, status: a.status })),
      outstandingDocuments: facts.outstandingDocuments.map((d) => d.document),
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
