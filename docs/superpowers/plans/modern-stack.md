# Modern Stack Implementation Plan

> Written while the app lived in `hackathon-starter/`; it now lives at the
> repository root, so drop that prefix from paths.

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the empty `hackathon-starter/` directory into a working Next.js
16 full-stack template with auth, a database, one example feature, an AI chat,
tests, CI, and agent-oriented docs.

**Architecture:** Next.js App Router serves UI, server actions, and route
handlers from one process. Drizzle (Postgres dialect) talks to PGlite locally
and to any Postgres via `DATABASE_URL`. Better Auth owns users and sessions
through the Drizzle adapter. Pure modules in `src/lib/` take the `db` handle as
a parameter so Vitest can run them against an in-memory PGlite.

**Tech Stack:** Bun 1.4, Next.js 16.3, React 19.2, TypeScript 5.9, Tailwind 4.3,
shadcn/ui 4 (radix-nova), Drizzle ORM 0.45 + drizzle-kit 0.31, PGlite 0.5,
`postgres` 3, Better Auth 1.7, AI SDK 7 + `@ai-sdk/anthropic` 4, Zod 4,
`@t3-oss/env-nextjs` 0.13, Vitest 4.1, Testing Library, Playwright 1.63, ESLint
9 + `eslint-config-next`, Prettier (repo root config), GitHub Actions.

**Spec:** `docs/superpowers/specs/modern-stack-design.md`

## Global Constraints

- Package manager is Bun; every command is `bun run <script>` or `bunx`.
- Formatting comes from the repo root `.prettierrc.json`: no semicolons, single
  quotes, 120 columns, no trailing commas. Run `bun run format` at the end of
  every task.
- TypeScript `strict`; no `any` outside generated files.
- `typescript` stays on `^5.9` and `eslint` on `^9` (Next 16.3 support).
- Vitest stays on `^4.1` (5.0 shipped 2026-09-03).
- Local dev requires no Docker, no DB server, no API key.
- No git commits in this plan; the user reviews the working tree. Every task
  ends with `bun run check` (lint + typecheck + unit tests) passing.
- Already done before this plan: `package.json`, `bun install`, base Next files
  (`tsconfig.json`, `postcss.config.mjs`, `next.config.ts`, `eslint.config.mjs`,
  `.gitignore`, `src/app/{layout,page,globals.css}`), shadcn init
  (`components.json`,
  `src/components/ui/{button,input,label,card,textarea}.tsx`,
  `src/lib/utils.ts`), `docker-compose.yml`.

---

### Task 1: Typed env, Vitest wiring, `.env.example`

**Files:**

- Create: `src/lib/env.ts`
- Create: `src/lib/env.test.ts`
- Create: `vitest.config.ts`
- Create: `src/test/setup-dom.ts`
- Create: `.env.example`
- Modify: `.gitignore` (un-ignore `.env.example`)
- Modify: `package.json` (`typecheck` runs `next typegen` first)

**Interfaces:**

- Produces: `env` object with server keys `NODE_ENV`, `DATABASE_URL?`,
  `PGLITE_DATA_DIR`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `GITHUB_CLIENT_ID?`, `GITHUB_CLIENT_SECRET?`, `GOOGLE_CLIENT_ID?`,
  `GOOGLE_CLIENT_SECRET?`, `ANTHROPIC_API_KEY?`, `AI_MODEL` and client key
  `NEXT_PUBLIC_APP_URL`.

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const TEST_ENV = {
  BETTER_AUTH_SECRET: 'vitest-only-secret-0123456789abcdef0123456789',
  BETTER_AUTH_URL: 'http://localhost:3000',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000'
}

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    env: TEST_ENV,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts']
        }
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/test/setup-dom.ts']
        }
      }
    ]
  }
})
```

`src/test/setup-dom.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 2: Write the failing env test** (`src/lib/env.test.ts`)

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

async function loadEnv(overrides: Record<string, string | undefined>) {
  vi.resetModules()
  process.env = { ...ORIGINAL_ENV, ...overrides }
  const mod = await import('./env')
  return mod.env
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('env', () => {
  it('applies defaults when optional values are missing', async () => {
    const env = await loadEnv({
      DATABASE_URL: undefined,
      AI_MODEL: undefined,
      PGLITE_DATA_DIR: undefined
    })
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.PGLITE_DATA_DIR).toBe('./.data/pglite')
    expect(env.AI_MODEL).toBe('claude-sonnet-5')
  })

  it('treats empty strings as undefined so blank .env lines are harmless', async () => {
    const env = await loadEnv({ DATABASE_URL: '', ANTHROPIC_API_KEY: '' })
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.ANTHROPIC_API_KEY).toBeUndefined()
  })

  it('rejects a short BETTER_AUTH_SECRET', async () => {
    await expect(loadEnv({ BETTER_AUTH_SECRET: 'short' })).rejects.toThrow(
      /environment variables/i
    )
  })
})
```

- [ ] **Step 3: Run it to see it fail**

Run: `bun run test -- src/lib/env.test.ts` Expected: FAIL, cannot resolve
`./env`.

- [ ] **Step 4: Write `src/lib/env.ts`**

```ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    // Leave unset to use PGlite (a file-backed Postgres) under PGLITE_DATA_DIR.
    DATABASE_URL: z.url().optional(),
    PGLITE_DATA_DIR: z.string().min(1).default('./.data/pglite'),
    BETTER_AUTH_SECRET: z
      .string()
      .min(
        32,
        'BETTER_AUTH_SECRET must be at least 32 characters (run `bun run setup`)'
      ),
    BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default('claude-sonnet-5')
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000')
  },
  // Next.js inlines NEXT_PUBLIC_* at build time only when accessed literally.
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true
})
```

- [ ] **Step 5: Run the test to see it pass**

Run: `bun run test -- src/lib/env.test.ts` Expected: 3 passed.

- [ ] **Step 6: Write `.env.example` and fix `.gitignore`**

`.env.example`:

```dotenv
# Copy to .env — `bun run setup` does this and fills in BETTER_AUTH_SECRET.
# Everything marked optional can stay blank; the feature switches itself off.

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
# At least 32 random characters. `bun run setup` generates one.
BETTER_AUTH_SECRET=

# Database
# Blank = PGlite, a real Postgres engine stored in PGLITE_DATA_DIR. No server needed.
# Set to a Postgres URL (Neon, Supabase, docker-compose) to use that instead.
DATABASE_URL=
PGLITE_DATA_DIR=./.data/pglite

# Social login (optional). Callback URL: <BETTER_AUTH_URL>/api/auth/callback/<provider>
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI chat (optional). Any model id from https://docs.claude.com/en/docs/about-claude/models
ANTHROPIC_API_KEY=
AI_MODEL=claude-sonnet-5
```

Append to `.gitignore` after the `.env*` line: `!.env.example`.

- [ ] **Step 7: Make `typecheck` generate Next's types first**

In `package.json` set `"typecheck": "next typegen && tsc --noEmit"`.

- [ ] **Step 8: Format and check**

Run: `bun run format && bun run check` Expected: lint clean, tsc clean, 3 tests
pass.

---

### Task 2: Database client, schema, migrations, test helper

**Files:**

- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/auth-schema.ts` (hand-written now, regenerated in Task 3)
- Create: `src/lib/db/index.ts`
- Create: `drizzle.config.ts`
- Create: `src/test/db.ts`
- Create: `src/lib/db/schema.test.ts`
- Generate: `drizzle/0000_*.sql` + `drizzle/meta/*` via `bun run db:generate`

**Interfaces:**

- Produces: `Db` type, `db` singleton, `createPgliteDb(dataDir?)`, tables
  `user`, `session`, `account`, `verification`, `notes`, type `Note`, and
  `createTestDb()` returning a migrated in-memory `Db`.

- [ ] **Step 1: Write `src/lib/db/auth-schema.ts`** (Better Auth's documented
      Postgres tables; Task 3 regenerates this file with the CLI and diffs)

```ts
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
```

- [ ] **Step 2: Write `src/lib/db/schema.ts`**

```ts
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export * from './auth-schema'

/**
 * Example feature table. Copy this shape for your own tables, then run
 * `bun run db:generate` and `bun run db:migrate`.
 */
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [index('notes_user_id_idx').on(table.userId)]
)

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
```

- [ ] **Step 3: Write `src/lib/db/index.ts`**

```ts
import { PGlite } from '@electric-sql/pglite'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import {
  drizzle as drizzlePglite,
  type PgliteDatabase
} from 'drizzle-orm/pglite'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import * as schema from './schema'

/** Driver-agnostic handle. Everything in src/lib takes this, never a concrete driver. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

/** PGlite: Postgres compiled to WASM. No dataDir = in-memory (tests). */
export function createPgliteDb(
  dataDir?: string
): PgliteDatabase<typeof schema> {
  return drizzlePglite({ client: new PGlite(dataDir), schema })
}

function createDb(): Db {
  if (env.DATABASE_URL) {
    return drizzlePostgres({
      client: postgres(env.DATABASE_URL, { prepare: false }),
      schema
    })
  }
  return createPgliteDb(env.PGLITE_DATA_DIR)
}

// Cache on globalThis so Next.js hot reloads reuse one connection / one PGlite instance.
const globalForDb = globalThis as unknown as { __hackathonDb?: Db }

export const db: Db = globalForDb.__hackathonDb ?? createDb()

if (env.NODE_ENV !== 'production') globalForDb.__hackathonDb = db
```

- [ ] **Step 4: Write `drizzle.config.ts`**

```ts
import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

// Load .env the same way Next.js does so `bun run db:*` sees DATABASE_URL.
loadEnvConfig(process.cwd())

const databaseUrl = process.env.DATABASE_URL

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  ...(databaseUrl
    ? { dbCredentials: { url: databaseUrl } }
    : {
        driver: 'pglite',
        dbCredentials: { url: process.env.PGLITE_DATA_DIR ?? './.data/pglite' }
      })
})
```

- [ ] **Step 5: Generate the first migration**

Run: `bun run db:generate` Expected: `drizzle/0000_<name>.sql` containing
`CREATE TABLE "user"`, `"session"`, `"account"`, `"verification"`, `"notes"` and
`drizzle/meta/_journal.json`.

- [ ] **Step 6: Write the test helper `src/test/db.ts`**

```ts
import { migrate } from 'drizzle-orm/pglite/migrator'
import { createPgliteDb, type Db } from '@/lib/db'
import { user } from '@/lib/db/schema'

/** Fresh in-memory Postgres with all migrations applied. ~100ms. */
export async function createTestDb(): Promise<Db> {
  const db = createPgliteDb()
  await migrate(db, { migrationsFolder: 'drizzle' })
  return db
}

export async function insertTestUser(
  db: Db,
  overrides: Partial<typeof user.$inferInsert> = {}
) {
  const id = overrides.id ?? crypto.randomUUID()
  const [row] = await db
    .insert(user)
    .values({
      id,
      name: 'Test User',
      email: `${id}@example.com`,
      emailVerified: true,
      ...overrides
    })
    .returning()
  return row
}
```

- [ ] **Step 7: Write the failing schema test `src/lib/db/schema.test.ts`**

```ts
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { notes } from '@/lib/db/schema'
import { createTestDb, insertTestUser } from '@/test/db'

describe('database schema', () => {
  it('migrates and round-trips a note with defaults', async () => {
    const db = await createTestDb()
    const owner = await insertTestUser(db)

    const [created] = await db
      .insert(notes)
      .values({ userId: owner.id, title: 'hello' })
      .returning()

    expect(created.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(created.body).toBe('')
    expect(created.createdAt).toBeInstanceOf(Date)

    const rows = await db.select().from(notes).where(eq(notes.userId, owner.id))
    expect(rows).toHaveLength(1)
  })

  it('cascades note deletion when the owner is deleted', async () => {
    const db = await createTestDb()
    const owner = await insertTestUser(db)
    await db.insert(notes).values({ userId: owner.id, title: 'orphan?' })

    const { user } = await import('@/lib/db/schema')
    await db.delete(user).where(eq(user.id, owner.id))

    expect(await db.select().from(notes)).toHaveLength(0)
  })
})
```

- [ ] **Step 8: Run the test to see it pass**

Run: `bun run test -- src/lib/db` Expected: 2 passed. If `migrate` cannot find
`drizzle/`, confirm Step 5 ran from the project root.

- [ ] **Step 9: Format and check**

Run: `bun run format && bun run check`

---

### Task 3: Better Auth server, route handler, session helpers, proxy

**Files:**

- Create: `src/lib/auth-providers.ts`
- Create: `src/lib/auth.ts`
- Regenerate: `src/lib/db/auth-schema.ts` via `bun run auth:schema`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `src/lib/session.ts`
- Create: `src/lib/auth-client.ts`
- Create: `src/proxy.ts`
- Create: `src/lib/auth.test.ts`

**Interfaces:**

- Consumes: `db`, `Db`, `createTestDb()` from Task 2; `env` from Task 1.
- Produces: `createAuth(database: Db)`, `auth`, `type Session`,
  `getSession(): Promise<Session | null>`,
  `requireUser(): Promise<Session['user']>`,
  `enabledSocialProviders(): SocialProvider[]`, `authClient`, `signIn`,
  `signUp`, `signOut`, `useSession`.

- [ ] **Step 1: Write `src/lib/auth-providers.ts`**

```ts
import { env } from '@/lib/env'

export type SocialProvider = 'github' | 'google'

/** Providers whose client id and secret are both configured. */
export function enabledSocialProviders(): SocialProvider[] {
  const providers: SocialProvider[] = []
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) providers.push('github')
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) providers.push('google')
  return providers
}
```

- [ ] **Step 2: Write `src/lib/auth.ts`**

```ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db, type Db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { env } from '@/lib/env'

/** Build an auth instance for any Db (tests pass an in-memory one). */
export function createAuth(database: Db) {
  return betterAuth({
    database: drizzleAdapter(database, { provider: 'pg', schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true },
    socialProviders: {
      ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            github: {
              clientId: env.GITHUB_CLIENT_ID,
              clientSecret: env.GITHUB_CLIENT_SECRET
            }
          }
        : {}),
      ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET
            }
          }
        : {})
    },
    // Must stay last: lets server actions set auth cookies.
    plugins: [nextCookies()]
  })
}

export const auth = createAuth(db)

export type Session = typeof auth.$Infer.Session
```

- [ ] **Step 3: Regenerate the auth schema with the CLI and diff**

Run:

```bash
BETTER_AUTH_SECRET=$(openssl rand -hex 32) bun run auth:schema
```

Expected: `src/lib/db/auth-schema.ts` overwritten with the CLI's tables. Diff
against Step 1 of Task 2. If columns differ, keep the CLI output and run
`bun run db:generate` again (delete `drizzle/` first so there is a single `0000`
migration). If the CLI cannot load the config (path alias or PGlite error), keep
the hand-written file: it matches the documented schema.

- [ ] **Step 4: Write `src/app/api/auth/[...all]/route.ts`**

```ts
import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

export const { GET, POST } = toNextJsHandler(auth)
```

- [ ] **Step 5: Write `src/lib/session.ts`**

```ts
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/lib/auth'

/** Current session or null. Cached per request. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
)

/** Use in protected layouts/pages/actions. Redirects anonymous visitors. */
export async function requireUser() {
  const session = await getSession()
  if (!session) redirect('/sign-in')
  return session.user
}
```

- [ ] **Step 6: Write `src/lib/auth-client.ts`**

```ts
'use client'

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
```

- [ ] **Step 7: Write `src/proxy.ts`** (Next 16's name for middleware)

```ts
import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Optimistic redirect for anonymous visitors. Only checks that a session cookie
 * exists; protected layouts still verify the session with requireUser().
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/chat/:path*']
}
```

- [ ] **Step 8: Write the failing auth test `src/lib/auth.test.ts`**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuth } from '@/lib/auth'
import { createTestDb } from '@/test/db'

// nextCookies() calls next/headers after each response; outside Next that throws.
vi.mock('next/headers', () => ({ cookies: async () => ({ set: () => {} }) }))

const ORIGIN = 'http://localhost:3000'

function post(path: string, body: unknown, cookie = '') {
  return new Request(`${ORIGIN}/api/auth${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, cookie },
    body: JSON.stringify(body)
  })
}

describe('auth', () => {
  let auth: ReturnType<typeof createAuth>

  beforeEach(async () => {
    auth = createAuth(await createTestDb())
  })

  it('signs up with email + password and returns a usable session cookie', async () => {
    const res = await auth.handler(
      post('/sign-up/email', {
        name: 'Ada',
        email: 'ada@example.com',
        password: 'password123'
      })
    )
    expect(res.status).toBe(200)
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/better-auth\.session_token=/)

    const session = await auth.api.getSession({
      headers: new Headers({ cookie })
    })
    expect(session?.user.email).toBe('ada@example.com')
  })

  it('rejects a wrong password', async () => {
    await auth.handler(
      post('/sign-up/email', {
        name: 'Ada',
        email: 'ada@example.com',
        password: 'password123'
      })
    )
    const res = await auth.handler(
      post('/sign-in/email', {
        email: 'ada@example.com',
        password: 'nope-nope-nope'
      })
    )
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 9: Run the test**

Run: `bun run test -- src/lib/auth.test.ts` Expected: 2 passed. If the cookie
header includes `__Secure-`, the baseURL is https; keep `BETTER_AUTH_URL` on
http in `vitest.config.ts`.

- [ ] **Step 10: Format and check**

Run: `bun run format && bun run check`

---

### Task 4: Layout, header, landing page, error page, health route

**Files:**

- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/error.tsx`
- Create: `src/components/site-header.tsx`
- Create: `src/components/auth/user-menu.tsx`
- Create: `src/app/api/health/route.ts`
- Create: `src/app/api/health/route.test.ts`
- Delete: unused `public/*.svg` from create-next-app if present

**Interfaces:**

- Consumes: `useSession`, `signOut` from Task 3.
- Produces: `<SiteHeader/>`; `GET /api/health → { ok: true }`.

- [ ] **Step 1: Write the failing health test
      `src/app/api/health/route.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { GET } from './route'

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})
```

- [ ] **Step 2: Write `src/app/api/health/route.ts`**

```ts
export function GET() {
  return Response.json({ ok: true })
}
```

Run: `bun run test -- src/app/api/health` → 1 passed.

- [ ] **Step 3: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: { default: 'Hackathon Starter', template: '%s · Hackathon Starter' },
  description:
    'Next.js, Drizzle, Better Auth, and the AI SDK, wired up and tested.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Write `src/components/auth/user-menu.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from '@/lib/auth-client'

export function UserMenu() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  if (isPending) return <div className="h-8 w-24" aria-hidden />

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost">
        <Link href="/account">{session.user.name || session.user.email}</Link>
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          signOut({ fetchOptions: { onSuccess: () => router.push('/') } })
        }
      >
        Sign out
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/components/site-header.tsx`**

```tsx
import Link from 'next/link'
import { UserMenu } from '@/components/auth/user-menu'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/chat', label: 'Chat' }
]

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-semibold tracking-tight">
            Hackathon Starter
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}
```

- [ ] **Step 6: Write `src/app/page.tsx`** (landing; content = what is in the
      box and where to find it)

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const STACK = [
  {
    title: 'Auth',
    body: 'Email + password, optional GitHub/Google. Better Auth over Drizzle.',
    where: 'src/lib/auth.ts'
  },
  {
    title: 'Database',
    body: 'Postgres dialect. PGlite locally, DATABASE_URL in production.',
    where: 'src/lib/db/'
  },
  {
    title: 'Example feature',
    body: 'Notes: table → query module → server action → page → tests.',
    where: 'src/lib/notes.ts'
  },
  {
    title: 'AI chat',
    body: 'Streaming chat with the AI SDK. Set ANTHROPIC_API_KEY to enable.',
    where: 'src/app/api/chat/'
  },
  {
    title: 'Tests',
    body: 'Vitest against in-memory Postgres, Playwright smoke test.',
    where: 'src/**/*.test.ts, e2e/'
  },
  {
    title: 'Agent docs',
    body: 'AGENTS.md maps every feature to its files and commands.',
    where: 'AGENTS.md'
  }
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6 pt-10">
        <p className="text-sm font-medium text-muted-foreground">
          Next.js 16 · Drizzle · Better Auth · AI SDK
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Ship the demo, not the boilerplate.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Sign-up, a database, a worked example feature, an AI chat, and tests
          are already here. Delete what you do not need and start on the idea.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>
            <CardContent>
              <code className="text-xs text-muted-foreground">
                {item.where}
              </code>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
```

- [ ] **Step 7: Write `src/app/error.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

- [ ] **Step 8: Remove create-next-app leftovers**

Run:
`rm -f public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg`
(only if they exist).

- [ ] **Step 9: Format, check, and smoke the dev server**

Run: `bun run format && bun run check` Then:
`bun run setup && (bun run dev &) ; sleep 8; curl -s localhost:3000/api/health; curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/; kill %1`
Expected: `{"ok":true}` and `200`.

---

### Task 5: Sign-in, sign-up, account pages

**Files:**

- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/sign-in/page.tsx`
- Create: `src/app/(auth)/sign-up/page.tsx`
- Create: `src/components/auth/sign-in-form.tsx`
- Create: `src/components/auth/sign-up-form.tsx`
- Create: `src/components/auth/social-buttons.tsx`
- Create: `src/app/account/page.tsx`
- Create: `src/components/auth/account-form.tsx`

**Interfaces:**

- Consumes: `signIn`, `signUp`, `authClient` (Task 3), `enabledSocialProviders`
  (Task 3), `requireUser` (Task 3), shadcn `Button`, `Input`, `Label`, `Card`.
- Produces: routes `/sign-in`, `/sign-up`, `/account`. Form labels used by e2e:
  `Name`, `Email`, `Password`; buttons `Create account`, `Sign in`, `Save`.

- [ ] **Step 1: Write `src/app/(auth)/layout.tsx`**

```tsx
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/auth/social-buttons.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth-client'
import type { SocialProvider } from '@/lib/auth-providers'

const LABELS: Record<SocialProvider, string> = {
  github: 'GitHub',
  google: 'Google'
}

export function SocialButtons({ providers }: { providers: SocialProvider[] }) {
  if (providers.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {providers.map((provider) => (
        <Button
          key={provider}
          variant="outline"
          type="button"
          onClick={() => signIn.social({ provider, callbackURL: '/dashboard' })}
        >
          Continue with {LABELS[provider]}
        </Button>
      ))}
      <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/auth/sign-up-form.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { SocialButtons } from '@/components/auth/social-buttons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth-client'
import type { SocialProvider } from '@/lib/auth-providers'

export function SignUpForm({ providers }: { providers: SocialProvider[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    await signUp.email(
      {
        name: String(form.get('name')),
        email: String(form.get('email')),
        password: String(form.get('password'))
      },
      {
        onSuccess: () => router.push('/dashboard'),
        onError: (ctx) => {
          setError(ctx.error.message)
          setPending(false)
        }
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Email and a password of at least 8 characters.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SocialButtons providers={providers} />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Write `src/components/auth/sign-in-form.tsx`** (same shape,
      `signIn.email`, no name field, title `Welcome back`, button `Sign in`,
      footer link to `/sign-up` reading `Create one`.)

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { SocialButtons } from '@/components/auth/social-buttons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth-client'
import type { SocialProvider } from '@/lib/auth-providers'

export function SignInForm({ providers }: { providers: SocialProvider[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    await signIn.email(
      {
        email: String(form.get('email')),
        password: String(form.get('password'))
      },
      {
        onSuccess: () => router.push('/dashboard'),
        onError: (ctx) => {
          setError(ctx.error.message)
          setPending(false)
        }
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SocialButtons providers={providers} />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">
          No account yet?{' '}
          <Link href="/sign-up" className="underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Write the two pages**

`src/app/(auth)/sign-up/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { enabledSocialProviders } from '@/lib/auth-providers'

export const metadata: Metadata = { title: 'Sign up' }

export default function SignUpPage() {
  return <SignUpForm providers={enabledSocialProviders()} />
}
```

`src/app/(auth)/sign-in/page.tsx`: identical with `SignInForm` and title
`Sign in`.

- [ ] **Step 6: Write `src/components/auth/account-form.tsx`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export function AccountForm({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    const { error } = await authClient.updateUser({
      name: String(form.get('name'))
    })
    setPending(false)
    setMessage(error ? (error.message ?? 'Could not save') : 'Saved')
    if (!error) router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        Save
      </Button>
    </form>
  )
}
```

- [ ] **Step 7: Write `src/app/account/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { AccountForm } from '@/components/auth/account-form'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Account' }

export default async function AccountPage() {
  const user = await requireUser()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <AccountForm name={user.name} email={user.email} />
    </div>
  )
}
```

- [ ] **Step 8: Format, check, and click through**

Run: `bun run format && bun run check`, then `bun run dev`, open `/sign-up`,
create an account, land on `/dashboard` (404 until Task 6 is done; the redirect
target is what matters), visit `/account`, change the name, sign out from the
header.

---

### Task 6: Notes example feature (query module, actions, dashboard)

**Files:**

- Create: `src/lib/notes.ts`
- Create: `src/lib/notes.test.ts`
- Create: `src/app/dashboard/actions.ts`
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/notes/note-form.tsx`
- Create: `src/components/notes/note-form.test.tsx`
- Create: `src/components/notes/note-list.tsx`

**Interfaces:**

- Consumes: `Db`, `db`, `notes`, `Note` (Task 2); `requireUser` (Task 3);
  `createTestDb`, `insertTestUser` (Task 2).
- Produces: `listNotes(db, userId)`, `createNote(db, { userId, title, body? })`,
  `deleteNote(db, userId, id)`; server actions
  `createNoteAction(prev, formData)` and `deleteNoteAction(id)`;
  `type ActionState`.

- [ ] **Step 1: Write the failing test `src/lib/notes.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '@/lib/db'
import { createNote, deleteNote, listNotes } from '@/lib/notes'
import { createTestDb, insertTestUser } from '@/test/db'

describe('notes', () => {
  let db: Db
  let ownerId: string
  let otherId: string

  beforeEach(async () => {
    db = await createTestDb()
    ownerId = (await insertTestUser(db)).id
    otherId = (await insertTestUser(db)).id
  })

  it('creates and lists only the owner’s notes, newest first', async () => {
    await createNote(db, { userId: ownerId, title: 'first' })
    await createNote(db, { userId: ownerId, title: 'second', body: 'details' })
    await createNote(db, { userId: otherId, title: 'someone else’s' })

    const list = await listNotes(db, ownerId)

    expect(list.map((n) => n.title)).toEqual(['second', 'first'])
    expect(list[0].body).toBe('details')
  })

  it('deletes only when the caller owns the note', async () => {
    const note = await createNote(db, { userId: ownerId, title: 'mine' })

    expect(await deleteNote(db, otherId, note.id)).toBe(false)
    expect(await listNotes(db, ownerId)).toHaveLength(1)

    expect(await deleteNote(db, ownerId, note.id)).toBe(true)
    expect(await listNotes(db, ownerId)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `bun run test -- src/lib/notes.test.ts` → FAIL (module not found).

- [ ] **Step 3: Write `src/lib/notes.ts`**

```ts
import { and, desc, eq } from 'drizzle-orm'
import type { Db } from '@/lib/db'
import { type Note, notes } from '@/lib/db/schema'

/**
 * Example query module. Pure functions over a Db handle: no Next.js, no auth,
 * so Vitest can run them against an in-memory PGlite. Server actions in
 * src/app/dashboard/actions.ts add auth + validation and call these.
 */

export function listNotes(db: Db, userId: string): Promise<Note[]> {
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt), desc(notes.id))
}

export async function createNote(
  db: Db,
  input: { userId: string; title: string; body?: string }
): Promise<Note> {
  const [note] = await db
    .insert(notes)
    .values({
      userId: input.userId,
      title: input.title,
      body: input.body ?? ''
    })
    .returning()
  return note
}

export async function deleteNote(
  db: Db,
  userId: string,
  id: string
): Promise<boolean> {
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({ id: notes.id })
  return deleted.length > 0
}
```

Run: `bun run test -- src/lib/notes.test.ts` → 2 passed. (If ordering is flaky
because two rows share a timestamp, the secondary `desc(notes.id)` key keeps it
deterministic within a test run.)

- [ ] **Step 4: Write `src/app/dashboard/actions.ts`**

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createNote, deleteNote } from '@/lib/notes'
import { requireUser } from '@/lib/session'

export type ActionState = { ok: true } | { ok: false; error: string } | null

const noteInput = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Keep titles under 120 characters'),
  body: z.string().trim().max(5000, 'Keep notes under 5000 characters')
})

export async function createNoteAction(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser()
  const parsed = noteInput.safeParse({
    title: formData.get('title') ?? '',
    body: formData.get('body') ?? ''
  })
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input'
    }

  await createNote(db, { userId: user.id, ...parsed.data })
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function deleteNoteAction(id: string): Promise<void> {
  const user = await requireUser()
  await deleteNote(db, user.id, id)
  revalidatePath('/dashboard')
}
```

- [ ] **Step 5: Write the failing component test
      `src/components/notes/note-form.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NoteForm } from './note-form'

const createNoteAction = vi.fn()
vi.mock('@/app/dashboard/actions', () => ({
  createNoteAction: (...args: unknown[]) => createNoteAction(...args)
}))

describe('<NoteForm/>', () => {
  it('shows the server-side validation error', async () => {
    createNoteAction.mockResolvedValue({
      ok: false,
      error: 'Title is required'
    })
    render(<NoteForm />)

    await userEvent.click(screen.getByRole('button', { name: 'Add note' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
  })

  it('clears the fields after a successful save', async () => {
    createNoteAction.mockResolvedValue({ ok: true })
    render(<NoteForm />)
    const title = screen.getByLabelText('Title')

    await userEvent.type(title, 'Buy snacks')
    await userEvent.click(screen.getByRole('button', { name: 'Add note' }))

    await vi.waitFor(() => expect(title).toHaveValue(''))
  })
})
```

- [ ] **Step 6: Write `src/components/notes/note-form.tsx`**

```tsx
'use client'

import { useActionState, useEffect, useRef } from 'react'
import { type ActionState, createNoteAction } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function NoteForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createNoteAction,
    null
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="What needs doing?" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">Details</Label>
        <Textarea id="body" name="body" rows={3} placeholder="Optional" />
      </div>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Adding…' : 'Add note'}
      </Button>
    </form>
  )
}
```

Run: `bun run test -- src/components/notes` → 2 passed. The `title` input has no
`required` attribute on purpose so the server-side validation path is exercised
(client `required` would block submission in the browser).

- [ ] **Step 7: Write `src/components/notes/note-list.tsx`** (server component)

```tsx
import { deleteNoteAction } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { Note } from '@/lib/db/schema'

export function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No notes yet. Add the first one.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li key={note.id}>
          <Card>
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <CardDescription>
                {note.createdAt.toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-start justify-between gap-4">
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              <form action={deleteNoteAction.bind(null, note.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${note.title}`}
                >
                  Delete
                </Button>
              </form>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 8: Write `src/app/dashboard/layout.tsx` and `page.tsx`**

`layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import { requireUser } from '@/lib/session'

export default async function DashboardLayout({
  children
}: {
  children: ReactNode
}) {
  await requireUser()
  return <>{children}</>
}
```

`page.tsx`:

```tsx
import type { Metadata } from 'next'
import { NoteForm } from '@/components/notes/note-form'
import { NoteList } from '@/components/notes/note-list'
import { db } from '@/lib/db'
import { listNotes } from '@/lib/notes'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const user = await requireUser()
  const notes = await listNotes(db, user.id)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">
            The example feature. Trace it: schema → src/lib/notes.ts →
            actions.ts → this page.
          </p>
        </div>
        <NoteForm />
      </section>
      <section aria-label="Your notes">
        <NoteList notes={notes} />
      </section>
    </div>
  )
}
```

- [ ] **Step 9: Format, check, and try it**

Run: `bun run format && bun run check`; `bun run dev`; sign in; add and delete a
note.

---

### Task 7: AI chat

**Files:**

- Create: `src/app/api/chat/route.ts`
- Create: `src/app/api/chat/route.test.ts`
- Create: `src/components/chat/chat.tsx`
- Create: `src/app/chat/page.tsx`

**Interfaces:**

- Consumes: `env` (Task 1), `getSession` (Task 3).
- Produces: `POST /api/chat` (UI message stream; 401 when anonymous; 503 as
  plain text when `ANTHROPIC_API_KEY` is unset), `/chat` page.

Before writing, load the `claude-api` skill and confirm the default model id
(`claude-sonnet-5`) is current; adjust `AI_MODEL` default in `env.ts` and
`.env.example` if it is not.

- [ ] **Step 1: Write the failing route test `src/app/api/chat/route.test.ts`**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getSession = vi.fn()
vi.mock('@/lib/session', () => ({ getSession: () => getSession() }))

const { POST } = await import('./route')

function chatRequest() {
  return new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { id: '1', role: 'user', parts: [{ type: 'text', text: 'hi' }] }
      ]
    })
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => getSession.mockReset())

  it('requires a signed-in user', async () => {
    getSession.mockResolvedValue(null)
    const res = await POST(chatRequest())
    expect(res.status).toBe(401)
  })

  it('explains how to enable chat when no API key is configured', async () => {
    getSession.mockResolvedValue({ user: { id: 'u1' } })
    const res = await POST(chatRequest())
    expect(res.status).toBe(503)
    expect(await res.text()).toMatch(/ANTHROPIC_API_KEY/)
  })
})
```

- [ ] **Step 2: Write `src/app/api/chat/route.ts`**

```ts
import { anthropic } from '@ai-sdk/anthropic'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { env } from '@/lib/env'
import { getSession } from '@/lib/session'

export const maxDuration = 30

const SYSTEM_PROMPT =
  'You are a concise, friendly assistant embedded in a hackathon project. Answer directly.'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return new Response('Sign in to use chat.', { status: 401 })
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(
      'Chat is disabled: set ANTHROPIC_API_KEY in .env and restart the dev server.',
      { status: 503 }
    )
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] }

  const result = streamText({
    model: anthropic(env.AI_MODEL),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
}
```

Run: `bun run test -- src/app/api/chat` → 2 passed.

- [ ] **Step 3: Write `src/components/chat/chat.tsx`**

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' })
  })
  const busy = status === 'submitted' || status === 'streaming'

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    void sendMessage({ text })
    setInput('')
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ol className="flex flex-1 flex-col gap-3" aria-live="polite">
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.role === 'user'
                ? 'self-end rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground'
                : 'self-start rounded-2xl bg-muted px-4 py-2 text-sm whitespace-pre-wrap'
            }
          >
            {message.parts.map((part, index) =>
              part.type === 'text' ? <span key={index}>{part.text}</span> : null
            )}
          </li>
        ))}
        {error ? (
          <li role="alert" className="text-sm text-destructive">
            {error.message}
          </li>
        ) : null}
      </ol>
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything…"
          aria-label="Message"
          disabled={busy}
        />
        <Button type="submit" disabled={busy || input.trim() === ''}>
          Send
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/app/chat/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Chat } from '@/components/chat/chat'
import { env } from '@/lib/env'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Chat' }

export default async function ChatPage() {
  await requireUser()
  const enabled = Boolean(env.ANTHROPIC_API_KEY)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Streaming responses through the AI SDK. Model:{' '}
          <code>{env.AI_MODEL}</code>
        </p>
      </div>
      {enabled ? (
        <Chat />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Chat is off. Add <code>ANTHROPIC_API_KEY</code> to <code>.env</code>,
          restart <code>bun run dev</code>, and this page turns into a working
          chat. The route lives in <code>src/app/api/chat/route.ts</code>.
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Format and check**

Run: `bun run format && bun run check`. If a real key is available, set it in
`.env` and confirm a streamed reply in the browser; otherwise confirm the
disabled state renders.

---

### Task 8: Setup script and Playwright smoke test

**Files:**

- Create: `scripts/setup.ts`
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`
- Modify: `tsconfig.json` (exclude `e2e` from the Next project is NOT needed;
  keep it included so the spec is type-checked)

**Interfaces:**

- Consumes: labels/buttons from Tasks 4–6: link `Get started`, labels `Name`,
  `Email`, `Password`, `Title`; buttons `Create account`, `Add note`,
  `Sign out`.

- [ ] **Step 1: Write `scripts/setup.ts`**

```ts
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * One-time local setup:
 *   1. create .env from .env.example with a fresh BETTER_AUTH_SECRET
 *   2. apply database migrations (PGlite by default)
 */
if (existsSync('.env')) {
  console.log('.env already exists; leaving it alone.')
} else {
  const secret = randomBytes(32).toString('base64url')
  const example = readFileSync('.env.example', 'utf8')
  writeFileSync(
    '.env',
    example.replace(/^BETTER_AUTH_SECRET=.*$/m, `BETTER_AUTH_SECRET=${secret}`)
  )
  console.log('Created .env with a generated BETTER_AUTH_SECRET.')
}

const migrate = spawnSync('bun', ['run', 'db:migrate'], { stdio: 'inherit' })
if (migrate.status !== 0) process.exit(migrate.status ?? 1)

console.log('\nReady. Start the app with: bun run dev')
```

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { loadEnvConfig } from '@next/env'
import { defineConfig, devices } from '@playwright/test'

loadEnvConfig(process.cwd())

const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: isCI
      ? `bun run db:migrate && bun run build && bun run start -- --port ${PORT}`
      : `bun run db:migrate && bun run dev -- --port ${PORT}`,
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 240_000,
    env: {
      PGLITE_DATA_DIR: './.data/e2e',
      DATABASE_URL: '',
      BETTER_AUTH_URL: BASE_URL,
      NEXT_PUBLIC_APP_URL: BASE_URL,
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ??
        'e2e-only-secret-0123456789abcdef0123456789'
    }
  }
})
```

- [ ] **Step 3: Write `e2e/smoke.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

test('sign up, add a note, sign out', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Ship the demo'
  )
  await page.getByRole('link', { name: 'Get started' }).click()

  await page.getByLabel('Name').fill('E2E User')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.getByLabel('Title').fill('First note')
  await page.getByLabel('Details').fill('Created by the smoke test')
  await page.getByRole('button', { name: 'Add note' }).click()
  await expect(page.getByRole('heading', { name: 'First note' })).toBeVisible()
  await expect(page.getByLabel('Title')).toHaveValue('')

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
})

test('anonymous visitors are sent to sign-in', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/sign-in$/)
})
```

- [ ] **Step 4: Install a browser and run it**

Run: `bunx playwright install chromium && bun run test:e2e` Expected: 2 passed.
`CardTitle` renders a `div`; if the heading role query fails, use
`page.getByText('First note')` instead and mirror the change in `note-list.tsx`
by giving `CardTitle` an `<h2>` via `asChild`-free markup.

- [ ] **Step 5: Format and check**

Run: `bun run format && bun run check`

---

### Task 9: CI workflow at the repository root

**Files:**

- Create: `../.github/workflows/ci.yml` (repo root, outside
  `hackathon-starter/`)

- [ ] **Step 1: Write the workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

defaults:
  run:
    working-directory: hackathon-starter

env:
  BETTER_AUTH_SECRET: ci-only-secret-0123456789abcdef0123456789abcdef
  BETTER_AUTH_URL: http://localhost:3000
  NEXT_PUBLIC_APP_URL: http://localhost:3000
  NEXT_TELEMETRY_DISABLED: '1'

jobs:
  check:
    name: Lint, typecheck, unit tests, build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: hackathon-starter/package.json
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run typecheck
      - run: bun run test
      - run: bun run build

  e2e:
    name: Playwright smoke test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: hackathon-starter/package.json
      - run: bun install --frozen-lockfile
      - run: bunx playwright install --with-deps chromium
      - run: bun run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: hackathon-starter/playwright-report
          retention-days: 7
```

Check the action majors against the research notes
(`docs/superpowers/research/modern-hackathon-stack.md`) and bump if newer majors
are current.

- [ ] **Step 2: Validate the YAML**

Run: `bunx yaml-lint ../.github/workflows/ci.yml` or
`node -e "require('yaml')"`-free check: `bun -e "import('yaml')"` is not
available, so use:
`python3 -c "import yaml,sys; yaml.safe_load(open('../.github/workflows/ci.yml'))" && echo ok`.

---

### Task 10: Documentation set

**Files:**

- Create: `README.md`
- Create: `AGENTS.md` (invoke the `writing-for-agents` skill first)
- Create: `CLAUDE.md` containing `@AGENTS.md`
- Create: `PROD_CHECKLIST.md`
- Create: `LICENSE` (MIT)
- Move: research notes from the scratchpad to
  `docs/superpowers/research/modern-hackathon-stack.md`

- [ ] **Step 1: README.md** — sections, in order: one-paragraph pitch; Quick
      start (`bun install`, `bun run setup`, `bun run dev`, open
      http://localhost:3000); What's inside (table: layer → choice → where);
      Scripts (table from the spec); Project map (tree from the spec);
      Environment (link to `.env.example`, PGlite vs `DATABASE_URL`, docker
      compose); Enabling optional features (GitHub/Google OAuth callback URLs,
      AI key); Testing (unit, component, e2e, how the e2e DB is isolated);
      Deploy (Vercel + Neon: set env vars, run `bun run db:migrate` against prod
      URL); Delete what you don't need (notes example, chat, social login —
      exact files per item); Docs (spec, plan, research). Wrap at 80 columns.

- [ ] **Step 2: AGENTS.md** — for coding agents: Commands (the scripts table
      with when to use each); Conventions (Prettier from repo root, no
      semicolons; strict TS; server actions thin + `src/lib` pure; tests
      colocated; `Db` parameter injection); Feature → files map (auth, db,
      notes, chat, layout, env, tests, CI); Recipe: add a feature (schema →
      `db:generate` → `db:migrate` → `src/lib/<feature>.ts` + test → action →
      page → e2e); Recipe: remove the notes example / chat / social login (exact
      file lists); Gotchas (PGlite single instance + `serverExternalPackages`,
      `nextCookies()` last, `next typegen` before `tsc`, `.env` loaded via
      `@next/env` in tooling, e2e uses `./.data/e2e`).

- [ ] **Step 3: PROD_CHECKLIST.md** — secrets (rotate `BETTER_AUTH_SECRET`, set
      `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL` to the public origin), database
      (managed Postgres, `db:migrate` in deploy step, backups), auth hardening
      (email verification, password reset, rate limiting via Better Auth
      options, trusted origins), observability (logging, error reporting),
      security headers/CSP, legal pages, SEO/OG metadata, remove example feature
      and docs you don't ship.

- [ ] **Step 4: LICENSE** — MIT,
      `Copyright (c) 2026 Hackathon Starter contributors`.

- [ ] **Step 5: Move research notes** —
      `mv <scratchpad>/research/modern-hackathon-stack.md docs/superpowers/research/`.

- [ ] **Step 6: Format and full verification**

Run: `bun run format && bun run check && bun run build && bun run test:e2e`
Expected: all green. Record the exact output summary for the final report.

---

## Self-review

- Spec coverage: env (T1), db/PGlite/postgres/migrations (T2), auth + proxy +
  session (T3), layout/landing/error/health (T4), auth pages + account (T5),
  notes example with unit + component tests (T6), AI chat with route tests (T7),
  setup script + e2e (T8), CI at root (T9), docs + license + research (T10),
  docker-compose already present.
- Placeholders: none; every code step contains the full file.
- Type consistency: `Db` (T2) used by `createAuth` (T3) and notes (T6);
  `ActionState` defined in T6 actions and consumed by `NoteForm`;
  `SocialProvider` defined in T3 and consumed by T5 components; `getSession`
  mocked in T7 with the same module path `@/lib/session`.
