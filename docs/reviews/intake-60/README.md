# Issue 60 Review

The approved intake is tracked by issues #62 through #71, with follow-up issues
#73 (sign-in) and #74 (Today). The implementation builds on PR #61, which must
merge first. The new PR is intentionally stacked on that branch until it lands.

## Access Model

- Seven named sales profiles see their own bookings and linked records.
- Loan and legal profiles see current assigned work or an open task assigned to
  their exact internal identity. After handoff/completion, past assignment alone
  does not grant access. The legal profile represents the internal legal desk,
  not an external solicitor firm.
- Manager sees all departments, edits shared project settings, and assigns
  persisted follow-up tasks.
- API reads, direct-ID writes, import undo and Copilot tools use the signed
  session profile. Client role parameters cannot widen access. Cross-tab
  session/profile mismatches fail closed.
- Profile changes remount the workspace and clear chat/draft state;
  notifications are stored separately for each profile.

This remains a public synthetic demo with selectable profiles. The session
boundary is not production identity verification; real accounts require a
credential-backed identity provider before using real data.

## Waiting Rule

A case is suggested when an active waiting clock reaches 150% of its expected
duration. A ten-day expected wait qualifies at day fifteen. Bank clocks use
working days. Closed cases are excluded, and fresh confirmed evidence resets the
no-update clock.

## Approved Follow-up Flow

The requester selected a compact manager decision list and actionable Admin
Today, with recent bookings secondary. Manager opens Suggestions before
Overview. The case list remains visible; evidence folds within each case.
Summary tiles live in Overview so mobile Suggestions opens directly on
decisions. Forecast Detail is removed from Overview.

Task recipients follow confirmed responsibility: legal work to the internal
legal desk, bank/document work to the named loan owner, general developer holds
to the sales owner. A manager can flag an equivalent ordinary task without
creating another. Server checks and database locks prevent stale recipients and
duplicate task races. Jev percentages are current action confidence, not success
probability; stale/unavailable results show an explained timing-rule fallback.

Admin Today leads with assigned tasks and suppresses recommendations already
covered by an equivalent assigned task. Recent Bookings starts folded and uses
the last seven calendar dates of `createdAt`; a backdated booking entered today
still counts as new. Legacy rows with unknown creation time are excluded.

## Browser Review

Validated against a disposable local PostgreSQL database using Chromium:

- Manager overview and Suggestions; manager task creation.
- Settings save/reload and three-block inventory.
- Sales snapshot isolation, unauthorized case/Copilot context rejection, and
  manager-only settings protection.
- Manager task notification on the receiving sales profile.
- Copilot draft reset when switching profiles and scoped fallback answers.
- Manual booking creation and manager assignment to a named sales profile.
- Desktop at 1440px and mobile at 390px, with no page errors or horizontal
  overflow.
- Follow-up review: named-profile sign-in; Manager Suggestions first; no manual
  recipient selector; legal follow-up notification and task on Admin Today;
  rejected unassigned loan/legal API and Copilot requests. The local synthetic
  dataset showed 151 Manager cases, 15 legal cases and 38 loan cases.
- A synthetic backdated import appeared in Recent Bookings because its creation
  timestamp was new; the test import was then undone. Manager's Today route
  redirects to the single manager decision queue.

The model transport/tool loop is covered by deterministic test doubles. No live
external model call was used for browser verification.

## Screenshots

The prior presentation is recorded in
[PR 61's review captures](../issues-50-56/desktop-forecast-open.png).

| View                  | Current                                  |
| --------------------- | ---------------------------------------- |
| Manager overview      | [Screenshot](manager-overview.png)       |
| Manager suggestions   | [Screenshot](manager-suggestions.png)    |
| Manual entry, desktop | [Screenshot](manual-booking-desktop.png) |
| Manual entry, mobile  | [Screenshot](manual-booking-mobile.png)  |
| Forecast              | [Screenshot](forecast.png)               |
| Copilot               | [Screenshot](copilot.png)                |

Latest follow-up captures supersede the earlier manager screenshots:

| View                       | Current                                    |
| -------------------------- | ------------------------------------------ |
| Manager decisions, desktop | [Screenshot](followup-manager-desktop.png) |
| Manager decisions, mobile  | [Screenshot](followup-manager-mobile.png)  |
| Assigned Admin Today       | [Screenshot](followup-today-desktop.png)   |
| Sign-in, desktop           | [Screenshot](followup-signin-desktop.png)  |
| Sign-in, mobile            | [Screenshot](followup-signin-mobile.png)   |

## Automated Verification

Follow-up results: 948 tests passed (447 frontend, 217 core, 31 Jev, 211
server-source and 42 database/mapping tests), plus 18 demo-script tests. Lint,
workspace typechecks, formatting and the production build passed. Tests include
assignment handoff/revocation, Copilot tools, stale-recipient rejection and
concurrent ordinary/manager task deduplication against disposable PostgreSQL.

Original-batch results: 935 tests passed (438 frontend, 216 core, 31 Jev, 208
server-source and 42 database/mapping tests), plus 18 demo-script tests. Lint,
workspace typechecks, formatting and the production build passed.

Run `bun run check` with `TEST_DATABASE_URL` pointing at a disposable database,
then `bun run format`, `bun run build`, and
`node --test scripts/demo/tests/*.test.mjs`. The full check covers lint, all
workspace typechecks, core/Jev/frontend/server tests and database tests.

The build retains Vite's existing large-chunk warning. Graphify's code graph is
refreshed in the final commit; the separate semantic-document skill is not
available in this environment.
