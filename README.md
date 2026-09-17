# Hackathon Starter

A full-stack Next.js template for teams that have 24 to 48 hours and an idea.
Sign-up, a database, a worked example feature, an AI chat, tests, and CI are
already here and green. Delete what you do not need and start on the idea.

## Quick start

```bash
bun install
bun run setup   # writes .env with a generated secret, applies migrations
bun run dev     # http://localhost:3000
```

No Docker, no database server, no API keys. The database is
[PGlite](https://pglite.dev), a real Postgres running in-process and stored
under `.data/pglite`.

Requirements: [Bun](https://bun.sh) 1.4+ and Node.js 22+ (Next.js runs on Node).

## What is inside

| Layer      | Choice                                          | Where to look                            |
| ---------- | ----------------------------------------------- | ---------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack), React 19    | `src/app/`                               |
| Language   | TypeScript 5.9, strict                          | `tsconfig.json`                          |
| UI         | Tailwind CSS 4, shadcn/ui, Geist                | `src/components/ui/`, `globals.css`      |
| Database   | Drizzle ORM, Postgres dialect                   | `src/lib/db/`, `drizzle/`                |
| Local DB   | PGlite (zero setup)                             | `PGLITE_DATA_DIR` in `.env`              |
| Prod DB    | Any Postgres via `DATABASE_URL`                 | `docker-compose.yml` for a local one     |
| Auth       | Better Auth: email + password, GitHub, Google   | `src/lib/auth.ts`, `src/lib/session.ts`  |
| Example    | Notes: table, query module, server action, page | `src/lib/notes.ts`, `src/app/dashboard/` |
| AI         | AI SDK 7 + Gemini, streaming chat               | `src/app/api/chat/route.ts`              |
| Env        | `@t3-oss/env-nextjs` + Zod, validated at boot   | `src/lib/env.ts`, `.env.example`         |
| Unit tests | Vitest + Testing Library, in-memory Postgres    | `src/**/*.test.ts(x)`, `src/test/`       |
| E2E        | Playwright smoke test                           | `e2e/`, `playwright.config.ts`           |
| Lint       | ESLint 9 (`eslint-config-next`), Prettier       | `eslint.config.mjs`, `.prettierrc.json`  |
| CI         | GitHub Actions: check + e2e                     | `.github/workflows/ci.yml`               |

## Scripts

| Script                            | What it does                                                  |
| --------------------------------- | ------------------------------------------------------------- |
| `bun run dev`                     | Dev server with hot reload                                    |
| `bun run build` / `start`         | Production build / serve                                      |
| `bun run setup`                   | Create `.env` if missing, generate secret, run migrations     |
| `bun run db:generate`             | Turn schema changes into SQL under `drizzle/`                 |
| `bun run db:migrate`              | Apply migrations (PGlite or `DATABASE_URL`)                   |
| `bun run db:studio`               | Browse the database in Drizzle Studio                         |
| `bun run auth:schema`             | Regenerate the Better Auth tables after changing auth options |
| `bun run check`                   | Lint, typecheck, unit tests. Run before you push              |
| `bun run lint` / `typecheck`      | ESLint / `next typegen && tsc --noEmit` on their own          |
| `bun run test` / `test:watch`     | Vitest                                                        |
| `bun run test:e2e`                | Playwright against a dev server on port 3100 and its own DB   |
| `bun run format` / `format:check` | Prettier                                                      |
| `bun run ui:add <name>`           | Add a shadcn/ui component                                     |

## Project map

```text
src/
  app/
    page.tsx                  landing
    (auth)/sign-in, sign-up   auth pages
    dashboard/                protected; the notes example (page, actions)
    account/                  edit name, sign out
    chat/                     AI chat (needs GOOGLE_GENERATIVE_AI_API_KEY)
    api/auth/[...all]         Better Auth handler
    api/chat                  streaming chat route
    api/health                { ok: true }
  components/                 ui/ (shadcn), auth/, notes/, chat/, site-header
  lib/
    env.ts                    typed env
    db/                       client.ts (drivers), index.ts (getDb), schema.ts
    auth.ts, auth-client.ts   server and browser auth
    session.ts                getSession(), requireUser()
    notes.ts                  example query module (unit-tested)
  proxy.ts                    redirects anonymous visitors (Next 16 middleware)
  test/                       createTestDb(), jsdom setup
drizzle/                      SQL migrations (committed)
e2e/                          Playwright specs
scripts/setup.ts              one-time local setup
docs/                         design spec, build plan, stack research
```

## Environment

Copy `.env.example` to `.env` (or let `bun run setup` do it). Everything
optional stays blank until you need it:

- `DATABASE_URL` blank: PGlite in `PGLITE_DATA_DIR`. Set it to a Postgres URL
  (Neon, Supabase, or `docker compose up -d` for the bundled one) and run
  `bun run db:migrate`.
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID` +
  `GOOGLE_CLIENT_SECRET`: social login buttons appear when both halves of a pair
  are set. Callback URL: `<BETTER_AUTH_URL>/api/auth/callback/<provider>`.
- `GOOGLE_GENERATIVE_AI_API_KEY`: turns `/chat` on. Get a free key at
  https://aistudio.google.com/. `AI_MODEL` picks the model (default
  `gemini-3.5-flash-lite`). Any AI SDK provider works with a one-line change in
  `src/app/api/chat/route.ts`.

## Testing

- Unit and component tests run in about two seconds against a fresh in-memory
  PGlite with all migrations applied (`createTestDb()` in `src/test/db.ts`). No
  mocks for the database.
- The Playwright smoke test signs up, adds a note, and signs out. It starts its
  own dev server on port 3100 with `PGLITE_DATA_DIR=./.data/e2e`, so your local
  data is untouched. First run: `bunx playwright install chromium`.

## Deploy

1.  Create a Postgres database (Neon, Supabase, Railway, or similar) and copy
    its connection string.
2.  Deploy to Vercel (or any Node host) with these variables set:
    `DATABASE_URL`, `BETTER_AUTH_SECRET` (new random 32+ characters),
    `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` (your public origin), plus any
    OAuth or AI keys you use.
3.  Run the migrations against production once:
    `DATABASE_URL=... bun run db:migrate`.
4.  Read `PROD_CHECKLIST.md` before announcing the URL.

## Delete what you do not need

`AGENTS.md` lists the exact files behind the notes example, the AI chat, and
social login, and how to remove each cleanly.

## Docs

- `docs/superpowers/specs/modern-stack-design.md`: design and the reasoning
  behind each choice.
- `docs/superpowers/research/modern-hackathon-stack.md`: versions and API shapes
  verified against official sources.
- `AGENTS.md` and `docs/agents/`: rules and notes for coding agents.
- `docs/markdown-style.md`: how Markdown in this repository is written.

## License

MIT. See `LICENSE`.
