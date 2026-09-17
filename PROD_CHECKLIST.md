# Production checklist

The template is tuned for a hackathon weekend. Before real users arrive, walk
this list. Items link to the file or doc where the change happens.

## Secrets and URLs

- [ ] Generate a new `BETTER_AUTH_SECRET` for production (32+ random
      characters). Never reuse the local one.
- [ ] Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the public https
      origin. OAuth callbacks and cookies depend on them.
- [ ] Register production callback URLs with each OAuth provider you use:
      `<origin>/api/auth/callback/github`, `.../google`.
- [ ] Keep `.env` out of git (already ignored) and out of Docker images.

## Database

- [ ] Use a managed Postgres via `DATABASE_URL`; PGlite is for local work.
- [ ] Run `bun run db:migrate` as a deploy step, before the new version serves
      traffic. Commit every file under `drizzle/`.
- [ ] Turn on backups or point-in-time recovery at the provider.
- [ ] Add indexes for the queries you actually run (see `notes_user_id_idx` in
      `src/lib/db/schema.ts` for the pattern).

## Auth hardening

- [ ] Decide on email verification and password reset. Better Auth supports
      both; they need an email sender:
      https://www.better-auth.com/docs/authentication/email-password
- [ ] Review rate limiting (Better Auth ships defaults; tune in `auth.ts`) and
      set `trustedOrigins` if you serve from more than one origin.
- [ ] Consider account deletion and session revocation flows.

## Abuse and cost

- [ ] `/api/chat` requires a session; add per-user rate limits or quotas before
      exposing it publicly. Every message costs money.
- [ ] Cap `maxDuration` and output length in `src/app/api/chat/route.ts` to
      match your budget.

## Operations

- [ ] Send server errors somewhere (Sentry, Axiom, the host's logs). The
      `error.tsx` boundary only shows the user a message.
- [ ] Add a real health check that touches the database if your host needs one;
      `/api/health` is a liveness probe only.
- [ ] Set security headers (CSP, HSTS) in `next.config.ts` `headers()` or at the
      edge.

## Product

- [ ] Replace the landing page copy in `src/app/page.tsx` and the metadata in
      `src/app/layout.tsx` (title, description, Open Graph image).
- [ ] Add terms of service and privacy policy pages if you collect accounts.
- [ ] Remove the notes example, the chat, or social login if unused (`AGENTS.md`
      has the file lists), and delete `docs/` if you do not want the build
      history shipped with the product.
