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
import { EventSettledError, ImportMovedOnError, OpenApplicationError, UnitHeldError, createDatabase } from '../index'
import { applySchema } from '../reset'

const DATABASE_URL = process.env.DATABASE_URL

describe.skipIf(!DATABASE_URL)('database integration', () => {
  // Guarded by skipIf: the callback body still runs during collection, so only
  // construct the client when the URL is present.
  const sql = DATABASE_URL ? new SQL(DATABASE_URL) : (null as unknown as SQL)
  const db = createDatabase(sql)

  afterAll(async () => {
    await sql`delete from event_reviews where event_id like 'W2TEST-%'`
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
      'jev_answers',
      'event_reviews'
    ]) {
      expect(tables).toContain(table)
    }
  })

  test('hasBookings is true once any booking exists', async () => {
    // The shared database always carries fixtures and other agents' test
    // rows, so this only pins the happy path; the empty-database branch is
    // exercised at boot in server/src/index.ts, which needs a database this
    // shared instance never is.
    expect(await db.hasBookings()).toBe(true)
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
    const reviewed = await db.reviewEvent('W2TEST-EV', 'confirmed', 'Tan Mei Ling', '2026-09-18T09:00:00+08:00')
    expect(reviewed?.status).toBe('confirmed')
    expect(reviewed?.verifiedBy).toBe('Tan Mei Ling')
    expect(await db.getEvent('W2TEST-EV')).toEqual(reviewed)
    expect(await db.getEvent('W2TEST-NONE')).toBeNull()
    expect(await db.replaceProposal('W2TEST-MSG', null)).toBeNull()
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

  describe('event order', () => {
    // Rows of its own under `FXORD-`, so other work sharing the database is never touched.
    const bookingId = 'FXORD-BK'
    const staffEvent = (id: string, kind: CaseEvent['kind']): CaseEvent => ({
      id,
      bookingId,
      applicationId: null,
      track: 'loan',
      kind,
      // Two updates back-dated to one day land at the same time.
      occurredAt: '2026-09-16T12:00:00+08:00',
      recordedAt: '2026-09-18T09:30:00+08:00',
      reportedBy: 'Tan Mei Ling',
      verifiedBy: 'Tan Mei Ling',
      status: 'confirmed',
      source: 'staff',
      messageId: null,
      document: 'payslip',
      note: null
    })

    afterAll(async () => {
      await sql`delete from events where booking_id = ${bookingId}`
      await sql`delete from bookings where id = ${bookingId}`
    })

    test('equal times come back in the order they were stored, and applySchema stays idempotent', async () => {
      await applySchema(sql)
      const sequences =
        await sql`select count(*)::int as n from pg_class where relkind = 'S' and relname like 'events_seq%'`
      expect(sequences[0].n).toBe(1)
      await sql`insert into bookings (id, project, unit, price_rm, booking_date, buyer, sales_owner, loan_owner, legal_firm)
        values (${bookingId}, 'FXORD Project', 'FX-01-01', 500000, '2026-09-01',
          ${{ name: 'Test Buyer', ic: 'x', phone: 'x', age: 30, grossMonthlyIncomeRm: 5000, monthlyCommitmentsRm: 100, propertiesOwned: 0 }},
          'Sales', 'Loan', 'Firm')`
      // Entered in this order; the ids sort the other way.
      await db.insertEvent(staffEvent('FXORD-EV-Z', 'documents_requested'))
      await db.insertEvent(staffEvent('FXORD-EV-A', 'documents_received'))

      const own = await db.eventsForBooking(bookingId)
      expect(own.map((e) => e.id)).toEqual(['FXORD-EV-Z', 'FXORD-EV-A'])
      expect(typeof own[0].seq).toBe('number')
      expect(own[1].seq ?? 0).toBeGreaterThan(own[0].seq ?? 0)
      const all = (await db.caseData()).events.filter((e) => e.bookingId === bookingId)
      expect(all.map((e) => e.id)).toEqual(['FXORD-EV-Z', 'FXORD-EV-A'])
    })
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

    test('undo never frees the booking number, and snapshots what it removed with no IC or phone', async () => {
      const [booking] = await db.importBookings(batch('F'), [draft('T-40')], booked('F'))
      await db.undoImport('W2TEST-F', 'Tan Mei Ling', '2026-09-18T10:05:00+08:00')

      const [importRow] = await sql`select removed from imports where id = 'W2TEST-F'`
      // jsonb comes back parsed for object writes but as raw text otherwise (see db/mappers.ts).
      const removed = (
        typeof importRow.removed === 'string' ? JSON.parse(importRow.removed) : importRow.removed
      ) as Array<Record<string, unknown>>
      expect(removed).toEqual([{ id: booking.id, unit: 'T-40', project, buyerName: 'Test Buyer', priceRm: 600000 }])
      const serialized = JSON.stringify(removed)
      expect(serialized).not.toContain('900514-00-0001') // IC
      expect(serialized).not.toContain('+60 00-000 0001') // phone

      // A later import numbers past the undone booking, never reusing it.
      const [again] = await db.importBookings(batch('G'), [draft('T-41')], booked('G'))
      const undoneNumber = Number(booking.id.slice(3))
      const laterNumber = Number(again.id.slice(3))
      expect(laterNumber).toBeGreaterThan(undoneNumber)
    })

    test('undoImport locks its bookings before checking whether they moved on, not just before the eventual delete', async () => {
      // A blind concurrent race (fire undoImport and a racing insert together
      // and hope to land inside the old window) is too fast and too flaky in
      // practice — `undoImport`'s final `delete from bookings` needs the same
      // kind of lock a racing insert's foreign key check does, so the two
      // block on each other eventually either way. What the fix changes is
      // *when* undo joins that queue: with the fix, undo queues immediately
      // (its own `select ... for update`), before its moved-on check runs; without
      // it, undo's moved-on check is a plain select that never waits, so undo
      // races straight through and only queues later, at the delete — giving
      // a racing insert every chance to land first, be cascade-deleted, and
      // still have already told its caller "200".
      //
      // This holds one booking row locked externally first (as a racing
      // insert's own FK check would), starts both undo and a real insert
      // referencing it while the hold is up, then releases: with the fix,
      // undo is already queued for the very same lock, so it and the insert
      // are strictly ordered — one wins outright, the other is refused or
      // fails cleanly, but never both "succeed" with the row now missing.
      const [booking] = await db.importBookings(batch('I'), [draft('T-60')], booked('I'))

      let releaseLock: (() => void) | undefined
      const locked = new Promise<void>((resolveLocked) => {
        void sql.begin(async (tx) => {
          await tx`select id from bookings where id = ${booking.id} for update`
          resolveLocked()
          await new Promise<void>((resolveHold) => (releaseLock = resolveHold))
        })
      })
      await locked

      const undoPromise = db.undoImport('W2TEST-I', 'Tan Mei Ling', '2026-09-18T10:20:00+08:00')
      const insertPromise = db.insertTask({
        id: 'W2TEST-TSK-I',
        bookingId: booking.id,
        action: 'call_buyer',
        title: 'Call',
        ownerRole: 'sales',
        ownerName: 'Nurul Aina',
        dueOn: '2026-09-19',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-18T09:10:00+08:00',
        completedAt: null
      })
      // Give both a moment to reach Postgres and queue behind the held lock.
      await new Promise((r) => setTimeout(r, 200))
      releaseLock?.()

      const [undoResult, insertResult] = await Promise.allSettled([undoPromise, insertPromise])
      // The bug: both could "succeed", with the task cascade-deleted right
      // after its own caller already got a 200 for it.
      const bothSucceeded = undoResult.status === 'fulfilled' && insertResult.status === 'fulfilled'
      expect(bothSucceeded).toBe(false)
      if (insertResult.status === 'fulfilled') {
        expect(undoResult.status).toBe('rejected')
        expect((undoResult as PromiseRejectedResult).reason).toBeInstanceOf(ImportMovedOnError)
      }
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

  describe('write rules', () => {
    // Rows of its own under `WRTEST-` (and the `WRTEST Project` for imports),
    // so parallel work on the shared database is never touched.
    const bookingId = 'WRTEST-BK'
    const messageId = 'WRTEST-MSG'
    const project = 'WRTEST Project'
    const buyer = {
      name: 'Test Buyer',
      ic: '900514-00-0001',
      phone: '+60 00-000 0001',
      age: 36,
      grossMonthlyIncomeRm: 8000,
      monthlyCommitmentsRm: 0,
      propertiesOwned: 0
    }
    const event = (id: string, extra: Partial<CaseEvent> = {}): CaseEvent => ({
      id,
      bookingId,
      applicationId: null,
      track: 'loan',
      kind: 'documents_received',
      occurredAt: '2026-09-17T21:05:00+08:00',
      recordedAt: '2026-09-17T21:10:00+08:00',
      reportedBy: 'Jev',
      verifiedBy: null,
      status: 'provisional',
      source: 'jev',
      messageId,
      document: 'payslip',
      note: '90% Probability',
      ...extra
    })
    const settle = (work: Promise<unknown>) =>
      work.then(
        () => 'stored',
        (e: unknown) => e
      )

    afterAll(async () => {
      await sql`delete from event_reviews where event_id like 'WRTEST-%'`
      await sql`delete from bookings where id = ${bookingId} or project = ${project}`
      await sql`delete from imports where id like 'WRTEST-%'`
    })

    test('sets up a booking with a message', async () => {
      await sql`insert into bookings (id, project, unit, price_rm, booking_date, buyer, sales_owner, loan_owner, legal_firm)
        values (${bookingId}, 'WRTEST Other', 'WR-01-01', 500000, '2026-09-01', ${buyer}, 'Sales', 'Loan', 'Firm')`
      await db.insertMessage({
        id: messageId,
        bookingId,
        senderRole: 'buyer',
        senderName: 'Test Buyer',
        language: 'en',
        sentAt: '2026-09-17T21:05:00+08:00',
        body: 'Payslip sent',
        origin: 'live'
      })
      expect(await db.getBooking(bookingId)).not.toBeNull()
    })

    test('two reviews at once: one lands and is kept, the other finds it settled', async () => {
      await db.insertEvent(event('WRTEST-EV-1'))
      const results = await Promise.all([
        settle(db.reviewEvent('WRTEST-EV-1', 'confirmed', 'Tan Mei Ling', '2026-09-18T09:00:00+08:00')),
        settle(db.reviewEvent('WRTEST-EV-1', 'superseded', 'Nurul Aina', '2026-09-18T09:00:01+08:00'))
      ])
      expect(results.filter((r) => r === 'stored')).toHaveLength(1)
      const refused = results.find((r) => r !== 'stored')
      expect(refused).toBeInstanceOf(EventSettledError)
      const reviews =
        await sql`select from_status, to_status, reviewer from event_reviews where event_id = 'WRTEST-EV-1'`
      expect(reviews).toHaveLength(1)
      expect(reviews[0].from_status).toBe('provisional')
      expect((await db.getEvent('WRTEST-EV-1'))?.status).toBe(reviews[0].to_status)
      expect((await db.getEvent('WRTEST-EV-1'))?.verifiedBy).toBe(reviews[0].reviewer)
    })

    test('a staff update is never reviewed, and a missing one is null', async () => {
      const cancelled = event('WRTEST-EV-2', {
        track: 'sales',
        kind: 'cancelled',
        reportedBy: 'Tan Mei Ling',
        verifiedBy: 'Tan Mei Ling',
        status: 'confirmed',
        source: 'staff',
        messageId: null,
        document: null,
        note: null
      })
      await db.insertEvent(cancelled)
      const outcome = await settle(
        db.reviewEvent('WRTEST-EV-2', 'superseded', 'Nurul Aina', '2026-09-18T09:00:00+08:00')
      )
      expect(outcome).toBeInstanceOf(EventSettledError)
      // Stored events also carry their storage `seq` (fx/order-clock).
      expect(await db.getEvent('WRTEST-EV-2')).toMatchObject(cancelled)
      expect(await sql`select 1 from event_reviews where event_id = 'WRTEST-EV-2'`).toHaveLength(0)
      expect(await db.reviewEvent('WRTEST-EV-NONE', 'confirmed', 'x', '2026-09-18T09:00:00+08:00')).toBeNull()
      await sql`delete from events where id = 'WRTEST-EV-2'`
    })

    test('re-reads at once leave one proposal standing', async () => {
      await sql`delete from events where message_id = ${messageId}`
      const stored = await Promise.all([1, 2, 3, 4].map((n) => db.replaceProposal(messageId, event(`WRTEST-EV-P${n}`))))
      expect(stored.every((e) => e !== null)).toBe(true)
      const standing = await sql`select id from events where message_id = ${messageId} and status = 'provisional'`
      expect(standing).toHaveLength(1)
      // Once one is confirmed, a re-read supersedes nothing confirmed and adds nothing.
      await sql`update events set status = 'confirmed' where id = ${String(standing[0].id)}`
      expect(await db.replaceProposal(messageId, event('WRTEST-EV-P5'))).toBeNull()
      expect(await db.getEvent('WRTEST-EV-P5')).toBeNull()
    })

    test('a retried submission to a bank still deciding is refused, even at once', async () => {
      const submit = (id: string, bank: string) =>
        settle(
          db.insertApplication(
            { id, bookingId, bank, banker: 'Lim Wei Jie' },
            event(`${id}-EV`, {
              applicationId: id,
              kind: 'loan_submitted',
              reportedBy: 'Tan Mei Ling',
              verifiedBy: 'Tan Mei Ling',
              status: 'confirmed',
              source: 'staff',
              messageId: null,
              document: null,
              note: null
            })
          )
        )
      const results = await Promise.all([
        submit('WRTEST-APP-1', 'Harbour Bank'),
        submit('WRTEST-APP-2', ' harbour BANK ')
      ])
      expect(results.filter((r) => r === 'stored')).toHaveLength(1)
      expect(results.find((r) => r !== 'stored')).toBeInstanceOf(OpenApplicationError)
      const apps = await sql`select id from loan_applications where booking_id = ${bookingId}`
      expect(apps).toHaveLength(1)

      // A rejection closes the first application; the bank can then be tried again.
      await db.insertEvent(
        event('WRTEST-EV-REJ', {
          applicationId: String(apps[0].id),
          kind: 'loan_rejected',
          status: 'confirmed',
          source: 'staff',
          messageId: null,
          document: null
        })
      )
      expect(await submit('WRTEST-APP-3', 'Harbour Bank')).toBe('stored')
    })

    test('undo counts a second booked event as the booking moving on', async () => {
      const booked = (booking: Booking, id: string): CaseEvent => ({
        ...event(id, { bookingId: booking.id }),
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
        note: 'Imported From WRTEST'
      })
      const [booking] = await db.importBookings(
        { id: 'WRTEST-IMP', source: 'wrtest.csv', reportedBy: 'Tan Mei Ling', createdAt: '2026-09-18T09:00:00+08:00' },
        [
          {
            project,
            unit: 'WR-01',
            priceRm: 600000,
            bookingDate: '2026-09-01',
            buyer,
            salesOwner: 'Unassigned',
            loanOwner: 'Tan Mei Ling',
            legalFirm: 'Unassigned'
          }
        ],
        (b) => booked(b, `WRTEST-EV-BOOKED-${b.id}`)
      )
      await db.insertEvent({ ...booked(booking, 'WRTEST-EV-BOOKED-AGAIN'), note: 'Booked again by hand' })
      const outcome = await settle(db.undoImport('WRTEST-IMP', 'Tan Mei Ling', '2026-09-18T10:00:00+08:00'))
      expect(outcome).toBeInstanceOf(ImportMovedOnError)
      expect(await db.getBooking(booking.id)).not.toBeNull()
    })
  })
})
