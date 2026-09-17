# Modern hackathon stack

Stack: Next.js + Drizzle/PGlite + Better Auth + AI SDK + Tailwind/shadcn +
Vitest/Playwright + Bun. Verified against primary sources on 2026-09-09.

Method: every version below was read from the npm registry
(`npm view <pkg> dist-tags|time|peerDependencies`) or GitHub releases (`gh api`)
today; every API/snippet was copied from the official docs (or the docs' source
`.mdx` in the project repo, or the tool's own `--help`). Two things were
additionally verified empirically in the scratchpad:
`bun create next-app@16.3.4 --yes` + `bunx shadcn@4.21.0 init -d -y`, and a
PGlite 0.5.8 + drizzle-orm 0.45.2 route handler under
`next build`/`next start`/`next dev` (Turbopack) with and without
`serverExternalPackages`.

## Recommendations

| Package                                                                                                       | Pin                                                                                                                      | Why (see sections)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next`                                                                                                        | `16.3.4`                                                                                                                 | `latest` (2026-08-31). Node ≥ 20.9. Turbopack default; `proxy.ts` replaces `middleware.ts`.                                                                                                                                                                                                                                                                                                                                                                                             |
| `react`, `react-dom`                                                                                          | `19.2.8`                                                                                                                 | `latest`; what create-next-app 16.3.4 installs.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `@types/react` / `@types/react-dom`                                                                           | `^19` (19.2.18 / 19.2.7)                                                                                                 | create-next-app defaults.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **`typescript`**                                                                                              | **`~5.9.3` (NOT 7.0.2)**                                                                                                 | npm `latest` = 7.0.2 = the Go-native compiler. Its tarball has **no `lib/typescript.js`** (no programmatic API until 7.1). `typescript-eslint` (pulled in by `eslint-config-next/typescript`) supports `>=4.8.4 <6.1.0`. create-next-app 16.3.4 itself pins `"typescript": "^5"`. Next 16.3 _can_ type-check with TS 7 (it shells out to `tsc`), but your lint toolchain cannot. `^6.0.3` also works with typescript-eslint but changes tsconfig defaults; not worth it for a template. |
| `@types/node`                                                                                                 | `^24` (24.13.3)                                                                                                          | Run on Node 24 LTS ("Krypton"). Floors: ai@7 Node 22+, vitest 5 Node ≥ 22.12, jsdom 30 Node ^22.22.2 ‖ ^24.15 ‖ ≥26, eslint 10 Node ^20.19 ‖ ^22.13 ‖ ≥24.                                                                                                                                                                                                                                                                                                                              |
| `tailwindcss`, `@tailwindcss/postcss`                                                                         | `4.3.3`                                                                                                                  | `latest` (2026-07-16).                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `shadcn` (CLI **and** runtime dep)                                                                            | `4.21.0`                                                                                                                 | `latest` (2026-09-04). v4 CLI adds `shadcn` as a dependency (`@import "shadcn/tailwind.css"`), default preset `base-nova` = **Base UI**, not Radix (`-b radix` for Radix).                                                                                                                                                                                                                                                                                                              |
| `drizzle-orm` / `drizzle-kit`                                                                                 | `0.45.2` / `0.31.10`                                                                                                     | `latest` tags. 1.0 is still RC (`rc` = 1.0.0-rc.4, 2026-06-27); the docs site defaults to `@rc` install commands — ignore that. vercel/ai-chatbot ships `^0.45.2`/`^0.31.10`.                                                                                                                                                                                                                                                                                                           |
| `@electric-sql/pglite`                                                                                        | `0.5.8`                                                                                                                  | `latest` (2026-08-26), embeds PostgreSQL 18.3. Works in Next 16.3.4 route handlers under Turbopack with or without `serverExternalPackages` (verified).                                                                                                                                                                                                                                                                                                                                 |
| `postgres` (postgres.js) or `pg`                                                                              | `3.4.9` / `8.23.0` (+`@types/pg`)                                                                                        | Prod driver. `pg` is on Next's auto-external list.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `better-auth`                                                                                                 | `1.7.3`                                                                                                                  | `latest` (2026-09-06; 1.7.0 = 2026-08-18). Peer `next ^14‖^15‖^16`, `drizzle-orm ^0.45.2 ‖ ≥1.0.0-rc.1`.                                                                                                                                                                                                                                                                                                                                                                                |
| `@better-auth/drizzle-adapter`                                                                                | `1.7.3`                                                                                                                  | New package the adapter docs use; `better-auth/adapters/drizzle` is still exported from `better-auth@1.7.3` too.                                                                                                                                                                                                                                                                                                                                                                        |
| Better Auth CLI                                                                                               | `bunx auth@latest …` (auth 1.7.3)                                                                                        | **`@better-auth/cli` is deprecated** (last 1.4.21, npm deprecation notice). The CLI is now the npm package `auth` (bins `auth` and `better-auth`).                                                                                                                                                                                                                                                                                                                                      |
| `ai` / `@ai-sdk/react` / `@ai-sdk/anthropic`                                                                  | `7.0.94` / `4.0.97` / `4.0.50`                                                                                           | AI SDK 7 GA 2026-06-25 (2.5 months). `@ai-sdk/react@4.0.97` depends on `ai@7.0.94` **exactly** — bump them together. ESM-only, Node 22+. Fallback: `ai-v6` dist-tag = 6.0.278 (`@ai-sdk/react` 3.0.281, `@ai-sdk/anthropic` 3.0.116).                                                                                                                                                                                                                                                   |
| `zod`                                                                                                         | `4.5.4`                                                                                                                  | `latest`; `@ai-sdk/anthropic` peer `^3.25.76 ‖ ^4.1.8`; t3-env peer `^3.24 ‖ ^4`.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@t3-oss/env-nextjs`                                                                                          | `0.13.11`                                                                                                                | `latest`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `vitest`                                                                                                      | `5.0.0` (+ `vite@^8` 8.2.2 explicitly)                                                                                   | GA 2026-09-03 (6 days old). **`vite` became a required peerDependency in 5.0** (`^6.4.0 ‖ ^7 ‖ ^8`; was a `dependency` in 4.1.11) — install it. Fallback for a conservative template: `vitest@4.1.11` (2026-08-18), identical config.                                                                                                                                                                                                                                                   |
| `@vitejs/plugin-react`                                                                                        | `6.1.1`                                                                                                                  | Peer `vite ^8.0.0`. (5.2.0 for vite 7.)                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `vite-tsconfig-paths` | `30.0.1`, `16.3.3`, `10.4.1`, `7.0.1`, `6.1.1`                                                                           | All `latest`. RTL 16 needs `@testing-library/dom` as a peer.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `@playwright/test`                                                                                            | `1.63.0`                                                                                                                 | `latest` (2026-09-04).                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `eslint` / `eslint-config-next` / `eslint-config-prettier`                                                    | `10.10.0` / `16.3.4` / `10.1.8`                                                                                          | `eslint-config-next` peer `eslint >=9.0.0` (create-next-app pins `^9`; 10 satisfies). Prettier bridge via `eslint-config-prettier/flat`.                                                                                                                                                                                                                                                                                                                                                |
| `prettier` / `prettier-plugin-tailwindcss`                                                                    | `3.9.6` / `0.8.1`                                                                                                        | `latest`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Bun                                                                                                           | `1.4.2`                                                                                                                  | `latest`; text lockfile `bun.lock`; `bun install --frozen-lockfile` in CI. create-next-app writes `"packageManager": "bun@1.4.2"`.                                                                                                                                                                                                                                                                                                                                                      |
| GitHub Actions                                                                                                | `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`, `actions/cache@v6`, `oven-sh/setup-bun@v2` | Latest majors (v7.0.1, v7.0.0, v7.0.1, v6.1.0, v2.2.0).                                                                                                                                                                                                                                                                                                                                                                                                                                 |

"Use an older major" calls: TypeScript 5.9.x (not 7), Drizzle 0.45/0.31 (not
1.0-rc). Everything else: current major.

---

## 1. Next.js 16.3.4 — create-next-app, proxy.ts, next.config.ts, TypeScript support

**Versions:** `next@16.3.4` (published 2026-08-31; 16.3.0 = 2026-08-03; 16.0.0 =
2025-10-22). `engines.node: ">=20.9.0"`. Peer `@playwright/test ^1.51.1`,
`babel-plugin-react-compiler *`.

**create-next-app defaults** (docs): `--yes` "skips prompts using saved
preferences or defaults. The default setup enables TypeScript, Tailwind CSS,
ESLint, App Router, and Turbopack, with import alias `@/*`, and includes
`AGENTS.md` (with a `CLAUDE.md` that references it)". Prompt shown:
`Yes, use recommended defaults - TypeScript, ESLint, Tailwind CSS, App Router, AGENTS.md`.

```bash
bun create next-app@latest my-app --yes
```

Flags (verbatim subset): `--ts`/`--typescript` (default), `--tailwind`
(default), `--react-compiler`, `--eslint`, `--biome`, `--no-linter`, `--app`,
`--api` (route handlers only), `--src-dir`, `--turbopack` (enabled by default),
`--webpack`, `--import-alias <alias>` (default `@/*`), `--empty`, `--use-bun`,
`--skip-install`, `--disable-git`, `--agents-md` (default), `--yes`, `--no-*` to
negate.

What `bun create next-app@16.3.4 --yes --use-bun` actually generated today
(package.json):

```json
"dependencies": { "next": "16.3.4", "react": "19.2.8", "react-dom": "19.2.8" },
"devDependencies": {
  "@tailwindcss/postcss": "^4", "@types/node": "^20", "@types/react": "^19", "@types/react-dom": "^19",
  "eslint": "^9", "eslint-config-next": "16.3.4", "tailwindcss": "^4", "typescript": "^5"
},
"packageManager": "bun@1.4.2"
```

Template files (repo `packages/create-next-app/templates/app-tw/ts` @ v16.3.4):
`eslint.config.mjs`, `next.config.ts` (empty `NextConfig`),
`postcss.config.mjs`, `tsconfig.json` (`target ES2017`, `module esnext`,
`moduleResolution bundler`, `strict`, `noEmit`, `jsx react-jsx`,
`plugins:[{name:"next"}]`, `paths {"@/*":["./*"]}`, includes
`.next/types/**/*.ts` and `.next/dev/types/**/*.ts`), `app/globals.css` starting
with `@import "tailwindcss";`. React Compiler in create-next-app pins
`"babel-plugin-react-compiler": "1.0.0"`.

**`middleware.ts` → `proxy.ts`: yes.** Docs: "The `middleware` file convention
is deprecated and has been renamed to `proxy`." Version history: "`v16.0.0`
Middleware is deprecated and renamed to Proxy. Proxy defaults to the Node.js
runtime". "Proxy defaults to using the Node.js runtime. The `runtime` config
option is not available in Proxy files." Upgrade guide: "The `edge` runtime is
**NOT** supported in `proxy`." Codemod:
`npx @next/codemod@canary middleware-to-proxy .`

```ts
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*'
}
```

(`export default` also allowed; `NextProxy` type exists:
`export const proxy: NextProxy = (request, event) => …`.)

**`serverExternalPackages`** (stable since 15.0.0): "If a dependency is using
Node.js specific features, you can choose to opt-out specific dependencies from
the Server Components bundling and use native Node.js `require`."

```js
const nextConfig = { serverExternalPackages: ['@acme/ui'] }
```

Built-in auto-external list includes `pg`, `better-sqlite3`, `@prisma/client`,
`prisma`, `jsdom`, `playwright`, `sharp`, `typescript`, … —
**`@electric-sql/pglite` is NOT on it** (but see §4: it works anyway).

**`output: 'standalone'`:** `module.exports = { output: 'standalone' }` →
"`.next/standalone` which can then be deployed on its own without installing
`node_modules`", plus minimal `server.js` ("does not copy the `public` or
`.next/static` folders by default"):
`cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`;
run `node .next/standalone/server.js` (`PORT`, `HOSTNAME` env). Monorepo:
`outputFileTracingRoot`.

**`reactCompiler`:** stable in 16 ("promoted from `experimental` to stable. It
is not enabled by default"). Requires `bun add -D babel-plugin-react-compiler`.

```ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = { reactCompiler: true } // or { compilationMode: 'annotation' }
export default nextConfig
```

16.3 experimental Rust port:
`experimental: { turbopackRustReactCompiler: true }`.

**TypeScript support:** Upgrade guide table: "TypeScript 5+ | Minimum version
now `5.1.0`". TS page §"Using TypeScript 7": "TypeScript 7 does not currently
provide the JavaScript compiler API. To use TypeScript 7 during `next build`,
install it in your project: `bun add -D typescript@^7` … Next.js uses the
project-local `tsc` CLI by default, so no additional configuration is required.
To use the JavaScript compiler API instead, set `experimental.useTypeScriptCli`
to `false`." `useTypeScriptCli` page: "By default, `next build` runs the
project-local `tsc` command … This supports TypeScript 6 and enables TypeScript
7 while its JavaScript API is unavailable." Caveats: "TypeScript diagnostics are
printed directly from `tsc`. Next.js-specific code frames and error rewriting
are not applied"; "`experimental.useTypeScriptCli` is experimental". 16.3 blog
(2026-08-03): "Typescript 7 was released last month, which is a 10x faster
native port of TypeScript … `pnpm add -D typescript@^7`".

**Is `typescript@7.0.2` the Go-native compiler? Yes.** npm `dist-tags`:
`latest: 7.0.2` (2026-07-08), `rc: 7.0.1-rc` (2026-06-18), `beta: 6.0.0-beta`;
6.0.3 is the last JS-based release (6.0.2 = 2026-03-23, 6.0.3 = 2026-04-16);
5.9.3 = 2025-09-30. `typescript@7.0.2` package.json depends on
`@typescript/typescript-{darwin-arm64,linux-x64,…}@7.0.2` platform binaries;
`bin` is only `tsc` (5.9.3 has `tsc` + `tsserver`); `npm pack --dry-run` lists
`bin/tsc`, `lib/tsc.js` (609 B), 416 files, 365.6 kB — **no
`lib/typescript.js`** (5.9.3: 9.1 MB `lib/typescript.js`). The
`microsoft/typescript-go` repo was archived 2026-09-01 ("native port process,
which is now completed"); `@typescript/native-preview` is frozen at
`7.0.0-dev.20260707.2`.

TS 7 announcement (2026-07-08), verbatim: "While TypeScript 7.0 is here, it does
not ship with an API. We expect TypeScript 7.1 to ship with a new (and
different) API, but until then we have made it a priority to ensure TypeScript
can be run side-by-side with TypeScript 6.0 for utilities that still need some
programmatic access to the compiler (such as typescript-eslint)." and "Workflows
that use Vue, MDX, Astro, Svelte, and others will likely not yet be able to
leverage TypeScript 7." typescript-eslint docs: "The version range of TypeScript
currently supported is `>=4.8.4 <6.1.0`."
(`@typescript-eslint/typescript-estree@8.70.0` peer
`typescript: >=4.8.4 <6.1.0`; `eslint-config-next@16.3.4` depends on
`typescript-eslint ^8.46.0`.) TS 6.0 announcement: "TypeScript 6.0 acts as the
bridge between TypeScript 5.9 and 7.0"; 6.0 changes defaults (`strict`,
`module`, `target`, `types: []`, `rootDir: .`) and deprecates `baseUrl`,
`moduleResolution node`, `target es5`, `esModuleInterop false`, `outFile`.

**Gotchas**

- Pin `typescript` `~5.9.3` in the template. TS 7 as `latest` means
  `bun add -D typescript` today installs 7.0.2 and breaks
  `eslint-config-next/typescript` (typescript-eslint has no compiler API to
  load).
- Next 16 removed `next lint` and the `eslint` key in next.config; `next build`
  no longer lints. Script: `"lint": "eslint"`.
- Async request APIs only (`await headers()`, `await cookies()`,
  `await params`). Parallel route slots need `default.js`.
- `next dev` writes to `.next/dev`; `next dev` also maintains an `AGENTS.md`
  block pointing at `node_modules/next/dist/docs/`.
- `next.config.ts` is CommonJS-resolved unless Node's native TS resolver is on;
  use `next.config.mts` if you need ESM/top-level await.

**Sources**

- https://nextjs.org/docs/app/api-reference/cli/create-next-app
- https://nextjs.org/docs/app/getting-started/installation
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
- https://nextjs.org/docs/app/api-reference/config/typescript
- https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli
- https://nextjs.org/blog/next-16-3
- https://github.com/vercel/next.js/tree/v16.3.4/packages/create-next-app/templates
  (index.ts, app-tw/ts/*)
- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
- https://github.com/microsoft/typescript-go (archived 2026-09-01)
- https://typescript-eslint.io/users/dependency-versions
- npm: `typescript`, `@typescript/native-preview`,
  `@typescript-eslint/typescript-estree`, `next`, `eslint-config-next`

## 2. Better Auth 1.7.3 — Next.js + Drizzle

**Versions:** `better-auth@1.7.3` (2026-09-06; 1.7.0 2026-08-18; blog "Better
Auth 1.7" 2026-08-17). `@better-auth/drizzle-adapter@1.7.3`. CLI: npm package
**`auth@1.7.3`** ("The CLI for Better Auth", bins `auth` + `better-auth`).
`@better-auth/cli@1.4.21` is marked deprecated on npm ("Package no longer
supported") — do not use `npx @better-auth/cli`. `better-auth@1.7.3` exports
include `./react`, `./client`, `./cookies`, `./next-js`, `./adapters/drizzle`,
`./db`. Peers: `next ^14‖^15‖^16`, `react ^18‖^19`,
`drizzle-orm ^0.45.2 ‖ >=1.0.0-rc.1 <2.0.0`,
`drizzle-kit >=0.31.4 ‖ >=1.0.0-beta.1`, `pg ^8`, `vitest ^2‖^3‖^4` (optional).

**Env vars** (installation docs): `BETTER_AUTH_SECRET` — "A secret value used
for encryption and hashing. It must be at least 32 characters and generated with
high entropy" (`openssl rand -base64 32`, or `npx auth@latest secret`);
`BETTER_AUTH_URL=http://localhost:3000`.

**Server instance with Drizzle adapter, email/password, GitHub/Google, Next
cookies plugin** (assembled from the installation, drizzle-adapter,
email-password, github, google and next docs; each block verbatim):

```ts
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter' // docs adapter page; `better-auth/adapters/drizzle` also still exported
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import * as schema from '@/db/auth-schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg', // "sqlite" | "pg" | "mysql"
    schema // optional: map/override tables, e.g. { ...schema, user: schema.users }
    // usePlural: true, schemaName: "auth"
  }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  plugins: [nextCookies()] // make sure this is the last plugin in the array
})
```

Callback URLs to register: `http://localhost:3000/api/auth/callback/github`,
`http://localhost:3000/api/auth/callback/google`. GitHub: "Your GitHub app must
include the `user:email` scope" (otherwise `email_not_found`).

**Route handler** (`app/api/auth/[...all]/route.ts`):

```ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

**Client** (`lib/auth-client.ts`):

```ts
import { createAuthClient } from 'better-auth/react' // make sure to import from better-auth/react

export const authClient = createAuthClient({
  //you can pass client configuration here   (e.g. baseURL: "http://localhost:3000")
})
```

Client calls (email-password / social / client docs):

```ts
const { data, error } = await authClient.signUp.email({
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password1234',
  image: 'https://example.com/image.png',
  callbackURL: 'https://example.com/callback'
})
const { data, error } = await authClient.signIn.email({
  email: 'john.doe@example.com',
  password: 'password1234',
  rememberMe: true,
  callbackURL: 'https://example.com/callback'
})
const data = await authClient.signIn.social({ provider: 'github' }) // or "google"
const { data: session, isPending, error, refetch } = authClient.useSession()
await authClient.signOut()
```

Password rule: "at least 8 characters long and max 128 by default" (scrypt).

**Server-side session** (RSC / server action):

```tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function ServerComponent() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    return <div>Not authenticated</div>
  }
  return <h1>Welcome {session.user.name}</h1>
}
```

Server-side sign-in:
`await auth.api.signInEmail({ body: { email, password, rememberMe, callbackURL }, headers: await headers() })`
— cookies are only set from server actions if `nextCookies()` is installed.

**Next.js 16 proxy** (docs "Next.js 16+ (Proxy)"):

```ts
// proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard'] // Specify the routes the middleware applies to
}
```

Cheaper variant: `import { getSessionCookie } from "better-auth/cookies"` and
redirect when missing — docs mark it "THIS IS NOT SECURE! … optimistically
redirect users … handle auth checks in each page/route". Docs recommend
cookie-existence checks in proxy to avoid DB calls per request.

**Schema generation (CLI):**

```bash
npx auth@latest generate            # bunx auth@latest generate
# options: -c/--cwd, --output, --config, -y/--yes, --adapter prisma|drizzle|kysely, --dialect (required with --adapter drizzle)
npx drizzle-kit generate            # generate the migration file
npx drizzle-kit migrate             # apply the migration   (or drizzle-kit push)
```

`--output`: "For Drizzle, it goes to schema.ts in your project root."
`--config`: "By default, the CLI will search for an auth.ts file in **./**,
**./utils**, **./lib**, or any of these directories under the `src` directory."
`migrate` "is available if you're using the built-in Kysely adapter" only. "If
`--adapter` is omitted, the CLI uses the adapter configured in your Better Auth
config file."

**Does Better Auth expose a ready-made Drizzle pg schema?** No package export —
the CLI _generates_ it (`user`, `session`, `account`, `verification`, plus
plugin tables and Drizzle `relations()` with `relationName`s). Core schema (docs
"Core Schema"): `user` (id PK, name, email unique, emailVerified boolean,
image?, createdAt, updatedAt); `session` (id, userId FK, token unique,
expiresAt, ipAddress?, userAgent?, createdAt, updatedAt); `account` (id, userId
FK, accountId, providerId, accessToken?, refreshToken?, accessTokenExpiresAt?,
refreshTokenExpiresAt?, scope?, idToken?, password?, createdAt, updatedAt);
`verification` (id, identifier indexed, value, expiresAt, createdAt, updatedAt).
1.7 blog: "the 1.6 account core schema was restored … commitment to keeping the
core schema stable throughout v1."

**Gotchas**

- The CLI imports your `auth.ts` → which imports `db` → with PGlite that opens
  the data dir. PGlite is single-connection (§4): stop `next dev` before
  `bunx auth generate`, or make `db` lazy.
- Joins: `advanced.database.joins: true` needs Drizzle relations in the adapter
  `schema` (the generated file has them).
- `@better-auth/drizzle-adapter/relations-v2` exists for Drizzle 1.0 Relations
  v2 — irrelevant on 0.45.
- All Better Auth packages must be upgraded together (1.7 blog).

**Sources**

- https://www.better-auth.com/docs/installation (+
  https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/installation.mdx)
- https://www.better-auth.com/docs/integrations/next (+
  …/docs/content/docs/integrations/next.mdx)
- https://www.better-auth.com/docs/adapters/drizzle (+
  …/docs/content/docs/adapters/drizzle.mdx)
- https://www.better-auth.com/docs/concepts/cli (+
  …/docs/content/docs/concepts/cli.mdx)
- https://www.better-auth.com/docs/concepts/database (+
  …/docs/content/docs/concepts/database.mdx)
- https://www.better-auth.com/docs/authentication/email-password · /github ·
  /google
- https://www.better-auth.com/docs/concepts/client · /session-management
- https://better-auth.com/blog/1-7 ·
  https://github.com/better-auth/better-auth/releases/tag/v1.7.3
- npm: `better-auth`, `auth`, `@better-auth/drizzle-adapter`, `@better-auth/cli`
  (deprecated)

## 3. Drizzle ORM 0.45.2 / drizzle-kit 0.31.10

**Versions:** `drizzle-orm` `latest 0.45.2` (2026-03-27), `beta 1.0.0-beta.22`,
`rc 1.0.0-rc.4`; GitHub releases: v1.0.0-rc.1 (2026-04-30) … v1.0.0-rc.4
(2026-06-27, prerelease), rc.5 hash builds in Aug 2026. `drizzle-kit`
`latest 0.31.10` (2026-03-17), `rc 1.0.0-rc.4`. **The docs site
(orm.drizzle.team) now shows `npm i drizzle-orm@rc` / `drizzle-kit@rc`
everywhere and the v1 upgrade page says RC** — use `latest` (0.45/0.31) for the
template; the APIs below were cross-checked against the 0.45.2 / kit 0.31
sources. `drizzle-orm@0.45.2` peers: `pg >=8`, `postgres >=3`,
`@electric-sql/pglite >=0.2.0`.

**drizzle.config.ts** (docs):

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle'
})
```

Options: `dialect` (`postgresql`|`mysql`|`sqlite`|`turso`|`singlestore`|…),
`schema` (glob or array), `out` (default `drizzle`), `driver` (`aws-data-api` |
`pglite` | …), `dbCredentials`, `casing`, `strict`, `verbose`,
`migrations: { table, schema }` (defaults `__drizzle_migrations` / `drizzle`),
`tablesFilter`, `schemaFilter`, `breakpoints`.

**PGlite target for drizzle-kit (push/migrate/studio): yes.** Docs:

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  driver: 'pglite',
  dbCredentials: {
    url: './database/' // database folder path   (or ":memory:")
  }
})
```

Verified in kit 0.31 source (`drizzle-kit/src/index.ts` @ tag 0.45.2): "`driver`
… _Possible values_: `aws-data-api`, `d1-http`, `expo`, `turso`, `pglite`" and
the config union
`{ dialect: 'postgresql'; driver: 'pglite'; dbCredentials: { url: string } }`.
Prod: `dbCredentials: { url: process.env.DATABASE_URL! }` (no `driver`).

**`drizzle-orm/pglite`** (docs "connect-pglite"; overloads confirmed in
`drizzle-orm/src/pglite/driver.ts` @ 0.45.2: string |
`{ connection: PGliteOptions & { dataDir } }` | `{ client }`):

```ts
import { drizzle } from 'drizzle-orm/pglite'
const db = drizzle() // in-memory
const db = drizzle('path-to-dir') // filesystem persistence
const db = drizzle({ connection: { dataDir: 'path-to-dir' } })
// existing client
import { PGlite } from '@electric-sql/pglite'
const client = new PGlite() // new PGlite('./.data/pg') for persistence
const db = drizzle({ client })
```

Runtime migrations exist for PGlite:
`import { migrate } from 'drizzle-orm/pglite/migrator'; await migrate(db, { migrationsFolder: './drizzle' })`
(`migrator.ts` present at 0.45.2).

**Prod drivers** (docs "get-started-postgresql"):

```ts
// postgres.js
import { drizzle } from 'drizzle-orm/postgres-js'
const db = drizzle(process.env.DATABASE_URL)
// or: const db = drizzle({ connection: { url: process.env.DATABASE_URL, ssl: true } });
// or: import postgres from 'postgres'; const queryClient = postgres(process.env.DATABASE_URL); const db = drizzle({ client: queryClient });

// node-postgres
import { drizzle } from 'drizzle-orm/node-postgres'
const db = drizzle(process.env.DATABASE_URL)
// or: import { Pool } from "pg"; const pool = new Pool({ connectionString: process.env.DATABASE_URL }); const db = drizzle({ client: pool });
```

Install: `bun add drizzle-orm postgres` (or `pg` + `-D @types/pg`),
`bun add -D drizzle-kit`.

**push vs generate/migrate** (docs "migrations", "drizzle-kit push"): push "lets
you literally push your schema and subsequent schema changes directly to the
database while omitting SQL files generation … pairs exceptionally well with
blue/green deployment strategy and serverless databases"; flags `--verbose`,
`--explain` (dry run), `--force` (auto-accept data-loss), `--config`. Options
list: (2) codebase-first `drizzle-kit push` (rapid prototyping), (3)
`drizzle-kit generate` + `drizzle-kit migrate` (version-controlled SQL), (4)
`generate` + runtime `migrate()` at startup ("Common in monolithic apps and
serverless deployments"). Hackathon default: `push` locally against PGlite,
`generate` + `migrate` (or `push`) in prod.

**1.0 beta/rc?** Yes (`beta` and `rc` dist-tags exist; Relations v2, new
`casing` API, RQB v1 `._query` removal are breaking). Not GA → template stays on
0.45.2/0.31.10. Better Auth's peer range already accepts `>=1.0.0-rc.1` when you
decide to move.

**Gotchas**

- `drizzle-kit push` against a PGlite dir is a _separate process_ opening the
  same data dir → stop the dev server first (PGlite single connection, §4) or
  use runtime `migrate()`.
- The docs' code samples reflect RC (e.g., `drizzle-orm@rc` install lines and a
  supported-dialect list including MSSQL/CockroachDB, which are 1.0-only).
- Note the two schema naming conventions: Better Auth's generated Drizzle schema
  uses singular table names (`user`, `session`, …) unless `usePlural: true`.

**Sources**

- https://orm.drizzle.team/docs/drizzle-config-file
- https://orm.drizzle.team/docs/connect-pglite ·
  https://orm.drizzle.team/docs/get-started/pglite-new
- https://orm.drizzle.team/docs/get-started-postgresql
- https://orm.drizzle.team/docs/drizzle-kit-push ·
  https://orm.drizzle.team/docs/migrations
- https://orm.drizzle.team/docs/upgrade-v1
- https://github.com/drizzle-team/drizzle-orm/releases (v1.0.0-rc.1 … rc.4)
- https://raw.githubusercontent.com/drizzle-team/drizzle-orm/0.45.2/drizzle-orm/src/pglite/driver.ts
  · …/pglite/migrator.ts · …/drizzle-kit/src/index.ts
- npm: `drizzle-orm`, `drizzle-kit`

## 4. PGlite 0.5.8 in Node/Next.js

**Versions:** `@electric-sql/pglite@0.5.8` (2026-08-26; 0.5.0 = 2026-06-02;
0.4.0 = 2026-03-17). Runtime reports
`PostgreSQL 18.3 (PGlite 0.5.8) on wasm32-unknown-emscripten` (observed).

**Node usage** (docs):

```js
import { PGlite } from '@electric-sql/pglite'
const db = new PGlite() // in-memory (default; also memory://)
const db = new PGlite('./path/to/pgdata') // persist to the native filesystem (Node FS; also file://)
// recommended: await PGlite.create(dataDir, { relaxedDurability, extensions, debug })
await db.exec(
  `CREATE TABLE IF NOT EXISTS todo (id SERIAL PRIMARY KEY, task TEXT, done BOOLEAN DEFAULT false);`
)
const result = await db.query('SELECT * FROM todo WHERE id = $1', [1])
await db.close()
```

`.exec()` "supports multiple statements"; `.query()` "supports parameters";
`waitReady` promise; `relaxedDurability`: "PGlite will not wait for flushes to
storage to complete after each query".

**Single-instance requirement** — docs (index): "As PGlite only has a single
exclusive connection to the database, we provide a multi-tab worker to enable
sharing a PGlite instance between multiple browser tabs." (multi-tab page: "as
PGlite is single connection only"). Consequence for a Next app: create **one**
PGlite instance per process and reuse it across HMR reloads (`globalThis`
singleton); don't open the same data dir from two processes (dev server +
drizzle-kit/auth CLI) at once.

**Bundler notes** (docs "Bundler Support"): Vite:
`optimizeDeps: { exclude: ['@electric-sql/pglite'] }`. Next.js: "add
`@electric-sql/pglite` to the `transpilePackages` array" (their snippet also
sets the obsolete `swcMinify: false`) — that guidance targets _client-side_
bundling. Issue #632 ("Is Turbopack supported?") was closed with maintainers
saying "with the right bundler setup, nextjs _should_ work".

**Empirical result (this scratchpad, 2026-09-09):** Next 16.3.4 (Turbopack) +
`@electric-sql/pglite@0.5.8` + `drizzle-orm@0.45.2` in `app/api/db/route.ts`
(`db.execute(sql`select version()`)` via drizzle), `lib/db.ts` creating
`new PGlite("./.data/pg")` behind a `globalThis` guard:

- `next build` + `next start` **succeed with and without**
  `serverExternalPackages: ['@electric-sql/pglite']` (no `transpilePackages`
  needed); `next dev` also works without it. So `serverExternalPackages` is
  optional; adding it is harmless (build compiled in 369 ms vs 1671 ms when
  bundling).
- **Gotcha 1:** PGlite's Node FS `mkdir` of `dataDir` is not recursive —
  `new PGlite('./.data/pg')` threw `ENOENT … mkdir '…/.data/pg'` until `.data/`
  existed. Create the parent (`mkdirSync(dirname, { recursive: true })`) or use
  a single-level dir.
- **Gotcha 2:** module-level `new PGlite()` executes during `next build`
  ("Generating static pages" workers import the route module). Lazily create the
  instance inside the request path (or guard on env) so builds don't touch the
  data dir.

**Sources**

- https://pglite.dev/docs/ (+
  https://raw.githubusercontent.com/electric-sql/pglite/main/docs/docs/index.md)
- https://pglite.dev/docs/filesystems · https://pglite.dev/docs/api ·
  https://pglite.dev/docs/multi-tab-worker
- https://pglite.dev/docs/bundler-support (+ …/docs/docs/bundler-support.md) ·
  https://pglite.dev/docs/orm-support
- https://github.com/electric-sql/pglite/issues/632
- npm: `@electric-sql/pglite`

## 5. Vercel AI SDK 7 (`ai@7.0.94`, `@ai-sdk/react@4.0.97`, `@ai-sdk/anthropic@4.0.50`)

**Status:** `ai@7.0.0` published 2026-06-25 (Vercel blog "AI SDK 7 is now
available", same day); `7.0.94` = 2026-09-08 → GA for ~2.5 months, not "too
fresh". `ai-v6` dist-tag = `6.0.278` (still receiving releases, 2026-09-08).
`@ai-sdk/react@4.0.97` `dependencies: { ai: "7.0.94", … }` (exact pin — upgrade
in lockstep); peer `react ^18 ‖ ~19.0.1 ‖ ~19.1.2 ‖ ^19.2.1`.
`@ai-sdk/anthropic@4.0.50` peer `zod ^3.25.76 ‖ ^4.1.8`. v7 is **ESM-only** and
requires **Node.js 22+** (migration guide; release notes: "Remove CommonJS
exports from all packages").

Install (quickstart): `pnpm add ai @ai-sdk/react zod` →
`bun add ai @ai-sdk/react @ai-sdk/anthropic zod`. Env: `ANTHROPIC_API_KEY`
("defaults to `ANTHROPIC_API_KEY`" for the `apiKey` option).

**Route handler — v7 canonical form** (docs "Chatbot", model swapped to
Anthropic; the docs use the AI Gateway string `"xai/grok-4.6"`):

```ts
// app/api/chat/route.ts
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage
} from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-5'),
    instructions: 'You are a helpful assistant.', // v7: `system` was renamed to `instructions`
    messages: await convertToModelMessages(messages)
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream })
  })
}
```

The pattern from the question, `result.toUIMessageStreamResponse()`, **still
works in v7 but is deprecated**: migration guide — "The `streamText` result
methods are now deprecated in favor of stateless helpers" … before
`return result.toUIMessageStreamResponse({ originalMessages });` → after
`import { createUIMessageStreamResponse, toUIMessageStream } from 'ai'; const uiStream = toUIMessageStream({ stream: result.stream, generateMessageId, originalMessages }); return createUIMessageStreamResponse(uiStream);`
— "still work in v7 (with deprecation warnings) and will be removed in the next
major release." Also `result.fullStream` → `result.stream`.

**Client** (docs "Chatbot"; `useChat` from `@ai-sdk/react`,
`DefaultChatTransport` from `ai`):

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export default function Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  })
  const [input, setInput] = useState('')

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim()) {
            sendMessage({ text: input })
            setInput('')
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Say something..."
        />
        <button type="submit" disabled={status !== 'ready'}>
          Submit
        </button>
      </form>
    </>
  )
}
```

`useChat` reference: options `id`, `messages`
(`UIMessage { id, role: 'system'|'user'|'assistant', parts, metadata? }`),
`transport` ("defaults to `DefaultChatTransport`", so `useChat()` alone posts to
`/api/chat`), `onFinish`, `onError`, `sendAutomaticallyWhen`; returns
`messages`, `status: 'submitted' | 'streaming' | 'ready' | 'error'`, `error`,
`sendMessage({ text, files?, metadata?, messageId? })`, `regenerate`, `stop`,
`clearError`, `setMessages`, `addToolResult({ tool, toolCallId, output })`. Tool
parts render as `part.type === 'tool-<name>'`; tools use
`inputSchema: z.object(...)`.

**Anthropic provider:** `import { anthropic } from '@ai-sdk/anthropic'` or
`import { createAnthropic } from '@ai-sdk/anthropic'; const anthropic = createAnthropic({ apiKey, baseURL, headers, fetch })`;
`const model = anthropic('claude-sonnet-5')`. Capability table lists
`claude-opus-5`, `claude-sonnet-5`, `claude-fable-5-1`, `claude-fable-5`,
`claude-opus-4-8`, … `claude-haiku-4-5`.

**Other v7 breaking changes worth knowing** (migration guide): `onFinish` →
`onEnd`, `onStepFinish` → `onStepEnd`; `experimental_*` prefixes dropped
(`prepareStep`, `output`, `activeTools`, `generateImage`…); telemetry moved to
`@ai-sdk/otel` (opt-out once registered); system messages inside `messages`
rejected unless `allowSystemInMessages: true`; `stepCountIs` → `isStepCount`.
Codemods: `npx @ai-sdk/codemod v7`.

**Sources**

- https://ai-sdk.dev/docs/getting-started/nextjs-app-router
- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
- https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
- https://ai-sdk.dev/providers/ai-sdk-providers/anthropic
- https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0
- https://vercel.com/blog/ai-sdk-7 ·
  https://github.com/vercel/ai/releases/tag/ai%407.0.0
- npm: `ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`

## 6. Tailwind CSS 4.3.3 + shadcn CLI 4.21.0

**Tailwind with Next.js** (framework guide, verbatim):

```bash
npm install tailwindcss @tailwindcss/postcss postcss      # create-next-app --tailwind already does this
```

```js
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
export default config
```

```css
/* app/globals.css */
@import 'tailwindcss';
```

**shadcn CLI** — `shadcn@4.21.0` (2026-09-04; 4.0.0 = 2026-03-06). Docs render
bun commands by replacing `npx` with `bunx --bun`
(`apps/v4/lib/highlight-code.ts`), i.e. `bunx --bun shadcn@latest init` /
`bunx --bun shadcn@latest add button`. `init --help` (from the 4.21.0 binary;
docs `cli.mdx` shows the same text except `-d` → `--preset=nova`):

```text
Usage: shadcn init|create [options] [components...]
Options:
  -t, --template <template>  the template to use. (next, start, vite, react-router, laravel, astro)
  -b, --base <base>          the component library to use. (base, radix, aria)
  --monorepo / --no-monorepo
  -p, --preset [name]        use a preset configuration
  -y, --yes                  skip confirmation prompt. (default: true)
  -d, --defaults             use default configuration: --template=next --preset=base-nova (default: false)
  -f, --force                force overwrite of existing configuration. (default: false)
  -c, --cwd <cwd>            the working directory. defaults to the current directory.
  -n, --name <name>          the name for the new project.
  -s, --silent               mute output. (default: false)
  --css-variables / --no-css-variables   (default: true)
  --rtl / --no-rtl  --pointer / --no-pointer  --reinstall / --no-reinstall
Usage: shadcn add [options] [components...]
  -y, --yes  -o, --overwrite  -c, --cwd <cwd>  -a, --all  -p, --path <path>  -s, --silent  --dry-run  --diff [path]  --view [path]
```

There is **no `--base-color` flag** in 4.x; base color comes from the preset
(valid preset names: `nova, vega, maia, lyra, mira, luma, sera, rhea` —
`-p base-nova` errors "Invalid preset"). Non-interactive init that worked today
inside a fresh create-next-app 16.3.4 project:
`CI=1 bunx shadcn@4.21.0 init -d -y` (then `bunx shadcn@4.21.0 add button -y`).
Other commands: `apply <preset>` (`--only theme|font`), `preset decode`,
`build`, `info`, `search/list`, `view`, `migrate`.

**Generated `components.json`** (Next 16.3.4 + Tailwind 4 + React 19, verbatim
from the run):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

`tailwind.config` is `""` for Tailwind v4 (docs: "leave blank for Tailwind v4");
`style` enum in `schema.json`: `default`, `new-york`,
`{radix,base,aria}-{vega,nova,maia,lyra,mira,luma,sera,rhea}`. `init` added deps
`@base-ui/react ^1.8.0`, `class-variance-authority ^0.7.1`, `cn ^0.2.6`,
`lucide-react ^1.43.0`, `shadcn ^4.21.0`, `tw-animate-css ^1.4.0`;
`lib/utils.ts` is `export { cn } from "cn"`; `globals.css` becomes
`@import "tailwindcss"; @import "tw-animate-css"; @import "shadcn/tailwind.css";` +
`@custom-variant dark (&:is(.dark *));` + `@theme inline { … }`;
`components/ui/button.tsx` imports `@base-ui/react/button`. `init -t next -d`
(new project) scaffolds `next 16.2.6` (not 16.3.4), adds `next-themes`,
`prettier`, `prettier-plugin-tailwindcss`, `"type": "module"`, scripts `format`,
`typecheck: tsc --noEmit` — so for the template, run `create-next-app` first and
`shadcn init` into it.

**Gotchas**

- Default `base-nova` = Base UI primitives. Use `-b radix` if you want
  Radix-based components.
- `init -y` is default true; `add -y` is default false (pass `-y` in scripts).
- The `shadcn` package is now a runtime dependency (`shadcn/tailwind.css`).

**Sources**

- https://tailwindcss.com/docs/installation/framework-guides/nextjs
- https://ui.shadcn.com/docs/cli (+
  https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/content/docs/(root)/cli.mdx)
- https://ui.shadcn.com/docs/installation/next (+
  …/apps/v4/content/docs/installation/next.mdx) ·
  https://ui.shadcn.com/docs/components-json · https://ui.shadcn.com/schema.json
  · https://ui.shadcn.com/docs/tailwind-v4
- https://github.com/shadcn-ui/ui/blob/main/apps/v4/lib/highlight-code.ts (`npx`
  → `bunx --bun`)
- `bunx shadcn@4.21.0 init --help` / `add --help`; local run of `init -d -y` in
  create-next-app 16.3.4
- npm: `shadcn`, `tailwindcss`, `@tailwindcss/postcss`

## 7. Vitest 5.0.0 (+ Vite 8, plugin-react 6, Testing Library)

**Release:** `vitest@5.0.0` 2026-09-03 (rc.4 2026-08-31; 4.1.11 2026-08-18;
4.0.0 2025-10-22). Requirements (migration guide, verbatim): "Vitest 5.0
requires Vite >= 6.4.0 and Node.js >= 22.12.0. Before proceeding with any other
migration steps, ensure your environment meets these requirements."
`engines.node: "^22.12.0 || ^24.0.0 || >=26.0.0"`.

**Vite is now a required peer** — registry metadata for 5.0.0:
`peerDependencies.vite: "^6.4.0 || ^7.0.0 || ^8.0.0"` with
`peerDependenciesMeta.vite.optional: false`; in 4.1.11 `vite` was in
`dependencies`. Bun/npm auto-install peers, but pin `vite@^8` explicitly.
`@vitejs/plugin-react@6.1.1` peer `vite ^8.0.0` (Node `^20.19 ‖ >=22.12`) →
compatible with Vitest 5 + Vite 8.2.2. (`@vitejs/plugin-react@5.2.0` supports
vite `^4.2 … ^8`.)

**Breaking changes vs 4** (migration guide headings): `clearMocks` enabled by
default; `testNamePattern` matches the `>`-joined full name; inline projects
inherit root config; hoisted `vi.mock`/`vi.hoisted` must be top-level (now
errors); class mocks keep prototype methods; benchmarking API rewrite; UI
requires token URL; fake timers mock `Temporal`; `toThrow("")` matches any
message; unawaited async assertions fail the test; `expect.poll` fails on
timeout; `toHaveTextContent` strict (`toMatchTextContent` for partial); config
files not looked up from parent dirs; `.vitest/` artifacts dir; worker ids
1-based; removed entry points
`vitest/coverage|reporters|environments|snapshot|runners|suite`;
`@vitest/runner` inlined. None affect a fresh template.

**Recommendation:** `vitest@5.0.0` + `vite@^8.2.2` +
`@vitejs/plugin-react@^6.1.1` + `jsdom@^30.0.1` +
`@testing-library/react@^16.3.3` + `@testing-library/dom@^10.4.1` +
`@testing-library/jest-dom@^7.0.1` + `vite-tsconfig-paths@^6.1.1`. If you prefer
a 3-week-old rather than 6-day-old major, `vitest@^4.1.11` with the identical
config (it bundles vite ^8 itself; `@vitest/coverage-v8` must match the vitest
major).

**Config** (Next.js docs, verbatim, plus jest-dom setup):

```ts
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true, // optional; then add "vitest/globals" to tsconfig types
    include: ['**/*.test.{ts,tsx}'], // vitest default: **/*.{test,spec}.?(c|m)[jt]s?(x)
    setupFiles: ['./vitest-setup.ts']
  }
})
```

```ts
// vitest-setup.ts   (jest-dom README: "import '@testing-library/jest-dom/vitest'" in the setup file, then setupFiles: ['./vitest-setup.js'])
import '@testing-library/jest-dom/vitest'
```

jest-dom README TypeScript note:
`"types": ["vitest/globals", "@testing-library/jest-dom"]` and include the setup
file; "Ensure your setup file has a `.ts` extension". Install line from Next
docs:
`bun add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`.
Script `"test": "vitest"` (watch by default; `vitest run` in CI). Next docs
caveat: "Since `async` Server Components are new to the React ecosystem, Vitest
currently does not support them … we recommend using **E2E tests** for `async`
components."

**Sources**

- https://vitest.dev/guide/migration (+
  https://raw.githubusercontent.com/vitest-dev/vitest/main/docs/guide/migration/index.md)
  · https://vitest.dev/blog/vitest-5.html ·
  https://github.com/vitest-dev/vitest/releases/tag/v5.0.0
- https://vitest.dev/guide/ · https://vitest.dev/config/
- https://nextjs.org/docs/app/guides/testing/vitest
- https://github.com/testing-library/jest-dom (README "With Vitest")
- npm: `vitest`, `vite`, `@vitejs/plugin-react`, `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`, `@vitest/coverage-v8`

## 8. Playwright 1.63.0

`@playwright/test@1.63.0` (2026-09-04; 1.62.0 2026-07-24). Next peer `^1.51.1`.

```ts
// playwright.config.ts  (docs "Web server", verbatim shape; command adapted to Bun/Next)
import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'bun run build && bun run start', // docs: 'npm run start'; Next docs recommend testing the production build
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120 * 1000
  },
  use: { baseURL: 'http://localhost:3000' }
})
```

Option semantics (docs): `url` "expected to return a 2xx, 3xx, 400, 401, 402, or
403 status code when the server is ready"; `reuseExistingServer` "If `true`, it
will re-use an existing server on the `port` or `url` when available … commonly
set to `!process.env.CI`"; `timeout` "Defaults to 60000"; `env` "Defaults to
inheriting `process.env` with `PLAYWRIGHT_TEST=1` added"; `gracefulShutdown`.

CI (docs "Continuous Integration", GitHub Actions example uses
`actions/checkout@v6`, `actions/setup-node@v6`,
`npx playwright install --with-deps`, `actions/upload-artifact@v5` with
`playwright-report/`, `timeout-minutes: 60`). Browser-specific:
`npx playwright install --with-deps chromium` (docs "Browsers": "Combine both
browser and dependency installation in one step") →
`bunx playwright install --with-deps chromium`. Docs: "Caching browser binaries
is not recommended". Next docs: `bun create playwright` for the wizard;
`npx playwright install-deps`.

**Sources**

- https://playwright.dev/docs/test-webserver · https://playwright.dev/docs/ci ·
  https://playwright.dev/docs/browsers
- https://nextjs.org/docs/app/guides/testing/playwright
- npm: `@playwright/test`

## 9. ESLint 10.10.0 + eslint-config-next 16.3.4 + Prettier

`eslint@10.10.0` (2026-09-04; 10.0.0 = 2026-02-06;
`engines.node ^20.19 ‖ ^22.13 ‖ >=24`). `eslint-config-next@16.3.4` peers
`eslint >=9.0.0`, `typescript >=3.3.1`; depends on `typescript-eslint ^8.46.0`,
`eslint-plugin-react-hooks ^7`, `@next/eslint-plugin-next 16.3.4`.
`eslint-config-prettier@10.1.8` exports `.` and `./flat`.

**Exactly what create-next-app 16.3.4 generates**
(`templates/app-tw/ts/eslint.config.mjs`, verbatim):

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ])
])

export default eslintConfig
```

**With Prettier** (Next ESLint docs, verbatim):
`bun add -d eslint-config-prettier`, then

```js
import prettier from 'eslint-config-prettier/flat'
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,          // after the configs it should override
  globalIgnores([...]),
])
```

eslint-config-prettier README: "Note the `/flat` suffix here, the difference
from default entry is that `/flat` added `name` property to the exported object
to improve config-inspector experience." Place it "**after** other configs that
you want to override". Scripts: `"lint": "eslint"`, `"lint:fix": "eslint --fix"`
(Next 16: "`next lint` and the `eslint` next.config.js option were removed in
favor of the ESLint CLI"; codemod
`npx @next/codemod@canary next-lint-to-eslint-cli .`). Prettier:
`prettier@3.9.6`, `prettier-plugin-tailwindcss@0.8.1` (shadcn's Next template
ships both).

**Sources**

- https://nextjs.org/docs/app/api-reference/config/eslint
- https://github.com/vercel/next.js/blob/v16.3.4/packages/create-next-app/templates/app-tw/ts/eslint.config.mjs
- https://github.com/prettier/eslint-config-prettier
- npm: `eslint`, `eslint-config-next`, `eslint-config-prettier`, `prettier`,
  `prettier-plugin-tailwindcss`

## 10. @t3-oss/env-nextjs 0.13.11 + zod 4

Peers: `zod ^3.24.0 ‖ ^4.0.0`, `typescript >=5.0.0`; depends on
`@t3-oss/env-core 0.13.11`. Standard Schema based ("works with Zod, Valibot,
ArkType, Typia"). Docs import zod as `import * as z from "zod"` (zod 4
top-level, `z.url()`).

```ts
// src/env.ts   (docs "Next.js", verbatim + option lines from "Customization")
import { createEnv } from '@t3-oss/env-nextjs'
import * as z from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    OPEN_AI_API_KEY: z.string().min(1)
  },
  client: {
    NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1)
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
  skipValidation: !!process.env.SKIP_ENV_VALIDATION, // docs: "Skipping validation is not encouraged and will lead to your types and runtime values being out of sync"
  emptyStringAsUndefined: true // docs: treats "" in .env as undefined so defaults apply
})
```

Docs: "Unlike in the core package, `runtimeEnv` is strict by default, meaning
you'll have to destructure all the keys manually. This is due to how Next.js
bundles environment variables and only explicitly accessed variables are
included in the bundle." Server-only file variant:
`experimental__runtimeEnv: process.env`. Other options:
`onValidationError(issues)`, `onInvalidAccess(variable)`, `isServer`,
`extends: [vercel()]`, `createFinalSchema`, `shared`, `clientPrefix` (core).

Validate at build (docs "Version 16+"):

```ts
// next.config.ts
import './app/env' // (or "./src/env")
const nextConfig: NextConfig = {/** ... */}
export default nextConfig
```

Docs note for `output: "standalone"`: add
`transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"]`.

**Sources**

- https://env.t3.gg/docs/nextjs (+
  https://raw.githubusercontent.com/t3-oss/t3-env/main/docs/src/app/docs/nextjs/page.mdx)
- https://env.t3.gg/docs/core · https://env.t3.gg/docs/customization
- npm: `@t3-oss/env-nextjs`, `zod`

## 11. Bun 1.4.2

`bun` `latest 1.4.2` (installed locally: 1.4.2). Lockfile docs: "Bun v1.2
changed the default lockfile format to the text-based `bun.lock`." Install docs
(verbatim): "For reproducible installs, use `--frozen-lockfile`. Bun installs
the exact versions specified in the lockfile and does not update it. If your
`package.json` disagrees with `bun.lock`, Bun exits with an error." … "Bun does
not enable `--frozen-lockfile` automatically in CI; pass the flag or use
`bun ci`." … "`--production` implies `--frozen-lockfile`." bunfig:
`[install] frozenLockfile = true`.

`bun run dev` vs `bun --bun` (docs "bun run"): "By default, Bun respects this
shebang and executes the script with `node`. The `--bun` flag overrides it: the
CLI runs with Bun instead of Node.js." → `bun run dev` runs `next dev` on
**Node** (so Node 24 must be present); Bun's Next guide shows
`bun --bun next dev` to run on Bun's runtime. Keep the Node path for the
template (Next declares Node ≥ 20.9; AI SDK/Vitest test on Node).

`oven-sh/setup-bun@v2` (v2.2.0, 2026-03-14, runs on Node 24):

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest # or bun-version-file: .bun-version / .tool-versions
```

README: version resolution "1. The `packageManager` field in package.json (e.g.,
`"packageManager": "bun@1.0.25"`) 2. The `engines.bun` field 3. Falls back to
`latest`". Inputs: `bun-version`, `bun-version-file`, `bun-download-url`,
`registry-url`, `scope`, `no-cache` (executable cache only), `token`.
create-next-app already wrote `"packageManager": "bun@1.4.2"`, so omitting
`bun-version` pins CI to the same Bun. Dependency cache (actions/cache
examples.md "## Bun"):

```yaml
- uses: actions/cache@v6
  with:
    path: |
      ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
```

**Sources**

- https://bun.sh/docs/install/lockfile · https://bun.sh/docs/cli/install ·
  https://bun.sh/docs/cli/run · https://bun.sh/guides/ecosystem/nextjs
- https://github.com/oven-sh/setup-bun ·
  https://github.com/actions/cache/blob/main/examples.md
- npm: `bun`

## 12. GitHub Actions — current majors (from `gh api …/releases`)

| Action                    | Latest release                                                  | Note                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions/checkout`        | **v7** (v7.0.1, 2026-07-20)                                     | v6.1.0/v5.1.0 are backports adding `allow-unsafe-pr-checkout`.                                                                               |
| `actions/setup-node`      | **v7** (v7.0.0, 2026-07-14)                                     | `node-version: 24` (Node 24 = Active LTS "Krypton", v24.21.0 2026-09-07; Node 26 = Current). `cache:` supports npm/yarn/pnpm only.           |
| `actions/upload-artifact` | **v7** (v7.0.1, 2026-04-10)                                     | (`actions/download-artifact` v8.0.1.) Old v3.2.2 notes: actions now run on Node 24 (`runs.using: node24`), runner ≥ 2.327.1 for self-hosted. |
| `actions/cache`           | **v6** (v6.1.0, 2026-06-26; v6.0.0 "migrate to ESM" 2026-06-23) | Bun example above.                                                                                                                           |
| `oven-sh/setup-bun`       | **v2** (v2.2.0, 2026-03-14)                                     |                                                                                                                                              |

Skeleton: `checkout@v7` → `setup-bun@v2` → `setup-node@v7 (node-version: 24)` →
`cache@v6 (~/.bun/install/cache)` → `bun install --frozen-lockfile` →
`bun run lint && bun run typecheck && bun run test -- --run && bun run build` →
`bunx playwright install --with-deps chromium` → `bunx playwright test` →
`upload-artifact@v7 (playwright-report/)`.

**Sources:** https://github.com/actions/checkout/releases ·
https://github.com/actions/setup-node/releases ·
https://github.com/actions/upload-artifact/releases ·
https://github.com/actions/cache/releases ·
https://github.com/oven-sh/setup-bun/releases ·
https://nodejs.org/dist/index.json

## 13. How 2025–2026 starters compose these (mainstream check)

- **create-t3-app 7.40.0**: README stack "Next.js, tRPC, Tailwind CSS,
  TypeScript, Prisma, Drizzle, NextAuth.js"; the CLI source has `--drizzle`,
  `--prisma`, `--nextAuth`, **`--betterAuth`**, `--dbProvider`,
  `--eslint`/`--biome` flags (`cli/src/cli/index.ts`), i.e. Next + Drizzle +
  Better Auth is a first-class T3 combination.
  (https://github.com/t3-oss/create-t3-app,
  https://create.t3.gg/en/introduction)
- **vercel/ai-chatbot** (Vercel's official Next.js AI template) `package.json`
  today: `next 16.2.10`, `ai 7.0.15`, `@ai-sdk/react 4.0.16`,
  `drizzle-orm ^0.45.2`, `drizzle-kit ^0.31.10`, `postgres ^3.4.9`,
  `tailwindcss ^4.3.2`, `zod ^4.4.3`, `@playwright/test ^1.61.1`, shadcn/ui;
  auth is `next-auth 5.0.0-beta.25` (Auth.js). Same stack shape; Better Auth is
  the only substitution. (https://github.com/vercel/ai-chatbot)
- **Better Auth** ships a `demo/nextjs` app and lists `next ^16` and
  `@tanstack/react-start ^1` as peers; its docs have a dedicated Next.js 16
  `proxy.ts` section (§2). Drizzle's docs have a first-party PGlite connector
  page and drizzle-kit `driver: 'pglite'` (§3).
  (https://github.com/better-auth/better-auth/tree/main/demo,
  https://orm.drizzle.team/docs/connect-pglite)
- **shadcn 4.x** `init -t` templates:
  `next, start, vite, react-router, laravel, astro` — Next remains the default
  (`-d` ⇒ `--template=next`). (https://ui.shadcn.com/docs/cli)
- **TanStack Start** is "currently in the **Release Candidate** stage"
  (`@tanstack/react-start` 1.168.50) — viable but not yet 1.0; Next.js 16 stays
  the safer hackathon default.
  (https://tanstack.com/start/latest/docs/framework/react/overview)
