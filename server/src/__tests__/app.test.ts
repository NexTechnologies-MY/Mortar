/**
 * Route tests against an in-memory `Database` and a fake `JevService`. The
 * lane-W1/W3 core functions are still stubs that throw "not built", so this
 * file mocks `@mortar/core` with fakes for the same signatures; when the real
 * implementations land the routes exercise them unchanged.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { SQL } from 'bun'
import * as realCore from '../../../packages/core/src/index'

/** What the mocked `simNow` answers; a test that moves it is put back afterwards. */
const NOON = '2026-09-18T12:00:00+08:00'
const clock = { now: NOON }
afterEach(() => {
  clock.now = NOON
})

const SUMMARY: realCore.CaseSummary = {
  bookingId: 'BK-9001',
  stage: 'loan_applied',
  spaSigned: false,
  unknown: false,
  bookingAgeDays: 16,
  daysSinceEvidence: 6,
  daysSinceLoIssued: null,
  daysSinceSpaSet: null,
  applications: [{ id: 'APP-9001-1', bank: 'Apex Bank', status: 'documents_pending' }],
  outstandingDocuments: ['payslip'],
  buyerWithdrew: false,
  risk: {
    level: 'medium',
    loanRm: 495000,
    instalmentRm: 2300,
    debtServiceRatio: 0.3,
    marginOfFinancing: 0.9,
    reasons: ['Income Document Outstanding']
  },
  stallReasons: ['Payslip Outstanding 5+ Days'],
  openTasks: 1
}

/**
 * Off, every booking reads as `SUMMARY`. The case-rule tests turn it on, so the
 * route derives the case from the fake's own rows as the server does.
 */
let deriveCases = false
// Held before `mock.module`, which rewrites the namespace's bindings in place.
const deriveSummaries = realCore.summarizeCases

mock.module('@mortar/core', () => ({
  ...realCore,
  simNow: () => clock.now,
  summarizeCases: (data: realCore.CaseData, asOf: string) => (deriveCases ? deriveSummaries(data, asOf) : [SUMMARY]),
  searchPlaybooks: (playbooks: realCore.Playbook[]) =>
    playbooks.map((playbook, i) => ({ playbook, keywordScore: 10 - i })),
  proposalFromExtraction: (extraction: realCore.Extraction, message: realCore.Message) =>
    extraction.event.value === 'no_update'
      ? null
      : {
          bookingId: message.bookingId,
          applicationId: 'APP-9001-1',
          track: 'loan',
          kind: 'documents_received',
          occurredAt: message.sentAt,
          reportedBy: 'Jev',
          verifiedBy: null,
          status: 'provisional',
          source: 'jev',
          messageId: message.id,
          document: 'payslip',
          note: '94% Probability'
        }
}))

import { createApp, type App } from '../app'
import {
  BookingMovedOnError,
  EventSettledError,
  ImportMovedOnError,
  OpenApplicationError,
  UnitHeldError,
  type Database,
  type ImportBatch
} from '../../db/index'
import type { JevAnswerRow, StoredMeta } from '../../db/mappers'
import type {
  Booking,
  BookingDraft,
  CaseData,
  CaseEvent,
  EvidenceStatus,
  JevService,
  LoanApplication,
  Message,
  SimulationMeta,
  Snapshot,
  Task
} from '@mortar/core'

const BOOKING: Booking = {
  id: 'BK-9001',
  project: 'Aster Heights',
  unit: 'A-12-03',
  priceRm: 550000,
  bookingDate: '2026-09-02',
  buyer: {
    name: 'Raymond Tan Wei Hong',
    ic: '000000-00-9001',
    phone: '+60 00-000 9001',
    age: 31,
    grossMonthlyIncomeRm: 9500,
    monthlyCommitmentsRm: 600,
    propertiesOwned: 0
  },
  salesOwner: 'Nurul Aina',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Khor & Associates'
}

const FIXTURE_MESSAGE: Message = {
  id: 'MSG-9001-9',
  bookingId: 'BK-9001',
  senderRole: 'buyer',
  senderName: 'Raymond Tan Wei Hong',
  language: 'mixed',
  sentAt: '2026-09-17T21:05:00+08:00',
  body: 'Salam, payslip hantar esok boleh?',
  origin: 'fixture'
}

const PROVISIONAL: CaseEvent = {
  id: 'EV-9001-9',
  bookingId: 'BK-9001',
  applicationId: 'APP-9001-1',
  track: 'loan',
  kind: 'documents_requested',
  occurredAt: '2026-09-12T11:00:00+08:00',
  recordedAt: '2026-09-12T11:05:00+08:00',
  reportedBy: 'Jev',
  verifiedBy: null,
  status: 'provisional',
  source: 'jev',
  messageId: 'MSG-9001-9',
  document: 'payslip',
  note: '88% Probability'
}

const APPLICATION: LoanApplication = { id: 'APP-9001-1', bookingId: 'BK-9001', bank: 'Apex Bank', banker: 'Kelvin Teo' }

/** A second booking with a bank application of its own; tests add it to prove ids are checked against the case. */
const OTHER_BOOKING: Booking = { ...BOOKING, id: 'BK-9002', unit: 'B-08-05', bookingDate: '2026-09-01' }
const OTHER_APPLICATION: LoanApplication = {
  id: 'APP-9002-1',
  bookingId: 'BK-9002',
  bank: 'Crestline Bank',
  banker: 'Aida Rahman'
}

class FakeDb implements Database {
  projectSettings: realCore.ProjectSettings | null = null
  bookings = [BOOKING]
  applications: LoanApplication[] = [APPLICATION]
  messages = [FIXTURE_MESSAGE]
  events: CaseEvent[] = []
  tasks: Task[] = []
  playbooks: realCore.Playbook[] = []
  resetAt: string | null = null
  resetAtWall: string | null = null
  /** Mirrors the `seq` column: every stored event is numbered in insertion order. */
  private seq = 0
  private stored = (event: CaseEvent): CaseEvent => ({ ...event, seq: ++this.seq })

  async ping() {}
  async hasBookings() {
    return this.bookings.length > 0
  }
  async meta(): Promise<StoredMeta | null> {
    return { seed: 20260918, referenceDate: '2026-09-18', resetAt: this.resetAt, resetAtWall: this.resetAtWall }
  }
  async getProjectSettings() {
    return this.projectSettings
  }
  async setProjectSettings(settings: realCore.ProjectSettings) {
    this.projectSettings = settings
  }
  async sessionSecret() {
    return 'test-session-secret'
  }
  async caseData(): Promise<CaseData> {
    return { bookings: this.bookings, applications: this.applications, events: this.events, tasks: this.tasks }
  }
  async snapshot(): Promise<Snapshot> {
    return {
      meta: (await this.meta())!,
      bookings: this.bookings,
      applications: this.applications,
      events: this.events,
      tasks: this.tasks,
      messages: this.messages,
      playbooks: this.playbooks,
      extractions: [],
      signals: [],
      nextActions: []
    }
  }
  async getBooking(id: string) {
    return this.bookings.find((b) => b.id === id) ?? null
  }
  async getApplication(id: string) {
    return this.applications.find((a) => a.id === id) ?? null
  }
  async getMessage(id: string) {
    return this.messages.find((m) => m.id === id) ?? null
  }
  async getEvent(id: string) {
    return this.events.find((e) => e.id === id) ?? null
  }
  async messagesForBooking(bookingId: string) {
    return this.messages.filter((m) => m.bookingId === bookingId)
  }
  async eventsForMessage(messageId: string) {
    return this.events.filter((e) => e.messageId === messageId)
  }
  async eventsForBooking(bookingId: string) {
    return this.events.filter((e) => e.bookingId === bookingId).sort(realCore.byOccurred)
  }
  async listPlaybooks() {
    return this.playbooks
  }
  async insertMessage(message: Message) {
    this.messages.push(message)
  }
  async insertEvent(event: CaseEvent) {
    this.events.push(this.stored(event))
  }
  /**
   * Mirrors the SQL transaction: both rows land, or neither does, and never
   * beside an application the same bank has not decided.
   */
  async insertApplication(application: LoanApplication, submitted: CaseEvent) {
    if (this.events.some((e) => e.id === submitted.id)) throw new Error(`duplicate event ${submitted.id}`)
    const confirmed = this.events.filter((e) => e.status === 'confirmed')
    const withdrew = confirmed.some((e) => e.bookingId === application.bookingId && e.kind === 'buyer_withdrew')
    const bankKey = (bank: string) => bank.trim().toLowerCase()
    const open = this.applications.find(
      (a) =>
        a.bookingId === application.bookingId &&
        bankKey(a.bank) === bankKey(application.bank) &&
        !withdrew &&
        !confirmed.some((e) => e.applicationId === a.id && (e.kind === 'loan_approved' || e.kind === 'loan_rejected'))
    )
    if (open) throw new OpenApplicationError(open.bank, open.id)
    this.applications.push(application)
    this.events.push(this.stored(submitted))
  }
  reviews: { eventId: string; fromStatus: EvidenceStatus; toStatus: EvidenceStatus; reviewer: string; at: string }[] =
    []
  /** Mirrors the SQL: only a Jev proposal still waiting changes, and each change is kept. */
  async reviewEvent(id: string, status: EvidenceStatus, reviewer: string, at: string) {
    const event = this.events.find((e) => e.id === id)
    if (!event) return null
    const pending = event.source === 'jev' && (event.status === 'provisional' || event.status === 'disputed')
    if (!pending || event.status === status) throw new EventSettledError(event)
    const reviewed = { ...event, status, verifiedBy: reviewer }
    this.events = this.events.map((e) => (e.id === id ? reviewed : e))
    this.reviews.push({ eventId: id, fromStatus: event.status, toStatus: status, reviewer, at })
    return reviewed
  }
  /** Mirrors the SQL transaction: no await between the supersede and the insert. */
  async replaceProposal(messageId: string, proposal: CaseEvent | null) {
    this.events = this.events.map((e) =>
      e.messageId === messageId && (e.status === 'provisional' || e.status === 'disputed')
        ? { ...e, status: 'superseded' as const }
        : e
    )
    if (!proposal || this.events.some((e) => e.messageId === messageId && e.status === 'confirmed')) return null
    this.events.push(proposal)
    return proposal
  }
  async insertTask(task: Task) {
    this.tasks.push(task)
  }
  async flagManagerTask(task: Task) {
    const existing = this.tasks.find(
      (candidate) =>
        candidate.status === 'open' &&
        candidate.bookingId === task.bookingId &&
        candidate.action === task.action &&
        candidate.ownerRole === task.ownerRole &&
        candidate.ownerName === task.ownerName &&
        candidate.managerFlaggedBy
    )
    if (existing) return existing
    this.tasks.push(task)
    return task
  }
  imports = new Map<string, { ids: string[]; undoneBy: string | null; undoneAt: string | null }>()
  removals: { id: string; removedBy: string; removedAt: string }[] = []
  /** Mirrors the SQL: an open booking (no confirmed cancelled or lapsed) holds its unit. */
  async importBookings(batch: ImportBatch, drafts: BookingDraft[], bookedEvent: (booking: Booking) => CaseEvent) {
    const closed = new Set(
      this.events
        .filter((e) => e.status === 'confirmed' && (e.kind === 'cancelled' || e.kind === 'lapsed'))
        .map((e) => e.bookingId)
    )
    for (const draft of drafts) {
      const key = realCore.unitKey(draft.project, draft.unit)
      const holder = this.bookings.find((b) => !closed.has(b.id) && realCore.unitKey(b.project, b.unit) === key)
      if (holder) throw new UnitHeldError(draft.unit, holder.id)
    }
    const imported = drafts.map((draft, i) => ({ id: `BK-${String(141 + i).padStart(4, '0')}`, ...draft }))
    this.bookings.push(...imported)
    this.events.push(...imported.map(bookedEvent).map(this.stored))
    this.imports.set(batch.id, { ids: imported.map((b) => b.id), undoneBy: null, undoneAt: null })
    return imported
  }
  async undoImport(id: string, undoneBy: string, undoneAt: string) {
    const record = this.imports.get(id)
    if (!record || record.undoneAt) return null
    const ids = record.ids
    const moved = ids.filter(
      (bookingId) =>
        this.events.filter((e) => e.bookingId === bookingId).length > 1 ||
        this.events.some((e) => e.bookingId === bookingId && e.kind !== 'booked') ||
        this.tasks.some((t) => t.bookingId === bookingId) ||
        this.messages.some((m) => m.bookingId === bookingId)
    )
    if (moved.length > 0) throw new ImportMovedOnError(moved)
    this.bookings = this.bookings.filter((b) => !ids.includes(b.id))
    this.events = this.events.filter((e) => !ids.includes(e.bookingId))
    this.imports.set(id, { ...record, undoneBy, undoneAt })
    return { removed: ids }
  }
  async canUndoImport(id: string, profile: realCore.StaffProfile) {
    const row = this.imports.get(id)
    return Boolean(
      row &&
      row.ids.length > 0 &&
      row.ids.every((bookingId) => {
        const booking = this.bookings.find((candidate) => candidate.id === bookingId)
        return booking && realCore.canAccessBooking(booking, profile)
      })
    )
  }
  async deleteBooking(id: string, removedBy: string, removedAt: string) {
    const booking = this.bookings.find((b) => b.id === id)
    if (!booking) return false
    if (
      this.events.filter((e) => e.bookingId === id).length > 1 ||
      this.events.some((e) => e.bookingId === id && e.kind !== 'booked') ||
      this.tasks.some((t) => t.bookingId === id) ||
      this.messages.some((m) => m.bookingId === id) ||
      this.applications.some((a) => a.bookingId === id)
    )
      throw new BookingMovedOnError(id)
    this.removals.push({ id, removedBy, removedAt })
    this.bookings = this.bookings.filter((b) => b.id !== id)
    this.events = this.events.filter((e) => e.bookingId !== id)
    return true
  }
  async updateTaskStatus(id: string, status: Task['status'], completedAt: string | null) {
    const task = this.tasks.find((t) => t.id === id)
    return task ? { ...task, status, completedAt } : null
  }
  async latestJevAnswers(): Promise<JevAnswerRow[]> {
    return []
  }
  jevAnswers = 0
  async jevAnswerCount() {
    return this.jevAnswers
  }
  async jevGet() {
    return null
  }
  async jevPut() {}
}

const fakeJev = (overrides: Partial<JevService> = {}): JevService => ({
  extract: async ({ message }) => ({
    messageId: message.id,
    event: { value: 'documents_received', probabilities: { documents_received: 0.94 }, confidence: 0.9 },
    document: { value: 'payslip', probabilities: { payslip: 0.97 }, confidence: 0.95 },
    owner: { value: 'loan_admin', probabilities: { loan_admin: 0.8 }, confidence: 0.8 },
    withdrawalRisk: 0.1,
    needsAction: 0.9,
    meta: { source: 'live', stale: false, latencyMs: 420 }
  }),
  nextAction: async ({ summary }) => ({
    bookingId: summary.bookingId,
    action: { value: 'request_document', probabilities: {}, confidence: 0.9 },
    owner: { value: 'loan_admin', probabilities: {}, confidence: 0.8 },
    urgency: { score: 2, confidence: 0.7 },
    meta: { source: 'live', stale: false, latencyMs: 300 }
  }),
  rankPlaybooks: async ({ summary, query, candidates }) => ({
    bookingId: summary.bookingId,
    query,
    results: candidates.map((c) => ({
      playbookId: c.playbook.id,
      keywordScore: c.keywordScore,
      fit: { score: 2, confidence: 0.9 }
    })),
    meta: { source: 'cache', stale: false, latencyMs: 500 }
  }),
  signals: async ({ bookingId }) => ({
    bookingId,
    responsiveness: { score: 2, confidence: 0.8 },
    hesitation: { score: 0, confidence: 0.7 },
    meta: { source: 'cache', stale: false, latencyMs: 200 }
  }),
  ...overrides
})

const makeApp = (db = new FakeDb(), jev = fakeJev(), addDemoData?: () => Promise<SimulationMeta>): App =>
  createApp({
    db,
    jev,
    addDemoData:
      addDemoData ??
      (async () => ({ seed: 20260918, referenceDate: '2026-09-18', resetAt: '2026-09-18T12:00:00+08:00' })),
    deleteDemoData: async () => {},
    jevAvailable: false
  })

const sessions = new WeakMap<App, string>()
const call = async (app: App, path: string, init?: RequestInit, profileId = 'sales-nurul-aina') => {
  let cookie = sessions.get(app)
  if (!cookie) {
    const selected = await app.fetch(
      new Request('http://test/api/session', { method: 'POST', body: JSON.stringify({ profileId }) })
    )
    cookie = selected?.headers.get('set-cookie')?.split(';')[0] ?? ''
    sessions.set(app, cookie)
  }
  const headers = new Headers(init?.headers)
  headers.set('cookie', cookie)
  return app.fetch(new Request(`http://test${path}`, { ...init, headers }))
}
const post = (body?: unknown) => ({ method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

describe('DELETE /api/bookings/:id', () => {
  test('removes an untouched booking and records the actor and removal time', async () => {
    const db = new FakeDb()
    db.applications = []
    db.messages = []
    const res = await call(makeApp(db), '/api/bookings/BK-9001', {
      method: 'DELETE',
      body: JSON.stringify({ reportedBy: 'Loan Admin' })
    })
    expect(res?.status).toBe(200)
    expect(await res?.json()).toEqual({ removed: 'BK-9001' })
    expect(db.bookings).toHaveLength(0)
    expect(db.removals).toEqual([{ id: 'BK-9001', removedBy: 'Nurul Aina', removedAt: NOON }])
  })

  test('refuses a booking with progression data and leaves it present', async () => {
    const db = new FakeDb()
    const res = await call(makeApp(db), '/api/bookings/BK-9001', {
      method: 'DELETE',
      body: JSON.stringify({ reportedBy: 'Loan Admin' })
    })
    expect(res?.status).toBe(409)
    expect(await res?.json()).toMatchObject({ error: expect.stringContaining('must be retained') })
    expect(db.bookings).toHaveLength(1)
    expect(db.removals).toHaveLength(0)
  })
})
const errorOf = async (res: Response | null) => ((await res?.json()) as { error?: string } | undefined)?.error

/** A confirmed staff update on BK-9001, for the case-rule tests to build a case from. */
const staffEvent = (id: string, kind: CaseEvent['kind'], applicationId: string | null = null): CaseEvent => ({
  id,
  bookingId: 'BK-9001',
  applicationId,
  track: kind === 'cancelled' || kind === 'lapsed' ? 'sales' : 'loan',
  kind,
  occurredAt: '2026-09-10T12:00:00+08:00',
  recordedAt: '2026-09-10T12:00:00+08:00',
  reportedBy: 'Tan Mei Ling',
  verifiedBy: 'Tan Mei Ling',
  status: 'confirmed',
  source: 'staff',
  messageId: null,
  document: null,
  note: null
})

/** Case-rule tests derive the case from the fake's rows; see `deriveCases`. */
const derivingCases = () => {
  beforeEach(() => {
    deriveCases = true
  })
  afterEach(() => {
    deriveCases = false
  })
}

describe('createApp', () => {
  test('non-api paths return null so static can handle them', async () => {
    expect(await call(makeApp(), '/bookings')).toBeNull()
    expect(await call(makeApp(), '/')).toBeNull()
  })

  test('GET /api/health reports db, jev and assistant flags plus the stored answer count', async () => {
    const db = new FakeDb()
    db.jevAnswers = 87
    const res = await call(makeApp(db), '/api/health')
    expect(res?.status).toBe(200)
    expect(await res?.json()).toEqual({
      ok: true,
      db: true,
      jev: false,
      assistant: false,
      jevAnswers: 87,
      jevLastError: null
    })
  })

  test('GET /api/health stays public for deployment probes', async () => {
    const response = await makeApp().fetch(new Request('http://test/api/health'))
    expect(response?.status).toBe(200)
  })

  test('GET /api/health reports ok: false, from a dead database, not a hardcoded true', async () => {
    const db = new FakeDb()
    db.jevAnswers = 87
    db.ping = async () => {
      throw new Error('down')
    }
    const res = await call(makeApp(db), '/api/health')
    expect(await res?.json()).toEqual({
      ok: false,
      db: false,
      jev: false,
      assistant: false,
      jevAnswers: null,
      jevLastError: null
    })
  })

  test('GET /api/health reports the assistant as configured from a Gemini key, never the key itself', async () => {
    const app = createApp({
      db: new FakeDb(),
      jev: fakeJev(),
      reset: async () => ({ seed: 1, referenceDate: '2026-09-18', resetAt: '2026-09-18T12:00:00+08:00' }),
      assistant: { apiKey: 'gemini-secret-key' }
    })
    const res = await call(app, '/api/health')
    const body = await res?.text()
    expect(JSON.parse(body!)).toMatchObject({ assistant: true })
    expect(body).not.toContain('gemini-secret-key')
  })

  test('GET /api/health reports jevLastError from the wiring, when given one', async () => {
    const app = createApp({
      db: new FakeDb(),
      jev: fakeJev(),
      reset: async () => ({ seed: 1, referenceDate: '2026-09-18', resetAt: '2026-09-18T12:00:00+08:00' }),
      jevAvailable: true,
      jevLastError: () => 'jev proxy request failed: 503 Service Unavailable'
    })
    const res = await call(app, '/api/health')
    expect(await res?.json()).toMatchObject({ jevLastError: 'jev proxy request failed: 503 Service Unavailable' })
  })

  test('GET /api/snapshot returns the snapshot', async () => {
    const res = await call(makeApp(), '/api/snapshot')
    expect(res?.status).toBe(200)
    const snapshot = (await res?.json()) as Snapshot
    expect(snapshot.bookings[0].id).toBe('BK-9001')
  })

  test('requires a session, scopes sales by owner, and rejects a profile header that disagrees with the cookie', async () => {
    const db = new FakeDb()
    db.bookings.push({ ...OTHER_BOOKING, salesOwner: 'Farah Izzati' })
    const app = makeApp(db)
    const anonymous = await app.fetch(new Request('http://test/api/snapshot'))
    expect(anonymous?.status).toBe(401)
    const scoped = await call(app, '/api/snapshot')
    expect(((await scoped?.json()) as Snapshot).bookings.map((booking) => booking.id)).toEqual(['BK-9001'])
    const cookie = sessions.get(app)!
    const mismatch = await app.fetch(
      new Request('http://test/api/snapshot', { headers: { cookie, 'x-mortar-profile': 'manager' } })
    )
    expect(mismatch?.status).toBe(409)
  })

  test('allows only the manager profile to persist shared project settings', async () => {
    const db = new FakeDb()
    const app = makeApp(db)
    const payload = { settings: realCore.DEFAULT_PROJECT_SETTINGS }
    expect((await call(app, '/api/settings', { ...post(payload), method: 'PUT' }))?.status).toBe(403)
    const managerApp = makeApp(db)
    const saved = await call(managerApp, '/api/settings', { ...post(payload), method: 'PUT' }, 'manager')
    expect(saved?.status).toBe(200)
    expect(db.projectSettings?.projectName).toBe('Bukit Damai')
  })

  test('unknown /api route is a json 404', async () => {
    const res = await call(makeApp(), '/api/nope')
    expect(res?.status).toBe(404)
    expect(await errorOf(res)).toMatch('no route')
  })

  describe('the catch-all error handler', () => {
    test('a plain thrown error becomes a generic 500, never the raw message', async () => {
      const db = new FakeDb()
      db.getBooking = async () => {
        throw new Error('relation "bookings" column secret_internal_field leaked here')
      }
      const res = await call(makeApp(db), '/api/bookings/BK-9001/next-action', post())
      expect(res?.status).toBe(500)
      const message = await errorOf(res)
      expect(message).not.toContain('secret_internal_field')
      expect(message).toBeTruthy()
    })

    test('a Postgres SQLSTATE class 22 (data exception) becomes a 400', async () => {
      const db = new FakeDb()
      db.getBooking = async () => {
        throw new SQL.PostgresError('invalid input syntax for type date: "0000-01-01"', { code: '22007' })
      }
      const res = await call(makeApp(db), '/api/bookings/BK-9001/next-action', post())
      expect(res?.status).toBe(400)
    })

    test('a Postgres SQLSTATE class 23 (integrity constraint violation, e.g. a foreign key) becomes a 409', async () => {
      const db = new FakeDb()
      db.getBooking = async () => {
        throw new SQL.PostgresError('insert or update on table "events" violates foreign key constraint', {
          code: '23503'
        })
      }
      const res = await call(makeApp(db), '/api/bookings/BK-9001/next-action', post())
      expect(res?.status).toBe(409)
    })
  })

  describe('POST /api/messages', () => {
    const valid = { bookingId: 'BK-9001', senderRole: 'buyer', senderName: 'Raymond', body: 'Payslip sent' }

    test('stores the message, extracts, and stages the proposal event', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/messages', post(valid))
      expect(res?.status).toBe(200)
      const body = (await res?.json()) as {
        message: Message
        extraction: { meta: { source: string } }
        event: CaseEvent
      }
      expect(body.message.origin).toBe('live')
      expect(body.message.language).toBe('en')
      expect(body.extraction.meta.source).toBe('live')
      expect(body.event.status).toBe('provisional')
      expect(body.event.source).toBe('jev')
      expect(body.event.messageId).toBe(body.message.id)
      expect(db.messages[db.messages.length - 1]?.id).toBe(body.message.id)
      expect(db.events).toHaveLength(1)
    })

    test('malay bodies are tagged ms', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/messages', post({ ...valid, body: 'Salam saya dah hantar slip gaji' }))
      expect(((await res?.json()) as { message: Message }).message.language).toBe('ms')
    })

    test.each([
      [{}, 'bookingId'],
      [{ bookingId: 'BK-9001' }, 'senderRole'],
      [{ ...valid, senderRole: 'robot' }, 'senderRole'],
      [{ ...valid, senderName: '' }, 'senderName'],
      [{ ...valid, body: '' }, 'body'],
      [{ ...valid, senderName: 'a\u0000b' }, 'senderName']
    ])('validation rejects %o mentioning %s', async (input, field) => {
      const res = await call(makeApp(), '/api/messages', post(input))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(field)
    })

    test('senderName over 300 characters is refused', async () => {
      const res = await call(makeApp(), '/api/messages', post({ ...valid, senderName: 'x'.repeat(301) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('senderName')
    })

    test('body over 5,000 characters is refused', async () => {
      const res = await call(makeApp(), '/api/messages', post({ ...valid, body: 'x'.repeat(5001) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('body')
    })

    test('unknown booking is a 404', async () => {
      const res = await call(makeApp(), '/api/messages', post({ ...valid, bookingId: 'BK-0000' }))
      expect(res?.status).toBe(404)
    })

    describe('on a closed booking', () => {
      derivingCases()

      test('keeps the message but proposes no update', async () => {
        const db = new FakeDb()
        db.events.push(staffEvent('EV-CANCEL', 'cancelled'))
        const res = await call(makeApp(db), '/api/messages', post(valid))
        expect(res?.status).toBe(200)
        const body = (await res?.json()) as { message: Message; event: CaseEvent | null }
        expect(body.event).toBeNull()
        expect(db.messages.some((m) => m.id === body.message.id)).toBe(true)
        expect(db.events).toHaveLength(1)
      })
    })

    describe('sentAt', () => {
      const send = async (sentAt: unknown, db = new FakeDb()) => {
        const res = await call(makeApp(db), '/api/messages', post({ ...valid, sentAt }))
        return { res, db }
      }

      test('without one the message is stamped now', async () => {
        const res = await call(makeApp(), '/api/messages', post(valid))
        expect(((await res?.json()) as { message: Message }).message.sentAt).toBe('2026-09-18T12:00:00+08:00')
      })

      test('stores the time the message was sent, and Jev dates its proposal from it', async () => {
        const { res, db } = await send('2026-09-16T15:30:00+08:00')
        expect(res?.status).toBe(200)
        const body = (await res?.json()) as { message: Message; event: CaseEvent }
        expect(body.message.sentAt).toBe('2026-09-16T15:30:00+08:00')
        expect(db.messages[db.messages.length - 1]?.sentAt).toBe('2026-09-16T15:30:00+08:00')
        expect(body.event.occurredAt).toBe('2026-09-16T15:30:00+08:00')
      })

      test('stores another offset in Malaysia time', async () => {
        const { res } = await send('2026-09-16T07:30:00Z')
        expect(((await res?.json()) as { message: Message }).message.sentAt).toBe('2026-09-16T15:30:00+08:00')
      })

      test('accepts the booking day itself and the minute just past', async () => {
        expect((await send('2026-09-02T00:00:00+08:00')).res?.status).toBe(200)
        expect((await send('2026-09-18T11:59:00+08:00')).res?.status).toBe(200)
      })

      test('clamps a browser clock a few seconds ahead to now', async () => {
        const { res } = await send('2026-09-18T12:00:30+08:00')
        expect(res?.status).toBe(200)
        expect(((await res?.json()) as { message: Message }).message.sentAt).toBe('2026-09-18T12:00:00+08:00')
      })

      test('takes a time stamped just before midnight and posted just after as the time it was sent', async () => {
        // `simNow` keeps the reference date, so after midnight it reads 00:00:40.
        clock.now = '2026-09-18T00:00:40+08:00'
        const { res, db } = await send('2026-09-18T23:59:30+08:00')
        expect(res?.status).toBe(200)
        expect(((await res?.json()) as { message: Message }).message.sentAt).toBe('2026-09-18T23:59:30+08:00')
        expect(db.messages[db.messages.length - 1]?.sentAt).toBe('2026-09-18T23:59:30+08:00')
      })

      test('still refuses a later time today that is not just before midnight', async () => {
        clock.now = '2026-09-18T00:00:40+08:00'
        const { res } = await send('2026-09-18T23:40:00+08:00')
        expect(res?.status).toBe(400)
        expect(await errorOf(res)).toContain('future')
      })

      test.each([
        ['a later time today', '2026-09-18T12:05:00+08:00', 'future'],
        ['tomorrow', '2026-09-19T09:00:00+08:00', 'future'],
        ['tomorrow, a few minutes short of a day ahead', '2026-09-19T11:55:00+08:00', 'future'],
        ['before the booking date', '2026-09-01T23:59:00+08:00', 'booking date'],
        ['a date with no time', '2026-09-17', 'sentAt'],
        ['a time with no offset', '2026-09-17T10:00:00', 'sentAt'],
        ['an impossible day', '2026-02-30T10:00:00+08:00', 'sentAt'],
        ['a word', 'yesterday', 'sentAt'],
        ['a number', 1726560000000, 'sentAt']
      ])('refuses %s', async (_label, sentAt, message) => {
        const { res, db } = await send(sentAt)
        expect(res?.status).toBe(400)
        expect(await errorOf(res)).toContain(message)
        expect(db.messages).toHaveLength(1)
      })
    })
  })

  describe('POST /api/messages/:id/extract', () => {
    test('re-extracts and supersedes the old proposal', async () => {
      const db = new FakeDb()
      db.events.push({ ...PROVISIONAL })
      const res = await call(makeApp(db), '/api/messages/MSG-9001-9/extract', post())
      expect(res?.status).toBe(200)
      const body = (await res?.json()) as { event: CaseEvent }
      expect(db.events.find((e) => e.id === 'EV-9001-9')?.status).toBe('superseded')
      expect(body.event.status).toBe('provisional')
      expect(body.event.messageId).toBe('MSG-9001-9')
    })

    test('leaves a confirmed event alone and returns null', async () => {
      const db = new FakeDb()
      db.events.push({ ...PROVISIONAL, status: 'confirmed', verifiedBy: 'Nurul Aina' })
      const res = await call(makeApp(db), '/api/messages/MSG-9001-9/extract', post())
      const body = (await res?.json()) as { event: CaseEvent | null }
      expect(body.event).toBeNull()
      expect(db.events[0].status).toBe('confirmed')
    })

    test('unknown message is a 404', async () => {
      const res = await call(makeApp(), '/api/messages/MSG-0000/extract', post())
      expect(res?.status).toBe(404)
    })

    test('two re-reads at once leave one proposal standing', async () => {
      const db = new FakeDb()
      db.events.push({ ...PROVISIONAL })
      const app = makeApp(db)
      const results = await Promise.all([
        call(app, '/api/messages/MSG-9001-9/extract', post()),
        call(app, '/api/messages/MSG-9001-9/extract', post())
      ])
      expect(results.map((r) => r?.status)).toEqual([200, 200])
      const standing = db.events.filter((e) => e.messageId === 'MSG-9001-9' && e.status === 'provisional')
      expect(standing).toHaveLength(1)
    })

    describe('on a closed booking', () => {
      derivingCases()

      test('withdraws the waiting proposal and proposes nothing new', async () => {
        const db = new FakeDb()
        db.events.push(staffEvent('EV-LAPSE', 'lapsed'), { ...PROVISIONAL })
        const res = await call(makeApp(db), '/api/messages/MSG-9001-9/extract', post())
        expect(res?.status).toBe(200)
        expect(((await res?.json()) as { event: CaseEvent | null }).event).toBeNull()
        expect(db.events.find((e) => e.id === 'EV-9001-9')?.status).toBe('superseded')
        expect(db.events).toHaveLength(2)
      })
    })
  })

  describe('POST /api/events', () => {
    const valid = { bookingId: 'BK-9001', track: 'loan', kind: 'buyer_contacted', reportedBy: 'Nurul Aina' }

    test('inserts a confirmed staff event verified by the reporter', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/events', post(valid))
      expect(res?.status).toBe(200)
      const event = (await res?.json()) as CaseEvent
      expect(event.status).toBe('confirmed')
      expect(event.source).toBe('staff')
      expect(event.verifiedBy).toBe('Nurul Aina')
      expect(event.occurredAt).toBe('2026-09-18T12:00:00+08:00')
      expect(db.events).toHaveLength(1)
    })

    test('rejects a bad kind', async () => {
      const res = await call(makeApp(), '/api/events', post({ ...valid, kind: 'exploded' }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('kind')
    })

    test('rejects a bad document', async () => {
      const res = await call(makeApp(), '/api/events', post({ ...valid, document: 'passport' }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('document')
    })

    test('unknown booking is a 404', async () => {
      const res = await call(makeApp(), '/api/events', post({ ...valid, bookingId: 'BK-0000' }))
      expect(res?.status).toBe(404)
    })

    test('note over 300 characters is refused', async () => {
      const res = await call(makeApp(), '/api/events', post({ ...valid, note: 'x'.repeat(301) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('note')
    })

    test('reportedBy over 300 characters is refused', async () => {
      const res = await call(makeApp(), '/api/events', post({ ...valid, reportedBy: 'x'.repeat(301) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('reportedBy')
    })

    test('records a bank decision against its application, on the day it happened', async () => {
      const db = new FakeDb()
      const res = await call(
        makeApp(db),
        '/api/events',
        post({
          ...valid,
          kind: 'loan_approved',
          applicationId: 'APP-9001-1',
          occurredOn: '2026-09-16',
          note: 'LO received'
        })
      )
      expect(res?.status).toBe(200)
      const event = (await res?.json()) as CaseEvent
      expect(event).toMatchObject({
        bookingId: 'BK-9001',
        applicationId: 'APP-9001-1',
        kind: 'loan_approved',
        occurredAt: '2026-09-16T12:00:00+08:00',
        recordedAt: '2026-09-18T12:00:00+08:00',
        status: 'confirmed',
        source: 'staff',
        note: 'LO received'
      })
      expect(db.events).toEqual([{ ...event, seq: 1 }])
    })

    test('accepts the booking day and today as the day it happened', async () => {
      for (const occurredOn of ['2026-09-02', '2026-09-18']) {
        const res = await call(makeApp(), '/api/events', post({ ...valid, occurredOn }))
        expect(res?.status).toBe(200)
        expect(((await res?.json()) as CaseEvent).occurredAt).toBe(`${occurredOn}T12:00:00+08:00`)
      }
    })

    describe('the order of updates on one day', () => {
      const today = { ...valid, applicationId: 'APP-9001-1', occurredOn: '2026-09-18' }
      const seeded = (occurredAt: string): CaseEvent => ({
        ...PROVISIONAL,
        id: 'EV-000039',
        kind: 'documents_requested',
        occurredAt,
        recordedAt: '2026-09-18T09:00:00+08:00',
        reportedBy: 'Sim',
        verifiedBy: 'Sim',
        status: 'confirmed',
        source: 'generator',
        messageId: null,
        seq: 1
      })
      const order = (db: FakeDb) => [...db.events].sort(realCore.byOccurred).map((e) => `${e.kind} ${e.document}`)

      test('two updates at the same moment keep the order they were entered in, whatever their ids', async () => {
        // The ids are random uuids; before `seq`, the later entry came first about half the time.
        for (let i = 0; i < 40; i++) {
          const db = new FakeDb()
          const app = makeApp(db)
          for (const occurredOn of ['2026-09-16', '2026-09-18']) {
            await call(
              app,
              '/api/events',
              post({ ...today, occurredOn, kind: 'documents_requested', document: 'payslip' })
            )
            await call(
              app,
              '/api/events',
              post({ ...today, occurredOn, kind: 'documents_received', document: 'payslip' })
            )
          }
          expect(new Set(db.events.map((e) => e.occurredAt)).size).toBe(2)
          expect(order(db)).toEqual([
            'documents_requested payslip',
            'documents_received payslip',
            'documents_requested payslip',
            'documents_received payslip'
          ])
        }
      })

      test('one dated today lands at now, among the messages of the day', async () => {
        clock.now = '2026-09-18T15:30:00+08:00'
        const db = new FakeDb()
        const res = await call(makeApp(db), '/api/events', post({ ...today, kind: 'buyer_contacted' }))
        expect(((await res?.json()) as CaseEvent).occurredAt).toBe('2026-09-18T15:30:00+08:00')
      })

      test('never lands before an update the booking already has on record that day', async () => {
        clock.now = '2026-09-18T10:00:00+08:00'
        const db = new FakeDb()
        // A seeded request timed later today than the clock reads now.
        db.events.push(seeded('2026-09-18T17:58:00+08:00'))
        const res = await call(
          makeApp(db),
          '/api/events',
          post({ ...today, kind: 'documents_received', document: 'payslip' })
        )
        expect(((await res?.json()) as CaseEvent).occurredAt).toBe('2026-09-18T17:58:00+08:00')
        expect(order(db)).toEqual(['documents_requested payslip', 'documents_received payslip'])
      })

      test('a back-dated one lands at noon, or after a later update on record that day', async () => {
        const db = new FakeDb()
        db.events.push(seeded('2026-09-16T17:00:00+08:00'))
        const app = makeApp(db)
        const on16 = await call(
          app,
          '/api/events',
          post({ ...today, occurredOn: '2026-09-16', kind: 'documents_received', document: 'payslip' })
        )
        expect(((await on16?.json()) as CaseEvent).occurredAt).toBe('2026-09-16T17:00:00+08:00')
        const on15 = await call(
          app,
          '/api/events',
          post({ ...today, occurredOn: '2026-09-15', kind: 'buyer_contacted' })
        )
        expect(((await on15?.json()) as CaseEvent).occurredAt).toBe('2026-09-15T12:00:00+08:00')
      })

      test('updates either side of midnight keep the order they were entered in', async () => {
        const db = new FakeDb()
        const app = makeApp(db)
        clock.now = '2026-09-18T23:59:50+08:00'
        await call(app, '/api/events', post({ ...today, kind: 'documents_requested', document: 'payslip' }))
        // `simNow` keeps the reference date, so twenty seconds later it reads 00:00:10.
        clock.now = '2026-09-18T00:00:10+08:00'
        const res = await call(app, '/api/events', post({ ...today, kind: 'documents_received', document: 'payslip' }))
        expect(((await res?.json()) as CaseEvent).occurredAt).toBe('2026-09-18T23:59:50+08:00')
        const submitted = await call(
          app,
          '/api/applications',
          post({ bookingId: 'BK-9001', bank: 'Harbour Bank', banker: 'Lim Wei Jie', reportedBy: 'Tan Mei Ling' })
        )
        expect(((await submitted?.json()) as { event: CaseEvent }).event.occurredAt).toBe('2026-09-18T23:59:50+08:00')
        expect(order(db)).toEqual(['documents_requested payslip', 'documents_received payslip', 'loan_submitted null'])
      })
    })

    test('refuses an application that belongs to another booking', async () => {
      const db = new FakeDb()
      db.bookings.push(OTHER_BOOKING)
      db.applications.push(OTHER_APPLICATION)
      const res = await call(makeApp(db), '/api/events', post({ ...valid, applicationId: 'APP-9002-1' }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('applicationId APP-9002-1')
      expect(db.events).toHaveLength(0)
    })

    test('sends a submission to the applications route', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/events', post({ ...valid, kind: 'loan_submitted' }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('/api/applications')
      expect(db.events).toHaveLength(0)
    })

    test.each(['loan_agreement_signed', 'disbursed'])(
      'refuses %s until a confirmed SPA signing is on the case',
      async (kind) => {
        const db = new FakeDb()
        // A signing Jev only proposed does not count.
        db.events.push({ ...PROVISIONAL, id: 'EV-9001-10', track: 'legal', kind: 'spa_signed', document: null })
        const refused = await call(makeApp(db), '/api/events', post({ ...valid, kind }))
        expect(refused?.status).toBe(400)
        expect(await errorOf(refused)).toContain('record spa_signed on BK-9001 first')
        expect(db.events).toHaveLength(1)

        const signed = await call(makeApp(db), '/api/events', post({ ...valid, track: 'legal', kind: 'spa_signed' }))
        expect(signed?.status).toBe(200)
        const accepted = await call(makeApp(db), '/api/events', post({ ...valid, kind }))
        expect(accepted?.status).toBe(200)
        expect(db.events.map((e) => [e.kind, e.status])).toEqual([
          ['spa_signed', 'provisional'],
          ['spa_signed', 'confirmed'],
          [kind, 'confirmed']
        ])
      }
    )

    test.each([
      [{ applicationId: 'APP-0000' }, 'applicationId APP-0000'],
      [{ applicationId: '' }, 'applicationId'],
      [{ applicationId: 42 }, 'applicationId'],
      [{ occurredOn: '2026-09-19' }, 'after today'],
      [{ occurredOn: '2026-09-01' }, 'before the booking date'],
      [{ occurredOn: '2026-02-30' }, 'occurredOn'],
      [{ occurredOn: '16 Sep 2026' }, 'occurredOn'],
      [{ occurredOn: '2026-09-16T10:00:00+08:00' }, 'occurredOn']
    ])('refuses %o mentioning %s', async (extra, message) => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/events', post({ ...valid, ...extra }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(message)
      expect(db.events).toHaveLength(0)
    })

    test('refuses a booked update: the import writes the one a booking carries', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/events', post({ ...valid, track: 'sales', kind: 'booked' }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('importing')
      expect(db.events).toHaveLength(0)
    })

    test.each(['loan_approved', 'loan_rejected', 'valuation_shortfall'])(
      'refuses %s without the bank application it is for',
      async (kind) => {
        const db = new FakeDb()
        const res = await call(makeApp(db), '/api/events', post({ ...valid, kind }))
        expect(res?.status).toBe(400)
        expect(await errorOf(res)).toContain('which bank application')
        expect(db.events).toHaveLength(0)
      }
    )

    describe('case rules', () => {
      derivingCases()

      test.each(['cancelled', 'lapsed'] as const)('refuses any update once the booking is %s', async (closing) => {
        for (const update of [
          valid,
          { ...valid, kind: 'spa_signed', track: 'legal' },
          { ...valid, kind: 'cancelled', track: 'sales' },
          { ...valid, kind: 'loan_approved', applicationId: 'APP-9001-1' }
        ]) {
          const db = new FakeDb()
          db.events.push(staffEvent('EV-CLOSE', closing))
          const res = await call(makeApp(db), '/api/events', post(update))
          expect(res?.status).toBe(409)
          expect(await errorOf(res)).toBe(`This booking is ${closing}, so it takes no more updates.`)
          expect(db.events).toHaveLength(1)
        }
      })

      test.each([
        ['loan_approved', 'approved'],
        ['loan_rejected', 'rejected']
      ] as const)('refuses a second decision on an application already %s', async (first, word) => {
        for (const second of ['loan_approved', 'loan_rejected']) {
          const db = new FakeDb()
          db.events.push(
            staffEvent('EV-SUB', 'loan_submitted', 'APP-9001-1'),
            staffEvent('EV-DEC', first, 'APP-9001-1')
          )
          const res = await call(
            makeApp(db),
            '/api/events',
            post({ ...valid, kind: second, applicationId: 'APP-9001-1' })
          )
          expect(res?.status).toBe(409)
          expect(await errorOf(res)).toBe(`Apex Bank has already ${word} this application.`)
          expect(db.events).toHaveLength(2)
        }
      })

      test('takes a decision on another bank still deciding, and other updates on a decided one', async () => {
        const db = new FakeDb()
        db.applications.push({ id: 'APP-9001-2', bookingId: 'BK-9001', bank: 'Crestline Bank', banker: 'Aida Rahman' })
        db.events.push(
          staffEvent('EV-SUB-1', 'loan_submitted', 'APP-9001-1'),
          staffEvent('EV-REJ', 'loan_rejected', 'APP-9001-1'),
          staffEvent('EV-SUB-2', 'loan_submitted', 'APP-9001-2')
        )
        const app = makeApp(db)
        const decision = await call(
          app,
          '/api/events',
          post({ ...valid, kind: 'loan_approved', applicationId: 'APP-9001-2' })
        )
        expect(decision?.status).toBe(200)
        const documents = await call(
          app,
          '/api/events',
          post({ ...valid, kind: 'documents_received', applicationId: 'APP-9001-1', document: 'payslip' })
        )
        expect(documents?.status).toBe(200)
      })
    })
  })

  describe('POST /api/applications', () => {
    const valid = {
      bookingId: 'BK-9001',
      bank: ' Harbour Bank ',
      banker: 'Lim Wei Jie',
      reportedBy: 'Tan Mei Ling'
    }

    test('creates the application and its confirmed submission together', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/applications', post({ ...valid, occurredOn: '2026-09-15' }))
      expect(res?.status).toBe(200)
      const { application, event } = (await res?.json()) as { application: LoanApplication; event: CaseEvent }
      expect(application).toMatchObject({ bookingId: 'BK-9001', bank: 'Harbour Bank', banker: 'Lim Wei Jie' })
      expect(application.id).toMatch(/^APP-/)
      expect(event).toMatchObject({
        bookingId: 'BK-9001',
        applicationId: application.id,
        track: 'loan',
        kind: 'loan_submitted',
        occurredAt: '2026-09-15T12:00:00+08:00',
        recordedAt: '2026-09-18T12:00:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        status: 'confirmed',
        source: 'staff',
        note: null
      })
      expect(db.applications).toContainEqual(application)
      expect(db.events).toEqual([{ ...event, seq: 1 }])
    })

    test('without a day it is dated now, and a note rides on the submission', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/applications', post({ ...valid, note: ' Full set of documents ' }))
      const { event } = (await res?.json()) as { event: CaseEvent }
      expect(event.occurredAt).toBe('2026-09-18T12:00:00+08:00')
      expect(event.note).toBe('Full set of documents')
    })

    test('unknown booking is a 404 and stores nothing', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/applications', post({ ...valid, bookingId: 'BK-0000' }))
      expect(res?.status).toBe(404)
      expect(db.applications).toHaveLength(1)
      expect(db.events).toHaveLength(0)
    })

    test.each([
      [{ bookingId: undefined }, 'bookingId'],
      [{ bank: ' ' }, 'bank'],
      [{ banker: undefined }, 'banker'],
      [{ reportedBy: '' }, 'reportedBy'],
      [{ note: 7 }, 'note'],
      [{ occurredOn: 'yesterday' }, 'occurredOn'],
      [{ occurredOn: '2026-09-19' }, 'after today'],
      [{ occurredOn: '2026-08-30' }, 'before the booking date']
    ])('refuses %o mentioning %s', async (extra, message) => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/applications', post({ ...valid, ...extra }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(message)
      expect(db.applications).toHaveLength(1)
      expect(db.events).toHaveLength(0)
    })

    test.each([
      ['bank', 'x'.repeat(301)],
      ['banker', 'x'.repeat(301)],
      ['note', 'x'.repeat(301)],
      ['reportedBy', 'x'.repeat(301)]
    ])('%s over 300 characters is refused', async (field, value) => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/applications', post({ ...valid, [field]: value }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(field)
    })

    test('a retried submission to a bank still deciding is refused, whatever its spacing or case', async () => {
      const db = new FakeDb()
      const app = makeApp(db)
      expect((await call(app, '/api/applications', post(valid)))?.status).toBe(200)
      for (const bank of ['Harbour Bank', ' harbour BANK ']) {
        const retry = await call(app, '/api/applications', post({ ...valid, bank }))
        expect(retry?.status).toBe(409)
        expect(await errorOf(retry)).toBe('Harbour Bank already has an application waiting on this booking.')
      }
      // The seeded Apex Bank application has no decision either.
      expect((await call(app, '/api/applications', post({ ...valid, bank: 'apex bank' })))?.status).toBe(409)
      expect(db.applications).toHaveLength(2)
      expect(db.events).toHaveLength(1)
    })

    test('a bank that rejected can be sent the case again', async () => {
      const db = new FakeDb()
      db.events.push(
        staffEvent('EV-SUB', 'loan_submitted', 'APP-9001-1'),
        staffEvent('EV-REJ', 'loan_rejected', 'APP-9001-1')
      )
      const res = await call(makeApp(db), '/api/applications', post({ ...valid, bank: 'Apex Bank' }))
      expect(res?.status).toBe(200)
      expect(db.applications.filter((a) => a.bank === 'Apex Bank')).toHaveLength(2)
    })

    describe('case rules', () => {
      derivingCases()

      test('refuses a submission once the booking is cancelled', async () => {
        const db = new FakeDb()
        db.events.push(staffEvent('EV-CANCEL', 'cancelled'))
        const res = await call(makeApp(db), '/api/applications', post(valid))
        expect(res?.status).toBe(409)
        expect(await errorOf(res)).toBe('This booking is cancelled, so it takes no more updates.')
        expect(db.applications).toHaveLength(1)
        expect(db.events).toHaveLength(1)
      })
    })
  })

  describe('POST /api/events/:id/review', () => {
    test.each([
      ['confirm', 'confirmed'],
      ['dispute', 'disputed'],
      ['dismiss', 'superseded']
    ])('%s maps to %s with the reviewer recorded', async (decision, status) => {
      const db = new FakeDb()
      db.events.push({ ...PROVISIONAL })
      const res = await call(makeApp(db), '/api/events/EV-9001-9/review', post({ decision, reviewer: 'Tan Mei Ling' }))
      expect(res?.status).toBe(200)
      const event = (await res?.json()) as CaseEvent
      expect(event.status).toBe(status as CaseEvent['status'])
      expect(event.verifiedBy).toBe('Nurul Aina')
    })

    test('rejects a bad decision', async () => {
      const res = await call(makeApp(), '/api/events/EV-9001-9/review', post({ decision: 'shrug', reviewer: 'x' }))
      expect(res?.status).toBe(400)
    })

    test('reviewer over 300 characters is refused', async () => {
      const res = await call(
        makeApp(),
        '/api/events/EV-9001-9/review',
        post({ decision: 'confirm', reviewer: 'x'.repeat(301) })
      )
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('reviewer')
    })

    test('unknown event is a 404', async () => {
      const res = await call(makeApp(), '/api/events/EV-0000/review', post({ decision: 'confirm', reviewer: 'x' }))
      expect(res?.status).toBe(404)
    })

    test('keeps who moved the proposal, from what to what, and when', async () => {
      const db = new FakeDb()
      db.events.push({ ...PROVISIONAL })
      await call(makeApp(db), '/api/events/EV-9001-9/review', post({ decision: 'confirm', reviewer: ' Tan Mei Ling ' }))
      expect(db.events[0]).toMatchObject({ status: 'confirmed', verifiedBy: 'Nurul Aina' })
      expect(db.reviews).toEqual([
        {
          eventId: 'EV-9001-9',
          fromStatus: 'provisional',
          toStatus: 'confirmed',
          reviewer: 'Nurul Aina',
          at: '2026-09-18T12:00:00+08:00'
        }
      ])
    })

    test('a stale screen cannot dismiss a proposal someone already confirmed', async () => {
      const db = new FakeDb()
      db.events.push({ ...PROVISIONAL })
      const app = makeApp(db)
      const review = (decision: string, reviewer: string) =>
        call(app, '/api/events/EV-9001-9/review', post({ decision, reviewer }))
      expect((await review('confirm', 'Tan Mei Ling'))?.status).toBe(200)
      const stale = await review('dismiss', 'Nurul Aina')
      expect(stale?.status).toBe(409)
      expect(await errorOf(stale)).toBe('This update was already reviewed and confirmed.')
      expect(db.events[0]).toMatchObject({ status: 'confirmed', verifiedBy: 'Nurul Aina' })
      expect(db.reviews).toHaveLength(1)
    })

    test.each([
      ['a staff cancellation', staffEvent('EV-9001-9', 'cancelled'), 'dismiss', 'already on record'],
      [
        'a staff update, even to confirm it',
        staffEvent('EV-9001-9', 'buyer_contacted'),
        'confirm',
        'already on record'
      ],
      ['a dismissed proposal', { ...PROVISIONAL, status: 'superseded' as const }, 'confirm', 'already dismissed'],
      ['a disputed proposal, disputed again', { ...PROVISIONAL, status: 'disputed' as const }, 'dispute', 'disputed']
    ])('refuses to review %s', async (_label, event, decision, message) => {
      const db = new FakeDb()
      db.events.push(event)
      const res = await call(makeApp(db), '/api/events/EV-9001-9/review', post({ decision, reviewer: 'Nurul Aina' }))
      expect(res?.status).toBe(409)
      expect(await errorOf(res)).toContain(message)
      expect(db.events[0]).toEqual(event)
      expect(db.reviews).toHaveLength(0)
    })

    test('a disputed proposal can still be confirmed or dismissed', async () => {
      for (const decision of ['confirm', 'dismiss']) {
        const db = new FakeDb()
        db.events.push({ ...PROVISIONAL, status: 'disputed' })
        const res = await call(makeApp(db), '/api/events/EV-9001-9/review', post({ decision, reviewer: 'Nurul Aina' }))
        expect(res?.status).toBe(200)
        expect(db.reviews[0]?.fromStatus).toBe('disputed')
      }
    })

    test('confirming a bank decision Jev could not tie to a bank is refused', async () => {
      const db = new FakeDb()
      db.events.push({ ...PROVISIONAL, kind: 'loan_approved', applicationId: null, document: null })
      const res = await call(makeApp(db), '/api/events/EV-9001-9/review', post({ decision: 'confirm', reviewer: 'x' }))
      expect(res?.status).toBe(409)
      expect(await errorOf(res)).toContain('which bank')
      expect(db.events[0].status).toBe('provisional')
    })

    describe('case rules', () => {
      derivingCases()

      test('a proposal on a closed booking can be dismissed but not confirmed', async () => {
        const db = new FakeDb()
        db.events.push(staffEvent('EV-CANCEL', 'cancelled'), { ...PROVISIONAL })
        const app = makeApp(db)
        const confirm = await call(app, '/api/events/EV-9001-9/review', post({ decision: 'confirm', reviewer: 'x' }))
        expect(confirm?.status).toBe(409)
        expect(await errorOf(confirm)).toBe('This booking is cancelled, so it takes no more updates.')
        const dismiss = await call(app, '/api/events/EV-9001-9/review', post({ decision: 'dismiss', reviewer: 'x' }))
        expect(dismiss?.status).toBe(200)
        expect(db.events.find((e) => e.id === 'EV-9001-9')?.status).toBe('superseded')
      })

      test('confirming a second decision on a decided application is refused', async () => {
        const db = new FakeDb()
        db.events.push(
          staffEvent('EV-SUB', 'loan_submitted', 'APP-9001-1'),
          staffEvent('EV-APP', 'loan_approved', 'APP-9001-1'),
          {
            ...PROVISIONAL,
            kind: 'loan_rejected',
            document: null
          }
        )
        const res = await call(
          makeApp(db),
          '/api/events/EV-9001-9/review',
          post({ decision: 'confirm', reviewer: 'x' })
        )
        expect(res?.status).toBe(409)
        expect(await errorOf(res)).toBe('Apex Bank has already approved this application.')
      })
    })
  })

  test('POST /api/bookings/:id/next-action passes the last three messages to Jev', async () => {
    let seen: realCore.Message[] = []
    const jev = fakeJev({
      nextAction: async ({ summary, recentMessages }) => {
        seen = recentMessages
        return {
          bookingId: summary.bookingId,
          action: { value: 'request_document', probabilities: {}, confidence: 0.9 },
          owner: { value: 'loan_admin', probabilities: {}, confidence: 0.8 },
          urgency: { score: 2, confidence: 0.7 },
          meta: { source: 'live', stale: false, latencyMs: 10 }
        }
      }
    })
    const res = await call(makeApp(new FakeDb(), jev), '/api/bookings/BK-9001/next-action', post())
    expect(res?.status).toBe(200)
    expect(seen[seen.length - 1]?.id).toBe('MSG-9001-9')
    const suggestion = (await res?.json()) as realCore.NextActionSuggestion
    expect(suggestion.action.value).toBe('request_document')
  })

  describe('GET /api/bookings/:id/playbooks', () => {
    const playbook: realCore.Playbook = {
      id: 'PB-01',
      title: 'Missing Income Documents',
      situation: 's',
      evidence: 'e',
      action: 'a',
      rationale: 'r',
      limits: 'l',
      outcome: 'o',
      author: 'a',
      reviewer: 'r',
      reviewedOn: '2026-09-01',
      status: 'approved',
      tags: ['slip gaji']
    }

    test('defaults the query to defaultPlaybookQuery so precomputed hashes hit', async () => {
      const db = new FakeDb()
      db.playbooks.push(playbook)
      const res = await call(makeApp(db), '/api/bookings/BK-9001/playbooks')
      const ranking = (await res?.json()) as realCore.PlaybookRanking
      // An outstanding document outranks stall reasons; `defaultPlaybookQuery`
      // is what the precompute cache and the frontend panel both use.
      expect(ranking.query).toBe('missing payslip')
      expect(ranking.results[0].playbookId).toBe('PB-01')
      expect(ranking.meta.source).toBe('cache')
    })

    test('an explicit q wins', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/bookings/BK-9001/playbooks?q=valuation')
      const ranking = (await res?.json()) as realCore.PlaybookRanking
      expect(ranking.query).toBe('valuation')
    })

    test('unknown booking is a 404', async () => {
      const res = await call(makeApp(), '/api/bookings/BK-0000/playbooks')
      expect(res?.status).toBe(404)
    })

    test('q over 200 characters is refused, before the booking is even looked up', async () => {
      const res = await call(makeApp(), `/api/bookings/BK-0000/playbooks?q=${'x'.repeat(201)}`)
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('q')
    })
  })

  describe('GET /api/bookings/:id/signals', () => {
    test('returns the Jev answer when the buyer has messaged', async () => {
      const res = await call(makeApp(), '/api/bookings/BK-9001/signals')
      expect(res?.status).toBe(200)
      const signals = (await res?.json()) as realCore.BuyerSignals
      expect(signals.bookingId).toBe('BK-9001')
      expect(signals.responsiveness.score).toBe(2)
    })

    test.each([
      ['no messages at all', []],
      [
        'only non-buyer messages',
        [{ ...FIXTURE_MESSAGE, id: 'MSG-9001-8', senderRole: 'banker' as const, senderName: 'Apex Banker' }]
      ]
    ])('404s without asking Jev when the buyer never messaged (%s)', async (_label, messages) => {
      const db = new FakeDb()
      db.messages = messages
      let asked = false
      const jev = fakeJev({
        signals: async ({ bookingId }) => {
          asked = true
          return {
            bookingId,
            responsiveness: { score: 0, confidence: 0.9 },
            hesitation: { score: 0, confidence: 0.9 },
            meta: { source: 'live', stale: false, latencyMs: 10 }
          }
        }
      })
      const res = await call(makeApp(db, jev), '/api/bookings/BK-9001/signals')
      expect(res?.status).toBe(404)
      expect(await errorOf(res)).toContain('no buyer messages')
      expect(asked).toBe(false)
    })
  })

  describe('POST /api/tasks', () => {
    const valid = {
      bookingId: 'BK-9001',
      action: 'request_document',
      title: 'Request Payslip',
      ownerRole: 'loan_admin',
      ownerName: 'Tan Mei Ling',
      dueOn: '2026-09-19',
      origin: 'jev'
    }

    test('inserts an open task', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/tasks', post(valid))
      expect(res?.status).toBe(200)
      const task = (await res?.json()) as Task
      expect(task.status).toBe('open')
      expect(task.completedAt).toBeNull()
      expect(db.tasks).toHaveLength(1)
    })

    test('only a manager can create a deduplicated task flag, and the flag records the session identity', async () => {
      const db = new FakeDb()
      const sales = await call(makeApp(db), '/api/tasks', post({ ...valid, managerFlaggedBy: 'Project Manager' }))
      expect(sales?.status).toBe(403)
      const app = makeApp(db)
      const request = post({ ...valid, managerFlaggedBy: 'spoofed name' })
      const first = await call(app, '/api/tasks', request, 'manager')
      const second = await call(app, '/api/tasks', request, 'manager')
      expect(first?.status).toBe(200)
      expect(second?.status).toBe(200)
      expect(((await first?.json()) as Task).managerFlaggedBy).toBe('Project Manager')
      expect(((await second?.json()) as Task).id).toBe(db.tasks[0]?.id)
      expect(db.tasks).toHaveLength(1)
    })

    test.each([
      [{ ...valid, action: 'nap' }, 'action'],
      [{ ...valid, ownerRole: 'ceo' }, 'ownerRole'],
      [{ ...valid, dueOn: 'tomorrow' }, 'dueOn'],
      [{ ...valid, dueOn: '0000-01-01' }, 'dueOn'],
      [{ ...valid, origin: 'robot' }, 'origin']
    ])('validation rejects %o mentioning %s', async (input, field) => {
      const res = await call(makeApp(), '/api/tasks', post(input))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(field)
    })

    test('title over 300 characters is refused', async () => {
      const res = await call(makeApp(), '/api/tasks', post({ ...valid, title: 'x'.repeat(301) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('title')
    })

    test('ownerName over 300 characters is refused', async () => {
      const res = await call(makeApp(), '/api/tasks', post({ ...valid, ownerName: 'x'.repeat(301) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('ownerName')
    })
  })

  describe('POST /api/bookings/import', () => {
    const draft: BookingDraft = {
      project: 'Aster Heights',
      unit: 'b-07-01',
      priceRm: 612800,
      bookingDate: '2026-09-02',
      buyer: {
        name: 'Nur Aisyah Binti Kamal',
        ic: '900514-00-0001',
        phone: '+60 00-000 0001',
        age: 36,
        grossMonthlyIncomeRm: 8500,
        monthlyCommitmentsRm: 400,
        propertiesOwned: 0
      },
      salesOwner: 'Nurul Aina',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Khor & Associates'
    }
    const valid = { bookings: [draft], reportedBy: 'Tan Mei Ling', source: 'september.xlsx' }

    test('numbers the bookings and records a confirmed booked event for each', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/bookings/import', post(valid))
      expect(res?.status).toBe(200)
      const { bookings } = (await res?.json()) as { bookings: Booking[] }
      expect(bookings).toHaveLength(1)
      expect(bookings[0]).toMatchObject({ id: 'BK-0141', unit: 'B-07-01', priceRm: 612800 })
      const event = db.events.find((e) => e.bookingId === 'BK-0141')
      expect(event).toMatchObject({
        kind: 'booked',
        track: 'sales',
        status: 'confirmed',
        source: 'staff',
        occurredAt: '2026-09-02T09:00:00+08:00',
        recordedAt: '2026-09-18T12:00:00+08:00',
        reportedBy: 'Nurul Aina',
        verifiedBy: 'Nurul Aina',
        note: 'Imported From september.xlsx'
      })
    })

    test('manager imports retain the selected sales owner', async () => {
      const db = new FakeDb()
      const res = await call(
        makeApp(db),
        '/api/bookings/import',
        post({ ...valid, bookings: [{ ...draft, salesOwner: 'Kelvin Chow' }] }),
        'manager'
      )
      expect(res?.status).toBe(200)
      expect(db.bookings.find((booking) => booking.id === 'BK-0141')?.salesOwner).toBe('Kelvin Chow')
    })

    test('manager imports reject unknown owners before creating an inaccessible booking', async () => {
      const db = new FakeDb()
      const res = await call(
        makeApp(db),
        '/api/bookings/import',
        post({ ...valid, bookings: [{ ...draft, salesOwner: 'Unknown Agent' }] }),
        'manager'
      )
      expect(res?.status).toBe(400)
      expect(db.bookings.some((booking) => booking.salesOwner === 'Unknown Agent')).toBe(false)
    })

    test('sales imports ignore a forged sales owner and use the signed-in profile', async () => {
      const db = new FakeDb()
      const res = await call(
        makeApp(db),
        '/api/bookings/import',
        post({ ...valid, bookings: [{ ...draft, salesOwner: 'Kelvin Chow' }] }),
        'sales-nurul-aina'
      )
      expect(res?.status).toBe(200)
      expect(db.bookings.find((booking) => booking.id === 'BK-0141')?.salesOwner).toBe('Nurul Aina')
    })

    test('answers with the import id and the bookings, IC and phone masked', async () => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/bookings/import', post(valid))
      const { importId, bookings } = (await res?.json()) as { importId: string; bookings: Booking[] }
      expect(importId).toMatch(/^IMP-/)
      expect(bookings[0].buyer.ic).toBe('••••••-••-0001')
      expect(bookings[0].buyer.phone).toBe('+•• ••-••• 0001')
      // The database keeps them whole.
      expect(db.bookings.find((b) => b.id === 'BK-0141')?.buyer.ic).toBe('900514-00-0001')
    })

    test('undo removes the batch while nothing has moved on, and refuses once it has', async () => {
      const db = new FakeDb()
      const app = makeApp(db)
      const undoBy = post({ reportedBy: 'Farah Idris' })
      const first = (await (await call(app, '/api/bookings/import', post(valid)))?.json()) as { importId: string }
      const undone = await call(app, `/api/imports/${first.importId}/undo`, undoBy)
      expect(undone?.status).toBe(200)
      expect(await undone?.json()).toEqual({ removed: ['BK-0141'] })
      expect(db.bookings.some((b) => b.id === 'BK-0141')).toBe(false)
      expect(db.events.some((e) => e.bookingId === 'BK-0141')).toBe(false)
      // The import itself stays on record, stamped with who undid it.
      expect(db.imports.get(first.importId)).toMatchObject({ ids: ['BK-0141'], undoneBy: 'Nurul Aina' })
      expect(db.imports.get(first.importId)?.undoneAt).toBeTruthy()
      expect((await call(app, `/api/imports/${first.importId}/undo`, undoBy))?.status).toBe(404)

      const second = (await (await call(app, '/api/bookings/import', post(valid)))?.json()) as { importId: string }
      db.tasks.push({
        id: 'TSK-1',
        bookingId: 'BK-0141',
        action: 'call_buyer',
        title: 'Call',
        ownerRole: 'sales',
        ownerName: 'Nurul Aina',
        dueOn: '2026-09-19',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-18T12:00:00+08:00',
        completedAt: null
      })
      const refused = await call(app, `/api/imports/${second.importId}/undo`, undoBy)
      expect(refused?.status).toBe(409)
      expect(await errorOf(refused)).toContain('BK-0141')
      expect(db.bookings.some((b) => b.id === 'BK-0141')).toBe(true)

      expect((await call(app, '/api/imports/IMP-nope/undo', undoBy))?.status).toBe(404)
    })

    test('undo needs to know who is undoing', async () => {
      const app = makeApp()
      const { importId } = (await (await call(app, '/api/bookings/import', post(valid)))?.json()) as {
        importId: string
      }
      const res = await call(app, `/api/imports/${importId}/undo`, post({}))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('reportedBy')
    })

    test('undo refuses a reportedBy over 300 characters', async () => {
      const app = makeApp()
      const { importId } = (await (await call(app, '/api/bookings/import', post(valid)))?.json()) as {
        importId: string
      }
      const res = await call(app, `/api/imports/${importId}/undo`, post({ reportedBy: 'x'.repeat(301) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('reportedBy')
    })

    test('import refuses a reportedBy over 300 characters', async () => {
      const res = await call(makeApp(), '/api/bookings/import', post({ ...valid, reportedBy: 'x'.repeat(301) }))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain('reportedBy')
    })

    test('stores only the contract fields of a draft', async () => {
      const db = new FakeDb()
      const padded = { ...draft, extra: 'x', buyer: { ...draft.buyer, notes: 'x' } }
      await call(makeApp(db), '/api/bookings/import', post({ ...valid, bookings: [padded] }))
      const stored = db.bookings.find((b) => b.id === 'BK-0141')
      expect(stored && 'extra' in stored).toBe(false)
      expect(stored && 'notes' in stored.buyer).toBe(false)
    })

    test('refuses a unit an open booking already holds, and one listed twice', async () => {
      const held = await call(
        makeApp(),
        '/api/bookings/import',
        post({ ...valid, bookings: [{ ...draft, unit: 'A-12-03' }] })
      )
      expect(held?.status).toBe(409)
      const message = await errorOf(held)
      expect(message).toContain('held by another booking')
      expect(message).not.toContain('BK-9001')
      const twice = await call(makeApp(), '/api/bookings/import', post({ ...valid, bookings: [draft, draft] }))
      expect(twice?.status).toBe(409)
    })

    test.each([
      [{ ...valid, bookings: [] }, 'bookings'],
      [{ ...valid, reportedBy: ' ' }, 'reportedBy'],
      [{ ...valid, bookings: [{ ...draft, bookingDate: '2026-10-01' }] }, 'row 1: bookingDate'],
      [{ ...valid, bookings: [{ ...draft, priceRm: 'lots' }] }, 'priceRm']
    ])('validation rejects %o mentioning %s', async (input, field) => {
      const db = new FakeDb()
      const res = await call(makeApp(db), '/api/bookings/import', post(input))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(field)
      expect(db.bookings).toHaveLength(1)
    })
  })

  describe('PATCH /api/tasks/:id', () => {
    const open: Task = {
      id: 'TSK-1',
      bookingId: 'BK-9001',
      action: 'call_buyer',
      title: 'Call Buyer',
      ownerRole: 'sales',
      ownerName: 'Nurul Aina',
      dueOn: '2026-09-19',
      status: 'open',
      origin: 'staff',
      createdAt: '2026-09-18T09:00:00+08:00',
      completedAt: null
    }

    test('done sets completedAt', async () => {
      const db = new FakeDb()
      db.tasks.push(open)
      const res = await call(makeApp(db), '/api/tasks/TSK-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'done' })
      })
      const task = (await res?.json()) as Task
      expect(task.status).toBe('done')
      expect(task.completedAt).toBe('2026-09-18T12:00:00+08:00')
    })

    test('bad status is a 400, unknown task a 404', async () => {
      const db = new FakeDb()
      db.tasks.push(open)
      expect((await call(makeApp(db), '/api/tasks/TSK-1', { method: 'PATCH', body: '{}' }))?.status).toBe(400)
      expect(
        (await call(makeApp(db), '/api/tasks/TSK-9', { method: 'PATCH', body: JSON.stringify({ status: 'done' }) }))
          ?.status
      ).toBe(404)
    })
  })

  describe('demo data routes', () => {
    test('a sales session cannot add or delete shared demo data', async () => {
      const app = makeApp()
      expect((await call(app, '/api/admin/demo/add', post()))?.status).toBe(403)
      expect((await call(app, '/api/admin/demo/delete', post()))?.status).toBe(403)
    })
    test('Add Demo Data is refused while demo management is switched off', async () => {
      let ran = false
      const app = createApp({
        db: new FakeDb(),
        jev: fakeJev(),
        addDemoData: async () => {
          ran = true
          return { seed: 20260918, referenceDate: '2026-09-18', resetAt: '2026-09-18T12:00:00+08:00' }
        },
        deleteDemoData: async () => {},
        resetEnabled: false
      })
      const res = await call(app, '/api/admin/demo/add', post(), 'manager')
      expect(res?.status).toBe(403)
      expect(await errorOf(res)).toContain('MORTAR_DEMO_RESET=off')
      expect(ran).toBe(false)
    })

    test('adds demo data and returns SimulationMeta', async () => {
      const res = await call(makeApp(), '/api/admin/demo/add', post(), 'manager')
      expect(res?.status).toBe(200)
      const meta = (await res?.json()) as SimulationMeta
      expect(meta.seed).toBe(20260918)
    })

    test('deletes demo data through its separate endpoint', async () => {
      let deleted = false
      const app = createApp({
        db: new FakeDb(),
        jev: fakeJev(),
        addDemoData: async () => ({
          seed: 20260918,
          referenceDate: '2026-09-18',
          resetAt: '2026-09-18T12:00:00+08:00'
        }),
        deleteDemoData: async () => {
          deleted = true
        }
      })
      const res = await call(app, '/api/admin/demo/delete', post(), 'manager')
      expect(res?.status).toBe(200)
      expect(deleted).toBe(true)
    })
  })
})
