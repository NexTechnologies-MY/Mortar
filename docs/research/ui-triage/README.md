# UI Triage: The Signed-In App

This document is a UX triage of Mortar's signed-in pages, conducted on 26 and 27
September 2026 from production screenshots and the code. Its purpose is to guide
a simplification before the October pitch.

Two early findings were confirmed in code and on screen; details are in the
Diagnosis.

Contents:

1.  [Diagnosis](#1-diagnosis)
1.  [The Daily Workflow](#2-the-daily-workflow)
1.  [Information Architecture](#3-information-architecture)
1.  [Page By Page](#4-page-by-page)
1.  [Cross-Cutting Rules](#5-cross-cutting-rules)
1.  [Implementation Plan](#6-implementation-plan)
1.  [Leave Alone Before The Pitch](#7-leave-alone-before-the-pitch)

## 1. Diagnosis

Ranked by how much each hurts a non-technical Sales Admin on a normal working
day.

**1. Two "next step" engines disagree, and both create tasks.** The chase card
shows Jev's suggestion. The same case's page shows a rule-based "Next Move" from
`ballInCourt`. On `sales-admin_chase.png`, unit B-15-08 (BK-9004) says "Call
Buyer · Sales · Nurul Aina". Its stall is "Bank Has Not Decided After 9 Working
Days", so the rule engine in `packages/core/src/ball.ts:78` returns
`chase_banker`, owned by Loan Admin per
`frontend/src/components/case/ball.ts:28`. "Create Task" on the card posts Jev's
action (`ChasePage.tsx:168`). "Add Task" in the Waiting On panel and in the
table's Task column posts the rule-based one (`WaitingOn.tsx:133`,
`TaskCell.tsx:64`). One booking can end up with two open tasks for two different
people. The owner filter on `/chase` also flips a case between buckets after
"Ask Jev" (`ChasePage.tsx:109`).

**2. Every fact on a case is shouted at the same volume.** On
`sales-admin_chase.png` each card carries an urgency pill, a 16px blocker line,
a coloured risk chip, a stage and age line, the suggestion with owner, a warning
pill "Jev's Answer May Be Out Of Date", and a Task Open pill. The warning pill
is on every card because the snapshot marks cached suggestions stale whenever
case state has moved, which on demo data is always (`ChaseCard.tsx:127`). A
warning that is always on stops being a warning. On `sales-admin_bookings.png`
every visible row has red Age, a red Waiting On pill, a coloured Risk chip, and
often a blue Task pill (`BookingsTable.tsx:155`, `:174`, `:182`). On
`sales-admin_bookings_BK-9002.png` the header stacks four status pills and three
owner badges, the journey strip repeats the stall in red, the Waiting On block
repeats "No Update For 8 Days" as a pill, and the same five events are drawn
three times: journey, track timelines, case history (`CaseHeader.tsx:37`,
`WaitingOn.tsx:216`, `TrackTimelines.tsx`, `EvidenceLog.tsx`).

**3. The persona appears in five places and the "lens" claims things the code
does not do.** Top bar switcher, the desk lens banner on `/bookings` and the
case page (`PersonaDeskLens.tsx`), the "Your Desk" chip in the pipeline strip
(`BookingPipelineFlow.tsx:291`), the "(Your Desk)" ring on the case header
(`CaseHeader.tsx:54`), and a row tint in the table (`BookingsTable.tsx:136`).
The banner says bank ratios "are masked", but the six `PERSONA_PERMISSIONS`
booleans in `persona.tsx:120` are read by nothing except the banner; the only
real difference is tooltip text in `RiskChip.tsx:39`. The three BK-9002
screenshots are pixel-identical apart from the banner and one note in Bank
Applications. Worse, the banner tells Sales Admin they see "buyer contact
signals", while their home page is full of bank stalls owned by Loan Admin.

**4. `/bookings` has three stacked filter systems and its numbers disagree.**
Stat tiles, the pipeline strip with its own selection state, Active/Closed tabs,
then a filter bar. In `sales-admin_bookings_quickview.png` one click on the
strip produces seven controls for one filter: "Filtered View Active", "Reset
Pipeline Filter", "Filter Mode", "Switch to All (11)", "Stalled Only (6)", "All
Cases (11)", "(Show All Active Bookings)". The strip totals 11+27+15+5 plus 6
developer cases, or 64, while the tab says Active (80). Cases at the Loan
Agreement stage fall into no bucket because `ballInCourt` returns no holder once
the SPA is signed and only `stage === 'spa_signed'` is counted as SPA
(`BookingsPage.tsx:189`). "SPA Signed 5" undercounts for the same reason. "Live
Bookings" reads 53 here and 50 on `/forecast` because `BookingsPage.tsx:146` and
`packages/core/src/sim/forecast.ts:44` use different definitions.

**5. The case page is a 2,635 px wall with three forms permanently open.**
Record An Update, Add Message and the playbook search are all expanded on load
(`BookingDetailPage.tsx:161`, `:185`, `PlaybooksPanel.tsx:135`). Each message
shows a probability bar and "Confidence 98%" (`MessagesPanel.tsx:102`), which
DESIGN.md's plain-language table explicitly bans. Playbooks show "Partial Fit"
beside a 100% keyword bar, two numbers that contradict each other to a lay
reader.

**6. Persona switching reorders the sidebar but stays on the page.**
`PersonaSwitch.tsx:46` calls `setPersona` only. Visible in
`loan-admin_bookings.png`. PR #48 adds that navigate call.

**7. Three ways to add a booking, three project names.** Add Booking defaults to
"Residensi Cahaya Muda" (`BookingsPage.tsx:320`), the case page shows "Aster
Heights" (`stories.ts`), and the Direct Case Import Ledger writes "Bukit Damai"
from browser-local settings (`DirectTableImport.tsx:213`,
`projectSettings.ts:77`). A judge who types a booking into the ledger creates it
in a project none of the other 148 belong to, with a generated IC and income
they never saw (`DirectTableImport.tsx:222`). "Unsold: 420 Units" counts a
building the ledger does not hold. Screenshots: `sales-admin_import.png`,
`sales-admin_settings.png`, `sales-admin_bookings_addbooking.png`.

**8. Design-system drift in the new components.** Native `<select>` at
`DirectTableImport.tsx:365` and `:389`; `type="number"` at
`DirectTableImport.tsx:406` and `ProjectSettingsCard.tsx:180`, `:195`, `:210`,
`:225`, `:351`; `title` tooltips at `DirectTableImport.tsx:283`, `:424`, `:432`,
`:447` and `ProjectSettingsCard.tsx:283`, `:296`. Beyond the brief's list:
`rounded-lg` cards, `shadow-xs` and `shadow-2xs` outside the two shadow tokens,
`rounded-full` pills, `animate-pulse` on a dot and a badge, ink tints
(`bg-primary/10`) used as a pseudo-accent, row tinting in two tables (banned
outright), an emoji in `RiskChip.tsx:41`, latency in a toast
(`AddMessageForm.tsx:110`), "Sim" and "Story" source badges in Case History
(`EvidenceLog.tsx:20`), and a dozen icons outside the approved list.

**9. Jargon a Sales Admin does not use.** "Purview", "Boundaries", "Lens",
"Conveyancing & SPA Execution", "Underwriting", "Bottleneck Flow", "Filter
Mode", "Developer Desk", "cases on hand", "conversions", "Direct Case Import
Ledger", "Confidence 98%", "Accuracy Score 0.180". The same milestone is "LO
Issued" in the table, "Loan Approved" in the journey strip, and "Loan Approved
(LO Issued)" in the update form.

**10. The chase queue hides most of itself and shows everyone's tasks.** Six of
26 stalled cards show, the rest behind "Show 20 More" (`ChasePage.tsx:57`). Open
Tasks lists tasks owned by four different sales agents with no "mine" view
(`ChaseTasks.tsx`).

One line on phones: `phone_bookings.png` stacks four full-height pipeline cards
before any row appears. Desktop is the target, so this is deferred, but the fix
in section 4 helps it for free.

## 2. The Daily Workflow

**Sales Admin, driven by `/chase` renamed "Today".**

1.  Open Today. The first card is the one to do now. The header says "8 bookings
    need a move from you · 3 tasks due today".
2.  Take the card's one action: "Ask buyer for payslip" or "Call buyer". Create
    Task is the only primary button.
3.  Log what happened from the case sheet: one "What happened" choice, one note,
    save.
4.  If a WhatsApp reply arrived, paste it and click Confirm on Jev's read.
5.  Mark the task done. The next card rises. Stop at "Nothing left for today".

**Loan Admin, driven by `/bookings` preset to Waiting On Bank.**

1.  Open Bookings. The table opens already filtered to bank-held cases, slowest
    first.
2.  Click the top row. The quick view opens, not the wall.
3.  Record the bank's answer in the quick view: Documents Requested, Loan
    Approved, or Rejected.
4.  If rejected, record "Submitted To Another Bank" in the same form.
5.  Before leaving, clear the "No Update 10+ Days" list.

**Legal Admin, driven by `/legal`.**

1.  Open Legal. Cases with no appointment sit on top.
2.  Call the firm, then record "SPA Appointment Set" from the row itself.
3.  For appointments past their date, record "SPA Signed" or chase the firm.
4.  Once a week, read Panel Load to see which firm is holding the most.

## 3. Information Architecture

**Sidebar.** Two groups. Primary: Today, Bookings, Legal, with the persona's
home hoisted first as `AppSidebar.tsx:125` already does. Secondary, under a
"More" heading: Forecast, Import (renamed Add Bookings), Settings.
`SectionHeading` already exists for this.

**Persona switching.** The top bar switcher is the only switcher. Switching
navigates to the persona's home. Delete the in-page "Switch Lens" buttons and
the banner entirely. The persona's name stays visible in the top bar trigger as
today.

**The desk lens becomes a preset, not a banner.** Persona sets defaults:
`/chase` owner filter defaults to the persona's role, `/bookings` Waiting On
filter defaults to Buyer for Sales, Bank for Loan, Solicitor for Legal. A filter
the user can see and change is honest; a banner claiming masking is not. Drop
the masking copy until masking is built. Keep the role-specific `RiskChip`
tooltip text but reword it (section 5).

**Pages to merge.** The Direct Case Import Ledger and the sheet upload become
two tabs on one "Add Bookings" page, spreadsheet first. The Add Booking dialog
stays on `/bookings` for the single-case path. The three project names collapse
to one: the ledger and Settings default to `mainProject(snapshot.bookings)`, the
same source Add Booking uses.

**Pages to split.** None. The Legal queue gains two sections instead of one
sentence (below).

**Overlays.** The quick view becomes the default target of a row click on
`/bookings` and gains the Record An Update form. "Open Full Case" remains inside
it. The full case page becomes the place for messages and history, not the place
for every action.

## 4. Page By Page

**App shell** (`AppNav.tsx`, `AppSidebar.tsx`, `PersonaSwitch.tsx`). Keep
breadcrumbs, Ask, bell, theme, persona. Add navigate on switch. Split nav into
Primary and More. Rename the "Chase List" label to "Today" in `NAV_ITEMS` and
`ROUTE_LABELS`; keep the `/chase` route.

**Today, `/chase`** (`ChasePage.tsx`, `ChaseCard.tsx`, `ChaseTasks.tsx`,
`chase.ts`). Above the fold: title, one sentence with the two counts, two stat
tiles (Need A Move From You, Value At Risk), the filter row, the first row of
cards. Delete the "Suggested Next" strip; the first card is the suggestion. Card
stack becomes: unit and buyer, blocker sentence, one muted meta line, next step
line, footer. Only one pill per card: urgency when overdue, else Task Open. Risk
chip appears only for High. Remove `JevTag` from the card; put "Jev checked
earlier" in a tooltip on the suggestion icon. Move "Ask Jev Again" into a ghost
icon button. Single next step: default to the rule-based move from `ballInCourt`
with `MOVE_OWNER`; when Jev's cached suggestion differs, show one extra line
"Jev suggests: Call buyer instead" with its own small button. Create Task posts
whichever the user picked, so `/chase`, the quick view and the table raise the
same task for the same case. Owner filter defaults to the persona's role. Open
Tasks defaults to "Mine" with an "All owners" toggle. Show 9 cards before "Show
N more" rather than 6. Copy: "Action Today" eyebrow goes; `NEXT_ACTION_LABELS`
become verbs a person says (section 5).

**Bookings, `/bookings`** (`BookingsPage.tsx`, `BookingPipelineFlow.tsx`,
`BookingsTable.tsx`, `BookingFilters.tsx`). Above the fold: title, Add Booking,
the pipeline strip, one filter row, the table by 420 px. Delete
`PersonaDeskLens`. Cut the four stat tiles to two (Stalled, No Update 10+ Days)
or make the strip carry the counts alone. The strip becomes the Waiting On
filter: one click filters to that party, a second click clears, and the "Waiting
On" select goes. Move "Stalled only" to a checkbox in the filter row. Delete
"Filter Mode", the two sub-buttons, "Switch to All", "Filtered View Active",
"Reset Pipeline Filter", the "Tip:" line, and the pulsing dot. Add Developer as
a fifth, narrower card instead of the footer badge. Count `summary.spaSigned`
cases into the SPA bucket and stat so the strip sums to the Active count. Rename
the strip "Who Holds Each Booking"; cards read "Buyer", "Bank", "Solicitor",
"Signed", "Us". Table: remove the row tint; Age turns red only when Waiting On
is not already a red pill; Low Risk renders as muted text, Medium and High as
pills; row click opens the quick view. Tabs stay, moved into the filter row.
Primary action: Add Booking.

**Case page, `/bookings/:id`** (`BookingDetailPage.tsx`, `CaseHeader.tsx`,
`WaitingOn.tsx`, `RecordUpdateForm.tsx`, `AddMessageForm.tsx`,
`MessagesPanel.tsx`, `PlaybooksPanel.tsx`, `EvidenceLog.tsx`,
`TrackTimelines.tsx`). Delete `PersonaDeskLens` and the "(Your Desk)" rings.
Header: title, one meta line, then one status sentence in words: "With bank ·
Waiting on Crestline Bank to decide · 8 days, stalled". Stage, freshness and
stall reasons stop being separate pills. Outstanding documents stay as pills
because they are actionable. Owners become one muted line. Journey strip stays.
Next Step block keeps one primary Add Task, with the Jev variant line from the
chase card when it differs. Record An Update collapses to a secondary button
that expands the form in place with `aria-expanded`, the same pattern as "Show
51 Assumptions". Add Message collapses to "Paste A Message". Messages: Jev block
becomes one line, "Jev suggests: Documents Received · Payslip · Jev is sure",
with Confirm and Dismiss; probability bar and percentage go. Playbooks: show the
top fit only, hide the keyword bar, "Show 9 more". Bank Applications: drop the
three persona notes. Fold Case History behind "Show Full History (5)"; keep the
track timelines visible since they are the auditable story the demo tells.
Primary action: Add Task.

**Legal, `/legal`** (`LegalPage.tsx`, `LegalQueueTable.tsx`,
`FirmLoadCard.tsx`). Already the calmest page; keep its shape. Split the queue
into "No Appointment Yet (7)" and "Appointment Set, Not Signed (8)", which is
what US-25 asks and what the current sentence only hints at. Add a row action
that opens Record An Update in a dialog preset to SPA Appointment Set or SPA
Signed, so Legal never needs the case page. "Days Since LO" becomes "Days Since
Loan Approved". Primary action: the row's Record button.

**Forecast, `/forecast`** (`ForecastPage.tsx`, `BacktestCard.tsx`). Copy only.
"Accuracy Score 0.180" becomes a sentence per DESIGN.md's plain-language table.
"Live Bookings" tile should match `/bookings` or be labelled with its own
definition. Nothing else moves.

**Add Bookings, `/import`** (`ImportPage.tsx`, `DirectTableImport.tsx`,
`DropZone.tsx`). Rename the page. Two tabs: Upload A Sheet (default, current
drop zone and "What The Sheet Needs" card) and Type Them In (the grid). In the
grid: `Select` for layout and law firm, `Input` with `inputMode="numeric"` and
an RM prefix for price, `Tooltip` for the three `title` attributes, `Button` for
the trash icon with an aria-label. Collapse the five header badges to one muted
line: "Sales Nurul Aina · Law firm Teh & Partners · Project Residensi Cahaya
Muda · Change in Settings". Remove row tinting; the Status column shows a pill
only for errors. Add one visible line above the grid: "Demo buyer details such
as IC and income are generated for you." Primary action: Import N Bookings.

**Settings, `/settings`** (`SettingsPage.tsx`, `ProjectSettingsCard.tsx`,
`DemoDataCard.tsx`). Put Demo Data first; it is the lever the presenter reaches
for. Project card second, with the three layout models folded behind "Unit
Layouts (3)". Replace the five number inputs with `Input` plus
`inputMode="numeric"`, the two `title` attributes with `Tooltip`, the pulsing
"Unsaved Changes" badge with the disabled state of Save that already exists, and
the tinted preview banner with a plain mono line. Primary action: Save.

## 5. Cross-Cutting Rules

**Density budget.**

| Surface                         | Budget                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Page above the fold at 1440×900 | Title, one lead line, at most three stat tiles, no banner, one filter row, the working list starts by 420 px |
| Table row                       | At most one coloured pill; Age or Waiting On carries red, never both                                         |
| Chase card                      | One pill, one primary button, no Jev status pill                                                             |
| Case page above the fold        | Header, one status sentence, journey strip, next step; every form closed                                     |
| Persona                         | Shown once, in the top bar                                                                                   |
| Any count                       | Appears once per page; a strip and a tile never show the same number                                         |
| Same fact on a case             | Rendered once; stall reason lives in the status sentence, not also in a pill and a strip                     |

**Copy rules.** Industry words stay: SPA, LO, RM, panel bank, solicitor.
Everything else is a word the office already uses.

| Drop                                              | Write                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| LO Issued (table, legal column)                   | Loan Approved, everywhere                                                         |
| Purview, Boundaries, Lens, Switch Lens            | Delete                                                                            |
| Conveyancing & SPA Execution, Underwriting        | SPA signing, bank review                                                          |
| Booking-to-SPA Pipeline & Bottleneck Flow         | Who Holds Each Booking                                                            |
| Client / Buyer, cases on hand, conversions        | Buyer, bookings, signed                                                           |
| Filter Mode, Filtered View Active, Developer Desk | Delete; "Us" for the developer bucket                                             |
| Direct Case Import Ledger                         | Type Bookings In                                                                  |
| Chase List, Action Today, Suggested Next          | Today; delete the other two                                                       |
| Request Document · Payslip                        | Ask Buyer For Payslip                                                             |
| Chase Banker, Escalate To Legal, Review Release   | Call The Banker, Ask The Solicitor For A Date, Decide Whether To Release The Unit |
| Confidence 98%, probability bar                   | Jev is sure / fairly sure / not sure                                              |
| Partial Fit 100%, Direct Fit                      | May apply, Applies                                                                |
| Accuracy Score 0.180                              | One sentence on how close the forecast came                                       |
| Sim, Story (source badges)                        | Demo                                                                              |
| Jev's Answer May Be Out Of Date on every card     | Tooltip only                                                                      |
| DSR (tooltip)                                     | Monthly repayments compared with income                                           |

**Progressive-disclosure patterns.** Four, all already present somewhere in the
app: a form behind a verb button that expands in place with `aria-expanded`;
"Show N more" for lists longer than nine; the side sheet for a case summary from
any list; a tooltip for explanation, never for an obligation or an action. A
fifth rule for new work: when two systems disagree, show the default and one
line for the alternative, never two blocks of equal weight.

## 6. Implementation Plan

**Phase 0, half a day, quick wins, no demo risk.** Merge the persona navigate
fix. Remove `PersonaDeskLens` from `BookingsPage.tsx` and
`BookingDetailPage.tsx`. Remove the row tint in `BookingsTable.tsx` and the
"(Your Desk)" rings in `CaseHeader.tsx`. Remove `JevTag`, the risk chip for Low
and Medium, and the stage line pills from `ChaseCard.tsx`. In
`BookingPipelineFlow.tsx` delete the Filter Mode sub-toggle, the Tip line, the
Filtered View badge, the Sparkles chip and the pulsing dot. Make Low Risk plain
text and Age plain when Waiting On is red in `BookingsTable.tsx`. Update
`BookingPipelineFlow.test.tsx`, which asserts on "Your Desk".

**Phase 1, two days, compliance and copy, low risk.** `DirectTableImport.tsx`
and `ProjectSettingsCard.tsx`: replace native controls, tooltips, non-token
radii and shadows, tints and row tinting. `RiskChip.tsx` emoji,
`AddMessageForm.tsx` toast, `EvidenceLog.tsx` source labels. `STAGE_LABELS` in
`StagePill.tsx` and the Legal column header. `NEXT_ACTION_LABELS` in `chase.ts`.
Page titles and strip copy. Fix the SPA bucket in `BookingsPage.tsx` so the
strip sums to Active. Pick one project name source for the ledger and Settings.
Label changes ripple into tests; run `bun run check` after each file.

**Phase 2, two to three days, the workflow, medium risk.** Collapse Record An
Update and Add Message behind buttons; fold Case History; reduce the Jev block
and playbook list. Single next-step block with the Jev variant line in
`ChaseCard.tsx` and `WaitingOn.tsx`. Persona presets for the owner filter in
`ChasePage.tsx` and the Waiting On filter in `BookingsPage.tsx`. "Mine" default
in `ChaseTasks.tsx`. Primary and More groups in `AppSidebar.tsx`. Record An
Update inside `CaseQuickView.tsx`, row click opens the quick view. Legal row
actions and the two-section queue. This phase touches demo steps 1 to 4, so walk
the six-step script in the PRD on production after each merge.

**Phase 3, after the pitch or only if phases 0 to 2 land by Wednesday.** Add
Bookings tabs, Settings reorder, forecast wording, "Live Bookings"
reconciliation, mobile stacking of the strip.

Phases 0 to 2 total about five days for one developer, which fits the week with
two days of slack for the demo walkthrough.

## 7. Leave Alone Before The Pitch

- **Forecast internals.** It is the judges' evidence page and its maths is the
  pitch. Copy only.
- **Routes.** `/chase` keeps its path; only labels change. Tests, breadcrumbs
  and bookmarks depend on it.
- **Jev extraction, Confirm, Dispute, Dismiss and the live message moment.**
  Demo steps 2 and 4 run through them and they work.
- **Ball-in-court rules, stall rules, task API, snapshot.** The fix for the
  two-engine problem is presentational: show one default, offer the other as a
  line. Do not rewrite the rules.
- **Reset Demo Data, Closed tab and Excel export, Add Booking dialog.** Working
  and low traffic.
- **Real per-persona masking.** Nothing masks today. Building it is a new
  feature with PDPA copy implications. Remove the claim instead.
- **DESIGN.md itself.** The system did not cause the overload; the new
  components stepped outside it. No token change is needed.
- **Sidebar hover mechanics, top bar, Ask panel, theme.** Stable and not part of
  the complaint.
- **Phone layout.** Users are on desktops; the judges will be too.
