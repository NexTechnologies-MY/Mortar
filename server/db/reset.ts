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

/** Removes seed-owned rows while preserving visitor activity and its parent booking. */
export async function deleteDemoData(sql: SQL): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(20_260_917)`
    const baseRows = await tx`select greatest(
      140,
      coalesce((select max(substring(b.id from 4)::int) from bookings b where b.id ~ '^BK-[0-8][0-9]{3}$'), 0),
      coalesce((select max(substring(x from 4)::int) from imports i, unnest(i.booking_ids) x
        where x ~ '^BK-[0-8][0-9]{3}$'), 0)
    )::int as n`
    const base = Number(baseRows[0]?.n ?? 140)
    // Reviewing a seed proposal is visitor activity. Preserve the reviewed
    // event under a fresh id, then rehome it with other visitor updates.
    // Seed event ids remain available when demo data is added again.
    const reviewedSeedEvents = await tx`select e.id from events e where e.demo_seed and exists (
      select 1 from event_reviews r where r.event_id = e.id
    )`
    for (const event of reviewedSeedEvents) {
      const preservedId = newId('EV')
      await tx`update events set id = ${preservedId}, demo_seed = false where id = ${event.id}`
      await tx`update event_reviews set event_id = ${preservedId} where event_id = ${event.id}`
      await tx`update jev_answers set subject_id = ${preservedId}
        where subject_id = ${event.id} and not demo_seed`
    }
    // Keep the source evidence of visitor updates/reviews under fresh ids too.
    // Cloning avoids both the message FK and collisions when fixtures return.
    const visitorMessages = await tx`select m.* from messages m where m.demo_seed and exists (
      select 1 from events e where e.message_id = m.id and not e.demo_seed
    )`
    for (const message of visitorMessages) {
      const preservedId = newId('MSG')
      await tx`insert into messages (id, booking_id, sender_role, sender_name, language, sent_at, body, origin, demo_seed)
        values (${preservedId}, ${message.booking_id}, ${message.sender_role}, ${message.sender_name},
          ${message.language}, ${message.sent_at}, ${message.body}, ${message.origin}, false)`
      await tx`update events set message_id = ${preservedId} where message_id = ${message.id} and not demo_seed`
      await tx`update jev_answers set subject_id = ${preservedId}
        where subject_id = ${message.id} and not demo_seed`
    }
    const visitorParents = await tx`select b.id from bookings b where b.demo_seed and (
      exists (select 1 from messages m where m.booking_id = b.id and not m.demo_seed)
      or exists (select 1 from events e where e.booking_id = b.id and not e.demo_seed)
      or exists (select 1 from tasks t where t.booking_id = b.id and not t.demo_seed)
      or exists (select 1 from loan_applications a where a.booking_id = b.id and not a.demo_seed)
      or exists (select 1 from jev_answers j where j.subject_id = b.id and not j.demo_seed)
    ) order by b.id`
    if (base + visitorParents.length > 8999) throw new Error('no booking numbers left to preserve visitor activity')
    const rehomes = visitorParents.map((row: Record<string, unknown>, i: number) => ({
      old_id: String(row.id),
      new_id: `BK-${String(base + i + 1).padStart(4, '0')}`
    }))
    // A visitor event may refer to a seeded bank application. Clone the
    // application with a fresh id so Add Demo Data can later reuse seed ids.
    const visitorApps =
      await tx`select a.id, a.booking_id, a.bank, a.banker from loan_applications a where a.demo_seed and exists (
      select 1 from events e where e.application_id = a.id and not e.demo_seed
    )`
    if (rehomes.length) {
      await tx`create temporary table demo_booking_rehomes (old_id text primary key, new_id text not null) on commit drop`
      await tx`insert into demo_booking_rehomes ${tx(rehomes)}`
      await tx`insert into bookings (id, project, unit, price_rm, booking_date, created_at, buyer, sales_owner, loan_owner, legal_firm, demo_seed)
        select r.new_id, b.project, b.unit, b.price_rm, b.booking_date, b.created_at, b.buyer, b.sales_owner, b.loan_owner, b.legal_firm, false
        from demo_booking_rehomes r join bookings b on b.id = r.old_id`
      for (const app of visitorApps) {
        const rehome = rehomes.find((row: { old_id: string; new_id: string }) => row.old_id === app.booking_id)
        if (!rehome) throw new Error(`cannot preserve application ${app.id}`)
        const newAppId = newId('APP')
        await tx`insert into loan_applications (id, booking_id, bank, banker, demo_seed)
          values (${newAppId}, ${rehome.new_id}, ${app.bank}, ${app.banker}, false)`
        await tx`update events set application_id = ${newAppId}
          where application_id = ${app.id} and not demo_seed`
      }
      await tx`update messages m set booking_id = r.new_id from demo_booking_rehomes r
        where m.booking_id = r.old_id and not m.demo_seed`
      await tx`update events e set booking_id = r.new_id from demo_booking_rehomes r
        where e.booking_id = r.old_id and not e.demo_seed`
      await tx`update tasks t set booking_id = r.new_id from demo_booking_rehomes r
        where t.booking_id = r.old_id and not t.demo_seed`
      await tx`update loan_applications a set booking_id = r.new_id from demo_booking_rehomes r
        where a.booking_id = r.old_id and not a.demo_seed`
      await tx`update jev_answers j set subject_id = r.new_id from demo_booking_rehomes r
        where j.subject_id = r.old_id and not j.demo_seed`
    }
    await tx`delete from events where demo_seed`
    await tx`delete from messages where demo_seed`
    await tx`delete from tasks where demo_seed`
    await tx`delete from loan_applications where demo_seed`
    await tx`delete from bookings where demo_seed`
    await tx`delete from playbooks where demo_seed`
    await tx`delete from jev_answers where demo_seed`
    await tx`delete from meta`
  })
}
