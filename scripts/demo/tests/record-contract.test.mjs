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

test('the runner restores the mutated production data off camera', () => {
  // The walk creates a task, confirms two proposals and posts a message on
  // production; the runner must reset through the same /settings dialog an
  // operator uses, in a context that is not the recorded one.
  assert.match(source, /DEMO_RESET_AFTER/)
  assert.match(source, /api\/admin\/reset/)
  assert.match(source, /\/settings/)
  assert.match(source, /Reset Demo Data/)
  assert.match(source, /verifyCleanSeed/)
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
