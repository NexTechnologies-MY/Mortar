# Agent Skills

Skills are reusable instruction packs that a coding agent loads when a task
matches their description. This repository installs three collections from
[skills.sh](https://www.skills.sh) with the `skills` CLI, plus
[Impeccable](#pbakausimpeccable), which ships its own installer.

`skills-lock.json` records the source and content hash of every skill installed
through the `skills` CLI; the files live in `.claude/skills/` (read by Claude
Code) and `.agents/skills/` (read by other agents). Impeccable is not in the
lock file: it installs and updates itself.

## Install And Update

```shell
bunx skills add obra/superpowers
bunx skills add mattpocock/skills
bunx skills add leonxlnx/taste-skill
```

Each command installs or refreshes that collection and updates
`skills-lock.json`. Commit the lock file and the skill directories together so
every clone loads the same instructions.

### On Windows

Each `.claude/skills/<name>` entry is a symlink into `.agents/skills/`. With
git's default `core.symlinks=false` on Windows, they check out as text files and
Claude Code loads no project skills. Turn on Developer Mode, then run:

```powershell
git config core.symlinks true
Get-ChildItem .claude/skills -File | Remove-Item
git checkout -- .claude/skills
```

For a fresh clone, pass `-c core.symlinks=true` to `git clone` instead.

## obra/superpowers

Process skills by Jesse Vincent (`obra`), at
https://www.skills.sh/obra/superpowers. They define how work flows rather than
what to build: `using-superpowers` loads at the start of a session and routes to
the others.

- `brainstorming`: turn an idea into a design and a written spec before any
  code.
- `writing-plans`, `executing-plans`, `subagent-driven-development`: write and
  run step-by-step implementation plans.
- `test-driven-development`, `systematic-debugging`,
  `verification-before-completion`: red-green-refactor, evidence before claims.
- `requesting-code-review`, `receiving-code-review`,
  `finishing-a-development-branch`, `using-git-worktrees`,
  `dispatching-parallel-agents`, `writing-skills`.

Reach for this collection whenever a task is bigger than a one-file fix.

## mattpocock/skills

Engineering and writing skills by Matt Pocock, at
https://www.skills.sh/mattpocock/skills. Thirty-seven of them are installed
here. The ones used most in this repository:

- `grilling` and `grill-me`: stress-test a plan or decision with questions.
- `codebase-design`, `improve-codebase-architecture`, `domain-modeling`: deep
  modules, seams, and shared vocabulary.
- `tdd`, `diagnosing-bugs`, `code-review`, `implement`, `implement-spec`.
- `research`: investigate a question against primary sources and save the
  findings as Markdown.
- `writing-for-agents`: how to write `AGENTS.md`, skills, and any document an
  agent consumes.
- `handoff`, `wizard`, `setup-pre-commit`, `to-spec`, `to-tickets`, `retro`.

Reach for this collection for design thinking, research, and documents.

## leonxlnx/taste-skill

Frontend design skills at https://www.skills.sh/leonxlnx/taste-skill. Thirteen
are installed. They exist to keep generated UI from looking generic.

- `design-taste-frontend`: landing pages, portfolios, and redesigns, with a
  strict pre-flight checklist.
- `redesign-existing-projects`, `high-end-visual-design`, `minimalist-ui`,
  `industrial-brutalist-ui`: specific visual directions.
- `brandkit`, `image-to-code`, `imagegen-frontend-web`,
  `imagegen-frontend-mobile`, `stitch-design-taste`: image-led design work.
- `gpt-taste`, `full-output-enforcement`.

Reach for these when a brief calls for a specific visual direction; `impeccable`
is the default entry point for page work. For this template,
[Vercel's web interface guidelines](https://vercel.com/design/guidelines) and
[Geist](https://vercel.com/geist) take precedence where the two disagree.

## pbakaus/impeccable

The design language for the AI harness itself, at
[impeccable.style](https://impeccable.style). One skill, 24 sub-commands, and a
deterministic detector for the patterns that make generated UI look generated.
Run it as `/impeccable <command> [target]`; `/impeccable` alone prints the menu.

- `critique`, `audit`, `polish`: review a surface, then close the findings.
- `quieter`, `distill`, `layout`, `typeset`: tone down, strip back, fix rhythm.
- `bolder`, `colorize`, `animate`, `delight`: the other direction.
- `harden`, `onboard`, `clarify`, `adapt`, `optimize`: states, first runs, copy,
  devices, performance.
- `init` and `document`: capture product truth and record the visual system.

It reads `docs/PRODUCT.md` and `docs/DESIGN.md` as this repo's authorities, so
those files stay canonical and no rival copies appear at the root.

Unlike the three collections above it is installed by its own CLI, because it
ships more than Markdown: a Rust engine binary, four Claude Code subagents
(`.claude/agents/impeccable-*.md`), and a design hook.

```shell
npx impeccable@latest install --providers=claude,codex --scope=project --yes
npx impeccable update
```

Notes:

- The engine binary (~15 MB per OS) is git-ignored. Each machine's launcher
  fetches a checksum-verified copy into `~/.impeccable/bin/<version>/` on first
  run, so a fresh clone needs nothing but the update command above.
- The Claude Code hook lands in `.claude/settings.local.json`, which git
  ignores, so it stays per-machine. Re-run the installer, or
  `/impeccable hooks on`, to enable it on yours. Codex reads
  `.codex/hooks.json`, which is committed; approve it once via `/hooks`.
- `.impeccable/` holds its working files. Shared artifacts (`config.json`,
  `design.json`, `surfaces/*.md`, `critique/*.md`) are tracked; screenshots,
  caches and per-developer overrides are not.

## Which Skill First

| Task                                  | Start With                                  |
| ------------------------------------- | ------------------------------------------- |
| New feature or behavior change        | `brainstorming`, then `writing-plans`       |
| Bug, failing test, slow path          | `systematic-debugging` or `diagnosing-bugs` |
| Reviewing or landing a branch         | `requesting-code-review`                    |
| Page, layout, or visual change        | `impeccable`                                |
| Docs for agents (`AGENTS.md`, skills) | `writing-for-agents`                        |
| Questions with sources                | `research`                                  |
