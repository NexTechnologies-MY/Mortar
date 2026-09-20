import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const walkSource = await readFile(new URL('../walk.mjs', import.meta.url), 'utf8')
const warmupSource = await readFile(new URL('../warmup.mjs', import.meta.url), 'utf8')
const narration = await readFile(new URL('../narration.txt', import.meta.url), 'utf8')
const walk = await import('../walk.mjs')

const WALK_BEATS = [
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
  'forecast'
]

test('the submission walk films the eight spine steps in order', () => {
  const narratedWalkBeats = narration
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('|', 1)[0].trim())
    .filter((name) => !/^s\d+$/.test(name))

  assert.deepEqual(narratedWalkBeats, WALK_BEATS)

  // Every step the spine names is on the page, driven through the real UI.
  assert.ok(walkSource.includes('mortar.persona'))
  assert.ok(walkSource.includes("'sales-admin'"))
  assert.ok(walkSource.includes('/chase'))
  assert.ok(walkSource.includes('[data-testid="chase-card-BK-9001"]'))
  assert.ok(walkSource.includes("'Create Task'"))
  assert.ok(walkSource.includes('/bookings/BK-9001'))
  assert.ok(walkSource.includes("'Loan Track'"))
  assert.ok(walkSource.includes("'Switch persona'"))
  assert.ok(walkSource.includes("'Legal Admin'"))
  assert.ok(walkSource.includes('/legal'))
  assert.ok(walkSource.includes('/forecast'))
  assert.doesNotMatch(walkSource, /scrollIntoViewIfNeeded/)
})

test('the walk shows what the spine requires beyond the numbered steps', () => {
  // The financing-risk flag and what drives it.
  assert.ok(walkSource.includes('[role="tooltip"]'))
  assert.ok(walkSource.includes('Debt Service'))
  // Stale evidence reads as unknown, not progressing or failed.
  assert.ok(walkSource.includes('#bookings-unknown-only'))
  assert.ok(walkSource.includes('No Recent Update'))
  // The banker message, the pasted Malay reply, and the two confirmations.
  assert.ok(walkSource.includes('Apex credit team checking'))
  assert.ok(walkSource.includes('Payslip Outstanding'))
  assert.ok(walkSource.includes('pressSequentially'))
  assert.match(walkSource, /getByRole\('button', \{ name: 'Confirm' \}\)/g)
})

test('camera pacing clears the placeholder-voice line before the next beat', () => {
  // Measured Kokoro jf_nezumi durations for the narration.txt lines, plus the
  // scheduler's 260ms gap. Regenerate by timing `speak.py --batch` output.
  const kokoroDurationMs = {
    chase_queue: 8_000,
    chase_task: 5_397,
    case_overview: 8_896,
    case_risk: 7_723,
    banker_message: 7_467,
    doc_pending: 4_117,
    buyer_reply: 6_549,
    case_cleared: 2_112,
    playbooks: 5_333,
    stale_unknown: 5_867,
    legal_persona: 5_163,
    forecast: 8_085
  }

  for (const [beat, duration] of Object.entries(kokoroDurationMs)) {
    assert.ok(
      walk.MIN_BEAT_INTERVAL_MS[beat] >= duration + 260,
      `${beat} needs enough time for the placeholder voice before the next narration starts`
    )
  }
  assert.equal(walk.remainingBeatDelay('case_cleared', 5000), 1000)
  assert.equal(walk.remainingBeatDelay('doc_pending', 5000), 1000)
  assert.equal(walk.remainingBeatDelay('doc_pending', 7000), 0)
})

test('the warm-up refuses a dirty seed before any page is filmed', () => {
  assert.ok(warmupSource.includes('verifyCleanSeed'))
  assert.match(warmupSource, /not the clean seed/)
  assert.match(warmupSource, /\/settings/)
})
