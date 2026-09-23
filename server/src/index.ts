/**
 * The one process: applies the schema, seeds the database when `meta` has no
 * `seed` row, then serves `/api/*` plus `frontend/dist` on `PORT` (8787
 * locally, 8080 on Cloud Run). `DATABASE_URL` is required. Jev runs one of
 * three ways: with `TYPESAFE_API_KEY` against the real TypeSafe API; with no
 * key but `JEV_PROXY_URL` set, against a local Anthropic-Messages-compatible
 * model proxy (see `.env.example`); or, with neither, cache-only. Whichever
 * key or proxy secret is configured reaches the Jev service only — never the
 * browser, and never the log. `MORTAR_DEMO_RESET=off` turns off the demo
 * reset route, as any server holding real data must.
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

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const port = Number(process.env.PORT ?? 8787)
const sql = new SQL(databaseUrl)
const db = createDatabase(sql)

await applySchema(sql)
if (!(await db.meta())) {
  try {
    const meta = await resetDatabase(sql)
    console.log(`seeded database — seed ${meta.seed}, resetAt ${meta.resetAt}`)
  } catch (e) {
    console.warn(`initial reset failed; serving an unseeded database (${(e as Error).message})`)
  }
}

// Measured against the local proxy (two runs, extractJob + nextActionJob on a
// documents_received/payslip case): gemini-3-flash answered correctly but averaged
// ~56s combined; gemini-3.8-flash-high ~20s; gemini-3.5-flash-lite ~17s and fastest,
// with equally correct event/document answers, so it is the default.
const DEFAULT_JEV_PROXY_MODEL = 'gemini-3.5-flash-lite'

const typesafeKey = process.env.TYPESAFE_API_KEY
const jevProxyUrl = process.env.JEV_PROXY_URL

let jev: JevService
let jevAvailable: boolean
if (typesafeKey) {
  jev = createJevService({ apiKey: typesafeKey, cache: new DbJevCache(db) })
  jevAvailable = true
  console.log('jev: TypeSafe API mode')
} else if (jevProxyUrl) {
  const jevProxyModel = process.env.JEV_PROXY_MODEL ?? DEFAULT_JEV_PROXY_MODEL
  const client = createProxySystemOne({
    url: jevProxyUrl,
    apiKey: process.env.JEV_PROXY_KEY ?? '',
    model: jevProxyModel
  })
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
  resetEnabled: process.env.MORTAR_DEMO_RESET?.toLowerCase() !== 'off'
})
const serveStatic = staticHandler(path.resolve(import.meta.dir, '../../frontend/dist'))

Bun.serve({
  port,
  // The default 10s kills slow requests; a reset can outlive it.
  idleTimeout: 120,
  async fetch(req) {
    return (await app.fetch(req)) ?? serveStatic(req)
  }
})
console.log(`mortar server on http://localhost:${port}`)
