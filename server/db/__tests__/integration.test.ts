/**
 * Integration tests against the live Neon database — skipped when
 * `DATABASE_URL` is absent (CI has none). Covers `applySchema` and the
 * round-trip of every writable path in `db/index.ts`; test rows carry
 * `W2TEST-` ids and are deleted afterwards. The full `resetDatabase` path
 * needs lane W1's generator and is verified end to end once it lands.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { SQL } from 'bun'
import { createDatabase } from '../index'
import { applySchema } from '../reset'

const DATABASE_URL = process.env.DATABASE_URL

describe.skipIf(!DATABASE_URL)('database integration', () => {
  // Guarded by skipIf: the callback body still runs during collection, so only
  // construct the client when the URL is present.
  const sql = DATABASE_URL ? new SQL(DATABASE_URL) : (null as unknown as SQL)
  const db = createDatabase(sql)

  afterAll(async () => {
    await sql`delete from events where booking_id = 'W2TEST-BK'`
    await sql`delete from tasks where booking_id = 'W2TEST-BK'`
    await sql`delete from messages where booking_id = 'W2TEST-BK'`
    await sql`delete from bookings where id = 'W2TEST-BK'`
    await sql`delete from jev_answers where subject_id like 'W2TEST-%'`
    await sql.end()
  })

  test('applySchema creates every table', async () => {
    await applySchema(sql)
    const rows = await sql`select tablename from pg_tables where schemaname = 'public' order by 1`
    const tables = rows.map((r: Record<string, unknown>) => String(r.tablename))
    for (const table of [
      'meta',
      'bookings',
      'loan_applications',
      'messages',
      'events',
      'playbooks',
      'tasks',
      'jev_answers'
    ]) {
      expect(tables).toContain(table)
    }
  })

  test('booking insert maps jsonb and dates back to the contract', async () => {
    await sql`insert into bookings (id, project, unit, price_rm, booking_date, buyer, sales_owner, loan_owner, legal_firm)
      values ('W2TEST-BK', 'Test Project', 'X-01-01', 400000, '2026-09-01',
        ${{ name: 'Test Buyer', ic: 'x', phone: 'x', age: 30, grossMonthlyIncomeRm: 5000, monthlyCommitmentsRm: 100, propertiesOwned: 0 }},
        'Sales', 'Loan', 'Firm')`
    const booking = await db.getBooking('W2TEST-BK')
    expect(booking?.buyer.name).toBe('Test Buyer')
    expect(booking?.bookingDate).toBe('2026-09-01')
    expect(booking?.priceRm).toBe(400000)
  })

  test('messages, events and tasks round-trip through the Database interface', async () => {
    await db.insertMessage({
      id: 'W2TEST-MSG',
      bookingId: 'W2TEST-BK',
      senderRole: 'buyer',
      senderName: 'Test Buyer',
      language: 'ms',
      sentAt: '2026-09-17T21:05:00+08:00',
      body: 'Salam',
      origin: 'live'
    })
    expect((await db.getMessage('W2TEST-MSG'))?.language).toBe('ms')
    expect((await db.messagesForBooking('W2TEST-BK'))[0]?.sentAt).toBe('2026-09-17T21:05:00+08:00')

    await db.insertEvent({
      id: 'W2TEST-EV',
      bookingId: 'W2TEST-BK',
      applicationId: null,
      track: 'loan',
      kind: 'documents_requested',
      occurredAt: '2026-09-17T21:10:00+08:00',
      recordedAt: '2026-09-17T21:10:00+08:00',
      reportedBy: 'Jev',
      verifiedBy: null,
      status: 'provisional',
      source: 'jev',
      messageId: 'W2TEST-MSG',
      document: 'payslip',
      note: '90% Probability'
    })
    const reviewed = await db.reviewEvent('W2TEST-EV', 'confirmed', 'Tan Mei Ling')
    expect(reviewed?.status).toBe('confirmed')
    expect(reviewed?.verifiedBy).toBe('Tan Mei Ling')
    await db.supersedePendingProposals('W2TEST-MSG')
    expect((await db.eventsForMessage('W2TEST-MSG'))[0].status).toBe('confirmed')

    await db.insertTask({
      id: 'W2TEST-TSK',
      bookingId: 'W2TEST-BK',
      action: 'call_buyer',
      title: 'Call',
      ownerRole: 'sales',
      ownerName: 'Nurul Aina',
      dueOn: '2026-09-19',
      status: 'open',
      origin: 'staff',
      createdAt: '2026-09-18T09:00:00+08:00',
      completedAt: null
    })
    const done = await db.updateTaskStatus('W2TEST-TSK', 'done', '2026-09-18T12:00:00+08:00')
    expect(done?.completedAt).toBe('2026-09-18T12:00:00+08:00')
    expect(await db.updateTaskStatus('W2TEST-NONE', 'done', null)).toBeNull()
  })

  test('jevGet serves the exact hash then the latest for the subject as stale', async () => {
    await db.jevPut({
      kind: 'signals',
      subjectId: 'W2TEST-BK',
      inputHash: 'h1',
      answer: { v: 1 },
      source: 'precomputed',
      latencyMs: 10
    })
    await db.jevPut({
      kind: 'signals',
      subjectId: 'W2TEST-BK',
      inputHash: 'h2',
      answer: { v: 2 },
      source: 'live',
      latencyMs: 20
    })
    expect(await db.jevGet('signals', 'W2TEST-BK', 'h1')).toEqual({ answer: { v: 1 }, stale: false })
    expect(await db.jevGet('signals', 'W2TEST-BK', 'h3')).toEqual({ answer: { v: 2 }, stale: true })
    expect(await db.jevGet('signals', 'W2TEST-NONE', 'h1')).toBeNull()
    const latest = await db.latestJevAnswers()
    expect(latest.find((r) => r.subjectId === 'W2TEST-BK')?.answer).toEqual({ v: 2 })
  })
})
