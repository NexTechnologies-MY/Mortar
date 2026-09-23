/**
 * The database module. One `Database` interface for every route handler, backed
 * by Bun's built-in `SQL` client on `DATABASE_URL`; tests substitute an
 * in-memory fake. Every function here maps rows to contract types via
 * `mappers.ts` — handlers never see snake_case.
 */
import { SQL } from 'bun'
import { unitKey } from '@mortar/core'
import type {
  Booking,
  BookingDraft,
  CaseData,
  CaseEvent,
  EvidenceStatus,
  IsoDateTime,
  JevMeta,
  LoanApplication,
  Message,
  Playbook,
  SimulationMeta,
  Snapshot,
  Task
} from '@mortar/core'
import {
  rowToApplication,
  rowToBooking,
  rowToEvent,
  rowToJevAnswer,
  rowToMessage,
  rowToPlaybook,
  rowToTask,
  rowsToMeta,
  withMaskedContact,
  type JevAnswerRow
} from './mappers'

export interface Database {
  /** `select 1`; throws when the connection is down. */
  ping(): Promise<void>
  /** Simulation parameters, or `null` while the `seed` row is absent (pre-reset). */
  meta(): Promise<SimulationMeta | null>
  /** Whether `bookings` has any row at all; boot uses it to tell an empty database from one whose `meta` row went missing. */
  hasBookings(): Promise<boolean>
  /** The case-derivation input: bookings, applications, events and tasks. */
  caseData(): Promise<CaseData>
  /**
   * Everything `GET /api/snapshot` returns, buyer IC and phone masked to their
   * last four digits; throws when the database is unseeded.
   */
  snapshot(): Promise<Snapshot>
  getBooking(id: string): Promise<Booking | null>
  getApplication(id: string): Promise<LoanApplication | null>
  getMessage(id: string): Promise<Message | null>
  getEvent(id: string): Promise<CaseEvent | null>
  messagesForBooking(bookingId: string): Promise<Message[]>
  eventsForMessage(messageId: string): Promise<CaseEvent[]>
  listPlaybooks(): Promise<Playbook[]>
  insertMessage(message: Message): Promise<void>
  insertEvent(event: CaseEvent): Promise<void>
  /**
   * Stores a new bank application and the confirmed `loan_submitted` event that
   * carries its id, in one transaction: neither lands without the other. Throws
   * `OpenApplicationError` while the same bank (trimmed, any case) still holds
   * an undecided application on the booking; the check runs under a per-booking
   * lock, so a retried submission cannot slip in beside the first.
   */
  insertApplication(application: LoanApplication, submitted: CaseEvent): Promise<void>
  /**
   * Staff review of a Jev proposal: sets the status, records `reviewer` as
   * `verifiedBy`, and appends the change to `event_reviews`, all in one
   * transaction. `null` when there is no such event; throws `EventSettledError`
   * unless the event is a Jev proposal still waiting (`provisional` or
   * `disputed`, and not already `status`), so a stale screen never overturns a
   * settled update.
   */
  reviewEvent(id: string, status: EvidenceStatus, reviewer: string, at: IsoDateTime): Promise<CaseEvent | null>
  /**
   * Swaps a message's pending proposals (`provisional` or `disputed`) for
   * `proposal`, in one transaction serialised per message, so two re-reads at
   * once leave one proposal standing. Nothing is inserted once an event on the
   * message is confirmed, or when `proposal` is `null`; returns what was.
   */
  replaceProposal(messageId: string, proposal: CaseEvent | null): Promise<CaseEvent | null>
  insertTask(task: Task): Promise<void>
  /**
   * Numbers and stores imported bookings in one transaction, each with the
   * event `bookedEvent` builds for it, records the batch under `batch.id`, and
   * returns the bookings as stored. Ids continue the generator's `BK-nnnn` run,
   * which stops short of the stories' `BK-9001`. Throws `UnitHeldError` when an
   * open booking already holds one of the units; the check runs under the same
   * lock as the insert, so two imports at once cannot both take a unit.
   */
  importBookings(
    batch: ImportBatch,
    drafts: BookingDraft[],
    bookedEvent: (booking: Booking) => CaseEvent
  ): Promise<Booking[]>
  /**
   * Removes an import's bookings, and everything cascading from them, as long
   * as none has moved on since: no update besides its booked event, no message,
   * no task, no bank application. Locks the bookings before that check, so a
   * staff update racing the undo either lands first (and is seen as "moved
   * on") or is blocked until this transaction ends and then fails its own
   * foreign key check, rather than being cascade-deleted after its own 200.
   * Stamps the import as undone by `undoneBy` at `undoneAt` and records a
   * `removed` snapshot of each booking (id, unit, project, buyer name, price —
   * no IC or phone); the import row itself stays. `null` when the import does
   * not exist or was already undone; throws `ImportMovedOnError` naming the
   * bookings that have moved on.
   */
  undoImport(id: string, undoneBy: string, undoneAt: IsoDateTime): Promise<{ removed: string[] } | null>
  updateTaskStatus(id: string, status: Task['status'], completedAt: IsoDateTime | null): Promise<Task | null>
  /** Latest `jev_answers` rows for `extract`, `next_action` and `signals`, for the snapshot. */
  latestJevAnswers(): Promise<JevAnswerRow[]>
  /** Total stored `jev_answers` rows — the real count behind the settings figure. */
  jevAnswerCount(): Promise<number>
  /** Exact-hash cache read, else the latest answer for the subject with `stale: true`. */
  jevGet(
    kind: JevAnswerRow['kind'],
    subjectId: string,
    inputHash: string
  ): Promise<{ answer: unknown; stale: boolean } | null>
  jevPut(entry: {
    kind: JevAnswerRow['kind']
    subjectId: string
    inputHash: string
    answer: unknown
    source: 'live' | 'precomputed'
    latencyMs: number | null
  }): Promise<void>
}

/** Who imported a sheet, and when; one row in `imports`. */
export interface ImportBatch {
  id: string
  /** The file name, when the browser sent one. */
  source: string | null
  reportedBy: string
  createdAt: IsoDateTime
}

/** An open booking already holds a unit the import would book. */
export class UnitHeldError extends Error {
  constructor(
    readonly unit: string,
    readonly holder: string
  ) {
    super(`unit ${unit} is already held by ${holder}`)
  }
}

/** Some of an import's bookings have moved on, so the batch cannot be undone. */
export class ImportMovedOnError extends Error {
  constructor(readonly bookingIds: string[]) {
    super(`${bookingIds.join(', ')} ${bookingIds.length === 1 ? 'has' : 'have'} had updates since the import`)
  }
}

/** The event is not a Jev proposal waiting for review; `event` is how it stands now. */
export class EventSettledError extends Error {
  constructor(readonly event: CaseEvent) {
    super(`event ${event.id} is not a proposal waiting for review`)
  }
}

/** The bank already holds an undecided application on the booking. */
export class OpenApplicationError extends Error {
  constructor(
    readonly bank: string,
    readonly applicationId: string
  ) {
    super(`${bank} already has application ${applicationId} waiting on this booking`)
  }
}

/** Advisory lock key that serialises imports, so two batches never draw the same booking numbers. */
const IMPORT_LOCK = 20_260_918
/**
 * First keys of the two-key advisory locks (a key space apart from the
 * import's one-key lock); the second key hashes the message or booking id.
 */
const MESSAGE_LOCK = 20_260_919
const BOOKING_APPLICATIONS_LOCK = 20_260_920
/** Highest imported booking number; the story fixtures start at `BK-9001`. */
const LAST_IMPORT_NUMBER = 8999

/** An event as an `events` row. */
function eventRow(event: CaseEvent) {
  return {
    id: event.id,
    booking_id: event.bookingId,
    application_id: event.applicationId,
    track: event.track,
    kind: event.kind,
    occurred_at: event.occurredAt,
    recorded_at: event.recordedAt,
    reported_by: event.reportedBy,
    verified_by: event.verifiedBy,
    status: event.status,
    source: event.source,
    message_id: event.messageId,
    document: event.document,
    note: event.note
  }
}

/** Marks a snapshot answer as served from the store rather than a fresh Jev call. */
function cached<T extends { meta?: JevMeta }>(answer: unknown): T {
  const parsed = answer as T
  return { ...parsed, meta: { source: 'cache', stale: false, latencyMs: parsed.meta?.latencyMs ?? null } }
}

export function createDatabase(sql: SQL): Database {
  const meta = async () => rowsToMeta(await sql`select key, value from meta`)

  const caseData = async (): Promise<CaseData> => {
    const [bookings, applications, events, tasks] = await Promise.all([
      sql`select * from bookings order by id`,
      sql`select * from loan_applications order by id`,
      sql`select * from events order by occurred_at, id`,
      sql`select * from tasks order by created_at, id`
    ])
    return {
      bookings: bookings.map(rowToBooking),
      applications: applications.map(rowToApplication),
      events: events.map(rowToEvent),
      tasks: tasks.map(rowToTask)
    }
  }

  const latestJevAnswers = async () => {
    const rows = await sql`select distinct on (kind, subject_id) kind, subject_id, answer
      from jev_answers
      where kind in ('extract', 'next_action', 'signals')
      order by kind, subject_id, created_at desc`
    return rows.map(rowToJevAnswer)
  }

  return {
    async ping() {
      await sql`select 1`
    },

    async hasBookings() {
      const rows = await sql`select exists(select 1 from bookings) as any`
      return Boolean(rows[0]?.any)
    },

    meta,
    caseData,
    latestJevAnswers,

    async jevAnswerCount() {
      const rows = await sql`select count(*)::int as n from jev_answers`
      return (rows[0]?.n as number | undefined) ?? 0
    },

    async snapshot() {
      const [metaRow, data, messages, playbooks, answers] = await Promise.all([
        meta(),
        caseData(),
        sql`select * from messages order by sent_at, id`,
        sql`select * from playbooks order by id`,
        latestJevAnswers()
      ])
      if (!metaRow) throw new Error('database is not seeded')
      const extractions: Snapshot['extractions'] = []
      const signals: Snapshot['signals'] = []
      const nextActions: Snapshot['nextActions'] = []
      for (const row of answers) {
        if (row.kind === 'extract') extractions.push(cached(row.answer))
        else if (row.kind === 'signals') signals.push(cached(row.answer))
        else if (row.kind === 'next_action') nextActions.push(cached(row.answer))
      }
      return {
        ...data,
        bookings: data.bookings.map(withMaskedContact),
        meta: metaRow,
        messages: messages.map(rowToMessage),
        playbooks: playbooks.map(rowToPlaybook),
        extractions,
        signals,
        nextActions
      }
    },

    async getBooking(id) {
      const rows = await sql`select * from bookings where id = ${id}`
      return rows.length ? rowToBooking(rows[0]) : null
    },

    async getApplication(id) {
      const rows = await sql`select * from loan_applications where id = ${id}`
      return rows.length ? rowToApplication(rows[0]) : null
    },

    async getMessage(id) {
      const rows = await sql`select * from messages where id = ${id}`
      return rows.length ? rowToMessage(rows[0]) : null
    },

    async getEvent(id) {
      const rows = await sql`select * from events where id = ${id}`
      return rows.length ? rowToEvent(rows[0]) : null
    },

    async messagesForBooking(bookingId) {
      const rows = await sql`select * from messages where booking_id = ${bookingId} order by sent_at, id`
      return rows.map(rowToMessage)
    },

    async eventsForMessage(messageId) {
      const rows = await sql`select * from events where message_id = ${messageId} order by recorded_at, id`
      return rows.map(rowToEvent)
    },

    async listPlaybooks() {
      const rows = await sql`select * from playbooks order by id`
      return rows.map(rowToPlaybook)
    },

    async insertMessage(message) {
      await sql`insert into messages ${sql({
        id: message.id,
        booking_id: message.bookingId,
        sender_role: message.senderRole,
        sender_name: message.senderName,
        language: message.language,
        sent_at: message.sentAt,
        body: message.body,
        origin: message.origin
      })}`
    },

    async insertEvent(event) {
      await sql`insert into events ${sql(eventRow(event))}`
    },

    async insertApplication(application, submitted) {
      await sql.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(${BOOKING_APPLICATIONS_LOCK}::int, hashtext(${application.bookingId}))`
        // Still with the bank: no confirmed decision, and the buyer has not
        // withdrawn (which leaves an undecided application withdrawn). A bank
        // that rejected can be sent the case again.
        const open = await tx`select a.id, a.bank from loan_applications a
          where a.booking_id = ${application.bookingId}
            and lower(trim(a.bank)) = lower(trim(${application.bank}))
            and not exists (select 1 from events e where e.application_id = a.id
              and e.status = 'confirmed' and e.kind in ('loan_approved', 'loan_rejected'))
            and not exists (select 1 from events w where w.booking_id = a.booking_id
              and w.status = 'confirmed' and w.kind = 'buyer_withdrew')
          order by a.id limit 1`
        if (open.length > 0) throw new OpenApplicationError(String(open[0].bank), String(open[0].id))
        await tx`insert into loan_applications ${tx({
          id: application.id,
          booking_id: application.bookingId,
          bank: application.bank,
          banker: application.banker
        })}`
        await tx`insert into events ${tx(eventRow(submitted))}`
      })
    },

    async reviewEvent(id, status, reviewer, at) {
      return sql.begin(async (tx) => {
        // The row lock makes the check and the change one step: a second
        // review waits here, then sees the first one's result.
        const rows = await tx`select * from events where id = ${id} for update`
        if (rows.length === 0) return null
        const current = rowToEvent(rows[0])
        const pending = current.source === 'jev' && (current.status === 'provisional' || current.status === 'disputed')
        if (!pending || current.status === status) throw new EventSettledError(current)
        const updated = await tx`update events set status = ${status}, verified_by = ${reviewer}
          where id = ${id} returning *`
        await tx`insert into event_reviews ${tx({
          event_id: id,
          from_status: current.status,
          to_status: status,
          reviewer,
          at
        })}`
        return rowToEvent(updated[0])
      })
    },

    async replaceProposal(messageId, proposal) {
      return sql.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(${MESSAGE_LOCK}::int, hashtext(${messageId}))`
        await tx`update events set status = 'superseded'
          where message_id = ${messageId} and status in ('provisional', 'disputed')`
        if (!proposal) return null
        const confirmed = await tx`select 1 from events
          where message_id = ${messageId} and status = 'confirmed' limit 1`
        if (confirmed.length > 0) return null
        await tx`insert into events ${tx(eventRow(proposal))}`
        return proposal
      })
    },

    async insertTask(task) {
      await sql`insert into tasks ${sql({
        id: task.id,
        booking_id: task.bookingId,
        action: task.action,
        title: task.title,
        owner_role: task.ownerRole,
        owner_name: task.ownerName,
        due_on: task.dueOn,
        status: task.status,
        origin: task.origin,
        created_at: task.createdAt,
        completed_at: task.completedAt
      })}`
    },

    async importBookings(batch, drafts, bookedEvent) {
      return sql.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(${IMPORT_LOCK})`
        // Under the lock, so a concurrent import's bookings are already visible
        // here. Matches `unitKey`; a cancelled or lapsed booking frees its unit.
        const keys = drafts.map((d) => unitKey(d.project, d.unit))
        const held = await tx`select b.id, b.unit from bookings b
          where lower(trim(b.project)) || '|' || upper(trim(b.unit)) in ${tx(keys)}
            and not exists (select 1 from events e where e.booking_id = b.id
              and e.status = 'confirmed' and e.kind in ('cancelled', 'lapsed'))
          order by b.id limit 1`
        if (held.length > 0) throw new UnitHeldError(String(held[0].unit), String(held[0].id))

        // Never reuse a number: an undo deletes the bookings, so `bookings`
        // alone would let a later import land on the same `BK-nnnn` an undone
        // one already used, pointing the old import's `booking_ids` (and its
        // `removed` snapshot) at a different buyer. `imports.booking_ids`
        // keeps every id an import ever assigned, undone or not (it is never
        // deleted — see `imports` in schema.sql), so the floor is the higher
        // of the two.
        const rows = await tx`select greatest(
            coalesce((select max(substring(b.id from 4)::int) from bookings b where b.id ~ '^BK-[0-8][0-9]{3}$'), 0),
            coalesce((select max(substring(x from 4)::int) from imports i, unnest(i.booking_ids) x
              where x ~ '^BK-[0-8][0-9]{3}$'), 0)
          )::int as n`
        const last = (rows[0]?.n as number | undefined) ?? 0
        if (last + drafts.length > LAST_IMPORT_NUMBER) throw new Error('no booking numbers left below BK-9000')
        const bookings: Booking[] = drafts.map((draft, i) => ({
          id: `BK-${String(last + i + 1).padStart(4, '0')}`,
          ...draft
        }))
        await tx`insert into bookings ${tx(
          bookings.map((b) => ({
            id: b.id,
            project: b.project,
            unit: b.unit,
            price_rm: b.priceRm,
            booking_date: b.bookingDate,
            buyer: b.buyer,
            sales_owner: b.salesOwner,
            loan_owner: b.loanOwner,
            legal_firm: b.legalFirm
          }))
        )}`
        await tx`insert into events ${tx(
          bookings.map(bookedEvent).map((e) => ({
            id: e.id,
            booking_id: e.bookingId,
            application_id: e.applicationId,
            track: e.track,
            kind: e.kind,
            occurred_at: e.occurredAt,
            recorded_at: e.recordedAt,
            reported_by: e.reportedBy,
            verified_by: e.verifiedBy,
            status: e.status,
            source: e.source,
            message_id: e.messageId,
            document: e.document,
            note: e.note
          }))
        )}`
        await tx`insert into imports ${tx({
          id: batch.id,
          source: batch.source,
          reported_by: batch.reportedBy,
          created_at: batch.createdAt,
          // Booking ids are generated above (`BK-nnnn`), so the literal needs no escaping.
          booking_ids: `{${bookings.map((b) => b.id).join(',')}}`
        })}`
        return bookings
      })
    },

    async undoImport(id, undoneBy, undoneAt) {
      return sql.begin(async (tx) => {
        const rows = await tx`select booking_ids from imports where id = ${id} and undone_at is null for update`
        if (rows.length === 0) return null
        const ids = rows[0].booking_ids as string[]
        // Locks the bookings *before* checking whether any has moved on. A
        // staff update that references one of these ids either finishes and
        // commits first (this select then blocks until it does, and sees it
        // in the check below) or starts after this lock and blocks on its own
        // foreign key check until this transaction ends — at which point the
        // booking is gone and that insert fails with a foreign key violation
        // instead of the row being cascade-deleted out from under a request
        // that already got a 200 (the catch-all in app.ts turns that failure
        // into a 409).
        await tx`select id from bookings where id in ${tx(ids)} for update`
        // The import wrote one booked event per booking; any other event,
        // a second booked one included, is activity since.
        const moved = await tx`select b.id from bookings b where b.id in ${tx(ids)} and (
            (select count(*) from events e where e.booking_id = b.id) > 1
            or exists (select 1 from events e where e.booking_id = b.id and e.kind <> 'booked')
            or exists (select 1 from messages m where m.booking_id = b.id)
            or exists (select 1 from tasks t where t.booking_id = b.id)
            or exists (select 1 from loan_applications a where a.booking_id = b.id)
          ) order by b.id`
        if (moved.length > 0) throw new ImportMovedOnError(moved.map((r: Record<string, unknown>) => String(r.id)))
        // A retention snapshot of what is being removed (docs/RETENTION.md):
        // kept on the import row forever, with no IC or phone, so the trace
        // an undo leaves behind still names a real booking and buyer even
        // after the row itself, and its `BK-nnnn` number, are gone for good.
        const removedRows = await tx`select id, unit, project, price_rm, buyer ->> 'name' as buyer_name
          from bookings where id in ${tx(ids)} order by id`
        const removed = removedRows.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          unit: String(r.unit),
          project: String(r.project),
          buyerName: String(r.buyer_name),
          priceRm: Number(r.price_rm)
        }))
        // Events cascade from bookings; cached Jev answers are keyed by booking id
        // and would otherwise greet the next booking to reuse the number.
        await tx`delete from jev_answers where subject_id in ${tx(ids)}`
        await tx`delete from bookings where id in ${tx(ids)}`
        await tx`update imports set undone_at = ${undoneAt}, undone_by = ${undoneBy},
          removed = ${JSON.stringify(removed)}::jsonb where id = ${id}`
        return { removed: ids }
      })
    },

    async updateTaskStatus(id, status, completedAt) {
      const rows = await sql`update tasks set status = ${status}, completed_at = ${completedAt}
        where id = ${id} returning *`
      return rows.length ? rowToTask(rows[0]) : null
    },

    async jevGet(kind, subjectId, inputHash) {
      const exact = await sql`select answer, subject_id, kind from jev_answers
        where kind = ${kind} and subject_id = ${subjectId} and input_hash = ${inputHash}
        order by created_at desc limit 1`
      if (exact.length) return { answer: rowToJevAnswer(exact[0]).answer, stale: false }
      const latest = await sql`select answer, subject_id, kind from jev_answers
        where kind = ${kind} and subject_id = ${subjectId}
        order by created_at desc limit 1`
      return latest.length ? { answer: rowToJevAnswer(latest[0]).answer, stale: true } : null
    },

    async jevPut(entry) {
      await sql`insert into jev_answers ${sql({
        kind: entry.kind,
        subject_id: entry.subjectId,
        input_hash: entry.inputHash,
        answer: entry.answer,
        source: entry.source,
        latency_ms: entry.latencyMs
      })}`
    }
  }
}
