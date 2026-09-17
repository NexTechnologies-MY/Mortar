# AGENTS.md

Instructions for coding agents working in this repository. The rules below apply
to every task; the linked documents carry the detail and are read when the task
calls for them.

## Rules

- Prefix every shell command with `rtk` (`rtk git status`, `rtk bun run test`).
  Details: [RTK](docs/agents/rtk.md).
- Think before coding, keep changes minimal and surgical, and verify with a test
  before claiming done. Details:
  [Andrej Karpathy skills](docs/agents/andrej-karpathy-skills.md).
- Run `bun run check` before finishing, plus `bun run test:e2e` for anything
  that touches a page, then `bun run format`.

## Documents

| Read when                                           | Document                                                        |
| --------------------------------------------------- | --------------------------------------------------------------- |
| Writing any Next.js code; the APIs changed recently | [Next.js 16 notes](docs/agents/nextjs.md)                       |
| Working in the app: file map, recipes, gotchas      | [Project notes](docs/agents/notes.md)                           |
| Running a shell command                             | [RTK](docs/agents/rtk.md)                                       |
| Deciding how much to build or how to change code    | [Andrej Karpathy skills](docs/agents/andrej-karpathy-skills.md) |
| Choosing or installing an agent skill               | [Skills](docs/agents/skills.md)                                 |
| Writing or formatting Markdown                      | [Markdown style guide](docs/markdown-style.md)                  |
