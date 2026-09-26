# GitHub Issues And Pull Requests

Every issue and pull request starts from what the repository already holds. Read
it with the GitHub CLI before writing anything, so the team never tracks the
same work twice or ships two changes that undo each other.

## Before Opening An Issue

Search open and closed issues and pull requests for the same problem. Search by
the page, the component and the words a user would use, not only by your planned
title:

```bash
gh issue list --state all --search "<keywords>" --limit 50
gh pr list --state all --search "<keywords>" --limit 50
```

Read every plausible match with `gh issue view <number> --comments` or
`gh pr view <number> --comments`, then decide:

- **Duplicate:** do not open a new issue. Add what is new as a comment on the
  existing one.
- **Overlap:** your issue touches the same page, files or behaviour as another.
  Open yours and say how they relate, for example "Builds on #52" or "Must land
  after #55".
- **Conflict:** your issue contradicts another's plan, for example both redesign
  the forecast differently. Say so in both issues and settle it before anyone
  builds either.

## Before Opening A Pull Request

List the open pull requests and compare the files each one touches with yours:

```bash
gh pr list --state open
gh pr view <number> --json files --jq '.files[].path'
git diff --name-only origin/main...HEAD
```

- When another open pull request changes the same files, name it in your
  description and agree the merge order. Rebase after it lands.
- Link the issues your change affects: `Closes #52` for the one it finishes,
  `Refs #56` for any it touches. Update an issue whose plan your change alters.
