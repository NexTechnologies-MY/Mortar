# Mortar Notes For Agents

Working notes for coding agents. `package.json` `scripts` is the command
reference; `docs/README.md` is the human quickstart. This file holds what
neither shows: conventions, the file map, and the gotchas.

## Conventions

- Formatting comes from the repo root `.prettierrc.json` (no semicolons, single
  quotes, 120 columns). Run `bun run format` before finishing.
- `bun run check` (ESLint, `tsc`, Vitest across workspaces) must pass before any
  task is called done. There is no e2e suite.
- Bun workspaces: `frontend` plus `packages/*`. Run a workspace script with
  `bun run --filter <name-or-glob> <script>` from the root (e.g.
  `bun run --filter frontend dev`).
- Tests sit next to the code under `src/**/__tests__/` (or `*.test.ts(x)`
  siblings). Frontend tests run in jsdom via the `test` block in
  `frontend/vite.config.ts`.
- New UI primitives come from `bunx shadcn add <component>` run inside
  `frontend/` (config: `frontend/components.json`), not hand-written.
- Import shared types from `@mortar/core` (`packages/core`), which resolves
  straight to `src/index.ts` — no build step.

## File Map

| Area           | Files                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell      | `frontend/src/App.tsx` (routes), `frontend/src/main.tsx` (providers), `frontend/src/components/layout/` (sidebar, nav, `AppFooter`, `PublicShell` (footer layout route for `/` and `/faq`), `AppShell`, `PageContainer`, `PageHeaderCard`, `AppErrorBoundary`, `ThemeToggle`, `PersonaSwitch`)                                                                              |
| Ask            | `packages/core/src/brain/` (`askBrain`, `buildAskContext`, the scripted set and its grounding test), `frontend/src/components/brain/` (`AskTrigger` in `AppNav`, `AskPanel` in a Dialog), `frontend/public/ai-mascot*.png`                                                                                                                                                  |
| Import         | `packages/core/src/import.ts` (`parseCsv`, `readBookingSheet`, `checkBookingDraft`), `frontend/src/components/import/` (`DropZone`, `readSheetFile`, `SheetReview`), `frontend/src/pages/ImportPage.tsx`, `POST /api/bookings/import` in `server/src/app.ts`, `frontend/public/booking-sheet-template.xlsx` (written by `frontend/scripts/booking-template.mjs`) and `.csv` |
| Waiting On     | `packages/core/src/ball.ts` (`ballInCourt`: who holds a case and the next move), `frontend/src/components/case/ball.ts` (labels, icons, move owners), `frontend/src/components/bookings/WaitingOn.tsx` (cell, journey, panel), `CaseQuickView.tsx` (side sheet from the ledger)                                                                                             |
| Persona        | `frontend/src/lib/persona.tsx` (context, `PERSONAS`, `mortar.persona` localStorage key, the retired-id migration), `packages/core/src/types.ts` (`Persona` type)                                                                                                                                                                                                            |
| Pages          | `frontend/src/pages/` — one file per route (`LandingPage` with `components/HeroFilm`, `SignInPage`, `BookingsPage`, `BookingDetailPage`, `ChasePage`, `LegalPage`, `ForecastPage`, `ImportPage`, `NotFoundPage`)                                                                                                                                                            |
| UI primitives  | `frontend/src/components/ui/` (shadcn: button, calendar, card, checkbox, dialog, drawer, sheet, DropdownMenu, input, label, popover, radio-group, select, separator, skeleton, table, tabs, tooltip + status-pill, EmptyState, InfoTooltip, LoadingOverlay, NotificationPopover, toastConfig)                                                                               |
| Charts         | `frontend/src/components/charts/ChartTooltipContent.tsx` (recharts tooltip shell), `frontend/src/lib/formatters.ts` (MYR/number Intl formatters)                                                                                                                                                                                                                            |
| Hooks / stores | `frontend/src/hooks/useTheme.tsx`, `frontend/src/lib/notificationStore.ts`, `frontend/src/lib/utils.ts` (`cn`)                                                                                                                                                                                                                                                              |
| Theme          | `frontend/src/globals.css` (Tailwind 4 `@theme` tokens from `docs/DESIGN.md`, light/dark, global scrollbar), `frontend/public/media/` (hero clip), `frontend/index.html` (fonts, FOUC theme script)                                                                                                                                                                         |
| Tests          | `frontend/src/lib/__tests__/`, `frontend/src/pages/__tests__/`, `frontend/src/components/layout/__tests__/`, `packages/core/src/index.test.ts`                                                                                                                                                                                                                              |
| Tooling        | root `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `.husky/pre-commit`, `frontend/vite.config.ts` (dev server + Vitest), `frontend/tsconfig.json`                                                                                                                                                                                               |
| CI             | `.github/workflows/ci.yml`                                                                                                                                                                                                                                                                                                                                                  |

## Recipe: Add A Route

1. Create `frontend/src/pages/<Name>Page.tsx` (heading + one-line description
   inside `PageHeaderCard`, `EmptyState` below — copy `ChasePage.tsx`).
2. Add the `<Route>` inside `<Route element={<AppShell />}>` in `App.tsx`.
3. If it is a top-level nav item, add it to `NAV_ITEMS` in `AppSidebar.tsx` and
   `ROUTE_LABELS` in `AppNav.tsx` (breadcrumbs). If it also belongs in the
   footer's Product column, add it to `LINK_COLUMNS` in `AppFooter.tsx`.

## Recipe: Add Shared Domain Types Or Logic

1. Export from `packages/core/src/index.ts`; the frontend imports it as
   `@mortar/core` — no build step, no path mapping needed.
2. Cover it with a `*.test.ts` next to the code; `bun run test` picks it up.

## Gotchas

- **`/` Is The Landing; `/app` Is Persona-Relative.** `/app` sends the active
  persona to their home. `/`, `/faq` and `/sign-in` sit outside `AppShell`.
  `PublicShell` wraps `/` and `/faq` only, and it is the one thing that mounts
  the footer — the desks, `/app`, the 404 and `/sign-in` carry none.
- **The Sidebar Puts The Persona's Home First.** `AppSidebar` hoists the active
  persona's home route above `NAV_ITEMS`' canonical order; keep new routes in
  canonical order in `NAV_ITEMS`.
- **Both Halves Of `/forecast` Read One Log.** `forecast()` projects forward and
  `leakage()` counts backward, both from the same confirmed events in
  `@mortar/core`, so what signed and what died cannot drift apart. Any recovery
  estimate must carry its Wilson interval and its sample size on screen — the
  second-bank rate is measured over single-digit resolved cases.
- **`open` Is Not `live`.** `deriveCase` computes both. `live` adds
  `ageDays < HORIZON_DAYS` (30) and is what the forecast counts; `open` is just
  unsigned and not exited. Stall reasons derive from `open`, because gating them
  on `live` hid every case that had sat longest — the ones most worth chasing.
  Anything that reads `stallReasons` must filter on `open` (`isOpen` in
  `brain/helpers.ts`), never `isLive`; `brain.test.ts` pins Ask's stalled set to
  the chase list's so the two cannot drift apart again.
- **Ask Answers Without A Model.** `packages/core/src/brain/` matches a typed
  question to a scripted answer that counts the snapshot. The panel is Jev's —
  staff ask Jev by name, and its tasks carry `origin: 'jev'` like a chase card's
  — but no model runs, so nothing in the copy implies Jev wrote the answer.
  Adding a question means adding an `answer` and the `predicate` that tests it.
- **Keyword Score Alone Does Not Gate A Question.** "What is the weather"
  out-scores a correct paraphrase, so `matchQuestion` ranks on how much of the
  query was covered and treats the score as a floor. Widen `tags` rather than
  lowering `MIN_COVERAGE`.
- **Imported Bookings Are Born `booked`, Dated To The Desks' Today.** The import
  writes each booking with one confirmed `booked` event recorded at
  `simNow(REFERENCE_DATE)`, so a sheet row dated after the reference date is
  refused (the case could not exist yet). Ids continue `BK-nnnn` after the
  generator's run and stop before the stories' `BK-9001`.
- **Focus The Sheet, Not Its First Control.** A Radix dialog or sheet focuses
  its first tabbable element on open; in the quick view that was the risk chip,
  which popped its tooltip unasked (and ran for tens of seconds under jsdom).
  `CaseQuickView` focuses the sheet itself in `onOpenAutoFocus`.
- **localStorage Access Is Always Wrapped In try/catch** (`persona.tsx`,
  `notificationStore.ts`) because private-mode browsers can throw.
- **`bun run --filter '*' <script>` Is How Root Scripts Fan Out** to workspaces;
  add the script name to a new package's `package.json` to join `check`.

## Docs

- `docs/PRODUCT.md`: product context, problem, personas, business case, and
  12-week pilot.
- `docs/PRD.md`: functional requirements, user stories, acceptance criteria, and
  screen specifications.
- `docs/TRD.md`: system architecture, data model, APIs, simulation engine, Jev
  integration, and deployment.
- `docs/DESIGN.md`: the visual spec — follow it for any UI work.
- `docs/markdown-style.md`: house Markdown style — follow it when editing docs.
- `docs/research/company-brain/simulation.md`: scope, seed values and rules for
  the front-end simulation — read it before generating synthetic bookings.
