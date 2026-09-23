/**
 * `createApp` builds the `/api` fetch handler. It takes a `Database` (Bun SQL in
 * production, an in-memory fake in tests), a `JevService` (the real
 * `createJevService` once `@mortar/jev` lands, `unavailableJevService` until
 * then) and a `reset` callback so the admin route stays testable. Returns
 * `null` for non-API paths so the caller can fall through to static files.
 */
import {
  REFERENCE_DATE,
  checkBookingDraft,
  proposalFromExtraction,
  searchPlaybooks,
  simNow,
  summarizeCases,
  unitKey
} from '@mortar/core'
import { defaultPlaybookQuery } from '@mortar/jev'
import type {
  BookingDraft,
  CaseEvent,
  CaseSummary,
  DocumentKind,
  EventKind,
  Extraction,
  JevService,
  Message,
  NextAction,
  OwnerRole,
  SenderRole,
  SimulationMeta,
  Task,
  Track
} from '@mortar/core'
import type { Database } from '../db/index'
import { body, detectLanguage, error, isIsoDate, isOneOf, isString, json, match, newId } from './util'

export interface AppOptions {
  db: Database
  jev: JevService
  /** Rebuilds the canonical dataset; `POST /api/admin/reset` and the boot seed both call it. */
  reset: () => Promise<SimulationMeta>
  /** What `/api/health` reports for Jev: whether a live service is wired. */
  jevAvailable?: boolean
}

export interface App {
  fetch(req: Request): Promise<Response | null>
}

const SENDER_ROLES: readonly SenderRole[] = ['buyer', 'banker', 'solicitor', 'sales_agent']
const TRACKS: readonly Track[] = ['sales', 'loan', 'legal']
const EVENT_KINDS: readonly EventKind[] = [
  'booked',
  'buyer_contacted',
  'buyer_hesitant',
  'buyer_withdrew',
  'cancelled',
  'lapsed',
  'loan_submitted',
  'documents_requested',
  'documents_received',
  'valuation_shortfall',
  'loan_approved',
  'loan_rejected',
  'loan_agreement_signed',
  'disbursed',
  'spa_appointment_set',
  'spa_signed'
]
const DOCUMENT_KINDS: readonly DocumentKind[] = [
  'payslip',
  'epf_statement',
  'bank_statement',
  'ic_copy',
  'employment_letter',
  'tax_form'
]
const OWNER_ROLES: readonly OwnerRole[] = ['sales', 'sales_admin', 'loan_admin', 'legal']
const NEXT_ACTIONS: readonly NextAction[] = [
  'request_document',
  'chase_banker',
  'submit_another_bank',
  'call_buyer',
  'schedule_spa',
  'escalate_legal',
  'review_release',
  'wait'
]
const TASK_STATUSES: readonly Task['status'][] = ['open', 'done', 'cancelled']
const REVIEW_DECISIONS = { confirm: 'confirmed', dispute: 'disputed', dismiss: 'superseded' } as const

const RESET_COOLDOWN_MS = 30_000
/** Rows one import may carry; a launch sheet is a few hundred units. */
const MAX_IMPORT_ROWS = 1000

/**
 * Copies only the contract's fields, so extra keys in a posted draft never
 * reach the `buyer` jsonb column. Call after `checkBookingDraft` passes.
 */
function cleanDraft(value: unknown): BookingDraft {
  const d = value as BookingDraft
  return {
    project: d.project.trim(),
    unit: d.unit.trim().toUpperCase(),
    priceRm: d.priceRm,
    bookingDate: d.bookingDate,
    buyer: {
      name: d.buyer.name.trim(),
      ic: d.buyer.ic.trim(),
      phone: d.buyer.phone.trim(),
      age: d.buyer.age,
      grossMonthlyIncomeRm: d.buyer.grossMonthlyIncomeRm,
      monthlyCommitmentsRm: d.buyer.monthlyCommitmentsRm,
      propertiesOwned: d.buyer.propertiesOwned
    },
    salesOwner: d.salesOwner.trim(),
    loanOwner: d.loanOwner.trim(),
    legalFirm: d.legalFirm.trim()
  }
}

type Handler = (ctx: { req: Request; url: URL; params: Record<string, string> }) => Promise<Response>

export function createApp(options: AppOptions): App {
  const { db, jev } = options
  /** Wall clock of the last reset through this route; covers restarts via `meta` below. */
  let lastResetAt = Number.NEGATIVE_INFINITY

  const summaryFor = async (bookingId: string): Promise<CaseSummary | null> => {
    const summaries = summarizeCases(await db.caseData(), REFERENCE_DATE)
    return summaries.find((s) => s.bookingId === bookingId) ?? null
  }

  /** Turns a Jev extraction into a provisional event row, or `null` for `no_update`. */
  const insertProposal = async (
    extraction: Extraction,
    message: Message,
    summary: CaseSummary
  ): Promise<CaseEvent | null> => {
    const proposal = proposalFromExtraction(extraction, message, summary)
    if (!proposal) return null
    const event: CaseEvent = { ...proposal, id: newId('EV'), recordedAt: simNow(REFERENCE_DATE) }
    await db.insertEvent(event)
    return event
  }

  const routes: [string, string, Handler][] = [
    [
      'GET',
      '/api/health',
      async () => {
        let dbOk = true
        let jevAnswers: number | null = null
        try {
          await db.ping()
          jevAnswers = await db.jevAnswerCount()
        } catch {
          dbOk = false
        }
        return json({ ok: true, db: dbOk, jev: Boolean(options.jevAvailable), jevAnswers })
      }
    ],
    ['GET', '/api/snapshot', async () => json(await db.snapshot())],
    [
      'POST',
      '/api/messages',
      async ({ req }) => {
        const b = await body(req)
        if (!b) return error(400, 'expected a JSON object body')
        if (!isString(b.bookingId)) return error(400, 'bookingId is required')
        if (!isOneOf(b.senderRole, SENDER_ROLES))
          return error(400, `senderRole must be one of: ${SENDER_ROLES.join(', ')}`)
        if (!isString(b.senderName)) return error(400, 'senderName is required')
        if (!isString(b.body)) return error(400, 'body is required')
        const booking = await db.getBooking(b.bookingId)
        if (!booking) return error(404, `booking ${b.bookingId} not found`)
        const summary = await summaryFor(booking.id)
        if (!summary) return error(500, `no case summary for ${booking.id}`)
        const message: Message = {
          id: newId('MSG'),
          bookingId: booking.id,
          senderRole: b.senderRole,
          senderName: b.senderName.trim(),
          language: detectLanguage(b.body),
          sentAt: simNow(REFERENCE_DATE),
          body: b.body.trim(),
          origin: 'live'
        }
        await db.insertMessage(message)
        const extraction = await jev.extract({ message, summary })
        const event = await insertProposal(extraction, message, summary)
        return json({ message, extraction, event })
      }
    ],
    [
      'POST',
      '/api/messages/:id/extract',
      async ({ params }) => {
        const message = await db.getMessage(params.id)
        if (!message) return error(404, `message ${params.id} not found`)
        const summary = await summaryFor(message.bookingId)
        if (!summary) return error(500, `no case summary for ${message.bookingId}`)
        const extraction = await jev.extract({ message, summary })
        await db.supersedePendingProposals(message.id)
        const confirmed = (await db.eventsForMessage(message.id)).some((e) => e.status === 'confirmed')
        const event = confirmed ? null : await insertProposal(extraction, message, summary)
        return json({ extraction, event })
      }
    ],
    [
      'POST',
      '/api/events',
      async ({ req }) => {
        const b = await body(req)
        if (!b) return error(400, 'expected a JSON object body')
        if (!isString(b.bookingId)) return error(400, 'bookingId is required')
        if (!isOneOf(b.track, TRACKS)) return error(400, `track must be one of: ${TRACKS.join(', ')}`)
        if (!isOneOf(b.kind, EVENT_KINDS)) return error(400, `kind must be one of: ${EVENT_KINDS.join(', ')}`)
        if (b.document != null && !isOneOf(b.document, DOCUMENT_KINDS))
          return error(400, `document must be one of: ${DOCUMENT_KINDS.join(', ')}`)
        if (b.note != null && typeof b.note !== 'string') return error(400, 'note must be a string')
        if (!isString(b.reportedBy)) return error(400, 'reportedBy is required')
        if (!(await db.getBooking(b.bookingId))) return error(404, `booking ${b.bookingId} not found`)
        const now = simNow(REFERENCE_DATE)
        const event: CaseEvent = {
          id: newId('EV'),
          bookingId: b.bookingId,
          applicationId: null,
          track: b.track,
          kind: b.kind,
          occurredAt: now,
          recordedAt: now,
          reportedBy: b.reportedBy.trim(),
          verifiedBy: b.reportedBy.trim(),
          status: 'confirmed',
          source: 'staff',
          messageId: null,
          document: (b.document as DocumentKind | undefined) ?? null,
          note: (b.note as string | undefined) ?? null
        }
        await db.insertEvent(event)
        return json(event)
      }
    ],
    [
      'POST',
      '/api/events/:id/review',
      async ({ req, params }) => {
        const b = await body(req)
        if (!b) return error(400, 'expected a JSON object body')
        if (!isOneOf(b.decision, Object.keys(REVIEW_DECISIONS)))
          return error(400, 'decision must be one of: confirm, dispute, dismiss')
        if (!isString(b.reviewer)) return error(400, 'reviewer is required')
        const status = REVIEW_DECISIONS[b.decision as keyof typeof REVIEW_DECISIONS]
        const event = await db.reviewEvent(params.id, status, b.reviewer.trim())
        if (!event) return error(404, `event ${params.id} not found`)
        return json(event)
      }
    ],
    [
      'POST',
      '/api/bookings/:id/next-action',
      async ({ params }) => {
        if (!(await db.getBooking(params.id))) return error(404, `booking ${params.id} not found`)
        const summary = await summaryFor(params.id)
        if (!summary) return error(500, `no case summary for ${params.id}`)
        const recentMessages = (await db.messagesForBooking(params.id)).slice(-3)
        return json(await jev.nextAction({ summary, recentMessages }))
      }
    ],
    [
      'GET',
      '/api/bookings/:id/playbooks',
      async ({ url, params }) => {
        if (!(await db.getBooking(params.id))) return error(404, `booking ${params.id} not found`)
        const summary = await summaryFor(params.id)
        if (!summary) return error(500, `no case summary for ${params.id}`)
        const query = url.searchParams.get('q')?.trim() || defaultPlaybookQuery(summary)
        const candidates = searchPlaybooks(await db.listPlaybooks(), query)
        return json(await jev.rankPlaybooks({ summary, query, candidates }))
      }
    ],
    [
      'GET',
      '/api/bookings/:id/signals',
      async ({ params }) => {
        if (!(await db.getBooking(params.id))) return error(404, `booking ${params.id} not found`)
        const messages = await db.messagesForBooking(params.id)
        // Signals read the buyer's messages only; an empty history is not a
        // Jev job, so the route 404s instead of scoring silence as unresponsive.
        if (!messages.some((m) => m.senderRole === 'buyer')) {
          return error(404, `booking ${params.id} has no buyer messages`)
        }
        return json(await jev.signals({ bookingId: params.id, messages }))
      }
    ],
    [
      'POST',
      '/api/bookings/import',
      async ({ req }) => {
        const b = await body(req)
        if (!b) return error(400, 'expected a JSON object body')
        if (!Array.isArray(b.bookings) || b.bookings.length === 0)
          return error(400, 'bookings must be a non-empty array')
        if (b.bookings.length > MAX_IMPORT_ROWS) return error(400, `at most ${MAX_IMPORT_ROWS} bookings per import`)
        if (!isString(b.reportedBy)) return error(400, 'reportedBy is required')
        const problems = b.bookings.flatMap((draft, i) =>
          checkBookingDraft(draft, REFERENCE_DATE).map((p) => `row ${i + 1}: ${p}`)
        )
        if (problems.length > 0) return error(400, problems.slice(0, 5).join('; '))
        const drafts = b.bookings.map(cleanDraft)

        // A unit an open booking holds cannot be booked again; a cancelled or
        // lapsed one has gone back on sale. The browser checks this too, but
        // another import may have landed since it last looked.
        const data = await db.caseData()
        const closed = new Set(
          summarizeCases(data, REFERENCE_DATE)
            .filter((s) => s.stage === 'cancelled' || s.stage === 'lapsed')
            .map((s) => s.bookingId)
        )
        const held = new Map(
          data.bookings.filter((x) => !closed.has(x.id)).map((x) => [unitKey(x.project, x.unit), x.id])
        )
        const inBatch = new Set<string>()
        for (const draft of drafts) {
          const key = unitKey(draft.project, draft.unit)
          const holder = held.get(key)
          if (holder) return error(409, `unit ${draft.unit} is already held by ${holder}`)
          if (inBatch.has(key)) return error(409, `unit ${draft.unit} appears twice in the import`)
          inBatch.add(key)
        }

        const reportedBy = b.reportedBy.trim()
        const note = isString(b.source)
          ? `Imported From ${b.source.trim().slice(0, 120)}`
          : 'Imported From A Booking Sheet'
        const recordedAt = simNow(REFERENCE_DATE)
        const bookings = await db.importBookings(drafts, (booking) => ({
          id: newId('EV'),
          bookingId: booking.id,
          applicationId: null,
          track: 'sales',
          kind: 'booked',
          occurredAt: `${booking.bookingDate}T09:00:00+08:00`,
          recordedAt,
          reportedBy,
          verifiedBy: reportedBy,
          status: 'confirmed',
          source: 'staff',
          messageId: null,
          document: null,
          note
        }))
        return json({ bookings })
      }
    ],
    [
      'POST',
      '/api/tasks',
      async ({ req }) => {
        const b = await body(req)
        if (!b) return error(400, 'expected a JSON object body')
        if (!isString(b.bookingId)) return error(400, 'bookingId is required')
        if (!isOneOf(b.action, NEXT_ACTIONS)) return error(400, `action must be one of: ${NEXT_ACTIONS.join(', ')}`)
        if (!isString(b.title)) return error(400, 'title is required')
        if (!isOneOf(b.ownerRole, OWNER_ROLES)) return error(400, `ownerRole must be one of: ${OWNER_ROLES.join(', ')}`)
        if (!isString(b.ownerName)) return error(400, 'ownerName is required')
        if (!isIsoDate(b.dueOn)) return error(400, 'dueOn must be a YYYY-MM-DD date')
        if (!isOneOf(b.origin, ['jev', 'staff'] as const)) return error(400, "origin must be 'jev' or 'staff'")
        if (!(await db.getBooking(b.bookingId))) return error(404, `booking ${b.bookingId} not found`)
        const task: Task = {
          id: newId('TSK'),
          bookingId: b.bookingId,
          action: b.action,
          title: b.title.trim(),
          ownerRole: b.ownerRole,
          ownerName: b.ownerName.trim(),
          dueOn: b.dueOn,
          status: 'open',
          origin: b.origin,
          createdAt: simNow(REFERENCE_DATE),
          completedAt: null
        }
        await db.insertTask(task)
        return json(task)
      }
    ],
    [
      'PATCH',
      '/api/tasks/:id',
      async ({ req, params }) => {
        const b = await body(req)
        if (!b) return error(400, 'expected a JSON object body')
        if (!isOneOf(b.status, TASK_STATUSES)) return error(400, `status must be one of: ${TASK_STATUSES.join(', ')}`)
        const completedAt = b.status === 'done' ? simNow(REFERENCE_DATE) : null
        const task = await db.updateTaskStatus(params.id, b.status, completedAt)
        if (!task) return error(404, `task ${params.id} not found`)
        return json(task)
      }
    ],
    [
      'POST',
      '/api/admin/reset',
      async () => {
        const meta = await db.meta()
        // `meta.resetAt` is sim time (the reference date plus the real time of
        // day), so the cooldown measures it against `simNow`, not `Date.now`.
        const recent =
          Date.now() - lastResetAt < RESET_COOLDOWN_MS ||
          (meta?.resetAt != null && Date.parse(meta.resetAt) > Date.parse(simNow(REFERENCE_DATE)) - RESET_COOLDOWN_MS)
        if (recent) return error(429, 'reset ran less than 30 seconds ago')
        // Arm before awaiting so a concurrent POST inside the reset's own
        // runtime is also a 429; a failed reset frees the window again.
        lastResetAt = Date.now()
        try {
          return json(await options.reset())
        } catch (e) {
          lastResetAt = Number.NEGATIVE_INFINITY
          throw e
        }
      }
    ]
  ]

  return {
    async fetch(req) {
      const url = new URL(req.url)
      if (!url.pathname.startsWith('/api/')) return null
      for (const [method, pattern, handler] of routes) {
        if (method !== req.method) continue
        const params = match(url.pathname, pattern)
        if (!params) continue
        try {
          return await handler({ req, url, params })
        } catch (e) {
          return error(500, e instanceof Error ? e.message : 'internal error')
        }
      }
      return error(404, `no route ${req.method} ${url.pathname}`)
    }
  }
}
