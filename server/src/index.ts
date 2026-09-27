/**
 * The one process: applies the schema, starts with an empty guest account,
 * then serves `/api/*` plus `frontend/dist` on `PORT` (8787
 * locally, 8080 on Cloud Run). `DATABASE_URL` is required. Jev runs one of
 * three ways: with `TYPESAFE_API_KEY` against the real TypeSafe API; with no
 * key but `JEV_PROXY_URL` set, against a local Anthropic-Messages-compatible
 * model proxy (see `.env.example`); or, with neither, cache-only. Whichever
 * key or proxy secret is configured reaches the Jev service only — never the
 * browser, and never the log. `MORTAR_DEMO_RESET=off` (also `false`, `0` or
 * `no`, case-insensitively — see `isResetEnabled`) turns off demo data actions,
 * as any server holding real data must.
 */
import { SQL } from 'bun'
import path from 'node:path'
import type { JevService } from '@mortar/core'
import { createJevService, createProxySystemOne } from '@mortar/jev'
import { createDatabase } from '../db/index'
import { addDemoData, applySchema, deleteDemoData } from '../db/reset'
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
  addDemoData: () => addDemoData(sql),
  deleteDemoData: () => deleteDemoData(sql),
  jevAvailable,
  jevLastError: () => jevLastError,
  resetEnabled,
  // Render sets RENDER_GIT_COMMIT on every deploy, so a merge can be seen to be live.
  commit: process.env.RENDER_GIT_COMMIT || null,
  // The Ask panel's model. With no key the route answers 503 and the panel falls
  // back to its scripted answers, so the server still serves every desk. The
  // key reaches this call and nothing else — not the browser, not the log.
  // `||`, not `??`, because .env.example ships GEMINI_MODEL empty.
  assistant: {
    apiKey: process.env.GEMINI_API_KEY || null,
    model: process.env.GEMINI_MODEL || undefined
  }
})
const serveStatic = staticHandler(path.resolve(import.meta.dir, '../../frontend/dist'))

Bun.serve({
  port,
  // The default 10s kills slow requests; adding demo data can outlive it, and
  // so can a model call, which is why the assistant's own 30s budget is tighter.
  idleTimeout: 120,
  // A launch sheet import is the largest legitimate body, and a photographed
  // bank letter runs to 5.6MB as base64; 8MB covers both and refuses anything
  // wildly oversized.
  maxRequestBodySize: 8 * 1024 * 1024,
  async fetch(req) {
    return (await app.fetch(req)) ?? serveStatic(req)
  }
})
console.log(`mortar server on http://localhost:${port}`)
