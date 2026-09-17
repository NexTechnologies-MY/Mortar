# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all
differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` (resolved from the repository root) before
writing any code, and heed deprecation notices.

Next.js can write this block into `AGENTS.md` itself on `next dev`;
`agentRules: false` in `next.config.ts` turns that off so it lives here instead.
After upgrading Next.js, compare this file with
`node_modules/next/dist/server/lib/generate-agent-files.js` and refresh it.

Two conventions that bit this project:

- `middleware.ts` is `proxy.ts` and exports `proxy`.
- A page that reads `env` at render time is prerendered at build time unless it
  calls a request API such as `await connection()` from `next/server`.
