import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../record.mjs', import.meta.url), 'utf8')
const contract = await import('../contract.mjs').catch(() => null)

test('a failed or incomplete walk exits non-zero after preserving diagnostics', () => {
  assert.match(source, /walkError/)
  assert.match(source, /process\.exitCode = 1/)
  assert.match(source, /if \(!warmed\).*throw/s)
})

test('the runner requires a disposable target and adds seed data only when empty', () => {
  assert.match(source, /DEMO_WEB must name a disposable recording deployment/)
  assert.match(source, /shared Mortar deployment cannot be used/)
  assert.match(source, /initialSnapshot\.bookings/)
  assert.match(source, /api\/admin\/demo\/add/)
  assert.doesNotMatch(source, /api\/admin\/reset/)
})

test('capture contract requires every narrated beat exactly once and in order', () => {
  assert.ok(contract, 'contract.mjs must expose the required capture sequence')
  const expected = [
    'chase_queue',
    'chase_task',
    'case_overview',
    'case_risk',
    'banker_message',
    'doc_pending',
    'buyer_reply',
    'case_cleared',
    'playbooks',
    'stale_unknown',
    'legal_persona',
    'forecast',
    'end'
  ]
  assert.deepEqual(contract.REQUIRED_BEATS, expected)
  const filmed = Object.fromEntries(expected.map((name) => [name, 1]))
  assert.equal(
    contract.auditCapture(
      expected.map((name, index) => ({ name, ms: index * 1000 })),
      filmed
    ).complete,
    true
  )
  assert.equal(contract.auditCapture([{ name: 'chase_queue', ms: 0 }], { chase_queue: 1 }).complete, false)
  assert.equal(
    contract.auditCapture(expected.map((name, index) => ({ name, ms: index * 1000 })).reverse(), filmed).complete,
    false
  )
})
