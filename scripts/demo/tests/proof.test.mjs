import assert from 'node:assert/strict'
import test from 'node:test'

const proof = await import('../proof.mjs')

const SEEDED_MESSAGES = Array.from({ length: 27 }, (_, i) => ({
  id: `MSG-${9000 + i}`,
  bookingId: i < 4 ? 'BK-9001' : 'BK-9002'
}))
SEEDED_MESSAGES[0].id = 'MSG-9001-1'
SEEDED_MESSAGES[1].id = 'MSG-9001-2'
SEEDED_MESSAGES[2].id = 'MSG-9001-3'
SEEDED_MESSAGES[3].id = 'MSG-9001-4'

const cleanEvents = [
  {
    id: 'EV-9001-1',
    bookingId: 'BK-9001',
    kind: 'documents_requested',
    document: 'payslip',
    status: 'provisional',
    source: 'jev',
    messageId: 'MSG-9001-4'
  }
]

const fetchJson = (payload) => async () => ({ ok: true, json: async () => payload })

const cleanSnapshot = () => ({ messages: SEEDED_MESSAGES, events: cleanEvents, tasks: [] })

test('the canonical reset passes the clean-seed check', async () => {
  const result = await proof.verifyCleanSeed('https://mortar.example', { fetchImpl: fetchJson(cleanSnapshot()) })
  assert.equal(result.clean, true)
  assert.deepEqual(result.problems, [])
})

test('a leftover task or extra message fails the check', async () => {
  const dirty = cleanSnapshot()
  dirty.tasks = [{ id: 'T-1', bookingId: 'BK-9001' }]
  dirty.messages = [...dirty.messages, { id: 'MSG-live', bookingId: 'BK-9001' }]
  const result = await proof.verifyCleanSeed('https://mortar.example', { fetchImpl: fetchJson(dirty) })
  assert.equal(result.clean, false)
  assert.ok(result.problems.some((p) => p.includes('tasks')))
  assert.ok(result.problems.some((p) => p.includes('27')))
})

test('a confirmed or consumed proposal fails the check', async () => {
  const confirmed = cleanSnapshot()
  confirmed.events = [{ ...cleanEvents[0], status: 'confirmed' }]
  const a = await proof.verifyCleanSeed('https://mortar.example', { fetchImpl: fetchJson(confirmed) })
  assert.equal(a.clean, false)

  const received = cleanSnapshot()
  received.events = [
    ...received.events,
    { id: 'EV-x', bookingId: 'BK-9001', kind: 'documents_received', status: 'provisional', source: 'jev' }
  ]
  const b = await proof.verifyCleanSeed('https://mortar.example', { fetchImpl: fetchJson(received) })
  assert.equal(b.clean, false)
  assert.ok(b.problems.some((p) => p.includes('documents_received')))
})

test('an unreachable deployment reports instead of throwing', async () => {
  const result = await proof.verifyCleanSeed('https://mortar.example', {
    fetchImpl: async () => {
      throw new Error('connection refused')
    }
  })
  assert.equal(result.clean, false)
  assert.ok(result.problems[0].includes('unreachable'))
})
