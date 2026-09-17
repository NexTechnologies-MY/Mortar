# Modern hackathon stack design

> Written while the app lived in `hackathon-starter/`; it now lives at the
> repository root, so drop that prefix from paths.

Replace the cloned `sahat/hackathon-starter` (Express 5, Pug, jQuery, Bootstrap,
MongoDB, CommonJS, 12 OAuth providers, ~25 API demos) with a 2026-era full-stack
template that a 2–4 person team can clone and ship from inside a 24–48 hour
hackathon.

## Assumptions

This spec was produced in an autonomous session (`/goal`), so the questions a
brainstorm would normally ask were answered with the assumptions below. Any of
them can be reversed by editing the plan before or after implementation.

1.  "Refactor to a full modern dev stack" means **replace the stack**, not port
    the Express app file by file. Nothing from the old code is kept; the ideas
    that made it a good starter (auth, account page, one worked example of each
    layer, an agent-oriented dependency map, a production checklist) are rebuilt
    on the new stack.
2.  The template lives inside this repository as plain files. The nested `.git`
    that came with the clone is removed so `hackathon-starter/` becomes part of
    the template repo instead of an unregistered embedded repo.
3.  The parent repo's conventions win where they overlap: Bun as the package
    manager, the parent `.prettierrc.json` (no semicolons, single quotes, 120
    columns) for formatting, Husky + lint-staged at the repo root.
4.  Local development must work with **zero external services**: no Docker, no
    database server, no API keys. Optional integrations (OAuth providers, AI)
    turn on when their env vars are present.
5.  The primary deploy target is Vercel + a hosted Postgres (Neon, Supabase,
    etc.). No Dockerfile: Railway, Render, and Fly auto-detect Next.js, and the
    Docker daemon was unavailable to verify an image build.
6.  Nothing is committed to git; the user reviews the working tree.

## Goals

- `bun install && bun run setup && bun dev` produces a running app with sign-up,
  sign-in, a protected dashboard, and a working example feature.
- Every layer has exactly one worked example to copy: DB table → query module →
  server action → page → unit test → e2e test.
- Type safety end to end: strict TypeScript, typed env, typed DB, typed auth.
- Fast feedback: Turbopack dev server, Vitest unit tests in seconds, one
  Playwright smoke test, ESLint + `tsc` + tests in CI.
- Docs that an agent can act on: `AGENTS.md` maps features to files and lists
  the exact commands; `README.md` is the human quickstart.

## Non-goals

- Reproducing the ~25 third-party API demos or 12 OAuth providers.
- Multi-tenant orgs, billing, email verification, password reset emails. (Better
  Auth supports them; the checklist points to the docs.)
- A design system beyond shadcn/ui defaults. Teams restyle during the event.
- Mobile, i18n, analytics.

## Stack

| Layer         | Choice                                              | Why                                                                   |
| ------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| Runtime / PM  | Node 24+, Bun 1.4 (install + scripts)               | Parent repo standard; fastest install; `bun.lock` committed           |
| Framework     | Next.js 16 (App Router, Turbopack), React 19        | Most widely known full-stack React; one-click Vercel deploy           |
| Language      | TypeScript 5.9 (strict)                             | Next 16 pins `typescript ^5`; TS 7 (native) not yet in Next's matrix  |
| Styling / UI  | Tailwind CSS 4, shadcn/ui (new-york, neutral)       | De facto standard; components are copied in, so they are editable     |
| Database      | Postgres dialect via Drizzle ORM 0.45               | Typed schema + SQL-like queries; `drizzle-kit` migrations             |
| Local DB      | PGlite (Postgres in WASM, file-persisted)           | Zero infra locally; same dialect and schema as production             |
| Prod DB       | Any Postgres via `DATABASE_URL` (`postgres` driver) | Neon/Supabase/Railway; `docker-compose.yml` for a local real Postgres |
| Auth          | Better Auth 1.7 (email+password, GitHub, Google)    | Current mainstream for Next.js; Drizzle adapter; social opt-in        |
| AI            | Vercel AI SDK 7 + `@ai-sdk/google` (Gemini)         | Provider-agnostic streaming chat; one route + one page                |
| Env           | `@t3-oss/env-nextjs` + Zod 4                        | Boot fails loudly on missing/invalid env instead of at 3 a.m.         |
| Unit tests    | Vitest 4.1, Testing Library, jsdom                  | Vitest 5.0 shipped 2026-09-03; too fresh for a template               |
| E2E tests     | Playwright 1.63                                     | One smoke test through sign-up → dashboard → create item              |
| Lint / format | ESLint 9 + `eslint-config-next`; parent Prettier    | ESLint 9 is Next 16's supported major; formatting is the repo's job   |
| CI            | GitHub Actions (`.github/workflows/ci.yml` at root) | Workflows only run from the repo root                                 |

## Architecture

```text
hackathon-starter/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # fonts, theme, <SiteHeader/>, toaster
│   │   ├── page.tsx              # landing: what this is + links
│   │   ├── (auth)/sign-in/page.tsx
│   │   ├── (auth)/sign-up/page.tsx
│   │   ├── dashboard/            # protected; the example feature ("notes")
│   │   │   ├── layout.tsx        # requireUser() → redirect to /sign-in
│   │   │   ├── page.tsx
│   │   │   └── actions.ts        # server actions: auth check + zod + lib call
│   │   ├── account/page.tsx      # profile: edit name, show email, sign out
│   │   ├── chat/page.tsx         # AI chat (needs ANTHROPIC_API_KEY, signed in)
│   │   └── api/
│   │       ├── auth/[...all]/route.ts   # Better Auth handler
│   │       ├── chat/route.ts            # streamText → UI message stream
│   │       └── health/route.ts          # { ok: true } for CI / uptime
│   ├── components/
│   │   ├── ui/                   # shadcn: button, input, label, card, textarea
│   │   ├── site-header.tsx
│   │   ├── auth/                 # sign-in-form.tsx, sign-up-form.tsx, social-buttons.tsx
│   │   ├── notes/                # note-form.tsx, note-list.tsx
│   │   └── chat/chat.tsx
│   ├── lib/
│   │   ├── env.ts                # createEnv(): server + client schemas
│   │   ├── db/index.ts           # drizzle client: PGlite or postgres-js
│   │   ├── db/schema.ts          # auth tables (generated) + notes
│   │   ├── auth.ts               # betterAuth({...}) server instance
│   │   ├── auth-client.ts        # createAuthClient() for React
│   │   ├── session.ts            # getSession(), requireUser()
│   │   ├── notes.ts              # pure DB module: list/create/delete (unit-tested)
│   │   └── utils.ts              # cn()
│   └── proxy.ts                  # cookie-based redirect for /dashboard, /account, /chat
├── drizzle/                      # generated SQL migrations (committed)
├── e2e/                          # Playwright specs
├── scripts/setup.ts              # .env from example + secret + migrate
├── public/
├── docs/                         # research, spec, plan
├── drizzle.config.ts  next.config.ts  vitest.config.ts  playwright.config.ts
├── eslint.config.mjs  postcss.config.mjs  components.json  tsconfig.json
├── docker-compose.yml            # optional real Postgres
├── .env.example  .gitignore  package.json  bun.lock
└── README.md  AGENTS.md  CLAUDE.md  PROD_CHECKLIST.md  LICENSE
```

### Data flow for the example feature

1.  `src/lib/db/schema.ts` defines `notes` (id, userId → user.id, title, body,
    createdAt). `bun run db:generate` writes SQL to `drizzle/`;
    `bun run db:migrate` applies it to whichever database the env selects.
2.  `src/lib/notes.ts` exposes `listNotes(db, userId)`, `createNote(db, input)`,
    `deleteNote(db, userId, id)`. It takes the `db` handle as a parameter so
    unit tests pass an in-memory PGlite.
3.  `src/app/dashboard/actions.ts` (`'use server'`) calls `requireUser()`,
    validates `FormData` with Zod, calls the lib, then `revalidatePath`.
4.  `src/app/dashboard/page.tsx` (server component) reads the session and notes,
    renders `<NoteForm/>` and `<NoteList/>`; the form posts to the action with
    `useActionState` for pending/error UI.

### Database client

```ts
// src/lib/db/index.ts (shape)
type Db = PgDatabase<PgQueryResultHKT, typeof schema>
function createDb(): Db {
  if (env.DATABASE_URL)
    return drizzlePostgres(postgres(env.DATABASE_URL), { schema })
  return drizzlePglite(new PGlite(env.PGLITE_DATA_DIR), { schema })
}
export const db = globalForDb.db ?? createDb() // cached across HMR
```

`drizzle.config.ts` mirrors the branch: `dbCredentials.url = DATABASE_URL`, or
`driver: 'pglite'` with the data dir. `next.config.ts` lists
`@electric-sql/pglite` in `serverExternalPackages`.

### Auth

- Server:
  `betterAuth({ database: drizzleAdapter(db, { provider: 'pg', schema }), emailAndPassword: { enabled: true }, socialProviders: {...only if env set}, plugins: [nextCookies()] })`.
- Tables `user`, `session`, `account`, `verification` come from
  `bunx @better-auth/cli generate` and live in `schema.ts` next to `notes`.
- `src/lib/session.ts`: `getSession()` wraps `auth.api.getSession({ headers })`
  in React `cache()`; `requireUser()` redirects to `/sign-in`.
- `src/proxy.ts` uses `getSessionCookie(request)` for an optimistic redirect;
  the real check stays in the protected layouts.
- Client: `createAuthClient()`; forms call `signUp.email`, `signIn.email`,
  `signIn.social({ provider })`; header uses `useSession()` and `signOut()`.

### AI chat

- `POST /api/chat`: requires a session; returns 503 with a readable message if
  `GOOGLE_GENERATIVE_AI_API_KEY` is unset; otherwise
  `streamText({ model: google(env.AI_MODEL), messages: await convertToModelMessages(messages) }).toUIMessageStreamResponse()`.
- `/chat` page: `useChat` with `DefaultChatTransport`, renders `parts` of type
  `text`; shows the 503 message inline when the key is missing.
- Model id is read from `AI_MODEL` with a Gemini default (free tier on AI
  Studio); provider swap is a one-line change because the SDK is
  provider-agnostic.

### Env

`src/lib/env.ts` (t3-env): server `DATABASE_URL?`, `PGLITE_DATA_DIR` (default
`./.data/pglite`), `BETTER_AUTH_SECRET` (min 32 chars), `BETTER_AUTH_URL`,
`GITHUB_CLIENT_ID?`/`GITHUB_CLIENT_SECRET?`,
`GOOGLE_CLIENT_ID?`/`GOOGLE_CLIENT_SECRET?`, `GOOGLE_GENERATIVE_AI_API_KEY?`,
`AI_MODEL`; client `NEXT_PUBLIC_APP_URL`. Empty strings are treated as
undefined. `SKIP_ENV_VALIDATION=1` bypasses validation for Docker-style builds.

### Error handling

- Env: invalid env throws at import with the offending keys listed.
- DB: connection errors surface as thrown errors in server components; the App
  Router `error.tsx` at `src/app/error.tsx` renders a retry UI.
- Server actions return `{ error: string }` for validation/auth failures instead
  of throwing, so forms can render them.
- Auth: Better Auth client errors (`error.message`) are shown under the form.
- AI: missing key → 503 JSON; provider errors → the SDK's stream error part,
  rendered inline.

## Testing

| Level     | Tool                         | What                                                                     |
| --------- | ---------------------------- | ------------------------------------------------------------------------ |
| Unit      | Vitest (node env)            | `src/lib/notes.test.ts` against in-memory PGlite with migrations applied |
| Unit      | Vitest (node env)            | `src/lib/env.test.ts`: valid env parses, empty string → undefined        |
| Component | Vitest (jsdom) + Testing Lib | `note-form.test.tsx`: renders, disables submit while pending             |
| Route     | Vitest (node env)            | `api/health` returns `{ ok: true }`; `api/chat` 401/503 branches         |
| E2E       | Playwright (chromium)        | landing → sign-up → dashboard → create note → visible → sign out         |
| Static    | `tsc --noEmit`, ESLint       | run in `bun run check` and CI                                            |

Vitest uses two projects in one config: `unit` (node) for `src/lib/**` and
`src/app/api/**`, `dom` (jsdom) for `src/components/**`. E2E runs against a dev
server started by Playwright's `webServer` with `PGLITE_DATA_DIR=./.data/e2e`
and a fresh migrate, so the developer's local DB is untouched.

## Scripts (`package.json`)

| Script          | Command                                                |
| --------------- | ------------------------------------------------------ |
| `dev`           | `next dev`                                             |
| `build`/`start` | `next build` / `next start`                            |
| `setup`         | `bun run scripts/setup.ts` (env file, secret, migrate) |
| `db:generate`   | `drizzle-kit generate`                                 |
| `db:migrate`    | `drizzle-kit migrate`                                  |
| `db:studio`     | `drizzle-kit studio`                                   |
| `auth:schema`   | `@better-auth/cli generate` (regenerate auth tables)   |
| `lint`          | `eslint`                                               |
| `typecheck`     | `tsc --noEmit`                                         |
| `format`        | `prettier --write .` (parent config resolves upward)   |
| `test`          | `vitest run`                                           |
| `test:watch`    | `vitest`                                               |
| `test:e2e`      | `playwright test`                                      |
| `check`         | `lint && typecheck && test`                            |
| `ui:add`        | `shadcn add` passthrough                               |

## CI

`.github/workflows/ci.yml` at the repository root (a workflow inside
`hackathon-starter/` would never run). Two jobs on push/PR, both with
`defaults.run.working-directory: hackathon-starter` and `oven-sh/setup-bun`:

1.  `check`: `bun install --frozen-lockfile`, `bun run lint`,
    `bun run typecheck`, `bun run test`, `bun run build` (with
    `SKIP_ENV_VALIDATION=1` and a throwaway `BETTER_AUTH_SECRET`).
2.  `e2e`: install chromium, `bun run test:e2e`, upload the Playwright report on
    failure.

## Documentation set

- `README.md`: 5-minute quickstart, stack table, project map, scripts, deploy
  (Vercel + Neon), "delete what you don't need".
- `AGENTS.md`: for coding agents; commands, conventions, feature→files map, the
  add-a-feature recipe, and the removal recipe (notes example, AI, social
  login). `CLAUDE.md` contains `@AGENTS.md`.
- `PROD_CHECKLIST.md`: rewritten for this stack (secrets, DB, auth hardening,
  rate limits, logging, SEO, legal pages).
- `docs/superpowers/research/modern-hackathon-stack.md`: the research notes with
  sources that justify the versions and APIs used here.

## Open risks

- **PGlite under Turbopack**: needs `serverExternalPackages`; if the WASM loader
  misbehaves in `next dev`, fall back to `driver: 'pglite'` only for tests and
  require Docker Postgres locally (compose file already present).
- **Better Auth CLI + PGlite**: the CLI imports `src/lib/auth.ts`, which
  instantiates the DB. If it cannot load PGlite, generate against `DATABASE_URL`
  once or hand-write the four tables from the docs.
- **Freshness**: AI SDK 7 and Next 16 APIs are verified from official docs
  during research; anything that fails at build time is fixed against the docs,
  not memory.
