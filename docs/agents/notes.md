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

| Area           | Files                                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App shell      | `frontend/src/App.tsx` (routes), `frontend/src/main.tsx` (providers), `frontend/src/components/layout/` (sidebar, nav, footer, `AppShell`, `PageContainer`, `PageHeaderCard`, `AppErrorBoundary`, `ThemeToggle`, `PersonaSwitch`)    |
| Persona        | `frontend/src/lib/persona.tsx` (context, `PERSONAS`, `mortar.persona` localStorage key), `packages/core/src/index.ts` (`Persona` type)                                                                                               |
| Pages          | `frontend/src/pages/` — one file per route (`BookingsPage`, `BookingDetailPage`, `ChasePage`, `ForecastPage`, `ImportPage`, `NotFoundPage`)                                                                                          |
| UI primitives  | `frontend/src/components/ui/` (shadcn: button, card, dialog, drawer, DropdownMenu, input, label, separator, skeleton, slider, tooltip + EmptyState, ImagePopup, InfoTooltip, LoadingOverlay, Logo, NotificationPopover, toastConfig) |
| Charts         | `frontend/src/components/charts/ChartTooltipContent.tsx` (recharts tooltip shell), `frontend/src/lib/formatters.ts` (MYR/number Intl formatters)                                                                                     |
| Hooks / stores | `frontend/src/hooks/useTheme.tsx`, `frontend/src/lib/notificationStore.ts`, `frontend/src/lib/utils.ts` (`cn`)                                                                                                                       |
| Theme          | `frontend/src/globals.css` (Tailwind 4 `@theme` tokens, light/dark, glass utilities), `frontend/index.html` (fonts, FOUC theme script)                                                                                               |
| Tests          | `frontend/src/lib/__tests__/persona.test.tsx`, `packages/core/src/index.test.ts`                                                                                                                                                     |
| Tooling        | root `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `.husky/pre-commit`, `frontend/vite.config.ts` (dev server + Vitest), `frontend/tsconfig.json`                                                        |
| CI             | `.github/workflows/ci.yml`                                                                                                                                                                                                           |

## Recipe: Add A Route

1. Create `frontend/src/pages/<Name>Page.tsx` (heading + one-line description
   inside `PageHeaderCard`, `EmptyState` below — copy `ChasePage.tsx`).
2. Add the `<Route>` inside `<Route element={<AppShell />}>` in `App.tsx`.
3. If it is a top-level nav item, add it to `NAV_ITEMS` in `AppSidebar.tsx`,
   `NAV_LINKS` in `AppFooter.tsx`, and `ROUTE_LABELS` in `AppNav.tsx`
   (breadcrumbs).

## Recipe: Add Shared Domain Types Or Logic

1. Export from `packages/core/src/index.ts`; the frontend imports it as
   `@mortar/core` — no build step, no path mapping needed.
2. Cover it with a `*.test.ts` next to the code; `bun run test` picks it up.

## Gotchas

- **`/` Is Persona-Relative.** The `HomeRedirect` in `App.tsx` sends it to the
  active persona's home, so never link to `/` expecting a fixed page.
- **The Sidebar Puts The Persona's Home First.** `AppSidebar` hoists the active
  persona's home route above `NAV_ITEMS`' canonical order; keep new routes in
  canonical order in `NAV_ITEMS`.
- **There Is No Backend Or Auth.** The Vite dev proxy, TanStack Query, and
  Better Auth were removed during scaffolding — don't re-add API calls until a
  later stage defines them.
- **localStorage Access Is Always Wrapped In try/catch** (`persona.tsx`,
  `notificationStore.ts`) because private-mode browsers can throw.
- **`bun run --filter '*' <script>` Is How Root Scripts Fan Out** to workspaces;
  add the script name to a new package's `package.json` to join `check`.

## Docs

- `docs/markdown-style.md`: house Markdown style — follow it when editing docs.
