import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { socialProviderCredentials } from '@/lib/auth-providers'
import { type Db, getDb } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { env } from '@/lib/env'

/**
 * Build an auth instance for any database handle. Tests pass an in-memory
 * PGlite; the app uses getAuth() below.
 *
 * Docs: https://www.better-auth.com/docs/basic-usage
 */
export function createAuth(database: Db) {
  return betterAuth({
    database: drizzleAdapter(database, { provider: 'pg', schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true },
    socialProviders: socialProviderCredentials(),
    // Must stay last: lets server actions and route handlers set auth cookies.
    plugins: [nextCookies()]
  })
}

export type Auth = ReturnType<typeof createAuth>
export type Session = Auth['$Infer']['Session']

const globalForAuth = globalThis as unknown as { __hackathonAuth?: Auth }

/** The application's auth instance, created on first use (no side effects at import). */
export function getAuth(): Auth {
  globalForAuth.__hackathonAuth ??= createAuth(getDb())
  return globalForAuth.__hackathonAuth
}
