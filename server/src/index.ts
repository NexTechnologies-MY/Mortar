/**
 * The one process: applies the schema, seeds the database on first boot when
 * the reset is on, then serves `/api/*` plus `frontend/dist` on `PORT` (8787
 * locally, 8080 on Cloud Run). `DATABASE_URL` is required. Jev runs one of
 * three ways: with `TYPESAFE_API_KEY` against the real TypeSafe API; with no
 * key but `JEV_PROXY_URL` set, against a local Anthropic-Messages-compatible
 * model proxy (see `.env.example`); or, with neither, cache-only. Whichever
 * key or proxy secret is configured reaches the Jev service only — never the
 * browser, and never the log. `MORTAR_DEMO_RESET=off` (also `false`, `0` or
 * `no`, case-insensitively — see `isResetEnabled`) turns off the demo reset
 * route AND the boot seed, as any server holding real data must.
 */
import { SQL } from 'bun'
import path from 'node:path'
import type { JevService } from '@mortar/core'
import { createJevService, createProxySystemOne } from '@mortar/jev'
import { createDatabase } from '../db/index'
import { applySchema, resetDatabase } from '../db/reset'
import { createApp } from './app'
import { DbJevCache } from './jev'
import { staticHandler } from './static'
import { isResetEnabled } from './util'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const port = Number(process.env.PORT ?? 8787)
const sql = new SQL(databaseUrl)
const db = createDatabase(sql)
const resetEnabled = isResetEnabled(process.env.MORTAR_DEMO_RESET)

await applySchema(sql)
if (!(await db.meta())) {
  if (!resetEnabled) {
    // A real server never seeds or truncates on its own. If `meta` is simply
    // absent (a fresh, empty database) that's fine — it just runs unseeded
    // until someone loads real data. If bookings already exist, the `meta`
    // row was lost some other way (a partial migration, a manual delete):
    // touching nothing and logging loudly beats guessing, since seeding would
    // never overwrite real rows but a future reset-style repair might.
    if (await db.hasBookings()) {
      console.error(
        'meta row is missing but bookings exist, and MORTAR_DEMO_RESET is off — refusing to seed or touch anything. Starting unseeded; routes that require meta (e.g. /api/snapshot) will fail until the meta row is restored by hand.'
      )
    } else {
      console.log('MORTAR_DEMO_RESET is off and the database is empty — starting unseeded, with no automatic seed.')
    }
  } else {
    try {
      const meta = await resetDatabase(sql)
      console.log(`seeded database — seed ${meta.seed}, resetAt ${meta.resetAt}`)
    } catch (e) {
      console.warn(`initial reset failed; serving an unseeded database (${(e as Error).message})`)
    }
  }
}

// Measured against the local proxy (two runs, extractJob + nextActionJob on a
// documents_received/payslip case): gemini-3-flash answered correctly but averaged
// ~56s combined; gemini-3.8-flash-high ~20s; gemini-3.5-flash-lite ~17s and fastest,
// with equally correct event/document answers, so it is the default.
const DEFAULT_JEV_PROXY_MODEL = 'gemini-3.5-flash-lite'

const typesafeKey = process.env.TYPESAFE_API_KEY
const jevProxyUrl = process.env.JEV_PROXY_URL

// The last message from a live Jev call that failed, for `/api/health`.
// `createJevService` swallows the error internally (falling back to the cache
// or a neutral answer), so this only reaches outside code that builds the
// `systemOne` client itself — which today is the proxy client below. Wiring
// the same tracking for TypeSafe API-key mode would mean constructing our own
// `TypeSafeClient`, which needs `@typesafe-ai/sdk` as a real dependency of
// this package rather than `@mortar/jev`'s; left out rather than reaching
// past `@mortar/jev`, which another agent owns.
let jevLastError: string | null = null

let jev: JevService
let jevAvailable: boolean
if (typesafeKey) {
  jev = createJevService({ apiKey: typesafeKey, cache: new DbJevCache(db) })
  jevAvailable = true
  console.log('jev: TypeSafe API mode')
} else if (jevProxyUrl) {
  // `||`, not `??`: .env.example ships the variable empty.
  const jevProxyModel = process.env.JEV_PROXY_MODEL || DEFAULT_JEV_PROXY_MODEL
  const proxyClient = createProxySystemOne({
    url: jevProxyUrl,
    apiKey: process.env.JEV_PROXY_KEY ?? '',
    model: jevProxyModel
  })
  // Wraps `systemOne` generically (no `@typesafe-ai/sdk` import needed: the
  // parameter and return types come from `typeof proxyClient.systemOne`
  // itself) so a failed call is recorded before the same error is rethrown
  // for `createJevService`'s own fallback to run.
  type SystemOne = typeof proxyClient.systemOne
  const trackedSystemOne = (async (...args: Parameters<SystemOne>) => {
    try {
      return await proxyClient.systemOne(...args)
    } catch (e) {
      jevLastError = e instanceof Error ? e.message : String(e)
      throw e
    }
  }) as SystemOne
  const client: typeof proxyClient = { systemOne: trackedSystemOne }
  jev = createJevService({ cache: new DbJevCache(db), client })
  jevAvailable = true
  console.log(`jev: local proxy mode (model ${jevProxyModel})`)
} else {
  jev = createJevService({ cache: new DbJevCache(db) })
  jevAvailable = false
  console.log('jev: cache-only mode (no TYPESAFE_API_KEY or JEV_PROXY_URL set)')
}

const app = createApp({
  db,
  jev,
  reset: () => resetDatabase(sql),
  jevAvailable,
  jevLastError: () => jevLastError,
  resetEnabled
})
const serveStatic = staticHandler(path.resolve(import.meta.dir, '../../frontend/dist'))

Bun.serve({
  port,
  // The default 10s kills slow requests; a reset can outlive it.
  idleTimeout: 120,
  // A launch sheet import is the largest legitimate body; 2MB comfortably
  // covers it with room to spare, and refuses anything wildly oversized.
  maxRequestBodySize: 2 * 1024 * 1024,
  async fetch(req) {
    return (await app.fetch(req)) ?? serveStatic(req)
  }
})
console.log(`mortar server on http://localhost:${port}`)
