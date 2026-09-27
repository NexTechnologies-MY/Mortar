# Tier: Lite

## Goal

Deliver the approved #60 intake and profile-aware Copilot in one branch and one
pull request, following #61. The requester has authorized implementation, issue
creation and the pull request.

## Acceptance Criteria

1. Named staff profiles and Manager share server-enforced access boundaries.
   Sales sees only owned cases, including direct APIs and Copilot
   tools/fallback.
2. Manager has a concise overview, folded full queue, Suggestions and persisted
   department escalation tasks with notifications.
3. Waiting suggestions trigger at 150% of the expected stage wait (requester
   clarified 50% overdue).
4. Shared project settings are manager-editable only; multiple blocks and
   available units work across all owners.
5. Manual entry is the first/default tab, responsive and validates the entire
   batch. Imports retain atomic duplicate protection.
6. Forecast documents are removed while useful forecast data remains accessible.
7. Profile changes clear old snapshots, conversations, pending responses and
   notification state.

## Work

- Builder: server and shared core access/session/settings/task changes, backend
  regression tests.
- Developer: profile plumbing, manager workflows, Copilot presentation,
  forecast, import integration and docs.
- Designer: booking form/settings implementation and visual review.
- Post-build tester: inspect integrated diff and verify isolation, workflow and
  regression checks.

## Verification

`bun run check`, `bun run format`, `bun run build`, disposable PostgreSQL
integration suite, focused browser checks at desktop/mobile widths,
`git diff --check`. Refresh Graphify in the final commit.

## Tracking

#62–#71 track the ten focused changes. #51/#53 are extended, #54's document
presentation is superseded; #58 stays excluded. PR #61 is the prerequisite and
planned base while open.
