import { env } from '@/lib/env'
import { createPgliteDb, createPostgresDb, type Db } from './client'

export type { Db } from './client'

// Cached on globalThis so Next.js hot reloads reuse one connection / one PGlite instance.
const globalForDb = globalThis as unknown as { __hackathonDb?: Db }

/**
 * The application database. Opened lazily on first call so importing this
 * module (e.g. from a test or a build step) has no side effects. PGlite allows
 * a single open instance per data directory, so the instance is always cached.
 */
export function getDb(): Db {
  if (!globalForDb.__hackathonDb) {
    if (env.DATABASE_URL) {
      globalForDb.__hackathonDb = createPostgresDb(env.DATABASE_URL)
    } else {
      if (env.NODE_ENV === 'production') {
        console.warn(
          `DATABASE_URL is not set: using PGlite in ${env.PGLITE_DATA_DIR}. Serverless hosts have a read-only or ephemeral filesystem, so set DATABASE_URL to a managed Postgres before real users arrive.`
        )
      }
      globalForDb.__hackathonDb = createPgliteDb(env.PGLITE_DATA_DIR)
    }
  }
  return globalForDb.__hackathonDb
}
