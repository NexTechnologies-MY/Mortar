/**
 * Route tests against an in-memory `Database` and a fake `JevService`. The
 * lane-W1/W3 core functions are still stubs that throw "not built", so this
 * file mocks `@mortar/core` with fakes for the same signatures; when the real
 * implementations land the routes exercise them unchanged.
 */
import { describe, expect, mock, test } from 'bun:test'
import * as realCore from '../../../packages/core/src/index'

const SUMMARY: realCore.CaseSummary = {
  bookingId: 'BK-9001',
  stage: 'loan_applied',
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

mock.module('@mortar/core', () => ({
  ...realCore,
  simNow: () => '2026-09-18T12:00:00+08:00',
  summarizeCases: () => [SUMMARY],
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
import { ImportMovedOnError, UnitHeldError, type Database, type ImportBatch } from '../../db/index'
import type { JevAnswerRow } from '../../db/mappers'
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
  bookings = [BOOKING]
  applications: LoanApplication[] = [APPLICATION]
  messages = [FIXTURE_MESSAGE]
  events: CaseEvent[] = []
  tasks: Task[] = []
  playbooks: realCore.Playbook[] = []
  resetAt: string | null = null

  async ping() {}
  async meta(): Promise<SimulationMeta | null> {
    return { seed: 20260918, referenceDate: '2026-09-18', resetAt: this.resetAt }
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
  async messagesForBooking(bookingId: string) {
    return this.messages.filter((m) => m.bookingId === bookingId)
  }
  async eventsForMessage(messageId: string) {
    return this.events.filter((e) => e.messageId === messageId)
  }
  async listPlaybooks() {
    return this.playbooks
  }
  async insertMessage(message: Message) {
    this.messages.push(message)
  }
  async insertEvent(event: CaseEvent) {
    this.events.push(event)
  }
  /** Mirrors the SQL transaction: both rows land, or neither does. */
  async insertApplication(application: LoanApplication, submitted: CaseEvent) {
    if (this.events.some((e) => e.id === submitted.id)) throw new Error(`duplicate event ${submitted.id}`)
    this.applications.push(application)
    this.events.push(submitted)
  }
  async reviewEvent(id: string, status: EvidenceStatus, reviewer: string) {
    const event = this.events.find((e) => e.id === id)
    if (!event) return null
    return { ...event, status, verifiedBy: reviewer }
  }
  async supersedePendingProposals(messageId: string) {
    this.events = this.events.map((e) =>
      e.messageId === messageId && (e.status === 'provisional' || e.status === 'disputed')
        ? { ...e, status: 'superseded' as const }
        : e
    )
  }
  async insertTask(task: Task) {
    this.tasks.push(task)
  }
  imports = new Map<string, { ids: string[]; undoneBy: string | null; undoneAt: string | null }>()
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
    this.events.push(...imported.map(bookedEvent))
    this.imports.set(batch.id, { ids: imported.map((b) => b.id), undoneBy: null, undoneAt: null })
    return imported
  }
  async undoImport(id: string, undoneBy: string, undoneAt: string) {
    const record = this.imports.get(id)
    if (!record || record.undoneAt) return null
    const ids = record.ids
    const moved = ids.filter(
      (bookingId) =>
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

const makeApp = (db = new FakeDb(), jev = fakeJev(), reset?: () => Promise<SimulationMeta>): App =>
  createApp({
    db,
    jev,
    reset:
      reset ?? (async () => ({ seed: 20260918, referenceDate: '2026-09-18', resetAt: '2026-09-18T12:00:00+08:00' })),
    jevAvailable: false
  })

const call = (app: App, path: string, init?: RequestInit) => app.fetch(new Request(`http://test${path}`, init))
const post = (body?: unknown) => ({ method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })
const errorOf = async (res: Response | null) => ((await res?.json()) as { error?: string } | undefined)?.error

describe('createApp', () => {
  test('non-api paths return null so static can handle them', async () => {
    expect(await call(makeApp(), '/bookings')).toBeNull()
    expect(await call(makeApp(), '/')).toBeNull()
  })

  test('GET /api/health reports db and jev flags plus the stored answer count', async () => {
    const db = new FakeDb()
    db.jevAnswers = 87
    const res = await call(makeApp(db), '/api/health')
    expect(res?.status).toBe(200)
    expect(await res?.json()).toEqual({ ok: true, db: true, jev: false, jevAnswers: 87 })
  })

  test('GET /api/health survives a dead database', async () => {
    const db = new FakeDb()
    db.jevAnswers = 87
    db.ping = async () => {
      throw new Error('down')
    }
    const res = await call(makeApp(db), '/api/health')
    expect(await res?.json()).toEqual({ ok: true, db: false, jev: false, jevAnswers: null })
  })

  test('GET /api/snapshot returns the snapshot', async () => {
    const res = await call(makeApp(), '/api/snapshot')
    expect(res?.status).toBe(200)
    const snapshot = (await res?.json()) as Snapshot
    expect(snapshot.bookings[0].id).toBe('BK-9001')
  })

  test('unknown /api route is a json 404', async () => {
    const res = await call(makeApp(), '/api/nope')
    expect(res?.status).toBe(404)
    expect(await errorOf(res)).toMatch('no route')
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
      [{ ...valid, body: '' }, 'body']
    ])('validation rejects %o mentioning %s', async (input, field) => {
      const res = await call(makeApp(), '/api/messages', post(input))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(field)
    })

    test('unknown booking is a 404', async () => {
      const res = await call(makeApp(), '/api/messages', post({ ...valid, bookingId: 'BK-0000' }))
      expect(res?.status).toBe(404)
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

      test.each([
        ['a later time today', '2026-09-18T12:05:00+08:00', 'future'],
        ['tomorrow', '2026-09-19T09:00:00+08:00', 'future'],
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
      expect(db.events).toEqual([event])
    })

    test('accepts the booking day and today as the day it happened', async () => {
      for (const occurredOn of ['2026-09-02', '2026-09-18']) {
        const res = await call(makeApp(), '/api/events', post({ ...valid, occurredOn }))
        expect(res?.status).toBe(200)
        expect(((await res?.json()) as CaseEvent).occurredAt).toBe(`${occurredOn}T12:00:00+08:00`)
      }
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
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'staff',
        note: null
      })
      expect(db.applications).toContainEqual(application)
      expect(db.events).toEqual([event])
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
      expect(event.verifiedBy).toBe('Tan Mei Ling')
    })

    test('rejects a bad decision', async () => {
      const res = await call(makeApp(), '/api/events/EV-9001-9/review', post({ decision: 'shrug', reviewer: 'x' }))
      expect(res?.status).toBe(400)
    })

    test('unknown event is a 404', async () => {
      const res = await call(makeApp(), '/api/events/EV-0000/review', post({ decision: 'confirm', reviewer: 'x' }))
      expect(res?.status).toBe(404)
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

    test.each([
      [{ ...valid, action: 'nap' }, 'action'],
      [{ ...valid, ownerRole: 'ceo' }, 'ownerRole'],
      [{ ...valid, dueOn: 'tomorrow' }, 'dueOn'],
      [{ ...valid, origin: 'robot' }, 'origin']
    ])('validation rejects %o mentioning %s', async (input, field) => {
      const res = await call(makeApp(), '/api/tasks', post(input))
      expect(res?.status).toBe(400)
      expect(await errorOf(res)).toContain(field)
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
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        note: 'Imported From september.xlsx'
      })
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
      expect(db.imports.get(first.importId)).toMatchObject({ ids: ['BK-0141'], undoneBy: 'Farah Idris' })
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
      expect(await errorOf(held)).toContain('BK-9001')
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

  describe('POST /api/admin/reset', () => {
    test('is refused while the reset is switched off, and runs nothing', async () => {
      let ran = false
      const app = createApp({
        db: new FakeDb(),
        jev: fakeJev(),
        reset: async () => {
          ran = true
          return { seed: 20260918, referenceDate: '2026-09-18', resetAt: '2026-09-18T12:00:00+08:00' }
        },
        resetEnabled: false
      })
      const res = await call(app, '/api/admin/reset', post())
      expect(res?.status).toBe(403)
      expect(await errorOf(res)).toContain('MORTAR_DEMO_RESET=off')
      expect(ran).toBe(false)
    })

    test('runs the reset and returns SimulationMeta', async () => {
      const res = await call(makeApp(), '/api/admin/reset', post())
      expect(res?.status).toBe(200)
      const meta = (await res?.json()) as SimulationMeta
      expect(meta.seed).toBe(20260918)
    })

    test('a second reset inside 30 seconds is a 429', async () => {
      const db = new FakeDb()
      const app = makeApp(db, fakeJev(), async () => {
        db.resetAt = new Date().toISOString()
        return { seed: 20260918, referenceDate: '2026-09-18', resetAt: db.resetAt }
      })
      expect((await call(app, '/api/admin/reset', post()))?.status).toBe(200)
      const second = await call(app, '/api/admin/reset', post())
      expect(second?.status).toBe(429)
      expect(await errorOf(second)).toContain('30 seconds')
    })

    test('the cooldown still bites when resetAt is sim time', async () => {
      const db = new FakeDb()
      const app = makeApp(db, fakeJev(), async () => {
        // `resetDatabase` stamps `resetAt` with `simNow`: the reference date and
        // the real time of day, which `Date.now()` can be days ahead of.
        db.resetAt = '2026-09-18T00:00:00+08:00'
        return { seed: 20260918, referenceDate: '2026-09-18', resetAt: db.resetAt }
      })
      expect((await call(app, '/api/admin/reset', post()))?.status).toBe(200)
      expect((await call(app, '/api/admin/reset', post()))?.status).toBe(429)
    })

    test('a reset recorded in meta by another path still cools down', async () => {
      const db = new FakeDb()
      // `simNow` is mocked to noon on the reference date, so a reset stamped at
      // 11:59:59 sim time ran a second ago.
      db.resetAt = '2026-09-18T11:59:59+08:00'
      const res = await call(makeApp(db), '/api/admin/reset', post())
      expect(res?.status).toBe(429)
    })

    test('a stale resetAt does not block a fresh reset', async () => {
      const db = new FakeDb()
      db.resetAt = '2026-09-18T00:00:00+08:00'
      const res = await call(makeApp(db), '/api/admin/reset', post())
      expect(res?.status).toBe(200)
    })
  })
})
