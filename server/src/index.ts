/**
 * The one process: applies the schema, seeds the database when `meta` has no
 * `seed` row, then serves `/api/*` plus `frontend/dist` on `PORT` (8787
 * locally, 8080 on Cloud Run). `DATABASE_URL` is required; `TYPESAFE_API_KEY`
 * reaches the Jev service only — never the browser.
 */
import { SQL } from 'bun'
import path from 'node:path'
import type { JevService } from '@mortar/core'
import { createJevService } from '@mortar/jev'
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

const jev: JevService = createJevService({
  apiKey: process.env.TYPESAFE_API_KEY,
  cache: new DbJevCache(db)
})

const app = createApp({
  db,
  jev,
  reset: () => resetDatabase(sql),
  jevAvailable: Boolean(process.env.TYPESAFE_API_KEY)
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
