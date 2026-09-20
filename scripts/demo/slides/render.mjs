// Renders the pitch-deck slides the submission cut uses to PNG stills, in the
// same browser that captures the product so type and colour cannot drift.
// The deck's own foot-lines sit at the very bottom of its 1080 canvas, which
// is exactly where the burned subtitle plate lands, so each slide is rendered
// "broadcast safe": the canvas is scaled to end above SUBTITLE_TOP and the
// band below stays deck-black for the captions.
//
// DEMO_SLIDES selects and orders them: tokens are `name:seconds`, where `name`
// is `s` plus the deck slide number (`s01` = slide 1). assemble.sh only needs
// the names; the seconds are its business. `@capture` tokens are ignored here.

import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = process.env.DEMO_DIR || join(tmpdir(), 'mortar-demo')
const HERE = dirname(fileURLToPath(import.meta.url))
const SUBTITLE_TOP = 852
const failures = []

// The deck lives in the repo, not in this suite. DEMO_DECK overrides the path.
const DECK = process.env.DEMO_DECK || join(HERE, '..', '..', '..', 'docs', 'demo', 'mortar-pitch-deck.html')

// Slide assembly is optional. Exit cleanly if no slides are requested.
const rawSlides = (process.env.DEMO_SLIDES || '').trim()
if (!rawSlides) {
  console.log('No DEMO_SLIDES specified; skipping slide rendering (slides are optional).')
  process.exit(0)
}

// Prefer playwright installed into DEMO_DIR; fall back to local module resolution.
const require = createRequire(import.meta.url)
let chromium
try {
  chromium = createRequire(join(DIR, 'package.json'))('playwright').chromium
} catch {
  try {
    chromium = require('playwright').chromium
  } catch {
    console.error(`playwright not found in ${DIR} or local node_modules.`)
    console.error(`Install it into scratch: cd "${DIR}" && bun add -d playwright`)
    process.exit(1)
  }
}

mkdirSync(DIR, { recursive: true })

const browser = await chromium.launch({ channel: process.env.DEMO_CHANNEL || undefined })
const page = await (
  await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  })
).newPage()

// `s12` names deck slide 12 (index 11). Anything else is a hard failure: the
// deck renumbers silently when a slide is added, so a name that does not pin a
// number would film the wrong argument.
const SLIDES = rawSlides
  .split(/\s+/)
  .map((pair) => pair.split(':')[0])
  .filter((name) => name && name !== '@capture')

await page.goto(`file://${DECK}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)

// Pin the design canvas to the top of the frame and scale it so its bottom
// edge lands at SUBTITLE_TOP. The band beneath stays the deck's own black and
// is where libass burns the captions; without this the slides' foot-lines sit
// directly underneath them.
await page.evaluate((safeTop) => {
  const host = document.querySelector('deck-stage')
  const stage = host.shadowRoot.querySelector('.stage')
  const canvas = host.shadowRoot.querySelector('.canvas')
  stage.style.alignItems = 'flex-start'
  canvas.style.transformOrigin = 'top center'
  canvas.style.transform = `scale(${safeTop / 1080})`
  host._fit = () => {}
}, SUBTITLE_TOP)

const slideCount = await page.evaluate(() => document.querySelector('deck-stage')?.length ?? 0)
if (!slideCount) {
  console.error(`no <deck-stage> slides found in ${DECK}`)
  process.exit(1)
}

for (const name of SLIDES) {
  const match = /^s(\d+)$/.exec(name)
  const index = match ? Number(match[1]) - 1 : -1
  if (index < 0 || index >= slideCount) {
    failures.push(`${name}: not a deck slide number (deck has ${slideCount})`)
    console.error(`bad slide name: ${name}`)
    continue
  }

  await page.evaluate((i) => {
    document.querySelector('deck-stage').goTo(i)
    // The deck flashes its control overlay on every navigation; it auto-hides
    // after 1.8s but the still must be clean now.
    const host = document.querySelector('deck-stage')
    for (const el of host.shadowRoot.querySelectorAll('.overlay, .tapzones, .notes')) el.remove()
  }, index)
  await page.waitForTimeout(350)
  const out = join(DIR, `slide-${name}.png`)
  await page.screenshot({ path: out })
  const empty = await page.evaluate(() => document.body.innerText.trim().length < 40)

  // The subtitle is burned in later, so a slide cannot see the thing that will
  // cover it. 852 is the measured top row of a two-line libass plate at
  // MarginV=10 on a 1080 frame -- not a guess, and not a number this file gets
  // to choose. The check runs on the slotted slide's own text.
  const floor = await page.evaluate((i) => {
    const slide = document.querySelector(`[data-deck-slide="${i}"]`)
    if (!slide) return 0
    let low = 0
    for (const el of slide.querySelectorAll('*')) {
      if (!el.textContent.trim()) continue
      const rect = el.getBoundingClientRect()
      if (rect.width < 4 || rect.height < 4) continue
      low = Math.max(low, rect.bottom)
    }
    return Math.round(low)
  }, index)
  const collides = floor > SUBTITLE_TOP
  if (collides) failures.push(`${name}: content reaches ${floor}, subtitle plate starts ${SUBTITLE_TOP}`)
  console.log(
    `${name} (deck ${index + 1}): ${out}  floor ${floor}/${SUBTITLE_TOP}${empty ? '  !! PAGE LOOKS EMPTY' : ''}${collides ? '  !! SUBTITLE COLLISION' : ''}`
  )
}
await browser.close()

if (failures.length) {
  console.error('\nslide rendering issues encountered:')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
