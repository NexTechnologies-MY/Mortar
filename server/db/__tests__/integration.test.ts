/**
 * Integration tests against the live Neon database — skipped when
 * `DATABASE_URL` is absent (CI has none). Covers `applySchema` and the
 * round-trip of every writable path in `db/index.ts`; test rows carry
 * `W2TEST-` ids (imported bookings, which take real `BK-nnnn` numbers, carry
 * the `W2TEST Project`; the bank application tests use `CITEST-` ids) and are
 * deleted afterwards. The full `resetDatabase`
 * path needs lane W1's generator and is verified end to end once it lands.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { SQL } from 'bun'
import type { Booking, BookingDraft, CaseEvent } from '@mortar/core'
import { ImportMovedOnError, UnitHeldError, createDatabase } from '../index'
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

  describe('insertApplication', () => {
    // Rows of its own under `CITEST-`, so other work sharing the database is never touched.
    const bookingId = 'CITEST-BK'
    const submitted = (id: string, applicationId: string): CaseEvent => ({
      id,
      bookingId,
      applicationId,
      track: 'loan',
      kind: 'loan_submitted',
      occurredAt: '2026-09-15T12:00:00+08:00',
      recordedAt: '2026-09-18T09:30:00+08:00',
      reportedBy: 'Tan Mei Ling',
      verifiedBy: 'Tan Mei Ling',
      status: 'confirmed',
      source: 'staff',
      messageId: null,
      document: null,
      note: 'Full set of documents'
    })

    afterAll(async () => {
      await sql`delete from events where booking_id = ${bookingId}`
      await sql`delete from loan_applications where booking_id = ${bookingId}`
      await sql`delete from bookings where id = ${bookingId}`
    })

    test('stores the application and its submission, read back through the contract', async () => {
      await sql`insert into bookings (id, project, unit, price_rm, booking_date, buyer, sales_owner, loan_owner, legal_firm)
        values (${bookingId}, 'CITEST Project', 'CI-01-01', 500000, '2026-09-01',
          ${{ name: 'Test Buyer', ic: 'x', phone: 'x', age: 30, grossMonthlyIncomeRm: 5000, monthlyCommitmentsRm: 100, propertiesOwned: 0 }},
          'Sales', 'Loan', 'Firm')`
      const application = { id: 'CITEST-APP-1', bookingId, bank: 'Harbour Bank', banker: 'Lim Wei Jie' }
      await db.insertApplication(application, submitted('CITEST-EV-1', application.id))

      expect(await db.getApplication('CITEST-APP-1')).toEqual(application)
      expect(await db.getApplication('CITEST-APP-NONE')).toBeNull()
      const [event] = await sql`select * from events where id = 'CITEST-EV-1'`
      expect(event.application_id).toBe('CITEST-APP-1')
      expect(event.kind).toBe('loan_submitted')
      expect(event.status).toBe('confirmed')
      expect(new Date(event.occurred_at as string).toISOString()).toBe('2026-09-15T04:00:00.000Z')
    })

    test('stores neither row when the submission cannot be written', async () => {
      // The event id is already taken, so its insert fails inside the transaction.
      const application = { id: 'CITEST-APP-2', bookingId, bank: 'Crestline Bank', banker: 'Aida Rahman' }
      // Settled by hand, like the undo test below: `expect(...).rejects` hangs Bun 1.3.14's runner.
      const outcome = await db.insertApplication(application, submitted('CITEST-EV-1', application.id)).then(
        () => 'stored',
        () => 'refused'
      )
      expect(outcome).toBe('refused')
      expect(await db.getApplication('CITEST-APP-2')).toBeNull()
    })
  })

  describe('importBookings and undoImport', () => {
    // A project of its own, so the units never meet real ones; afterAll removes it.
    const project = 'W2TEST Project'
    const draft = (unit: string): BookingDraft => ({
      project,
      unit,
      priceRm: 600000,
      bookingDate: '2026-09-01',
      buyer: {
        name: 'Test Buyer',
        ic: '900514-00-0001',
        phone: '+60 00-000 0001',
        age: 36,
        grossMonthlyIncomeRm: 8000,
        monthlyCommitmentsRm: 0,
        propertiesOwned: 0
      },
      salesOwner: 'Unassigned',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Unassigned'
    })
    const booked =
      (tag: string) =>
      (booking: Booking): CaseEvent => ({
        id: `W2TEST-EV-${tag}-${booking.id}`,
        bookingId: booking.id,
        applicationId: null,
        track: 'sales',
        kind: 'booked',
        occurredAt: '2026-09-01T09:00:00+08:00',
        recordedAt: '2026-09-18T09:00:00+08:00',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'staff',
        messageId: null,
        document: null,
        note: 'Imported From W2TEST'
      })
    const batch = (id: string) => ({
      id: `W2TEST-${id}`,
      source: 'w2test.csv',
      reportedBy: 'Tan Mei Ling',
      createdAt: '2026-09-18T09:00:00+08:00'
    })

    afterAll(async () => {
      await sql`delete from bookings where project = ${project}`
      await sql`delete from imports where id like 'W2TEST-%'`
    })

    test('numbers after the highest BK-nnnn, records the batch, and undoes it', async () => {
      const before = await sql`select coalesce(max(substring(id from 4)::int), 0)::int as n
        from bookings where id ~ '^BK-[0-8][0-9]{3}$'`
      const next = (before[0].n as number) + 1
      const bookings = await db.importBookings(batch('A'), [draft('T-01'), draft('T-02')], booked('A'))
      expect(bookings.map((b) => b.id)).toEqual([next, next + 1].map((n) => `BK-${String(n).padStart(4, '0')}`))
      const events =
        await sql`select booking_id, kind, status from events where booking_id in ${sql(bookings.map((b) => b.id))}`
      expect(events).toHaveLength(2)

      const undoneAt = '2026-09-18T10:00:00+08:00'
      expect(await db.undoImport('W2TEST-A', 'Tan Mei Ling', undoneAt)).toEqual({ removed: bookings.map((b) => b.id) })
      expect(await db.getBooking(bookings[0].id)).toBeNull()
      // The import row stays as the record of the undo.
      const [record] = await sql`select undone_by, undone_at from imports where id = 'W2TEST-A'`
      expect(record.undone_by).toBe('Tan Mei Ling')
      expect(new Date(record.undone_at as string).toISOString()).toBe(new Date(undoneAt).toISOString())
      expect(await db.undoImport('W2TEST-A', 'Tan Mei Ling', undoneAt)).toBeNull()
    })

    test('refuses a held unit, even when two imports race for it', async () => {
      const results = await Promise.allSettled([
        db.importBookings(batch('B'), [draft('T-10')], booked('B')),
        db.importBookings(batch('C'), [draft('T-10')], booked('C'))
      ])
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
      const refused = results.find((r) => r.status === 'rejected') as PromiseRejectedResult
      expect(refused.reason).toBeInstanceOf(UnitHeldError)
      const rows = await sql`select id from bookings where project = ${project} and unit = 'T-10'`
      expect(rows).toHaveLength(1)
    })

    test('will not undo a batch whose booking has moved on', async () => {
      const [booking] = await db.importBookings(batch('D'), [draft('T-20')], booked('D'))
      await db.insertTask({
        id: 'W2TEST-TSK-D',
        bookingId: booking.id,
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
      // Settled by hand: `await expect(...).rejects` on this promise hangs Bun's
      // test runner (1.3.14) until the test times out, though the call returns.
      const outcome = await db.undoImport('W2TEST-D', 'Tan Mei Ling', '2026-09-18T10:00:00+08:00').then(
        () => 'resolved',
        (e: unknown) => (e instanceof ImportMovedOnError ? 'moved-on' : `other: ${String(e)}`)
      )
      expect(outcome).toBe('moved-on')
      expect(await db.getBooking(booking.id)).not.toBeNull()
    })
  })
})
