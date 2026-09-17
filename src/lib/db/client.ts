import { mkdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite'
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Driver-agnostic database handle. Everything in src/lib takes a `Db`, never a
 * concrete driver, so the same code runs on PGlite (local, tests) and Postgres.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

export type PgliteDb = PgliteDatabase<typeof schema> & { $client: PGlite }
export type PostgresDb = PostgresJsDatabase<typeof schema> & { $client: postgres.Sql }

/** PGlite: Postgres compiled to WASM. No dataDir = in-memory (tests). */
export function createPgliteDb(dataDir?: string): PgliteDb {
  // PGlite does not create parent directories itself.
  if (dataDir) mkdirSync(dataDir, { recursive: true })
  return drizzlePglite({ client: new PGlite(dataDir), schema })
}

/** Any Postgres reachable by URL (Neon, Supabase, docker-compose, ...). */
export function createPostgresDb(url: string): PostgresDb {
  // prepare: false keeps pooled/serverless Postgres (e.g. Neon, PgBouncer) happy.
  return drizzlePostgres({ client: postgres(url, { prepare: false }), schema })
}
