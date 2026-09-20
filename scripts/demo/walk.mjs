// Mortar's submission walk follows one stalled booking (BK-9001) from the Sales
// Admin chase queue through a confirmed document chase to the forecast. The
// recording mutates production: it creates one task, confirms two Jev proposals
// and posts one buyer message. warmup.mjs verifies the clean seed before this
// runs and record.mjs restores it from /settings after the capture closes.

import { smoothScrollTo } from './motion.mjs'

// The buyer's Malay reply pasted into the case's Add Message form. Jev reads it
// live and proposes `documents_received · payslip`; the exact wording matters
// because walk locators and narration both refer to it.
export const BUYER_REPLY = 'Hi Nurul, slip gaji 3 bulan dah saya hantar ke Mei Ling tadi. Dokumen semua lengkap ya.'

// Minimum wall-clock gap between consecutive marks, measured against the
// default Kokoro placeholder voice so each narration line finishes inside its
// own picture. Slow page work naturally counts toward the interval; fast page
// work waits only for the remainder, so the cut stays tight without dead air.
export const MIN_BEAT_INTERVAL_MS = Object.freeze({
  chase_queue: 8_400,
  chase_task: 6_000,
  case_overview: 9_300,
  case_risk: 8_100,
  banker_message: 9_000,
  doc_pending: 6_000,
  buyer_reply: 8_000,
  case_cleared: 6_000,
  playbooks: 6_500,
  stale_unknown: 7_000,
  legal_persona: 6_500,
  forecast: 9_000
})

export function remainingBeatDelay(previousBeat, elapsedMs) {
  return Math.max(0, Math.ceil((MIN_BEAT_INTERVAL_MS[previousBeat] ?? 0) - elapsedMs))
}

async function visible(locator, timeout = 15_000) {
  return locator
    .waitFor({ state: 'visible', timeout })
    .then(() => true)
    .catch(() => false)
}

async function film({ name, locator, hold, page, mark, beat, filmed, scroll = {} }) {
  filmed[name] = 0
  if (!(await visible(locator))) {
    console.log(`  ! ${name} did not render -- that beat did not film`)
    return false
  }
  await smoothScrollTo(page, locator, scroll)
  await beat(300)
  await mark(name)
  filmed[name] = 1
  await beat(hold)
  return true
}

const sidebarLink = (page, href) => page.locator(`aside[data-sidebar] a[href="${href}"]`).first()

export async function walk({ page, mark: captureMark, beat, filmed, WEB }) {
  let previousBeat = null
  let previousBeatAt = 0
  const mark = async (name) => {
    if (previousBeat) {
      const delay = remainingBeatDelay(previousBeat, Date.now() - previousBeatAt)
      if (delay > 0) await beat(delay)
    }
    captureMark(name)
    previousBeat = name
    previousBeatAt = Date.now()
  }

  // The walk films the Sales Admin desk; the choice persists in localStorage
  // under mortar.persona, so seed it before any app page loads.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('mortar.persona', 'sales-admin')
    } catch {
      // Privacy modes may deny localStorage; the walkthrough still tests the current persona.
    }
  })

  // 1. `/chase` as Sales Admin -- the morning queue. BK-9001 leads it because a
  // provisional Jev proposal is waiting for review. Read one card on camera:
  // the unit, the blocker in plain words, the owner, the action for today.
  await page.goto(`${WEB}/chase`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Chase List', level: 1 }).waitFor({ state: 'visible' })
  const card = page.locator('[data-testid="chase-card-BK-9001"]')
  await film({ name: 'chase_queue', locator: card, hold: 5_500, page, mark, beat, filmed })

  // 2. Create the task from Jev's suggested action -- one click, and it carries
  // an owner and a due date into the Open Tasks group below the queue.
  const createTask = card.getByRole('button', { name: 'Create Task' })
  await createTask.waitFor({ state: 'visible' })
  await createTask.click()
  const openTasks = page.getByRole('heading', { name: 'Open Tasks' })
  await openTasks.waitFor({ state: 'visible', timeout: 20_000 })
  await film({ name: 'chase_task', locator: openTasks, hold: 3_500, page, mark, beat, filmed })

  // 3. Open BK-9001 -- the case: loan and legal tracks side by side, and every
  // update carrying who reported it and who verified it.
  await card.locator('a[href="/bookings/BK-9001"]').first().click()
  await page.getByRole('heading', { name: /A-12-03/, level: 1 }).waitFor({ state: 'visible' })
  const tracks = page
    .getByRole('heading', { name: 'Loan Track' })
    .locator('xpath=ancestor::*[contains(@class,"grid")][1]')
  await film({ name: 'case_overview', locator: tracks, hold: 5_500, page, mark, beat, filmed })

  // The financing-risk flag: hover the chip so the tooltip names what drives it
  // -- debt service, margin, instalment and the reasons underneath.
  const riskChip = page.getByRole('button', { name: /Risk$/ }).first()
  await riskChip.waitFor({ state: 'visible' })
  await smoothScrollTo(page, riskChip, { viewportRatio: 0.2 })
  await beat(250)
  await riskChip.hover()
  const tooltip = page.locator('[role="tooltip"]').filter({ hasText: 'Debt Service' })
  await tooltip.waitFor({ state: 'visible', timeout: 10_000 })
  await mark('case_risk')
  filmed.case_risk = 1
  await beat(4_000)
  await page.mouse.move(0, 0)

  // 4. The banker's message, half Malay half English, and what Mortar read from
  // it: a payslip is missing and sales should chase it. Confirm it on camera;
  // the outstanding document lands on the case header.
  const bankerMessage = page.locator('li').filter({ hasText: 'Apex credit team checking' }).first()
  await film({ name: 'banker_message', locator: bankerMessage, hold: 6_500, page, mark, beat, filmed })

  await bankerMessage.getByRole('button', { name: 'Confirm' }).click()
  const outstanding = page.getByText('Payslip Outstanding', { exact: true })
  await outstanding.waitFor({ state: 'visible', timeout: 20_000 })
  await film({ name: 'doc_pending', locator: outstanding, hold: 3_000, page, mark, beat, filmed })

  // 5. Paste the buyer's Malay reply into Add Message. Jev answers live in
  // under a second: the payslip has arrived. Never rush this moment -- mark the
  // beat only when the read is on screen.
  const messageBody = page.locator('#add-message-body')
  await smoothScrollTo(page, messageBody)
  await messageBody.click()
  await messageBody.pressSequentially(BUYER_REPLY, { delay: 40 })
  await beat(400)
  await page.getByRole('button', { name: 'Add Message', exact: true }).click()
  const buyerMessage = page.locator('li').filter({ hasText: 'slip gaji 3 bulan dah saya hantar' }).first()
  await buyerMessage.getByText('Documents Received').waitFor({ state: 'visible', timeout: 30_000 })
  await mark('buyer_reply')
  filmed.buyer_reply = 1
  await beat(5_500)

  // Confirm it and the case clears: the outstanding-document pill leaves the
  // case header.
  await buyerMessage.getByRole('button', { name: 'Confirm' }).click()
  await outstanding.waitFor({ state: 'hidden', timeout: 20_000 })
  const clearedHeader = page.getByRole('heading', { name: /A-12-03/, level: 1 })
  await film({ name: 'case_cleared', locator: clearedHeader, hold: 3_000, page, mark, beat, filmed })

  // 6. The playbook panel -- staff experience ranked for this booking's blocker.
  const playbooks = page
    .getByRole('heading', { name: 'What To Do' })
    .locator('xpath=ancestor::*[contains(@class,"rounded")][1]')
  await film({ name: 'playbooks', locator: playbooks, hold: 4_500, page, mark, beat, filmed })

  // A booking whose evidence has gone stale reads as unknown rather than
  // progressing or failed -- one filtered row on the bookings list.
  await sidebarLink(page, '/bookings').click()
  await page.getByRole('heading', { name: 'Bookings', level: 1 }).waitFor({ state: 'visible' })
  await page.locator('#bookings-unknown-only').click()
  const stalePill = page.getByText('No Recent Update', { exact: true }).first()
  await stalePill.waitFor({ state: 'visible', timeout: 15_000 })
  const staleRow = page.locator('tr').filter({ has: stalePill }).first()
  await film({
    name: 'stale_unknown',
    locator: (await staleRow.count()) ? staleRow : stalePill,
    hold: 4_500,
    page,
    mark,
    beat,
    filmed
  })

  // 7. Switch persona to Legal Admin -- the same record seen as the queue of
  // cases waiting on signing.
  await page.getByRole('button', { name: 'Switch persona' }).click()
  await page.getByRole('menuitem', { name: 'Legal Admin' }).click()
  await beat(300)
  await sidebarLink(page, '/legal').click()
  await page.getByRole('heading', { name: 'Legal', level: 1 }).waitFor({ state: 'visible' })
  const legalQueue = page.getByRole('heading', { name: 'Sitting With The Lawyers' })
  await film({ name: 'legal_persona', locator: legalQueue, hold: 4_500, page, mark, beat, filmed })

  // 8. `/forecast` -- how many of these bookings sign within 30 days, with a
  // range, and the check of the method against what actually happened.
  await sidebarLink(page, '/forecast').click()
  await page.getByRole('heading', { name: 'Forecast', level: 1 }).waitFor({ state: 'visible' })
  const expected = page.getByText('Expected Signings', { exact: false }).first()
  await expected.waitFor({ state: 'visible', timeout: 30_000 })
  await film({ name: 'forecast', locator: expected, hold: 6_000, page, mark, beat, filmed })

  await mark('end')
  filmed.end = 1
  await beat(2_500)
}
