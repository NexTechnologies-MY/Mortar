/**
 * The Mortar domain contract. The browser, the server and the Jev module all
 * build against these types. Change them only through a reviewed pull request.
 */

/** Calendar date, `YYYY-MM-DD`. */
export type IsoDate = string
/** Timestamp with offset, e.g. `2026-09-18T09:30:00+08:00`. */
export type IsoDateTime = string

// Case Model ----------------------------------------------------------------

/** Funnel stages; `cancelled` and `lapsed` are exits. Conversion means `spa_signed`. */
export type Stage =
  'booked' | 'loan_applied' | 'lo_issued' | 'spa_signed' | 'loan_agreement' | 'disbursed' | 'cancelled' | 'lapsed'

/** Loan and legal progress are separate tracks that can overlap. */
export type Track = 'sales' | 'loan' | 'legal'

export type EventKind =
  | 'booked'
  | 'buyer_contacted'
  | 'buyer_hesitant'
  | 'buyer_withdrew'
  | 'cancelled'
  | 'lapsed'
  | 'loan_submitted'
  | 'documents_requested'
  | 'documents_received'
  | 'valuation_shortfall'
  | 'loan_approved'
  | 'loan_rejected'
  | 'loan_agreement_signed'
  | 'disbursed'
  | 'spa_appointment_set'
  | 'spa_signed'

export type EvidenceStatus = 'confirmed' | 'provisional' | 'disputed' | 'superseded'
export type EventSource = 'generator' | 'story' | 'staff' | 'jev'
export type DocumentKind = 'payslip' | 'epf_statement' | 'bank_statement' | 'ic_copy' | 'employment_letter' | 'tax_form'
export type OwnerRole = 'sales' | 'sales_admin' | 'loan_admin' | 'legal'

export interface Buyer {
  name: string
  /** Obviously fake, e.g. `000000-00-0001`. */
  ic: string
  /** Obviously fake, e.g. `+60 00-000 0001`. */
  phone: string
  age: number
  grossMonthlyIncomeRm: number
  monthlyCommitmentsRm: number
  /** Residential properties owned before this purchase; sets the margin-of-financing cap. */
  propertiesOwned: number
}

export interface Booking {
  /** `BK-0001` onward from the generator; `BK-9001` onward from story fixtures. */
  id: string
  project: string
  unit: string
  priceRm: number
  bookingDate: IsoDate
  buyer: Buyer
  salesOwner: string
  loanOwner: string
  legalFirm: string
}

/** An application's status is derived from the event log, never stored. */
export interface LoanApplication {
  id: string
  bookingId: string
  bank: string
  banker: string
}

export interface CaseEvent {
  id: string
  bookingId: string
  applicationId: string | null
  track: Track
  kind: EventKind
  /** When it happened. */
  occurredAt: IsoDateTime
  /** When Mortar learned of it. */
  recordedAt: IsoDateTime
  reportedBy: string
  verifiedBy: string | null
  status: EvidenceStatus
  source: EventSource
  messageId: string | null
  document: DocumentKind | null
  note: string | null
}

export type SenderRole = 'buyer' | 'banker' | 'solicitor' | 'sales_agent'
export type Language = 'en' | 'ms' | 'zh' | 'mixed'

export interface Message {
  id: string
  bookingId: string
  senderRole: SenderRole
  senderName: string
  language: Language
  sentAt: IsoDateTime
  body: string
  origin: 'fixture' | 'live'
}

export interface Playbook {
  id: string
  title: string
  situation: string
  evidence: string
  action: string
  rationale: string
  limits: string
  outcome: string
  author: string
  reviewer: string
  reviewedOn: IsoDate
  status: 'draft' | 'approved' | 'superseded' | 'retired'
  /** Search synonyms, including Malay and Manglish ones such as `slip gaji` and `LO`. */
  tags: string[]
}

export type NextAction =
  | 'request_document'
  | 'chase_banker'
  | 'submit_another_bank'
  | 'call_buyer'
  | 'schedule_spa'
  | 'escalate_legal'
  | 'review_release'
  | 'wait'

export interface Task {
  id: string
  bookingId: string
  action: NextAction
  title: string
  ownerRole: OwnerRole
  ownerName: string
  dueOn: IsoDate
  status: 'open' | 'done' | 'cancelled'
  origin: 'jev' | 'staff'
  createdAt: IsoDateTime
  completedAt: IsoDateTime | null
}

// Derived Views -------------------------------------------------------------

export type RiskLevel = 'low' | 'medium' | 'high'

export interface FinancingRisk {
  level: RiskLevel
  loanRm: number
  instalmentRm: number
  /** (existing commitments + new instalment) / gross monthly income. */
  debtServiceRatio: number
  marginOfFinancing: number
  reasons: string[]
}

export type ApplicationStatus = 'submitted' | 'documents_pending' | 'approved' | 'rejected' | 'withdrawn'

export interface CaseSummary {
  bookingId: string
  stage: Stage
  /** A live booking with no confirmed evidence recently: shown as unknown, never as progressing or failed. */
  unknown: boolean
  bookingAgeDays: number
  daysSinceEvidence: number
  /** Days since the loan was approved — the legal waiting room's clock. `null` when never approved. */
  daysSinceLoIssued: number | null
  /** Days since an SPA appointment was recorded. `null` when none is on the log. */
  daysSinceSpaSet: number | null
  applications: { id: string; bank: string; status: ApplicationStatus }[]
  outstandingDocuments: DocumentKind[]
  /** A confirmed `buyer_withdrew` is on the log, whatever the banks decided. */
  buyerWithdrew: boolean
  risk: FinancingRisk
  /** Why the stall rule flagged this booking; empty when it is not stalled. */
  stallReasons: string[]
  openTasks: number
}

export interface StageRate {
  stage: Stage
  signed: number
  resolved: number
  rate: number
  /** Wilson 95% interval. */
  low: number
  high: number
}

export interface Forecast {
  asOf: IsoDate
  horizonDays: number
  liveBookings: number
  expectedSignings: number
  /** 10th to 90th percentile of simulated signing counts. */
  rangeLow: number
  rangeHigh: number
  stageRates: StageRate[]
  perBooking: { bookingId: string; probability: number }[]
}

export interface Backtest {
  cutoff: IsoDate
  predicted: number
  observed: number
  brier: number
  calibration: { bucket: string; n: number; predicted: number; observed: number }[]
}

export type SourceTag = 'official' | 'industry' | 'anecdotal' | 'survey' | 'assumption'

export interface Assumption {
  key: string
  label: string
  value: number
  unit: string
  tag: SourceTag
  source: string
  min: number
  max: number
  step: number
}

// Jev -------------------------------------------------------------------------

export type JevKind = 'extract' | 'next_action' | 'playbooks' | 'signals'

export interface JevMeta {
  source: 'live' | 'cache' | 'unavailable'
  /** True when a cached answer was computed for an earlier case state. */
  stale: boolean
  latencyMs: number | null
}

export interface ChoiceAnswer<T extends string> {
  value: T
  probabilities: Partial<Record<T, number>>
  confidence: number
}

export interface ScoreAnswer {
  score: number
  confidence: number
}

/** Probability that the answer is yes. */
export type NoulAnswer = number

export type ExtractedEvent =
  | 'loan_approved'
  | 'loan_rejected'
  | 'documents_requested'
  | 'documents_received'
  | 'valuation_shortfall'
  | 'buyer_hesitant'
  | 'buyer_withdrawing'
  | 'spa_appointment'
  | 'spa_signed'
  | 'no_update'

export interface Extraction {
  messageId: string
  event: ChoiceAnswer<ExtractedEvent>
  document: ChoiceAnswer<DocumentKind | 'none'>
  owner: ChoiceAnswer<OwnerRole | 'none'>
  withdrawalRisk: NoulAnswer
  needsAction: NoulAnswer
  meta: JevMeta
}

export interface NextActionSuggestion {
  bookingId: string
  action: ChoiceAnswer<NextAction>
  owner: ChoiceAnswer<OwnerRole>
  /** 0 = within a week, 1 = this week, 2 = today. */
  urgency: ScoreAnswer
  meta: JevMeta
}

export interface PlaybookRanking {
  bookingId: string
  query: string
  results: { playbookId: string; keywordScore: number; fit: ScoreAnswer | null }[]
  meta: JevMeta
}

export interface BuyerSignals {
  bookingId: string
  /** 0 = unresponsive, 1 = slow, 2 = prompt. */
  responsiveness: ScoreAnswer
  /** 0 = committed, 1 = some doubts, 2 = strong doubts. */
  hesitation: ScoreAnswer
  meta: JevMeta
}

export interface JevService {
  extract(input: { message: Message; summary: CaseSummary }): Promise<Extraction>
  nextAction(input: { summary: CaseSummary; recentMessages: Message[] }): Promise<NextActionSuggestion>
  rankPlaybooks(input: {
    summary: CaseSummary
    query: string
    candidates: { playbook: Playbook; keywordScore: number }[]
  }): Promise<PlaybookRanking>
  signals(input: { bookingId: string; messages: Message[] }): Promise<BuyerSignals>
}

/** Implemented by the server over the `jev_answers` table. */
export interface JevCache {
  get<T>(kind: JevKind, subjectId: string, inputHash: string): Promise<{ answer: T; stale: boolean } | null>
  put<T>(kind: JevKind, subjectId: string, inputHash: string, answer: T, latencyMs: number): Promise<void>
}

/** One row of `server/fixtures/jev-cache.json`, written by the precompute script. */
export interface JevCacheEntry {
  kind: JevKind
  subjectId: string
  inputHash: string
  answer: unknown
  latencyMs: number
}

// Data Exchange ---------------------------------------------------------------

export interface Dataset {
  bookings: Booking[]
  applications: LoanApplication[]
  events: CaseEvent[]
}

/** One hand-written demo booking with its full history and messages. */
export interface StoryFixture {
  booking: Booking
  applications: LoanApplication[]
  events: CaseEvent[]
  messages: Message[]
}

export interface SimulationMeta {
  seed: number
  referenceDate: IsoDate
  resetAt: IsoDateTime | null
}

/** `GET /api/snapshot`: everything the app renders. */
export interface Snapshot extends Dataset {
  meta: SimulationMeta
  messages: Message[]
  playbooks: Playbook[]
  tasks: Task[]
  extractions: Extraction[]
  signals: BuyerSignals[]
  nextActions: NextActionSuggestion[]
}

// Personas ------------------------------------------------------------------

/** The three staff desks. Persisted in the browser under `mortar.persona`. */
export type Persona = 'sales-admin' | 'loan-admin' | 'legal-admin'

// Ask -----------------------------------------------------------------------

/**
 * Everything a scripted answer may read. Built once per snapshot — the
 * forecast is a Monte Carlo and must not run per question.
 */
export interface AskContext {
  snapshot: Snapshot
  cases: CaseSummary[]
  /** The authoritative live set: `perBooking` lists exactly the bookings in play. */
  forecast: Forecast
}

/**
 * The follow-through an answer may offer. Domain only — the panel maps this
 * onto `POST /api/tasks`, so core never encodes the transport.
 */
export interface AskAction {
  label: string
  bookingIds: string[]
  action: NextAction
  ownerRole: OwnerRole
}

/** One answer: prose, the bookings it counted, and an optional follow-through. */
export interface AskReply {
  text: string
  /** Booking ids the answer counted; the panel renders them as links. */
  citations: string[]
  action?: AskAction
}

/**
 * One scripted question. `answer` computes from the snapshot rather than
 * returning a stored string, so its numbers can never drift from the screens.
 * `predicate` states the same claim as a test: every booking it accepts must
 * be cited, and every citation must satisfy it.
 */
export interface AskQuestion {
  id: string
  /** Canonical phrasing, shown as a suggestion chip. */
  question: string
  /** Alternate phrasings plus Malay and Manglish synonyms, like `Playbook.tags`. */
  tags: string[]
  /** Whose desk this belongs to; orders the chips. `all` shows for everyone. */
  desk: Persona | 'all'
  answer: (context: AskContext) => AskReply
  /**
   * The set the answer claims. `null` when an answer names no set — a summary
   * over every booking rather than a filtered list.
   */
  predicate: ((context: AskContext, bookingId: string) => boolean) | null
  /** How many bookings the answer names. Defaults to the shared cap of six. */
  cites?: number
}
