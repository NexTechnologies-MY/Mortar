# Agent skills

Skills are reusable instruction packs that a coding agent loads when a task
matches their description. This repository installs them from three collections
on [skills.sh](https://www.skills.sh) with the `skills` CLI. `skills-lock.json`
records the source and content hash of every installed skill; the files live in
`.claude/skills/` (read by Claude Code) and `.agents/skills/` (read by other
agents).

## Install and update

```shell
bunx skills add obra/superpowers
bunx skills add mattpocock/skills
bunx skills add leonxlnx/taste-skill
```

Each command installs or refreshes that collection and updates
`skills-lock.json`. Commit the lock file and the skill directories together so
every clone loads the same instructions.

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

Reach for this collection before building or restyling any page. For this
template,
[Vercel's web interface guidelines](https://vercel.com/design/guidelines) and
[Geist](https://vercel.com/geist) take precedence where the two disagree.

## Which skill first

| Task                                  | Start with                                  |
| ------------------------------------- | ------------------------------------------- |
| New feature or behavior change        | `brainstorming`, then `writing-plans`       |
| Bug, failing test, slow path          | `systematic-debugging` or `diagnosing-bugs` |
| Reviewing or landing a branch         | `requesting-code-review`                    |
| Page, layout, or visual change        | `design-taste-frontend`                     |
| Docs for agents (`AGENTS.md`, skills) | `writing-for-agents`                        |
| Questions with sources                | `research`                                  |
