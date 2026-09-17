# Hackathon Starter notes for agents

Working notes for coding agents on this template. `package.json` `scripts` is
the command reference; `README.md` is the human quickstart. This file holds what
neither shows: conventions, the feature-to-files map, and the gotchas.

## Conventions

- Formatting comes from the repo root `.prettierrc.json` (no semicolons, single
  quotes, 120 columns). Run `bun run format` before finishing.
- `bun run check` (lint, `next typegen` + `tsc`, Vitest) must pass before any
  task is called done. `bun run test:e2e` for anything touching a page.
- Database code lives in `src/lib/*.ts` as pure functions that take a `Db`
  handle (`listNotes(db, userId)`), so Vitest runs them against an in-memory
  PGlite via `createTestDb()` in `src/test/db.ts`. Server actions in
  `src/app/**/actions.ts` stay thin: `requireUser()`, Zod parse, call the
  module, `revalidatePath`.
- Read config through `env` from `src/lib/env.ts`, never `process.env`. Optional
  integrations switch on when their variables are set.
- Tests sit next to the code (`foo.test.ts` for node, `foo.test.tsx` for jsdom).
  E2E specs live in `e2e/`. Server actions are tested by swapping their three
  Next.js seams (`@/lib/db`, `@/lib/session`, `next/cache`) for doubles and
  running the real validation and queries against PGlite; copy
  `src/app/dashboard/actions.test.ts`.
- New UI primitives come from `bun run ui:add <component>` (shadcn), not
  hand-written.

## Feature to files

| Feature         | Files                                                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Env             | `src/lib/env.ts`, `.env.example`, `scripts/setup.ts`                                                                                                                                                                          |
| Database        | `src/lib/db/client.ts` (drivers), `src/lib/db/index.ts` (`getDb()`), `src/lib/db/schema.ts`, `src/lib/db/auth-schema.ts` (generated), `drizzle/`, `drizzle.config.ts`                                                         |
| Auth            | `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/session.ts`, `src/lib/auth-providers.ts`, `src/proxy.ts`, `src/app/api/auth/[...all]/route.ts`, `src/components/auth/*`, `src/app/(auth)/*`, `src/app/account/page.tsx` |
| Notes (example) | `src/lib/notes.ts`, `src/app/dashboard/*`, `src/components/notes/*`, `notes` table in `schema.ts`, `e2e/smoke.spec.ts`                                                                                                        |
| AI chat         | `src/app/api/chat/route.ts`, `src/app/chat/page.tsx`, `src/components/chat/chat.tsx`, `GOOGLE_GENERATIVE_AI_API_KEY` + `AI_MODEL` in env                                                                                      |
| Layout / theme  | `src/app/layout.tsx`, `src/components/site-header.tsx`, `src/components/theme-provider.tsx`, `src/app/globals.css`, `components.json`                                                                                         |
| Tests           | `vitest.config.mts`, `src/test/*`, `playwright.config.ts`, `e2e/`                                                                                                                                                             |
| CI              | `.github/workflows/ci.yml`                                                                                                                                                                                                    |

## Recipe: add a feature

1.  Add the table to `src/lib/db/schema.ts`. Done when `bun run db:generate`
    writes a new file under `drizzle/`.
2.  Run `bun run db:migrate` (stop `bun run dev` first on PGlite; see gotchas).
    Done when it reports the migration applied.
3.  Write `src/lib/<feature>.test.ts` against `createTestDb()`, watch it fail,
    then write `src/lib/<feature>.ts` until it passes.
4.  Add `src/app/<feature>/actions.ts` (auth + Zod + module call) and the page
    under `src/app/<feature>/`. Protect it by calling `requireUser()` and adding
    the path to the `matcher` in `src/proxy.ts`.
5.  Extend `e2e/smoke.spec.ts` or add a spec. Done when `bun run check` and
    `bun run test:e2e` both pass.

## Recipe: remove what you do not need

Delete every file in the row above, then run `bun run check` and fix what
breaks. Specifics:

- **Notes example**: also drop the `notes` table, the `Note` type, and the
  imports they used from `schema.ts` (leave `export * from './auth-schema'`),
  regenerate migrations from scratch (delete `drizzle/` and `.data/`, then run
  `db:generate`), remove the Dashboard link in `site-header.tsx` and
  `/dashboard` from `proxy.ts`, and rewrite the dashboard portion of
  `e2e/smoke.spec.ts`.
- **AI chat**: also remove `ai`, `@ai-sdk/react`, `@ai-sdk/google` with
  `bun remove`, the `GOOGLE_GENERATIVE_AI_API_KEY`/`AI_MODEL` entries in
  `env.ts`, `env.test.ts`, and `.env.example`, the Chat link in
  `site-header.tsx`, and `/chat` in `proxy.ts`.
- **Social login**: remove `src/lib/auth-providers.ts` and the `socialProviders`
  line that imports it in `auth.ts`, `src/components/auth/social-buttons.tsx`,
  the `providers` prop in both auth forms and pages (and the `connection()` call
  those pages only need for reading env per request), and the four `*_CLIENT_*`
  variables in `env.ts` and `.env.example`.

## Gotchas

- **PGlite allows one open instance per data directory.** `getDb()` caches the
  instance for that reason. Stop the dev server before running `db:migrate` or
  `auth:schema`; they open the same directory from another process. Playwright
  avoids the clash by using `./.data/e2e`.
- **Never open the database at import time.** `getDb()` and `getAuth()` are lazy
  so tests, `next build`, and the Better Auth CLI can import modules without
  side effects. Keep new code on that pattern.
- **Pages that read `env` render static unless they use a request API.** Next
  prerenders any page without dynamic data at build time, freezing the env
  values it read. `/sign-in` and `/sign-up` call `await connection()` from
  `next/server` so the OAuth buttons follow the running deployment's env. Do the
  same for any new page whose output depends on `env`.
- **PGlite is for local work.** `getDb()` warns at startup when
  `NODE_ENV=production` and `DATABASE_URL` is unset; serverless filesystems are
  read-only or ephemeral, so production needs a managed Postgres.
- **Custom type utilities are `type-*`, not `text-*`.** `cn()` runs
  tailwind-merge, which treats any unknown `text-*` class as a colour and drops
  the real colour class next to it (labels vanish). The Geist type scale in
  `globals.css` is therefore `type-heading-32`, `type-copy-14`, and so on.
- **Cross auth boundaries through `continueAfterAuth()`** in
  `src/app/(auth)/actions.ts`. `<Link>` prefetches `/dashboard` while the
  visitor is anonymous, the proxy answers with a redirect, and the client router
  caches it; a later `router.push` reuses the stale redirect (production only,
  since dev never prefetches). A server-action `redirect()` ships fresh RSC data
  for the target, and `window.location.assign` would trip the
  `no-location-assign-relative-destination` lint rule.
- **`nextCookies()` must be the last plugin** in `betterAuth({ plugins })`.
- **`auth-schema.ts` is generated.** Change auth options in `auth.ts`, run
  `bun run auth:schema` (needs `.env`), then `bun run db:generate`. Hand edits
  are overwritten.
- **AI SDK packages move together.** `@ai-sdk/react` pins an exact `ai` version;
  bump `ai`, `@ai-sdk/react`, and `@ai-sdk/google` in one go. In AI SDK 7 the
  prompt option is `instructions` (`system` is deprecated) and responses use
  `createUIMessageStreamResponse` + `toUIMessageStream`.
- **Pinned majors on purpose**: `typescript ^5.9` and `eslint ^9` (Next 16's
  supported matrix), `vitest ^4.1` (5.0 shipped 2026-09-03). Reasons and
  sources: `docs/superpowers/research/modern-hackathon-stack.md`.
- **`middleware.ts` is `proxy.ts`** in Next 16, exporting `proxy`.

## Docs

- `docs/superpowers/specs/modern-stack-design.md`: why the stack looks like
  this.
- `docs/superpowers/plans/modern-stack.md`: how it was built, task by task.
- `docs/superpowers/research/modern-hackathon-stack.md`: verified versions and
  API shapes with sources.
- `PROD_CHECKLIST.md`: before you point real users at it.
