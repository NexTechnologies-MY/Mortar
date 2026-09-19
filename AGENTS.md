# AGENTS.md

Instructions for coding agents working in this repository. The rules below apply
to every task; the linked documents carry the detail and are read when the task
calls for them.

## Project

Mortar is an internal operations tool for a Malaysian property developer. Sales,
loan, and finance staff track every unit booking until the Sale & Purchase
Agreement (SPA) is signed.

The app is used as one of three personas, switched in the header and persisted
in `localStorage` under `mortar.persona`:

| Persona     | Home Route  |
| ----------- | ----------- |
| Sales Admin | `/chase`    |
| Loan Admin  | `/bookings` |
| Finance     | `/forecast` |

Routes: `/` (landing), `/sign-in` (no real auth), `/app` (redirects to the
active persona's home), `/bookings` (list), `/bookings/:id` (detail), `/chase`
(follow-ups), `/forecast` (projected signings), `/import` (spreadsheet intake).

## Stack

Bun workspaces (`frontend`, `packages/*`). `frontend/` is React 19 + Vite +
Tailwind 4 + shadcn/ui (Radix) + react-router 7 + recharts. `packages/core` is
`@mortar/core`, the shared TypeScript package (`Persona` type today). ESLint
flat config at the root, Prettier, husky + lint-staged.

## Rules

- If `rtk` is installed, prefix every shell command with it (`rtk git status`,
  `rtk bun run test`); otherwise run commands as they are. Details:
  [RTK](docs/agents/rtk.md).
- Think before coding, keep changes minimal and surgical, and verify with a test
  before claiming done. Details:
  [Andrej Karpathy Skills](docs/agents/andrej-karpathy-skills.md).
- Run `bun run check` before finishing, then `bun run format`.

## Documents

| Read When                                        | Document                                                        |
| ------------------------------------------------ | --------------------------------------------------------------- |
| Working in the app: file map, recipes, gotchas   | [Project notes](docs/agents/notes.md)                           |
| Building or styling any UI                       | [Design](docs/DESIGN.md)                                        |
| Running a shell command                          | [RTK](docs/agents/rtk.md)                                       |
| Deciding how much to build or how to change code | [Andrej Karpathy Skills](docs/agents/andrej-karpathy-skills.md) |
| Choosing or installing an agent skill            | [Skills](docs/agents/skills.md)                                 |
| Writing or formatting Markdown                   | [Markdown Style Guide](docs/markdown-style.md)                  |
