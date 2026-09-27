/**
 * Demo data actions: `applySchema` runs `schema.sql` idempotently; `addDemoData`
 * inserts the canonical demo dataset in one transaction — the generator's 140
 * bookings, the story fixtures, the playbooks and the precomputed Jev cache —
 * then writes `meta`. The server boots empty; the Settings action calls this.
 */
import { SQL } from 'bun'
import {
  DEFAULT_SEED,
  PLAYBOOKS,
  REFERENCE_DATE,
  STORIES,
  generate,
  proposalFromExtraction,
  simNow,
  summarizeCases
} from '@mortar/core'
import type { CaseEvent, Extraction, JevCacheEntry, SimulationMeta } from '@mortar/core'
import { newId } from '../src/util'

const SCHEMA_PATH = new URL('./schema.sql', import.meta.url)
const JEV_CACHE_PATH = new URL('../fixtures/jev-cache.json', import.meta.url)

/** Applies `schema.sql`; safe to run on every boot (`create table if not exists`). */
export async function applySchema(sql: SQL): Promise<void> {
  await sql.unsafe(await Bun.file(SCHEMA_PATH).text())
}

/** `server/fixtures/jev-cache.json`, written by `bun run jev:precompute`; absent is fine. */
async function readJevCacheEntries(): Promise<JevCacheEntry[]> {
  const file = Bun.file(JEV_CACHE_PATH)
  if (!(await file.exists())) return []
  const parsed: unknown = await file.json()
  return Array.isArray(parsed) ? (parsed as JevCacheEntry[]) : []
}

/** Postgres array literal for `text[]` writes; tags carry arbitrary prose. */
function textArray(values: string[]): string {
  const quoted = values.map((v) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
  return `{${quoted.join(',')}}`
}

/**
 * Fixture messages whose cached extraction proposes an event (and no event
 * already carries the message id) get a provisional `jev` event.
 */
export async function addDemoData(sql: SQL): Promise<SimulationMeta> {
  const dataset = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })
  const resetAt = simNow(REFERENCE_DATE)

  const bookings = [...dataset.bookings, ...STORIES.map((s) => s.booking)]
  const applications = [...dataset.applications, ...STORIES.flatMap((s) => s.applications)]
  const messages = STORIES.flatMap((s) => s.messages)
  const events = [...dataset.events, ...STORIES.flatMap((s) => s.events)]

  const cacheEntries = await readJevCacheEntries()
  const extractionByMessage = new Map(
    cacheEntries.filter((e) => e.kind === 'extract').map((e) => [e.subjectId, e.answer as Extraction])
  )
  const summaryByBooking = new Map(
    summarizeCases({ bookings, applications, events, tasks: [] }, REFERENCE_DATE).map((s) => [s.bookingId, s])
  )
  const messageIdsWithEvents = new Set(events.map((e) => e.messageId).filter((id) => id != null))

  const proposals: CaseEvent[] = []
  for (const message of messages) {
    const extraction = extractionByMessage.get(message.id)
    const summary = summaryByBooking.get(message.bookingId)
    if (!extraction || !summary || messageIdsWithEvents.has(message.id)) continue
    const proposal = proposalFromExtraction(extraction, message, summary)
    if (proposal) proposals.push({ ...proposal, id: newId('EV'), recordedAt: resetAt })
  }

  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(20_260_917)`
    const seeded = await tx`select exists(select 1 from bookings where demo_seed) as seeded`
    if (seeded[0]?.seeded) return
    // Multi-row inserts: one round trip per chunk instead of one per row.
    const chunks = <T>(rows: T[]) => {
      const out: T[][] = []
      for (let i = 0; i < rows.length; i += 500) out.push(rows.slice(i, i + 500))
      return out
    }
    for (const chunk of chunks(
      bookings.map((b) => ({
        id: b.id,
        project: b.project,
        unit: b.unit,
        price_rm: b.priceRm,
        booking_date: b.bookingDate,
        // Synthetic creation times follow the fixture's original recorded booking event.
        created_at: events.find((e) => e.bookingId === b.id && e.kind === 'booked')?.recordedAt ?? null,
        buyer: b.buyer,
        sales_owner: b.salesOwner,
        loan_owner: b.loanOwner,
        legal_firm: b.legalFirm,
        demo_seed: true
      }))
    )) {
      await tx`insert into bookings ${tx(chunk)}`
    }
    for (const chunk of chunks(
      applications.map((a) => ({ id: a.id, booking_id: a.bookingId, bank: a.bank, banker: a.banker, demo_seed: true }))
    )) {
      await tx`insert into loan_applications ${tx(chunk)}`
    }
    for (const chunk of chunks(
      messages.map((m) => ({
        id: m.id,
        booking_id: m.bookingId,
        sender_role: m.senderRole,
        sender_name: m.senderName,
        language: m.language,
        sent_at: m.sentAt,
        body: m.body,
        origin: m.origin,
        demo_seed: true
      }))
    )) {
      await tx`insert into messages ${tx(chunk)}`
    }
    for (const chunk of chunks(
      [...events, ...proposals].map((e) => ({
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
        note: e.note,
        demo_seed: true
      }))
    )) {
      await tx`insert into events ${tx(chunk)}`
    }
    for (const chunk of chunks(
      PLAYBOOKS.map((p) => ({
        id: p.id,
        title: p.title,
        situation: p.situation,
        evidence: p.evidence,
        action: p.action,
        rationale: p.rationale,
        limits: p.limits,
        outcome: p.outcome,
        author: p.author,
        reviewer: p.reviewer,
        reviewed_on: p.reviewedOn,
        status: p.status,
        tags: textArray(p.tags),
        demo_seed: true
      }))
    )) {
      await tx`insert into playbooks ${tx(chunk)}`
    }
    for (const chunk of chunks(
      cacheEntries.map((e) => ({
        kind: e.kind,
        subject_id: e.subjectId,
        input_hash: e.inputHash,
        answer: e.answer,
        source: 'precomputed' as const,
        latency_ms: e.latencyMs,
        demo_seed: true
      }))
    )) {
      await tx`insert into jev_answers ${tx(chunk)}`
    }
    // Keep the display time in the simulation's fixed reference timeline.
    await tx`insert into meta (key, value) values
      ('seed', to_jsonb(${DEFAULT_SEED}::int)),
      ('referenceDate', to_jsonb(${REFERENCE_DATE}::text)),
      ('resetAt', to_jsonb(${resetAt}::text)),
      ('resetAtWall', to_jsonb(${new Date().toISOString()}::text))
      on conflict (key) do update set value = excluded.value`
  })

  return { seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, resetAt }
}

/**
 * Removes the demo dataset and nothing else: every demo booking with the rows
 * attached to it (applications, messages, events, their reviews, tasks and the
 * Jev answers about them), the demo playbooks and the demo `meta` keys.
 * Bookings a visitor added, and anything attached to one, are untouched. Work
 * a visitor did *on* a demo booking goes with the demo case, so Add Demo Data
 * can restore the whole dataset afterwards.
 */
export async function deleteDemoData(sql: SQL): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(20_260_917)`
    // Jev answers and reviews first: they key off ids the deletes below remove.
    // A visitor's own message or update on a demo booking cascades away with
    // it, so its answers and reviews are matched by booking, not by flag.
    await tx`delete from jev_answers where demo_seed
      or subject_id in (select id from bookings where demo_seed)
      or subject_id in (select m.id from messages m join bookings b on b.id = m.booking_id where b.demo_seed)
      or subject_id in (select e.id from events e join bookings b on b.id = e.booking_id where b.demo_seed)`
    await tx`delete from event_reviews where event_id in
      (select e.id from events e join bookings b on b.id = e.booking_id where b.demo_seed)`
    await tx`delete from events where demo_seed`
    await tx`delete from messages where demo_seed`
    await tx`delete from tasks where booking_id in (select id from bookings where demo_seed)`
    await tx`delete from loan_applications where booking_id in (select id from bookings where demo_seed)`
    await tx`delete from bookings where demo_seed`
    await tx`delete from playbooks where demo_seed`
    // Only the four keys Add Demo Data writes; any other key is the app's.
    await tx`delete from meta where key in ('seed', 'referenceDate', 'resetAt', 'resetAtWall')`
  })
}
