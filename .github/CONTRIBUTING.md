# Contributing To Mortar

How we take a change from an idea to the live site without breaking it. Read
this once before your first pull request; the issue and pull request forms walk
you through the rest.

Contents:

1.  [The One Rule To Remember](#the-one-rule-to-remember)
1.  [The Journey Of A Change](#the-journey-of-a-change)
1.  [Issues](#issues)
1.  [Branches](#branches)
1.  [Commits](#commits)
1.  [Pull Requests](#pull-requests)
1.  [Reviews And Merging](#reviews-and-merging)
1.  [Never Do These](#never-do-these)
1.  [When Something Breaks On The Live Site](#when-something-breaks-on-the-live-site)
1.  [Working With AI Coding Agents](#working-with-ai-coding-agents)

## The One Rule To Remember

**Merging into `main` deploys to the live site within minutes.** There is no
staging step in between, so a pull request is the last chance to catch a
mistake. Everything below exists to protect that moment.

## The Journey Of A Change

```text
Issue ──► Branch ──► Commits ──► Pull Request ──► Review ──► Squash Merge ──► Live
 what      your       small       CI checks it     a teammate   one commit      check it
 and why   copy       steps                        approves     on main         works
```

1.  **Issue:** describe the problem or idea using an issue form.
1.  **Branch:** make your own branch from the latest `main`.
1.  **Commits:** save your work in small, named steps.
1.  **Pull Request:** open it with the template filled in. CI runs the checks.
1.  **Review:** a teammate reads it and approves or asks for changes.
1.  **Squash Merge:** the change lands on `main` as one commit.
1.  **Live:** open the live site and confirm the change works.

## Issues

- **Start With An Issue:** every change except a typo fix starts as an issue, so
  the team agrees on the what and why before anyone writes code.
- **Use A Form:** pick **Bug Report** or **Feature Or Change**. Blank issues are
  turned off.
- **One Problem Per Issue:** if you find a second problem, open a second issue.
- **Check For Duplicates And Conflicts:** before creating an issue, search open
  and closed issues and pull requests with `gh`. Comment on a duplicate instead
  of opening another, and link any issue that overlaps or conflicts with yours.
  See [GitHub Issues And Pull Requests](/docs/agents/github.md).

## Branches

Name every branch `<type>/<short-topic>`, in lowercase with hyphens.

| Type    | Use It For                                | Example                    |
| ------- | ----------------------------------------- | -------------------------- |
| `feat`  | A new capability                          | `feat/chase-quick-confirm` |
| `fix`   | Something that was broken                 | `fix/persona-switch-home`  |
| `ui`    | Look and layout only, no behaviour change | `ui/case-page-spacing`     |
| `docs`  | Documents only                            | `docs/survey-n8`           |
| `chore` | Tooling, dependencies, config and cleanup | `chore/update-eslint`      |

- **Start From Fresh `main`:** run `git switch main` and `git pull` first.
- **One Branch, One Change:** don't reuse a merged branch for new work.
- **Stay Up To Date:** if GitHub shows **Update branch** on your pull request,
  click it before asking for review.

## Commits

Write each commit message as `type(scope): what changed`, in lowercase and in
the imperative, like an instruction.

```text
feat(chase): add a confirm button to each chase card
fix(import): keep the unit number when a row has no layout
docs(survey): add the three new responses
```

- **Type:** the same list as branch types.
- **Scope:** optional, naming the area touched, such as `chase`, `import`,
  `legal`, `forecast`, `landing` or `survey`.
- **Small Steps:** commit each working step separately, not a whole day in one
  commit.
- **Before You Commit:** the pre-commit hook formats staged files for you. If it
  fails, read the message, fix it and commit again.

## Pull Requests

- **One Thing Per Pull Request:** if the title needs the word "and", split it.
  Aim for under about 400 changed lines, not counting `bun.lock`.
- **Fill In The Template:** every section, in plain words. Link the issue with
  `Closes #123` so it closes on merge.
- **Run The Checks Locally:** run `bun run check`, then `bun run format`, before
  pushing. CI runs the same checks and blocks the merge if they fail.
- **Check Open Pull Requests:** compare the files you touch with every open pull
  request (`gh pr view <number> --json files`), and name any overlap in your
  description.
- **Refresh The Graph Last:** make `graphify update .` your last commit, so
  `main` always carries a current graph. See
  [Graphify](/docs/agents/graphify.md).
- **Show UI Changes:** attach before and after screenshots for anything visible.
- **Follow The Design Guide:** UI must follow
  [`docs/DESIGN.md`](/docs/DESIGN.md). Use the components in
  `frontend/src/components/ui/`, never browser-native inputs, selects or date
  pickers.
- **Update The Docs:** if behaviour changed, update the PRD, TRD or
  `docs/agents/notes.md` in the same pull request.
- **Draft While Unfinished:** open it as a **Draft** until it is ready for
  review.

## Reviews And Merging

- **Never Merge Your Own Pull Request:** wait for one teammate's approval.
- **Green Checks Only:** merge only when every check shows a green tick.
- **Answer Every Comment:** reply or push a fix, then resolve the thread.
- **Squash And Merge:** always choose **Squash and merge**, so `main` gets one
  clean commit per change. Edit the squash title into the commit format above.
- **Delete The Branch:** click **Delete branch** after merging.
- **Check The Live Site:** open the live site after the deploy finishes and try
  your change as a real user would.

## Never Do These

- **Push Straight To `main`:** always go through a pull request.
- **Commit Secrets:** `.env` files, API keys, passwords or tokens. Use
  `.env.example` for placeholders only.
- **Commit Real Buyer Data:** no real names, IC numbers, phone numbers or bank
  details, in code, test data, screenshots or issues. All data in Mortar is
  synthetic. See [Data Retention](/docs/TRD.md#data-retention).
- **Force-Push A Shared Branch:** never run `git push --force` on a branch
  someone else works on.
- **Bypass The Checks:** don't disable a test, lint rule or hook to make a
  failure go away. Ask for help instead.

## When Something Breaks On The Live Site

1.  **Tell The Team First:** post in the team chat with a screenshot and the
    page link.
1.  **Revert, Don't Patch:** open the merged pull request on GitHub, click
    **Revert** and merge the revert pull request. This restores the last working
    version within minutes.
1.  **Fix Calmly:** open a bug issue, then fix it on a new branch through the
    normal journey.

## Working With AI Coding Agents

AI agents are welcome, but you own everything they write.

- **Read The Diff:** read every changed line before you commit it. If you can't
  explain a change, don't ship it.
- **Keep Them On Task:** ask for one change at a time, matching one issue. Large
  mixed changes from an agent are the fastest way to a messy repo.
- **Graph First:** have agents query the Graphify graph (`graphify query`)
  before grepping. It answers most questions for far fewer tokens.
- **Point Them At The Rules:** agents read [`AGENTS.md`](/AGENTS.md), which
  links back to this guide.
