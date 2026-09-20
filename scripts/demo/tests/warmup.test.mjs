import assert from 'node:assert/strict'
import test from 'node:test'

const { warmProduction } = await import('../warmup.mjs')

// A minimal Playwright-shaped stub: contexts open pages whose locator and
// navigation calls resolve immediately, and every visit is recorded so the
// test can see which surfaces were warmed.
function fakeBrowser({ failOn } = {}) {
  const visits = []
  const page = {
    setDefaultTimeout() {},
    async goto(url) {
      visits.push(url)
      if (failOn?.(url)) throw new Error(`boom on ${url}`)
    },
    getByRole() {
      return { waitFor: async () => {} }
    },
    getByText() {
      return { first: () => ({ waitFor: async () => {} }) }
    },
    locator() {
      return { waitFor: async () => {} }
    }
  }
  return {
    visits,
    async newContext() {
      return { newPage: async () => page, close: async () => {} }
    }
  }
}

test('a dirty seed refuses the capture without opening a page', async () => {
  const browser = fakeBrowser()
  const logs = []
  const ok = await warmProduction({
    browser,
    web: 'https://mortar.example',
    log: (m) => logs.push(m),
    verify: async () => ({ clean: false, problems: ['expected no tasks, found 1'] })
  })
  assert.equal(ok, false)
  assert.equal(browser.visits.length, 0)
  assert.ok(logs.some((m) => m.includes('not the clean seed')))
  assert.ok(logs.some((m) => m.includes('/settings')))
  assert.ok(logs.some((m) => m.includes('expected no tasks')))
})

test('a clean seed warms the chase list, the case and the forecast', async () => {
  const browser = fakeBrowser()
  const ok = await warmProduction({
    browser,
    web: 'https://mortar.example',
    log: () => {},
    verify: async () => ({ clean: true, problems: [] })
  })
  assert.equal(ok, true)
  assert.deepEqual(browser.visits, [
    'https://mortar.example/chase',
    'https://mortar.example/bookings/BK-9001',
    'https://mortar.example/forecast'
  ])
})

test('a warm-up failure retries once, then gives up', async () => {
  let calls = 0
  const browser = fakeBrowser({
    failOn: (url) => url.endsWith('/forecast') && ((calls += 1), true)
  })
  const logs = []
  const ok = await warmProduction({
    browser,
    web: 'https://mortar.example',
    log: (m) => logs.push(m),
    attempts: 2,
    verify: async () => ({ clean: true, problems: [] })
  })
  assert.equal(ok, false)
  assert.equal(calls, 2)
  assert.ok(logs.some((m) => m.includes('retrying')))
  assert.ok(logs.some((m) => m.includes('aborting')))
})
