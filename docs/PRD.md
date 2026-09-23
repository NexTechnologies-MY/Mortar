# Product Requirements: Mortar

Mortar is an internal operations tool for a Malaysian property developer that
tracks property unit bookings from initial deposit through loan approval to
signed Sale and Purchase Agreement (SPA). This document defines the functional
and non-functional requirements for the prototype, establishing exact acceptance
criteria, persona workflows, domain rules, and verification standards. All data
in this build is synthetic, grounding the platform's mechanisms in Malaysian
property regulations and empirical industry findings.

Contents:

1.  [Goals And Non-Goals](#goals-and-non-goals)
1.  [Personas And Jobs To Be Done](#personas-and-jobs-to-be-done)
1.  [User Stories Per Screen](#user-stories-per-screen)
1.  [Functional Requirements](#functional-requirements)
1.  [Non-Functional Requirements](#non-functional-requirements)
1.  [Demo Script As Acceptance](#demo-script-as-acceptance)
1.  [Metrics](#metrics)
1.  [Assumptions And Constraints](#assumptions-and-constraints)
1.  [Out Of Scope](#out-of-scope)
1.  [Open Questions](#open-questions)
1.  [See Also](#see-also)
1.  [Sources](#sources)

## Goals And Non-Goals

Mortar unifies property unit booking operations across sales administration,
loan administration, and legal. The primary goal is closing the visibility gap
between booking deposit collection and SPA signing, transforming stalled cases
into an actionable daily follow-up queue.

A second goal is introducing structured artificial intelligence assistance
without operational risk. Mortar employs TypeSafe Jev for typed message
classification, document extraction, and playbook matching while reserving all
case state transitions for verified human confirmation.

Finally, the platform replaces speculative booking-face-value projections with a
statistical, stage-weighted 30-day SPA conversion forecast grounded in
historical conversion rates, Wilson score confidence intervals, and Monte Carlo
simulation bounds.

| Category    | In-Scope Prototype Goal                                                         | Out-Of-Scope Non-Goal                                                         |
| ----------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Operations  | Unified ledger tracking bookings across separate sales, loan, and legal tracks  | Enterprise CRM replacement, lead scoring, or marketing campaign management    |
| Bottlenecks | Deterministic stall rules surfacing blocked bookings and suggested next actions | Unsupervised automated chasing or autonomous outreach to external parties     |
| AI Decision | Structured message extraction with explicit human review and dispute workflows  | Unsupervised case mutation, autonomous loan approval, or unit release         |
| Financing   | Advisory financing-risk flags prompting early follow-up without gating sales    | Stricter upstream buyer pre-qualification rules that restrict launch momentum |
| Knowledge   | Searchable staff guidance using MiniSearch and Jev semantic fit scoring         | Generic conversational chatbots or ungrounded generative prose assistants     |
| Forecasting | Stage-weighted 30-day conversion forecast with uncertainty intervals            | Booking-face-value cash projection or accounting ledger reconciliation        |
| Resilience  | Precomputed Jev answers so the demo survives a Jev outage                       | High-availability multi-region cluster deployment or distributed messaging    |
| Data        | Fully synthetic data describing no real person, so no personal data is held     | Direct access to real buyer documents, live CRM databases, or banking APIs    |

**Core Objective:** give operational staff a single source of truth for booking
progress, so signings land inside the 30-day horizon rather than languishing for
weeks off the market.

**Human In The Loop:** ensure every AI suggestion remains a proposal until
confirmed by an authorized staff member, preserving accountability across all
departments.

**Honest Accounting:** enforce the fundamental domain rule that a booking is
never counted as cash at face value, protecting financial planning from
unrealized revenue.

## Personas And Jobs To Be Done

Mortar serves three distinct internal operational personas within a Malaysian
property development firm. Each persona operates from a dedicated home screen
tailored to their daily responsibilities, while sharing the same underlying case
records.

| Persona     | Persona Staff | Home Route  | Primary Focus                                                                   |
| ----------- | ------------- | ----------- | ------------------------------------------------------------------------------- |
| Sales Admin | Nurul Aina    | `/chase`    | Daily stalled booking follow-ups, buyer communication, and task execution       |
| Loan Admin  | Tan Mei Ling  | `/bookings` | Multi-bank application tracking, document completeness, and banker coordination |
| Legal Admin | Arvind Raj    | `/legal`    | SPA execution: what sits between an approved loan and a signed agreement        |

### Sales Admin

**Profile:** Nurul Aina manages booking intake, coordinates with purchasers and
sales agents, tracks outstanding deposits, and ensures documentation progresses
toward SPA execution.

**Job To Be Done 1 (Stall Resolution):** When a booking stalls or sits idle, I
want to see the exact blocker, responsible party, and suggested next action on
my daily chase list, so that I can unblock the buyer before the booking lapses
or the unit sits off the market.

**Job To Be Done 2 (Message Intake):** When a buyer or sales agent sends an
update via WhatsApp or email in English, Malay, or Manglish, I want Mortar to
extract the structured event and allow me to confirm it with one click, so that
the case timeline reflects reality without tedious manual data entry.

### Loan Admin

**Profile:** Tan Mei Ling liaises with panel banks, monitors credit assessment
progress, collects supporting income documentation, and manages loan
documentation through Letter of Offer issuance.

**Job To Be Done 1 (Application Tracking):** When multiple loan applications are
submitted across panel banks, I want to track each bank's progress and
outstanding documents independently, so that one rejection does not kill the
deal and slow bankers are flagged after nine working days.

**Job To Be Done 2 (Guidance Retrieval):** When income eligibility or valuation
shortfalls occur, I want to find approved procedural playbooks with actionable
limits, so that I can guide the buyer through second-bank submissions or top-up
arrangements.

### Legal Admin

**Profile:** Arvind Raj runs the SPA execution stretch. Once a loan is approved
he is accountable for getting the agreement scheduled, executed and stamped, and
he works across a panel of external law firms he does not manage directly.

**Job To Be Done 1 (Seeing What Has Stopped):** When a loan has been approved
but no SPA has been signed, I want the elapsed time on that case and the firm
holding it, so that a case cannot sit quietly past the point where the booking
was worth holding.

**Job To Be Done 2 (Closing Out Appointments):** When an SPA appointment has
been put on the log and no signing has followed it, I want that gap surfaced as
its own condition, so that a booked appointment is not mistaken for a completed
one.

## User Stories Per Screen

### Chase Queue (`/chase`)

- **US-1 (View Stalled Bookings):** As a Sales Admin, I want to view all stalled
  live bookings ordered by urgency and staleness, displaying stall reasons,
  financing-risk chips, and Jev-suggested next actions, so that I know who to
  chase today.
- **US-2 (Suggest Next Action And Create Task):** As a Sales Admin, I want to
  accept Jev's suggested next action or request a live suggestion, and create an
  assigned task with one click, so that follow-up responsibilities are recorded.
- **US-3 (Complete Follow-Up Tasks):** As an operations staff member, I want to
  view open tasks grouped by owner role and mark them complete inline, so that
  our team maintains operational momentum.
- **US-4 (Filter Chase List):** As a Sales Admin, I want to filter the chase
  list by financing risk level and owner role, so that I can prioritize
  high-risk or department-specific bottlenecks.

### Bookings Ledger (`/bookings`)

- **US-5 (Pipeline Overview):** As a Loan Admin, I want a dense tabular ledger
  of all bookings showing unit code, buyer name, booking age in days, stage,
  evidence recency (Fresh or Unknown), financing risk, buyer signals, and open
  tasks, so that I maintain complete pipeline visibility.
- **US-6 (Stalled Prioritization And Filtering):** As a Loan Admin, I want
  stalled bookings pinned to the top and filters for stage, risk, and unknown
  status, so that I can isolate problematic applications instantly.

### Case Detail (`/bookings/:id`)

- **US-7 (Dual-Track Timeline):** As a staff member, I want to view loan and
  legal progression timelines side by side, with stage pills reflecting
  confirmed events only, so that I can see the independent advancement of each
  track.
- **US-8 (Multi-Bank Application Tracker):** As a Loan Admin, I want to inspect
  one to three bank applications per booking with independent status indicators,
  so that I know exactly which banks are evaluating the buyer.
- **US-9 (Audit Evidence Log):** As an administrator, I want to view a
  chronological log of all case events showing when occurred, when recorded,
  reported by, verified by, and evidence status, so that every record is
  auditable.
- **US-10 (Review Proposed Updates):** As a staff member, I want to inspect
  incoming messages with Jev proposals (event kind, document, owner,
  probability, confidence, Needs Review) and confirm, dispute, or dismiss them,
  so that no unverified update modifies case state.
- **US-11 (Live Message Intake):** As a Sales Admin, I want to paste a new buyer
  message in Malay, English, or Manglish and receive a structured Jev proposal
  in under three seconds, so that ad-hoc communications update the system
  immediately.
- **US-12 (Playbook Knowledge Retrieval):** As a staff member, I want to search
  approved procedural playbooks ranked by keyword relevance and Jev semantic
  fit, so that I can apply reviewed organizational guidance to the case.
- **US-13 (Buyer Signals Evaluation):** As a Sales Admin, I want to view
  Jev-scored buyer responsiveness and hesitation indicators derived from message
  patterns, so that I can gauge buyer commitment.

### Forecast (`/forecast`)

- **US-14 (Risk-Weighted SPA Forecast):** As a user on any desk, I want to view
  projected SPA signings within 30 days of booking, with an expected figure,
  10th to 90th percentile simulation range, and live count, so that cash
  projections reflect realistic conversion.
- **US-15 (Conversion Rates With Intervals):** As a user on any desk, I want to
  inspect stage conversion rates with resolved sample sizes and Wilson 95%
  confidence intervals, so that sample uncertainty is transparent.
- **US-16 (Historical Backtesting):** As a user on any desk, I want to inspect a
  backtest cut at reference date minus 30 days showing predicted versus observed
  signings, Brier score, and calibration table, so that model performance is
  verified.
- **US-17 (Assumptions Transparency):** As a user on any desk, I want an
  assumptions panel detailing every simulation parameter with its value, unit,
  source tag, and reference, so that all baseline figures are auditable.
- **US-18 (Client-Side Seed Variance):** As a user on any desk, I want a "Try
  Another Seed" action that regenerates bookings in-browser to observe outcome
  spread without modifying the shared database.

### Legal (`/legal`)

- **US-24 (SPA Execution Queue):** As a Legal Admin, I want every booking with
  an approved loan and no signed SPA, ordered by how long it has waited, so that
  the oldest case is the first thing I see rather than something I have to go
  looking for.
- **US-25 (Scheduled Versus Unscheduled):** As a Legal Admin, I want to tell a
  case with no SPA appointment on the log apart from one whose appointment was
  recorded and never signed, so that I chase the right party.
- **US-26 (Panel Load):** As a Legal Admin, I want the count, median wait and
  value sitting with each panel firm, so that I can see where the queue is
  concentrated without inferring firm performance the data cannot support.

### Settings And Administration (`/settings`)

- **US-19 (Inspect Simulation Metadata):** As an operator, I want to view the
  active simulation seed, reference date, last reset timestamp, and table record
  counts, so that system state is verified.
- **US-20 (Reset Demo Data):** As a demonstrator, I want a button behind a
  confirmation dialog that restores the canonical demo dataset with a 30-second
  cooldown, so that the prototype can be reset repeatedly.
- **US-21 (Health Monitoring):** As an operator, I want to inspect database and
  TypeSafe Jev service connectivity status reported from `/api/health`.

### Intake And Shell (`/import`, Site Shell)

- **US-22 (Spreadsheet Intake):** As an administrator, I want a drag-and-drop
  zone accepting XLSX and CSV booking sheets with row parsing and validation, so
  that existing team spreadsheets can be ingested.
- **US-23 (Persona Switching And App Shell):** As a user, I want a persistent
  top-bar persona switcher, role-based redirection from `/app`, simulated data
  badge, and responsive navigation across light and dark modes.

## Functional Requirements

### FR-1: Canonical Simulation Dataset Generation

The system must generate a deterministic, synthetic property booking dataset
using a seeded pseudo-random number generator (`sfc32` or `mulberry32`).

- **AC-1.1:** The generator must accept `DEFAULT_SEED` (`20260918`),
  `REFERENCE_DATE` (`2026-09-18`), and a booking count of 140.
- **AC-1.2:** The output must contain exactly 140 generated bookings (`BK-0001`
  to `BK-0140`) plus eight pre-written story fixture bookings (`BK-9001` to
  `BK-9008`), yielding 148 total bookings.
- **AC-1.3:** Booking dates must be distributed across the 120 calendar days
  preceding the reference date. No event shall have a timestamp after the
  reference date.
- **AC-1.4:** Unit prices must range between RM 350,000 and RM 900,000 within a
  single fictional development project.
- **AC-1.5:** Stage transitions must be generated via Monte Carlo simulation
  across separate sales, loan, and legal tracks. Exactly one `booked` event must
  exist per booking.
- **AC-1.6:** Each booking must feature one to three bank applications. Per-bank
  approval probability must default to 0.62 (calibrated between the REHDA 2H2025
  survey band of 55% to 69% and the historical 74% approval rate).
- **AC-1.7:** Complete document bank assessments must take 2 to 9 working days;
  rejections must take 1 to 2 working days (Association of Banks in Malaysia,
  Oct 2017).
- **AC-1.8:** Approximately 35% of submissions must initiate with a document
  missing, triggering a `documents_requested` and `documents_received` loop.
- **AC-1.9:** The generator must calibrate so approximately 50% of resolved
  bookings convert to signed SPAs within 30 days of booking.
- **AC-1.10:** All names must be synthetic Malay, Chinese, and Indian names. All
  ICs (`000000-00-0001` format) and phone numbers (`+60 00-000 0001` format)
  must be obviously fake.
- **AC-1.11:** The system must export `PERSONA_STAFF` defining Sales Admin Nurul
  Aina (`sales_admin`), Loan Admin Tan Mei Ling (`loan_admin`), and Legal Admin
  Arvind Raj (`legal`).

### FR-2: Case Summarization And Stall Detection

The system must derive operational case summaries from the confirmed event log
without storing transient state in database tables.

- **AC-2.1:** A booking's current pipeline stage must derive strictly from
  confirmed events. Provisional, disputed, or superseded events must never
  advance case stage.
- **AC-2.2:** Funnel stages must include `booked`, `loan_applied`, `lo_issued`,
  `spa_signed`, `loan_agreement`, `disbursed`, and exit states `cancelled` and
  `lapsed`.
- **AC-2.3:** Loan and legal progress must be maintained as independent tracks
  that can overlap in time.
- **AC-2.4:** Outstanding documents must be computed as document kinds requested
  and not yet received (`payslip`, `epf_statement`, `bank_statement`, `ic_copy`,
  `employment_letter`, `tax_form`).
- **AC-2.5:** A live booking with no confirmed event for 10 or more calendar
  days must be assigned `unknown: true`. The UI must display this booking as
  unknown, never as progressing or failed.
- **AC-2.6:** A booking must be flagged as stalled with specific Title Case
  reasons when any of the following conditions hold:
  1. No confirmed evidence for 7 or more calendar days.
  2. A required document outstanding for 5 or more calendar days.
  3. A bank application undecided after 9 working days.
  4. An unresolved disputed event.
  5. A loan approved 10 or more calendar days ago with no SPA appointment on the
     log.
  6. An SPA appointment recorded 14 or more calendar days ago with no signing
     against it.
- **AC-2.7:** Stall detection must apply to every booking that is unsigned and
  not exited, with no upper bound on booking age. The 30-day horizon governs
  what the forecast counts, not what the desks are shown; gating stall reasons
  on it hides the longest-running failures, which are the ones worth chasing.
  Any derived answer that reads stall reasons must apply the same rule.

### FR-3: Deterministic Financing Risk Calculation

The system must calculate an advisory financing-risk level and debt service
ratio for each booking using deterministic financial rules.

- **AC-3.1:** Margin of financing must cap at 90% for buyers with 0 or 1 prior
  properties (industry norm), and 70% for buyers with 2 or more prior properties
  (Bank Negara Malaysia, Nov 2010). Loan amount = `priceRm * cap`.
- **AC-3.2:** Monthly instalment must be calculated using the standard annuity
  formula at 4.2% annual interest (assumption) over tenure equal to
  `min(35, 70 - buyer.age)` years. The 35-year ceiling follows Bank Negara
  Malaysia (Jul 2013); the age-70 bound is an assumption.
- **AC-3.3:** Debt service ratio (DSR) must equal
  `(buyer.monthlyCommitmentsRm + instalmentRm) / buyer.grossMonthlyIncomeRm`.
- **AC-3.4:** The maximum allowable DSR cap must be 40% of gross income (ABM
  2017).
- **AC-3.5:** Risk level must evaluate to `high` if DSR exceeds 40%; `medium` if
  DSR is within 5 percentage points of the cap (35% to 40%) or while an income
  document is outstanding; `low` otherwise.
- **AC-3.6:** The system must return an array of explanatory strings detailing
  margin cap, tenure, instalment, and DSR breach reasons.

### FR-4: Evidence Log And Multi-Party Event Verification

The system must record all case events in a timestamped, auditable log and
provide a human verification workflow.

- **AC-4.1:** Every event must record `id`, `bookingId`, `applicationId`,
  `track`, `kind`, `occurredAt`, `recordedAt`, `reportedBy`, `verifiedBy`,
  `status` (`confirmed`, `provisional`, `disputed`, `superseded`), `source`
  (`generator`, `story`, `staff`, `jev`), `messageId`, `document`, and `note`.
- **AC-4.2:** Direct staff event submissions (`POST /api/events`) must be saved
  with `status: 'confirmed'`, `verifiedBy` set to the reporting user, and
  `source: 'staff'`.
- **AC-4.3:** Review of provisional events (`POST /api/events/:id/review`) must
  accept decisions `confirm`, `dispute`, or `dismiss`:
  - `confirm`: sets `status: 'confirmed'` and `verifiedBy` to the reviewer.
  - `dispute`: sets `status: 'disputed'`.
  - `dismiss`: sets `status: 'superseded'`.
- **AC-4.4:** Reviewer names must be populated from `PERSONA_STAFF` based on the
  active persona.

### FR-5: Chase Queue And Task Management

The system must present stalled live bookings in an actionable queue and support
task assignment and completion.

- **AC-5.1:** The chase list (`/chase`) must query live stalled bookings,
  displaying stall reasons, financing-risk chip, and cached Jev next action.
- **AC-5.2:** Clicking "Suggest Next Action" must trigger
  `POST /api/bookings/:id/next-action` live-first.
- **AC-5.3:** The user must be able to create a task via `POST /api/tasks`
  specifying `bookingId`, `action`, `title`, `ownerRole`, `ownerName`, `dueOn`,
  and `origin`.
- **AC-5.4:** Open tasks must be displayed grouped by owner role with due date
  status (`Overdue`, `Due today`, `Upcoming`).
- **AC-5.5:** Marking a task complete via `PATCH /api/tasks/:id` must update
  status to `done` and timestamp `completedAt`.
- **AC-5.6:** The chase view must provide functional filters for risk level and
  owner role.

### FR-6: TypeSafe Jev Structured Message Extraction

The system must evaluate case communications using TypeSafe Jev structured
primitives without free-form text generation.

- **AC-6.1:** Ingesting a message (`POST /api/messages`) or re-extracting
  (`POST /api/messages/:id/extract`) must execute a single fan-out request to
  TypeSafe Jev (`jev-latest`).
- **AC-6.2:** The request must evaluate:
  - `event`: Choice over `ExtractedEvent` (10 options).
  - `document`: Choice over `DocumentKind` plus `none`.
  - `owner`: Choice over `OwnerRole` plus `none`.
  - `withdrawalRisk`: Noul (probability 0.0 to 1.0).
  - `needsAction`: Noul (probability 0.0 to 1.0).
- **AC-6.3:** Every response must include `JevMeta`
  (`source: 'live' | 'cache' | 'unavailable'`, `stale: boolean`,
  `latencyMs: number | null`).
- **AC-6.4:** If confidence is below 0.6 (`JEV_REVIEW_THRESHOLD`), the UI must
  prominently display a "Needs Review" badge.
- **AC-6.5:** `proposalFromExtraction` must map the extraction to a provisional
  case event with `source: 'jev'`, `reportedBy: 'Jev'`, `occurredAt` matching
  message time, and note detailing extraction probability (e.g. "94%
  Probability"). For `no_update`, it must return `null`.

### FR-7: Next Action, Playbook Fit, And Buyer Signals Scoring

The system must provide structured scoring for operational guidance, playbook
retrieval, and buyer sentiment.

- **AC-7.1:** `POST /api/bookings/:id/next-action` must evaluate case summary,
  recent messages, and open tasks, returning Choice over `NextAction`, Choice
  over `OwnerRole`, and Score over `urgency` (0 = within a week, 1 = this week,
  2 = today).
- **AC-7.2:** Playbook search (`GET /api/bookings/:id/playbooks`) must index
  playbooks using MiniSearch across title, situation, action, and tags (with
  Malay/Manglish synonyms boosted), then score Jev `fit` (0 = does not apply, 1
  = partly applies, 2 = directly applies).
- **AC-7.3:** Buyer signals (`GET /api/bookings/:id/signals`) must score buyer
  messages for `responsiveness` (0 = unresponsive, 1 = slow, 2 = prompt) and
  `hesitation` (0 = committed, 1 = some doubts, 2 = strong doubts).
- **AC-7.4:** All GET routes must be cache-first, serving cached answers
  instantly without blocking page render.

### FR-8: Statistical Conversion Forecasting

The system must forecast expected 30-day SPA signings using historical stage
transition frequencies.

- **AC-8.1:** Live bookings must be defined as bookings made fewer than 30
  calendar days before `asOf` that are not signed, cancelled, or lapsed.
  Resolved bookings must be those signed, cancelled, lapsed, or 30+ days old.
- **AC-8.2:** A live booking's signing probability must equal the proportion of
  resolved bookings that reached its stage and signed within 30 days of booking,
  grouped by stage and age bucket (0 to 9, 10 to 19, 20 to 29 days).
- **AC-8.3:** If a stage-age group contains fewer than 8 resolved cases, the
  system must fall back to the stage rate; if that contains fewer than 8 cases,
  it must fall back to the overall dataset conversion rate.
- **AC-8.4:** The system must calculate Wilson 95% binomial confidence intervals
  for all stage conversion rates.
- **AC-8.5:** Expected signings must equal the sum of individual live booking
  probabilities.
- **AC-8.6:** The forecast range must represent the 10th to 90th percentiles of
  2,000 seeded Monte Carlo simulation draws.

### FR-9: Historical Forecast Backtesting

The system must evaluate model reliability through historical cut backtesting.

- **AC-9.1:** The backtest must cut the event log at `REFERENCE_DATE - 30 days`
  (`2026-08-19`), using strictly events recorded on or before that date.
- **AC-9.2:** The system must forecast outcomes for bookings live at the cutoff
  date, then observe actual outcomes from the complete event log.
- **AC-9.3:** The backtest must output overall predicted count, observed count,
  Brier score, and a four-bucket calibration table comparing predicted versus
  observed conversion rates.
- **AC-9.4:** The UI must display the mandatory caption: "A Backtest On
  Simulated Data Proves The Method, Not The Business".

### FR-10: Transparent Assumptions And Browser Re-Simulation

The system must expose all simulation parameters and enable client-side variance
testing.

- **AC-10.1:** The `/forecast` assumptions panel must list every parameter in
  `DEFAULT_ASSUMPTIONS` showing label, value, unit, source tag (`official`,
  `industry`, `anecdotal`, `survey`, `assumption`), and source reference.
- **AC-10.2:** The panel must carry the caption: "Placeholder To Calibrate On
  Company Data".
- **AC-10.3:** Clicking "Try Another Seed" must regenerate 140 bookings in the
  browser with a randomized seed and recompute the forecast, displaying the new
  forecast beside the canonical baseline without altering database records.

### FR-11: Database Persistence And Atomic State Reset

The system must persist state in PostgreSQL and provide an atomic reset
endpoint.

- **AC-11.1:** The schema must define tables for `meta`, `bookings`,
  `loan_applications`, `messages`, `events`, `playbooks`, `tasks`, and
  `jev_answers`.
- **AC-11.2:** Bootstrapping without a seed in `meta` must automatically trigger
  a reset.
- **AC-11.3:** `POST /api/admin/reset` must execute within a single transaction:
  truncate all tables; insert canonical generated bookings, story fixtures,
  playbooks, and precomputed Jev cache entries; insert the provisional proposal
  for each fixture message with a cached extraction and no event carrying its
  `messageId`; and write `meta`.
- **AC-11.4:** The reset endpoint must enforce a 30-second cooldown, returning
  HTTP 429 if called within 30 seconds of a prior reset.

### FR-12: High-Availability Offline Jev Fallback

The system must maintain full operational functionality even when the external
AI service is unavailable.

- **AC-12.1:** The service must implement a 3-tier resolution strategy:
  1. Live Jev call (3,000ms timeout). On success, write cache and return
     `source: 'live'`.
  2. Cache fallback: on error or timeout, query `jev_answers` by exact input
     SHA-256 hash. If absent, retrieve latest subject record with `stale: true`
     and return `source: 'cache'`.
  3. Unavailable fallback: return neutral answers with `source: 'unavailable'`.
- **AC-12.2:** Cache-first GET routes must inspect the cache first and never
  wait on live API responses during initial page render.
- **AC-12.3:** The server must load precomputed entries from
  `server/fixtures/jev-cache.json` during reset.
- **AC-12.4:** The application must function completely without an API key
  configured.

### FR-13: Spreadsheet Intake And Validation

The system must support intake of operational spreadsheets.

**Status:** Built. The shipped `/import` flow goes beyond AC-13.1 to AC-13.3 in
two respects: an import can be undone from its confirmation screen, provided
none of its bookings has since taken an update, message, or task; and a date
column written month first is detected and parsed as month first across the
whole column, with the row review stating the switch.

- **AC-13.1:** The `/import` screen must provide a custom drag-and-drop zone
  accepting XLSX and CSV booking spreadsheets.
- **AC-13.2:** The parser must extract unit codes, buyer names, ICs, phone
  numbers, prices, and booking dates, reporting total rows parsed.
- **AC-13.3:** Parsing must occur entirely in the client without transmitting
  unverified files to third-party endpoints.

### FR-14: Persona Navigation And Design System Compliance

The system must enforce persona routing and adhere to visual design standards.

- **AC-14.1:** The active persona must persist in `localStorage` under key
  `mortar.persona`.
- **AC-14.2:** Navigating to `/app` must redirect to the persona's designated
  home (`/chase` for Sales Admin, `/bookings` for Loan Admin, `/legal` for Legal
  Admin). `/forecast` is the shared projection and is homed to no desk. A
  `mortar.persona` value of `finance`, the retired identifier, must resolve to
  `legal-admin` rather than falling back to the default.
- **AC-14.3:** `/settings` must state plainly that the data is simulated, with
  the seed and the reference date, and `/forecast` must keep its caption that a
  backtest on simulated data proves the method, not the business.
- **AC-14.4:** All UI elements must follow `docs/DESIGN.md`: monochrome ledger
  styling on a white ground, 6px corner radius, 1px hairlines, Geist and Geist
  Mono typefaces, six status tones with explicit words, zero emoji, and exactly
  10 Lucide icons.
- **AC-14.5:** All mutations must display a toast and trigger snapshot refresh.

### FR-16: Leakage Analysis And Recovery Sizing

The system must state where bookings are lost, in order of size, from the event
log rather than from opinion.

- **AC-16.1:** `/forecast` must rank cancelled and lapsed bookings by value
  lost, with units, value and share of total loss per cause, and must report the
  unit-days those bookings held inventory off the market.
- **AC-16.2:** Causes must be assigned in a stated root-cause order. A booking
  that took a rejection and then saw the buyer withdraw is counted against the
  rejection. The order is a judgement and must be visible on screen.
- **AC-16.3:** The system must size the recoverable share: bookings that died
  after a rejection with no second submission, multiplied by the rate at which
  resubmitted cases reached signing.
- **AC-16.4:** That rate must be measured over resolved cases only, and must be
  presented with its sample size and a Wilson 95% interval. The recoverable
  figure must never appear as a bare point estimate; the arithmetic producing it
  must be shown.
- **AC-16.5:** Live bookings sitting on a rejection with no second submission
  must be named individually and linked to their case files, so the estimate
  resolves into work rather than a headline.

### FR-15: SPA Execution Desk

The system must surface the stretch between loan approval and a signed SPA,
which is otherwise measured nowhere.

- **AC-15.1:** `/legal` must list every booking at stage `lo_issued`, ordered by
  days since loan approval descending, breaking ties on booking value. Each row
  must carry the booking, unit, buyer, panel firm, days since approval, the SPA
  appointment note where one exists, and the value.
- **AC-15.2:** Rows tripping a legal stall reason (AC-2.6 conditions 5 and 6)
  must be visually distinguished on the days-since-approval figure alone. No
  other column may carry a pill, per the Chip Economy rule in `docs/DESIGN.md`.
- **AC-15.3:** The page must report awaiting count, the number past a stall
  threshold, the longest wait in days, and the total value held.
- **AC-15.4:** Panel load must group the queue by `legalFirm` with count, median
  wait and value, and must state on the screen that it reports load rather than
  firm performance, because firms are assigned by a uniform draw in the seeded
  data and any difference between rows is the luck of the seed.
- **AC-15.5:** `CaseSummary` must carry `daysSinceLoIssued` and
  `daysSinceSpaSet`, both nullable, so the desk and the chase list read one
  derivation rather than two.

### FR-17: Waiting On Party And Next Move

The system must name who is holding up each open case, what they owe, and the
next move, on the bookings ledger and on the case page alike.

- **AC-17.1:** Every open case must record the party currently waited on (buyer,
  bank, solicitor, or developer), what that party owes, and the next move
  together with the desk that makes it.
- **AC-17.2:** `/bookings` must show a Waiting On column in place of the retired
  Last Update column, displaying the waiting party in plain text while the case
  is moving and a red pill showing days since the last update once the case
  stalls; a Waiting On filter must narrow the table to cases waiting on one
  chosen party.
- **AC-17.3:** Clicking a Waiting On cell must open a quick view beside the
  table showing the five milestones with the stuck one marked, the blocker, the
  next move, and a one-click Add Task action, without losing the table's active
  filters or page.
- **AC-17.4:** `/bookings/:id` must display the same Waiting On and Next Move
  block under the case header.

## Non-Functional Requirements

### Performance

- **NFR-1 (Initial Load Time):** The application shell and initial snapshot
  payload (`GET /api/snapshot`) must render the full case ledger promptly on a
  standard broadband connection. Page loads must never wait on a live Jev call.
- **NFR-2 (Jev SLA And Timeout):** Live Jev API requests must complete within
  3,000ms. Calls exceeding 3,000ms must abort and fall back to cache
  immediately.
- **NFR-3 (Client Derivation Latency):** Derivation of 148 case summaries and
  forecast computation must execute fast enough to keep page transitions
  responsive on the client.

### Reliability And Resilience

- **NFR-4 (Zero Demo Failure):** The precomputed offline cache
  (`server/fixtures/jev-cache.json`) must cover an extraction for every fixture
  message; signals, next action and default-query playbooks for each story
  booking (`BK-9001` to `BK-9008`); and next actions for up to 25 stalled
  generated bookings, ensuring a seamless demonstration even during complete
  network disconnection.
- **NFR-5 (Database Reconnection):** The server must handle Neon serverless
  PostgreSQL cold starts (about a second after idle) gracefully without dropping
  requests.

### Data Integrity And Determinism

- **NFR-6 (PRNG Repeatability):** Executing
  `generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })`
  must yield the identical booking records, application assignments, and event
  sequences across all execution environments.
- **NFR-7 (Auditable Event Log):** Every event must keep when it occurred, when
  it was recorded, who reported it, and who verified it. Status modifications
  must record the acting reviewer so the log stays auditable.

### Security, Secrets, And Privacy

- **NFR-8 (Synthetic Data And PDPA):** All records must be fully synthetic:
  invented, rule-generated records describe no identifiable person, so the
  prototype holds no personal data under the Personal Data Protection Act. No
  real personal data, identity card numbers, or real company names may be
  committed or stored.
- **NFR-9 (Secret Isolation):** `DATABASE_URL` and `TYPESAFE_API_KEY` must
  remain server-side only. No client-side environment variable (`VITE_*`) may
  expose API keys.

### Accessibility And Design Standards

- **NFR-10 (WCAG AA Contrast):** All text elements must satisfy WCAG AA contrast
  (minimum 4.5:1 on background; muted text `#6B6B6B` achieves 5.33:1 on the
  white ground).
- **NFR-11 (Keyboard Accessibility):** All interactive components (menus, dialog
  modals, date picker calendars) must provide complete keyboard navigation and
  visible 2px focus rings (`--ring`).
- **NFR-12 (Motion Accessibility):** The interface must honor
  `prefers-reduced-motion: reduce` by disabling sliding animations and rendering
  static poster images in place of looping videos.

## Demo Script As Acceptance

The prototype build is accepted when the live deployed application executes the
following six-step pitch video script without error or manual intervention:

1.  **Sales Admin Opens `/chase`:**
    - The Sales Admin lands on `/chase`.
    - Stalled live bookings are listed with stall reasons, financing-risk chips,
      and Jev-suggested next actions.
    - Booking `BK-9001` appears at the top: Jev suggests requesting the buyer's
      missing payslip, owner Sales, due today.
    - Clicking the action button creates the task with one click.
2.  **Opens Case `BK-9001`:**
    - The user navigates to `/bookings/BK-9001`.
    - Loan and legal tracks are displayed side by side.
    - A Manglish banker message regarding the missing payslip displays Jev's
      extraction proposal: Documents Requested, Payslip, Loan Admin, with
      confidence score and probability.
    - The Sales Admin clicks Confirm. The evidence log updates immediately,
      displaying who reported and who verified the event.
3.  **Playbook Guidance:**
    - The user opens the playbooks panel on `BK-9001`.
    - The "Missing income documents" playbook ranks first by Jev fit score for
      this case.
4.  **The Live AI Moment:**
    - The Sales Admin pastes a new buyer message in Malay: "Salam, saya dah
      emailkan slip gaji 3 bulan terkini kepada banker semalam."
    - TypeSafe Jev processes the message live and returns the structured
      extraction in under three seconds: Documents Received, Payslip.
    - Once confirmed, the outstanding payslip requirement clears, and the
      booking's stall condition clears.
5.  **Legal Admin Opens `/forecast`:**
    - The user switches persona to Legal Admin and navigates to `/forecast`.
    - The headline card displays expected SPA signings within 30 days of
      booking, with 10th to 90th percentile range, stage conversion rates,
      resolved sample sizes (n), and Wilson 95% confidence intervals.
    - The backtest panel displays predicted versus observed signings, Brier
      score, and calibration table.
    - The assumptions panel lists all `DEFAULT_ASSUMPTIONS` with source tags.
    - Clicking "Try Another Seed" generates a new in-browser forecast,
      displaying the outcome spread beside the canonical baseline.
6.  **Settings Reset:**
    - The user opens `/settings` and clicks "Reset Demo Data".
    - A confirmation dialog appears; confirming resets the database to the
      canonical state with a toast notification.
    - The 30-second cooldown is enforced.

## Metrics

### Business Success Metric

The primary success measure for Mortar is one number that can be read within one
quarter:

**30-day verified SPA rate** = bookings that sign a verified SPA within 30 days
of booking, divided by all eligible bookings enrolled.

- **Horizon:** exactly 30 calendar days from initial booking deposit date. A
  booking signing on day 31 is recorded as a conversion miss.
- **Verification:** the milestone requires an executed agreement confirmed by
  the legal panel, not an informal verbal report.
- **Illustration, Not A Finding:** the concept's worked example assumes 40
  eligible stalled bookings whose 30-day conversion rises from 20% to 40%, which
  gives 40 x (40% - 20%) = 8 additional SPAs. Real figures replace these
  assumptions during the pilot.

### Secondary Operational Metrics

| Metric                   | Measurement Method                                                                | Target Objective                          |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------- |
| Stalled Booking Recovery | Count of stalled bookings transitioned to active stage following task completion  | Set from the pilot baseline               |
| Case Dwell In Unknown    | Average calendar days bookings remain in `unknown: true` status                   | Set from the pilot baseline               |
| Forecast Calibration     | Brier score comparing case probabilities against observed 30-day outcomes         | Reported, not targeted, on simulated data |
| AI Extraction Accuracy   | Proportion of Jev proposals confirmed by staff without modification or dispute    | Set from the pilot baseline               |
| Live Jev Latency         | End-to-end network roundtrip time for live message extraction                     | Under 3 seconds in the demo               |
| Fallback Cache Hit Rate  | Percentage of demo requests successfully served from cache during network latency | Every demo step has a cached answer       |

## Assumptions And Constraints

### Empirical Grounding Table

Every rate and threshold used across the simulation, financing-risk evaluation,
and stall detection is grounded in Malaysian statutory provisions or industry
benchmarks.

| Parameter                                    | Value                                            | Tag                | Source Authority                           |
| -------------------------------------------- | ------------------------------------------------ | ------------------ | ------------------------------------------ |
| Commercial bank decision                     | 2–9 working days; rejections 1–2 days            | Industry           | Association of Banks in Malaysia, Oct 2017 |
| Typical booking to SPA                       | 14–21 calendar days                              | Anecdotal          | Malaysian buyer guides                     |
| Documented booking to SPA                    | Approximately 64 calendar days                   | Official           | Federal Court, _PJD Regency_ (2021)        |
| Residential loans approved ÷ applied (value) | 42.1% (2024), 41.1% (2025), 38.9% (Jan–Jul 2026) | Official           | Bank Negara Malaysia, Tables 1.10 and 1.12 |
| Approval by number of applications           | Approximately 74%                                | Official           | Bank Negara Malaysia & ABM (2016–2017)     |
| Rejection rate (RM 500k–700k band)           | 31%–45%, average 38%                             | Industry           | REHDA Property Industry Survey 2H2025      |
| Developer launch take-up rate                | 21% (2H2025), 38% (1H2025)                       | Industry           | REHDA Property Industry Survey 2H2025      |
| Margin of financing cap                      | 70% from the third home; about 90% before it     | Official, Industry | Bank Negara Malaysia, Nov 2010; press      |
| Maximum loan tenure                          | 35 years; simulation also ends it by age 70      | Official           | Bank Negara Malaysia, Jul 2013             |
| Debt service ratio cap                       | Instalments <= 40% of gross income               | Industry           | Association of Banks in Malaysia, 2017     |
| Tenure age bound                             | Loan matures by buyer age 70                     | Assumption         | Assumptions panel                          |
| Missing document rate at intake              | Approximately 35% of submissions                 | Assumption         | Assumptions panel                          |
| Default per-application approval             | 0.62                                             | Assumption         | Between REHDA band (55–69%) and 74%        |
| Annual mortgage interest rate                | 4.2% per annum                                   | Assumption         | Assumptions panel                          |

### Statutory And Legal Constraints

- **Booking Fee Prohibition:** In Peninsular Malaysia, Regulation 11(2) of the
  Housing Development (Control and Licensing) Regulations 1989 (amended 2015)
  prohibits collecting any payment the contract of sale does not provide for.
  Fees are still collected in practice, usually 2 to 3%.
- **Late-Delivery Damages Clock:** The Federal Court held in _PJD Regency Sdn
  Bhd v Tribunal Tuntutan Pembeli Rumah_ (19 January 2021) that liquidated
  ascertained damages (LAD) for late delivery run from the date the booking fee
  is paid, not the SPA signing date. Unresolved stalled bookings directly
  increase developer legal liability.
- **Statutory Post-SPA Termination:** Under Schedule H Clause 5(3) (2002 text),
  a buyer who proves income ineligibility after SPA execution owes 1% of the
  purchase price, and the developer refunds the rest within 21 days.
- **Data Protection Mandates:** The Personal Data Protection (Amendment) Act
  2024 took effect in phases through 2025, adding breach notification to the
  Commissioner within 72 hours, a mandatory data protection officer, data
  portability, and a cross-border transfer test. PDPC guidelines issued in May
  2026 cover impact assessments, privacy by design, and automated
  decision-making; they will apply once the forecast scores real buyers. The
  prototype holds only synthetic data, so these duties are not triggered.

### Operational Constraints

- **Project Timeline:** Prototype build must be complete for pitch presentation
  on 20 September 2026.
- **Budgetary Boundary:** Zero budget for external software consultants, new CRM
  platform licensing, or vendor procurement.
- **Organizational Authority:** The project operates without authority over the
  sales director, the panel bankers, or the panel solicitors; the bankers and
  solicitors do not work for the developer.

## Out Of Scope

1.  **Direct Core ERP Integration:** Live synchronization with IFCA Property
    Plus, SAP, or Salesforce is excluded from the prototype. Intake operates via
    spreadsheet upload and database seeding.
2.  **Autonomous Communication:** The platform does not send automated WhatsApp
    messages, SMS notifications, or emails directly to purchasers, bankers, or
    solicitors.
3.  **Document OCR And Computer Vision:** Optical character recognition of
    scanned paper titles, payslips, or identity cards is deferred to roadmap
    development.
4.  **Automatic Credit Underwriting:** Mortar does not replace bank credit
    decisioning or approve loan eligibility.
5.  **Multi-Tenant Architecture:** The prototype runs as a dedicated deployment
    for a single property developer instance.
6.  **Real Personal Data:** Ingestion or processing of genuine purchaser records
    is strictly barred.

## Open Questions

1.  **IFCA Export Formats:** What standard export schemas (CSV, Excel) and
    reconciliation intervals will Chin Hin provide during operational phase 1?
2.  **Joint Purchaser Financials:** How should the deterministic financing-risk
    calculation evaluate joint borrowers (e.g. spouse co-signers, family
    guarantors) when evaluating combined debt service ratios?
3.  **Disputed Evidence Governance:** What internal escalation protocol should
    govern situations where Sales Admin and Loan Admin register conflicting
    evidence regarding buyer commitment?
4.  **Subsidiary Policy Variation:** How should developer-specific refund terms
    and administrative fee schedules be configured across different commercial
    operating entities?

## See Also

- [Product Concept (`PRODUCT.md`)](PRODUCT.md): business rationale, problem
  cost, persona day-in-the-life journeys, and 12-week pilot roadmap.
- [Technical Requirements (`TRD.md`)](TRD.md): architecture, component
  breakdown, schema definition, Jev integration, and deploy pipeline.
- [Design Specification (`DESIGN.md`)](DESIGN.md): visual system, design tokens,
  component specifications, and interaction states.
- [Company Brain Concept](research/company-brain/README.md): platform concept,
  open-source tools analysis, and pilot design.
- [Front-End Simulation](research/company-brain/simulation.md): simulation
  scope, seed values, and presentation principles.
- [Practitioner Survey Findings](research/practitioner-survey/README.md): survey
  evidence ranking loan rejection as the primary leakage cause (n = 5).
- [Problem Statement](source/problem-statement.md): the original Chin Hin
  challenge brief.
- [Project Overview](README.md): architecture, stack summary, and repository
  structure.

## Sources

### Industry And Statutory Sources

- Association of Banks in Malaysia. (2017). Commercial banks' housing loan
  applications processed on timely basis. Press Release, October 2017.
- Bank Negara Malaysia. (2010). Measures to promote a stable and sustainable
  property market. Press Release, November 2010.
- Bank Negara Malaysia. (2013). Circular setting the 35-year maximum loan
  tenure, July 2013.
- Bank Negara Malaysia. (2026). Monthly Statistical Bulletin, Tables 1.10 and
  1.12.
- Federal Court of Malaysia. (2021). _PJD Regency Sdn Bhd v Tribunal Tuntutan
  Pembeli Rumah & Another_, 19 January 2021.
- Housing Development (Control and Licensing) Regulations 1989, Regulation 11(2)
  (as amended in 2015).
- Housing Development (Control and Licensing) Regulations 2002, Schedule H.
- Real Estate and Housing Developers' Association (REHDA). (2026). Property
  Industry Survey 2H2025.
- Personal Data Protection Act 2010 (Act 709) and Personal Data Protection
  (Amendment) Act 2024.

### Statistical And Technical References

- Brown, L. D., Cai, T. T., & DasGupta, A. (2001). Interval estimation for a
  binomial proportion. _Statistical Science_, 16(2), 101–133.
- TypeSafe AI. (2026). Jev API Documentation: Choice, Score, and Noul
  Primitives. `https://docs.typesafe.ai/llms.txt`.
