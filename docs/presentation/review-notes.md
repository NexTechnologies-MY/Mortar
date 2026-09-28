# Repository And Prototype Review

Reviewed the current `main` checkout of
[NexTechnologies-MY/Mortar](https://github.com/NexTechnologies-MY/Mortar),
commit `e7f3f5db821b42830a941ba4d33975890f9ced91`, on 28 September 2026.

The organisation's accessible repository listing contained Mortar. The complete
tracked-file inventory is in `repository-inventory.json`. Substantive review
focused on the challenge, product/requirements/architecture documents, survey,
research and roadmap, existing deck, demo scripts, routes, staff scoping, case
derivation, task creation, message review, legal updates, management follow-up,
forecast logic and their existing tests. Inventorying binaries and generated
files is not a line-by-line review of every asset.

## Findings That Affect The Presentation

- The qualification deck uses n = 5. The current survey is n = 8, with updated
  counts. Its interview template remains blank.
- The current app has Sales Admin, Loan Admin, Legal Admin and Manager. Arvind
  Raj is Legal Admin; Finance is a beneficiary of the forecast.
- The old Cloud Run URL returned HTTP 500 during this check. Render was healthy
  and reported the same commit as the inspected checkout.
- Today has named-profile scoping and Quick View. BK-9001 already had an open
  payslip task, so a script relying on Create Task being visible is fragile.
- The fixture's banker request was unconfirmed. Staff confirmation changes the
  operational case; AI confidence does not replace that confirmation.
- Receipt clears a document blocker; it does not approve a loan or establish an
  additional sale. Task completion is separate from evidence confirmation.
- The forecast's target is signing within 30 days of booking, not cash receipts
  over the next 30 days. The inspected display showed 21, range 17–25, 50
  bookings, on synthetic data. Values may change with state and profile.
- Manager follow-up assigns internal work. It does not send external messages.
- Ask MortarAI exists in the current implementation; the old deck's blanket “not
  a generative chatbot” wording is stale. Jev is the structured layer.
- Shared demo management now uses Add/Delete Demo Data, restricted to Manager;
  the older recording walk's reset assumptions and several locators are stale.
- Official company research identifies Kingdee's announced ERP programme. IFCA
  is a survey suggestion and cannot be presented as Chin Hin's stack.
- OCR, automatic WhatsApp intake and mortgage-rescue proposals are roadmap
  material. Several feature-idea figures explicitly lack published sources; the
  presentation excludes them.

## Verification And Its Limits

The live app was inspected in Chromium through Today, the case page, Manager,
Legal, Forecast, Add Bookings, Settings, FAQ and Sign In. Screenshots and text
captures were retained in the local review folder. Live task/evidence state was
read; the shared dataset was not reset or changed by this review.

`bun run check` passed: lint, typechecks and existing test suites. The core
suite reported 218 passing tests, Jev 31 and frontend 457. Database tests
requiring a configured database were not a live-production verification.
`bun run build` passed with a bundle-size advisory. Existing UI fixtures also
emit duplicate-key warnings in some tests. Neither was a test failure.

The script's critical loop was checked against the implementation and existing
tests, and the current live preconditions were inspected. The end-to-end live
mutation sequence must still be rehearsed on a dedicated synthetic demo state.
Do not describe this read-only review as a completed production transaction
test.

The initial review produced the presentation files outside the repository. This
publication adds those documents to `docs/presentation/` on a separate branch
for review. The review did not change live shared bookings.
