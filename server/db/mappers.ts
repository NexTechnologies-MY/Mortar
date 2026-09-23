/**
 * Row mapping between Postgres rows (snake_case) and the contract types
 * (camelCase) in `@mortar/core`. Pure functions so they can be tested without
 * a database. Bun's SQL driver returns `timestamptz` and `date` as `Date`,
 * `jsonb` either parsed or as raw text, and `text[]` as `string[]`.
 */
import type {
  Booking,
  CaseEvent,
  IsoDate,
  IsoDateTime,
  JevKind,
  LoanApplication,
  Message,
  Playbook,
  SimulationMeta,
  Task
} from '@mortar/core'

type Row = Record<string, unknown>

/** Malaysia keeps a fixed UTC+8 offset; the contract formats timestamps with it. */
const OFFSET_MS = 8 * 60 * 60 * 1000

/** `Date` (or ISO text) to `YYYY-MM-DD`. */
export function isoDate(value: unknown): IsoDate {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

/** `Date` (or ISO text) to `YYYY-MM-DDTHH:mm:ss+08:00`. */
export function isoDateTime(value: unknown): IsoDateTime {
  if (value instanceof Date) {
    return new Date(value.getTime() + OFFSET_MS).toISOString().slice(0, 19) + '+08:00'
  }
  return String(value)
}

/** jsonb comes back parsed for object writes but as raw text otherwise. */
export function jsonb<T>(value: unknown): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return value as T
    }
  }
  return value as T
}

export function rowToBooking(row: Row): Booking {
  return {
    id: String(row.id),
    project: String(row.project),
    unit: String(row.unit),
    priceRm: Number(row.price_rm),
    bookingDate: isoDate(row.booking_date),
    buyer: jsonb<Booking['buyer']>(row.buyer),
    salesOwner: String(row.sales_owner),
    loanOwner: String(row.loan_owner),
    legalFirm: String(row.legal_firm)
  }
}

/** Every digit but the last four becomes `•`: `900514-07-5123` → `••••••-••-5123`. */
export function maskDigits(value: string): string {
  const total = (value.match(/\d/g) ?? []).length
  let seen = 0
  return value.replace(/\d/g, (digit) => ((seen += 1) <= total - 4 ? '•' : digit))
}

/**
 * The booking as the browser may see it: IC and phone masked. Nothing on the
 * desks reads either in full, and the snapshot has no sign-in in front of it
 * (issue #5). The database and the server's own reads keep them whole.
 */
export function withMaskedContact(booking: Booking): Booking {
  return {
    ...booking,
    buyer: { ...booking.buyer, ic: maskDigits(booking.buyer.ic), phone: maskDigits(booking.buyer.phone) }
  }
}

export function rowToApplication(row: Row): LoanApplication {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    bank: String(row.bank),
    banker: String(row.banker)
  }
}

export function rowToMessage(row: Row): Message {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    senderRole: row.sender_role as Message['senderRole'],
    senderName: String(row.sender_name),
    language: row.language as Message['language'],
    sentAt: isoDateTime(row.sent_at),
    body: String(row.body),
    origin: row.origin as Message['origin']
  }
}

export function rowToEvent(row: Row): CaseEvent {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    applicationId: row.application_id == null ? null : String(row.application_id),
    track: row.track as CaseEvent['track'],
    kind: row.kind as CaseEvent['kind'],
    occurredAt: isoDateTime(row.occurred_at),
    recordedAt: isoDateTime(row.recorded_at),
    reportedBy: String(row.reported_by),
    verifiedBy: row.verified_by == null ? null : String(row.verified_by),
    status: row.status as CaseEvent['status'],
    source: row.source as CaseEvent['source'],
    messageId: row.message_id == null ? null : String(row.message_id),
    document: row.document as CaseEvent['document'],
    note: row.note == null ? null : String(row.note)
  }
}

export function rowToPlaybook(row: Row): Playbook {
  return {
    id: String(row.id),
    title: String(row.title),
    situation: String(row.situation),
    evidence: String(row.evidence),
    action: String(row.action),
    rationale: String(row.rationale),
    limits: String(row.limits),
    outcome: String(row.outcome),
    author: String(row.author),
    reviewer: String(row.reviewer),
    reviewedOn: isoDate(row.reviewed_on),
    status: row.status as Playbook['status'],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : []
  }
}

export function rowToTask(row: Row): Task {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    action: row.action as Task['action'],
    title: String(row.title),
    ownerRole: row.owner_role as Task['ownerRole'],
    ownerName: String(row.owner_name),
    dueOn: isoDate(row.due_on),
    status: row.status as Task['status'],
    origin: row.origin as Task['origin'],
    createdAt: isoDateTime(row.created_at),
    completedAt: row.completed_at == null ? null : isoDateTime(row.completed_at)
  }
}

/** The latest `jev_answers` row per (kind, subject) for the snapshot's Jev views. */
export interface JevAnswerRow {
  kind: JevKind
  subjectId: string
  answer: unknown
}

export function rowToJevAnswer(row: Row): JevAnswerRow {
  return {
    kind: row.kind as JevKind,
    subjectId: String(row.subject_id),
    answer: jsonb(row.answer)
  }
}

/** Rows of the `meta` table to `SimulationMeta`; `null` while the `seed` row is absent. */
export function rowsToMeta(rows: Row[]): SimulationMeta | null {
  const values = new Map(rows.map((row) => [String(row.key), jsonb<unknown>(row.value)]))
  if (!values.has('seed')) return null
  const resetAt = values.get('resetAt')
  return {
    seed: Number(values.get('seed')),
    referenceDate: String(values.get('referenceDate')),
    resetAt: resetAt == null ? null : String(resetAt)
  }
}
