/**
 * Row-mapping tests: Bun's SQL driver hands back `Date` for `date` and
 * `timestamptz`, `string[]` for `text[]`, and jsonb either parsed or as raw
 * text — every shape has to land on the contract type.
 */
import { describe, expect, test } from 'bun:test'
import {
  isoDate,
  isoDateTime,
  jsonb,
  rowToBooking,
  rowToEvent,
  rowToJevAnswer,
  rowToMessage,
  rowToPlaybook,
  rowToTask,
  rowsToMeta
} from '../mappers'

describe('isoDate', () => {
  test('Date maps to YYYY-MM-DD', () => {
    expect(isoDate(new Date('2026-09-18T00:00:00Z'))).toBe('2026-09-18')
  })
  test('text passes through', () => {
    expect(isoDate('2026-09-18')).toBe('2026-09-18')
  })
})

describe('isoDateTime', () => {
  test('Date maps to +08:00 wall time', () => {
    expect(isoDateTime(new Date('2026-09-18T04:30:00Z'))).toBe('2026-09-18T12:30:00+08:00')
  })
  test('fractional seconds are dropped', () => {
    expect(isoDateTime(new Date('2026-09-18T04:30:00.900Z'))).toBe('2026-09-18T12:30:00+08:00')
  })
  test('text passes through', () => {
    expect(isoDateTime('2026-09-18T12:30:00+08:00')).toBe('2026-09-18T12:30:00+08:00')
  })
})

describe('jsonb', () => {
  test('raw text is parsed', () => {
    expect(jsonb<unknown>('{"a":1}')).toEqual({ a: 1 })
  })
  test('already-parsed values pass through', () => {
    expect(jsonb<unknown>({ a: 1 })).toEqual({ a: 1 })
    expect(jsonb<number>(20260918)).toBe(20260918)
  })
})

test('rowToBooking parses the buyer jsonb and the date', () => {
  const booking = rowToBooking({
    id: 'BK-9001',
    project: 'Aster Heights',
    unit: 'A-12-03',
    price_rm: 550000,
    booking_date: new Date('2026-09-02T00:00:00Z'),
    buyer: '{"name":"Raymond","age":31}',
    sales_owner: 'Nurul Aina',
    loan_owner: 'Tan Mei Ling',
    legal_firm: 'Khor & Associates'
  })
  expect(booking.bookingDate).toBe('2026-09-02')
  expect(booking.buyer.name).toBe('Raymond')
  expect(booking.buyer.age).toBe(31)
})

test('rowToMessage formats sent_at and keeps the enums', () => {
  const message = rowToMessage({
    id: 'MSG-1',
    booking_id: 'BK-9001',
    sender_role: 'buyer',
    sender_name: 'Raymond',
    language: 'mixed',
    sent_at: new Date('2026-09-17T13:05:00Z'),
    body: 'Salam',
    origin: 'fixture'
  })
  expect(message.sentAt).toBe('2026-09-17T21:05:00+08:00')
  expect(message.senderRole).toBe('buyer')
  expect(message.origin).toBe('fixture')
})

test('rowToEvent keeps nulls as nulls', () => {
  const event = rowToEvent({
    id: 'EV-1',
    booking_id: 'BK-9001',
    application_id: null,
    track: 'loan',
    kind: 'documents_requested',
    occurred_at: '2026-09-12T11:00:00+08:00',
    recorded_at: '2026-09-12T11:05:00+08:00',
    reported_by: 'Jev',
    verified_by: null,
    status: 'provisional',
    source: 'jev',
    message_id: 'MSG-1',
    document: 'payslip',
    note: null
  })
  expect(event.applicationId).toBeNull()
  expect(event.verifiedBy).toBeNull()
  expect(event.messageId).toBe('MSG-1')
  expect('seq' in event).toBe(false)
})

test('rowToEvent carries the storage order, which bigint may send as text', () => {
  const row = {
    id: 'EV-1',
    booking_id: 'BK-9001',
    application_id: null,
    track: 'loan',
    kind: 'documents_requested',
    occurred_at: '2026-09-12T11:00:00+08:00',
    recorded_at: '2026-09-12T11:05:00+08:00',
    reported_by: 'Tan',
    verified_by: 'Tan',
    status: 'confirmed',
    source: 'staff',
    message_id: null,
    document: 'payslip',
    note: null
  }
  expect(rowToEvent({ ...row, seq: '42' }).seq).toBe(42)
  expect(rowToEvent({ ...row, seq: 42n }).seq).toBe(42)
})

test('rowToPlaybook maps the tags array and reviewed_on date', () => {
  const playbook = rowToPlaybook({
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
    reviewed_on: new Date('2026-09-01T00:00:00Z'),
    status: 'approved',
    tags: ['slip gaji', 'LO']
  })
  expect(playbook.tags).toEqual(['slip gaji', 'LO'])
  expect(playbook.reviewedOn).toBe('2026-09-01')
})

test('rowToTask keeps a null completed_at', () => {
  const task = rowToTask({
    id: 'TSK-1',
    booking_id: 'BK-9001',
    action: 'call_buyer',
    title: 'Call',
    owner_role: 'sales',
    owner_name: 'Nurul Aina',
    due_on: '2026-09-19',
    status: 'open',
    origin: 'staff',
    created_at: '2026-09-18T09:00:00+08:00',
    completed_at: null
  })
  expect(task.completedAt).toBeNull()
  expect(task.dueOn).toBe('2026-09-19')
})

test('rowToJevAnswer parses the answer payload and keeps the input hash', () => {
  const row = rowToJevAnswer({ kind: 'extract', subject_id: 'MSG-1', input_hash: 'h1', answer: '{"confidence":0.9}' })
  expect(row.kind).toBe('extract')
  expect(row.inputHash).toBe('h1')
  expect(row.answer).toEqual({ confidence: 0.9 } as object)
})

describe('rowsToMeta', () => {
  test('null while the seed row is absent', () => {
    expect(rowsToMeta([])).toBeNull()
    expect(rowsToMeta([{ key: 'referenceDate', value: '"2026-09-18"' }])).toBeNull()
  })

  test('assembles SimulationMeta from jsonb values, with the real clock time of the reset', () => {
    const meta = rowsToMeta([
      { key: 'seed', value: '20260918' },
      { key: 'referenceDate', value: '"2026-09-18"' },
      { key: 'resetAt', value: '"2026-09-18T12:00:00+08:00"' },
      { key: 'resetAtWall', value: '"2026-09-23T04:00:00.000Z"' }
    ])
    expect(meta).toEqual({
      seed: 20260918,
      referenceDate: '2026-09-18',
      resetAt: '2026-09-18T12:00:00+08:00',
      resetAtWall: '2026-09-23T04:00:00.000Z'
    })
  })

  test('a missing resetAt or resetAtWall stays null', () => {
    const meta = rowsToMeta([
      { key: 'seed', value: 20260918 },
      { key: 'referenceDate', value: '2026-09-18' }
    ])
    expect(meta?.resetAt).toBeNull()
    expect(meta?.resetAtWall).toBeNull()
  })
})
