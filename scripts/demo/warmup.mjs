// Prime the deployment before Playwright creates a recorded page: verify the
// snapshot is the clean seed the walk expects, then open the three surfaces it
// films so a cold Cloud Run start never lands on camera. The warm-up performs
// no mutations -- reads only.

import { verifyCleanSeed } from './proof.mjs'

export async function warmProduction({ browser, web, log = console.log, attempts = 2, verify = verifyCleanSeed }) {
  const seed = await verify(web)
  if (!seed.clean) {
    log('snapshot is not the clean seed -- reset it at ' + `${web}/settings before recording:`)
    for (const problem of seed.problems) log(`  ! ${problem}`)
    return false
  }
  log('snapshot verified: clean seed (27 messages, no tasks, one provisional proposal on BK-9001)')

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let context
    try {
      context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
      const page = await context.newPage()
      page.setDefaultTimeout(60_000)

      await page.goto(`${web}/chase`, { waitUntil: 'domcontentloaded' })
      await page.getByRole('heading', { name: 'Chase List', level: 1 }).waitFor({ state: 'visible' })
      await page.locator('[data-testid="chase-card-BK-9001"]').waitFor({ state: 'visible' })

      await page.goto(`${web}/bookings/BK-9001`, { waitUntil: 'domcontentloaded' })
      await page.getByRole('heading', { name: 'Loan Track' }).waitFor({ state: 'visible' })

      await page.goto(`${web}/forecast`, { waitUntil: 'domcontentloaded' })
      await page.getByText('Expected Signings', { exact: false }).first().waitFor({ state: 'visible', timeout: 60_000 })

      log('production warm-up complete (chase + case + forecast)')
      return true
    } catch (error) {
      const state = attempt < attempts ? `retrying (${attempt}/${attempts})` : 'aborting capture'
      log(`production warm-up incomplete; ${state}: ${String(error).slice(0, 180)}`)
    } finally {
      if (context) await context.close()
    }
  }
  return false
}
