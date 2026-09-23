# Technical Requirements Document: Mortar

Technical specification and implementation guide for the Mortar engineering
team. Mortar is an internal operations tool for Malaysian property developers to
track property unit bookings from initial deposit through loan approval to Sale
& Purchase Agreement (SPA) signing. It combines a shared event ledger,
statistical cash forecasting, and probabilistic intelligence via TypeSafe Jev.

Contents:

1.  [Architecture And Components](#architecture-and-components)
1.  [Repository Layout](#repository-layout)
1.  [Data Model And Schema](#data-model-and-schema)
1.  [API Reference](#api-reference)
1.  [Simulation Method](#simulation-method)
1.  [Forecast And Backtest Method](#forecast-and-backtest-method)
1.  [Financing-Risk Method](#financing-risk-method)
1.  [Jev Integration](#jev-integration)
1.  [Security, Secrets And Privacy](#security-secrets-and-privacy)
1.  [Deploy And CI](#deploy-and-ci)
1.  [Testing Strategy](#testing-strategy)
1.  [Technical Risks And Build Flags](#technical-risks-and-build-flags)
1.  [See Also](#see-also)
1.  [Sources](#sources)

## Architecture And Components

Mortar uses a lean three-tier architecture: a single-page React application in
the browser, a unified Bun HTTP API server, and a managed PostgreSQL database
hosted on Neon.

```text
Browser (React 19 SPA)               Bun Server (Cloud Run)             Neon PostgreSQL
┌─────────────────────────┐         ┌─────────────────────────┐         ┌───────────────────┐
│ SnapshotProvider        │         │ Bun.serve API           │         │ bookings          │
│ GET /api/snapshot ──────┼────────►│ map rows to contract ◄──┼────────►│ loan_applications │
│                         │         │                         │         │ events            │
│ @mortar/core            │         │ POST /api/* writes ─────┼────────►│ messages          │
│ (derives all views)     │         │                         │         │ tasks             │
│                         │         │ @mortar/jev ────────────┼──┐      │ playbooks         │
│                         │         │ (server-side client)    │  │      │ jev_answers, meta │
└─────────────────────────┘         └─────────────────────────┘  │      └───────────────────┘
                                                                 ▼
                                                        TypeSafe Jev Service
                                                        (model: jev-latest)
```

The system topology separates high-frequency client interactions from
asynchronous classification workflows:

- **Single HTTP Server:** One Bun process running on Google Cloud Run serves the
  compiled static assets (`frontend/dist`) with client-side SPA routing
  fallbacks, while handling all `/api/*` endpoints. This runtime replaces
  traditional reverse proxies such as Nginx.
- **Relational Storage:** Neon PostgreSQL holds relational state. The server
  connects through pooled connections via Bun's native SQL client. Local
  development targets the Neon `dev` branch, while production targets `main`.
- **Pure Core Library:** `@mortar/core` contains pure TypeScript logic (ES2020
  target, zero DOM or Node.js dependencies). It defines the domain contract
  types, seeded PRNG simulation, event log derivation rules, financial risk
  formulas, forecasting math, and fixture datasets. Both browser and server
  import it.
- **Server-Side Intelligence:** `@mortar/jev` wraps the TypeSafe SDK to run
  probabilistic classifications server-side. The TypeSafe API key is restricted
  to the server process and is never sent to the browser.
- **Client Snapshot Provider:** The React client loads the entire operational
  dataset via `GET /api/snapshot`, fetched lazily on the first `useSnapshot()`
  call so public pages never hit the API. The browser's `SnapshotProvider`
  retains this data, derives all views client-side using `@mortar/core`, sends
  mutations over REST, and refreshes the snapshot upon completion.
- **Fixed Reference Time:** Every view operates against a fixed reference date,
  `REFERENCE_DATE = '2026-09-18'`, representing "Today". Live mutations generate
  timestamps using `simNow(referenceDate, clock)`, preserving the wall-clock
  time in the Malaysian time zone (`+08:00`).
- **Caching Strategy:** Jev data reads are cache-first; mutation classifications
  are live-first. Client page transitions never block on external model
  invocations.

## Repository Layout

Mortar is structured as a Bun multi-package monorepo configured in
`package.json`. It isolates core domain logic from transport and presentation
layers.

| Directory        | Package / Workspace  | Responsibility                                                     |
| ---------------- | -------------------- | ------------------------------------------------------------------ |
| `packages/core/` | `@mortar/core`       | Contract types, Monte Carlo simulation, forecasting, and fixtures  |
| `packages/jev/`  | `@mortar/jev`        | Server-only TypeSafe Jev service client, questions, and fallbacks  |
| `server/`        | Workspace `server`   | Bun HTTP server, SQL schema, REST endpoints, and precompute script |
| `frontend/`      | Workspace `frontend` | React 19, Vite, Tailwind CSS 4, shadcn/ui components, and pages    |
| `docs/`          | Non-package          | Technical, product, and design system documentation                |

Key files within each package include:

- `packages/core/src/types.ts`: The binding TypeScript domain contract.
- `packages/core/src/sim.ts`: Deterministic dataset generator, case derivations,
  and Wilson-score forecasting algorithms.
- `packages/core/src/jev.ts`: Shared MiniSearch playbook search and extraction
  proposal mapping helpers.
- `packages/core/src/fixtures/`: Canonical story bookings (`stories.ts`) and
  reviewed knowledge articles (`playbooks.ts`).
- `server/src/index.ts`: Application bootstrap, static file serving, and route
  dispatching.
- `server/db/schema.sql`: PostgreSQL table definitions applied idempotently on
  server start.
- `server/fixtures/jev-cache.json`: Precomputed model responses for offline and
  resilient demo operation.
- `frontend/src/lib/data.tsx`: React context providing `useSnapshot()` and
  `useCases()`.

## Data Model And Schema

The PostgreSQL schema (`server/db/schema.sql`) mirrors the TypeScript interfaces
defined in `packages/core/src/types.ts`. Tables use `snake_case` naming while
TypeScript entities use `camelCase`.

```text
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│    bookings     │───────┤  loan_applications   │───────┤    messages          │
├─────────────────┤1     *├──────────────────────┤1     *├──────────────────────┤
│ id (PK)         │       │ id (PK)              │       │ id (PK)              │
│ project         │       │ booking_id (FK)      │       │ booking_id (FK)      │
│ unit            │       │ bank                 │       │ sender_role          │
│ price_rm        │       │ banker               │       │ sender_name          │
│ booking_date    │       └──────────────────────┘       │ language             │
│ buyer (JSONB)   │                                      │ sent_at              │
│ sales_owner     │                                      │ body                 │
│ loan_owner      │       ┌──────────────────────┐       │ origin               │
│ legal_firm      │       │        events        │       └──────────────────────┘
└─────────────────┘       ├──────────────────────┤                  │
         │1               │ id (PK)              │                  │ 1
         │                │ booking_id (FK)      │                  │
         │*               │ application_id (FK)  │                  ▼
┌─────────────────┐       │ track                │       ┌──────────────────────┐
│     tasks       │       │ kind                 │       │    jev_answers       │
├─────────────────┤       │ occurred_at          │       ├──────────────────────┤
│ id (PK)         │       │ recorded_at          │       │ id (BIGINT PK)       │
│ booking_id (FK) │       │ reported_by          │       │ kind                 │
│ action          │       │ verified_by          │       │ subject_id           │
│ title           │       │ status               │       │ input_hash           │
│ owner_role      │       │ source               │       │ answer (JSONB)       │
│ owner_name      │       │ message_id (FK) ─────┼───────┤ source               │
│ due_on          │       │ document             │       │ latency_ms           │
│ status          │       │ note                 │       │ created_at           │
│ origin          │       └──────────────────────┘       └──────────────────────┘
│ created_at      │
│ completed_at    │
└─────────────────┘
```

### Table Definitions

The schema establishes relational integrity while allowing flexible document
storage for nested domain entities:

- `meta`: Key-value store (`key text primary key, value jsonb not null`) holding
  simulation parameters (`seed`, `referenceDate`, `resetAt`, `resetAtWall`).
  `resetAt` is sim time; `resetAtWall` is the real wall-clock timestamp of the
  last reset, and is what the 30-second reset cooldown reads, since sim time's
  time-of-day wraps to `00:00` at midnight and cannot time a cooldown.
- `bookings`: Core booking records (`id text primary key`, `project`, `unit`,
  `price_rm integer`, `booking_date date`, `buyer jsonb`, `sales_owner`,
  `loan_owner`, `legal_firm`). The nested `buyer` JSONB object stores contact
  details, financial metrics, and property ownership counts.
- `loan_applications`: Bank loan filings associated with a booking
  (`id text primary key`,
  `booking_id text references bookings(id) on delete cascade`, `bank`,
  `banker`). An application's status is never stored as an enum column; it is
  derived dynamically from confirmed events.
- `messages`: Communication transcripts from buyers, bankers, or solicitors
  (`id text primary key`, `booking_id`, `sender_role`, `sender_name`,
  `language`, `sent_at timestamptz`, `body`, `origin`). Sender roles are
  restricted to `'buyer'`, `'banker'`, `'solicitor'`, and `'sales_agent'`.
- `events`: Auditable event log capturing case history (`id text primary key`,
  `booking_id`, `application_id`, `track`, `kind`, `occurred_at`, `recorded_at`,
  `reported_by`, `verified_by`, `status`, `source`, `message_id`, `document`,
  `note`, `seq bigint`). Indexed on `(booking_id, occurred_at)`, `message_id`,
  and `application_id`. `seq`, drawn from the `events_seq` sequence, numbers
  rows in storage order; every ordered read of the event log (case data, the
  snapshot, `eventsForBooking`) sorts on `occurred_at, seq`, so two events
  recorded for the same instant — a same-day update stamped noon, say — keep the
  order they were entered in rather than an arbitrary one.
- `event_reviews`: Append-only log of every staff review of a Jev proposal
  (`id bigint identity primary key`, `event_id text`, `from_status text`,
  `to_status text`, `reviewer text`, `at timestamptz`), indexed on
  `(event_id, at)`. Carries no foreign key to `events`, so the trail survives
  the event it reviewed and a reset from an older build can still truncate
  `events` without breaking `event_reviews`'s own schema.
- `playbooks`: Structured institutional guidance records (`id text primary key`,
  `title`, `situation`, `evidence`, `action`, `rationale`, `limits`, `outcome`,
  `author`, `reviewer`, `reviewed_on date`, `status`, `tags text[]`).
- `tasks`: Action items assigned to staff members (`id text primary key`,
  `booking_id`, `action`, `title`, `owner_role`, `owner_name`, `due_on date`,
  `status`, `origin`, `created_at`, `completed_at`).
- `jev_answers`: Historical store of model evaluations
  (`id bigint generated always as identity primary key`, `kind`, `subject_id`,
  `input_hash`, `answer jsonb`, `source`, `latency_ms`, `created_at`). Indexed
  on `(kind, subject_id, created_at desc)` to allow rapid cache resolution.
- `imports`: One row per spreadsheet import (`id text primary key`, `source`,
  `reported_by`, `created_at`, `booking_ids text[]`, `undone_at timestamptz`,
  `undone_by text`, `removed jsonb`), so a batch can be undone as a whole.
  `undone_at`/`undone_by` stamp who undid an import and when; the row itself is
  never deleted, so every removal leaves a trace (`docs/RETENTION.md`).
  `removed` holds the undo's own snapshot of what it took out: each removed
  booking's id, unit, project, buyer name and price — never its IC or phone,
  since the booking row itself is gone once the undo commits.
- Indexes added for query paths that did not have one: `messages(booking_id)`,
  `tasks(booking_id)`, and `loan_applications(booking_id)`, alongside the
  `events(message_id)` and `events(application_id)` indexes noted above.

### Event Model And Evidence Lifecycle

Events represent facts observed on one of three parallel tracks: `'sales'`,
`'loan'`, or `'legal'`. Every event maintains an explicit verification state:

- `confirmed`: Verified by authorized personnel or emitted by default
  generation. Only confirmed events advance the booking funnel stage.
- `provisional`: Unverified proposal emitted by Jev message extraction.
  Provisional events appear on case pages for human confirmation.
- `disputed`: Contested by staff during review. Disputed events halt automatic
  progression and immediately trigger a case stall reason.
- `superseded`: Invalidated by subsequent evidence or explicitly dismissed
  during human review. Superseded events remain in the ledger for auditability
  but do not influence case state.

Only a Jev proposal still waiting (`provisional` or `disputed`) may be reviewed;
the server checks this under a row lock and refuses a second decision on an
already-settled proposal with `409`. Every review that succeeds — confirm,
dispute, or dismiss — is appended to `event_reviews` (`from_status`,
`to_status`, `reviewer`, `at`), so the case rules that gate a confirm (no update
on a closed booking, no second decision on a bank, no bank name missing where
one is required) apply to a reviewed proposal exactly as they do to an update
recorded by hand.

## API Reference

The Bun server exposes a RESTful JSON API. Request bodies and responses conform
directly to contract types. Validation is implemented with explicit type guards;
no third-party schema validation libraries are loaded.

| Method  | Path                            | Request Body                                                          | Response Body                                                            | Execution Pattern |
| ------- | ------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------- |
| `GET`   | `/api/health`                   | None                                                                  | `{ ok, db, jev, jevAnswers, jevLastError }`                              | Direct Check      |
| `GET`   | `/api/snapshot`                 | None                                                                  | `Snapshot`                                                               | Database Query    |
| `POST`  | `/api/messages`                 | `{ bookingId, senderRole, senderName, body }`                         | `{ message: Message, extraction: Extraction, event: CaseEvent \| null }` | Live-First Jev    |
| `POST`  | `/api/messages/:id/extract`     | None                                                                  | `{ extraction: Extraction, event: CaseEvent \| null }`                   | Live-First Jev    |
| `POST`  | `/api/events`                   | `{ bookingId, track, kind, document?, note?, reportedBy }`            | `CaseEvent`                                                              | Transaction Write |
| `POST`  | `/api/events/:id/review`        | `{ decision: 'confirm' \| 'dispute' \| 'dismiss', reviewer: string }` | `CaseEvent`                                                              | Transaction Write |
| `POST`  | `/api/bookings/:id/next-action` | None                                                                  | `NextActionSuggestion`                                                   | Live-First Jev    |
| `GET`   | `/api/bookings/:id/playbooks`   | Optional Query `q`                                                    | `PlaybookRanking`                                                        | Cache-First Jev   |
| `GET`   | `/api/bookings/:id/signals`     | None                                                                  | `BuyerSignals`                                                           | Cache-First Jev   |
| `POST`  | `/api/tasks`                    | `{ bookingId, action, title, ownerRole, ownerName, dueOn, origin }`   | `Task`                                                                   | Database Insert   |
| `PATCH` | `/api/tasks/:id`                | `{ status: 'open' \| 'done' \| 'cancelled' }`                         | `Task`                                                                   | Database Update   |
| `POST`  | `/api/admin/reset`              | None                                                                  | `SimulationMeta`                                                         | Database Truncate |

### Endpoint Details

- `GET /api/health`: `ok` and `db` report a live database ping (`false` on
  failure, alongside `jevAnswers: null`); `jev` is whether a live Jev service
  (TypeSafe key or proxy) is wired at all, not whether its last call succeeded;
  `jevLastError` carries the message from the last failed live Jev call when the
  proxy client is wired, or `null` otherwise. TypeSafe API-key mode does not
  track `jevLastError`, since doing so would need `@typesafe-ai/sdk` as a
  dependency of the server package rather than `@mortar/jev`'s.
- `GET /api/snapshot`: Assembles the full dataset required by the frontend
  workspace: `bookings`, `loan_applications`, `events`, `messages`, `playbooks`,
  `tasks`, and the latest `extractions`, `signals`, and `nextActions` from
  `jev_answers`.
- `POST /api/messages`: Persists an incoming message, computes an input hash,
  and invokes Jev extraction. If the extraction yields an event proposal, the
  system stages a provisional `CaseEvent` linked to the message.
- `POST /api/events/:id/review`: Updates event status. If `'confirm'`, the event
  becomes active and sets `verifiedBy`. If `'dismiss'`, status becomes
  `'superseded'`. If `'dispute'`, status becomes `'disputed'`, which flags the
  case as stalled until resolved. Only a pending proposal (`source: 'jev'`,
  status `'provisional'` or `'disputed'`) may be reviewed at all; the database
  checks and changes it under a row lock, appends the change to `event_reviews`,
  and the route returns `409` if the proposal had already settled (confirmed,
  dismissed, or replaced by a later re-read of its message) between the click
  and the request.
- `POST /api/admin/reset`: Clears all tables in a single transaction and
  re-seeds the database using
  `generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })`,
  story fixtures, playbooks, and precomputed Jev cache entries. The endpoint
  enforces a 30-second cooldown period between resets, returning HTTP 429 if
  called prematurely, timed against `meta.resetAtWall` (a real clock timestamp)
  rather than sim time, whose time of day wraps at midnight and cannot time a
  cooldown.

### Write Rules And Error Codes

Every write route re-checks the case rules from the current `CaseSummary`
server-side, so a stale screen or a hand-made request cannot skip them:

- `POST /api/events` refuses (`400`) a `booked` event, a `loan_submitted` event
  (that kind is only ever written by `POST /api/applications`), a bank decision
  or valuation shortfall with no `applicationId`, and a `loan_agreement_signed`
  or `disbursed` event with no confirmed `spa_signed` event yet on the booking.
  It refuses (`409`) any update on a booking already `cancelled` or `lapsed`,
  and a second decision (`loan_approved` or `loan_rejected`) on an application
  that already has one.
- `POST /api/applications` refuses (`409`) a second undecided application to the
  same bank (trimmed, case-insensitive) on the same booking, under a per-booking
  lock; a bank that already rejected an application may be tried again.
- `POST /api/events/:id/review` refuses (`409`) confirming a proposal that would
  itself break the case rules above (a closed booking, a settled decision, a
  bank decision with no application), and refuses (`409`) reviewing a proposal
  that is no longer pending.
- Request bodies are capped at 2MB (`Bun.serve`'s `maxRequestBodySize`); free
  text fields are capped and rejected with a plain `400` past their limit:
  message body at 5,000 characters, names/notes/bank/banker/task titles at 300,
  and the playbooks `q` query at 200.
- Any Postgres error the routes above do not already turn into a specific
  message is mapped by its SQLSTATE class: class `22` (data exception, e.g. a
  value Postgres itself rejects) becomes `400`; class `23` (integrity constraint
  violation — a foreign key, unique, or check failure) becomes `409`. Anything
  else is a generic `500`, with the real error always logged server-side, never
  shown to the browser.

## Simulation Method

The synthetic simulation generates realistic operational history for a property
development project without exposing real consumer information.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Generator Pipeline                              │
│                                                                        │
│  Seed: 20260918                                                        │
│  PRNG: sfc32 / mulberry32                                              │
│                                                                        │
│  140 Bookings (BK-0001..0140)       8 Story Bookings (BK-9001..9008)   │
│  [Price: RM 350k - RM 900k]         [Hand-crafted edge cases]          │
│  [DSR: 40% threshold]               [1-3 Bank applications]            │
│               │                                    │                   │
│               ▼                                    ▼                   │
│     Stage-Transition Monte Carlo        Coherent Chronological History │
│     (Dwell times: 2-9 bank days)        (Manglish, Malay, Chinese)     │
│               │                                    │                   │
│               └─────────────────┬──────────────────┘                   │
│                                 ▼                                      │
│                     Unified Event Ledger (events)                      │
│                     Strictly occurredAt <= 2026-09-18                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Generator Architecture

The dataset generator in `packages/core/src/sim.ts` (`generate`) runs a
stage-transition Monte Carlo model:

- **Population Scale:** Synthesizes 140 baseline bookings (`BK-0001` through
  `BK-0140`) distributed over the 120 days preceding `REFERENCE_DATE`. Merged
  with 8 hand-written story bookings (`BK-9001` through `BK-9008`), the baseline
  environment comprises 148 active or completed cases.
- **Project Context:** Configured for one fictional development project with
  realistic Malaysian unit numbering (e.g., `A-12-03`) and property pricing
  between RM 350,000 and RM 900,000.
- **Seeded Pseudo-Randomness:** Uses a deterministic PRNG algorithm (`sfc32` or
  `mulberry32`) seeded with `DEFAULT_SEED = 20260918`. `Math.random` is strictly
  forbidden, ensuring identical output across server and client executions.
- **Demographic Synthesis:** Hand-written lists of Malay, Chinese and Indian
  names, mapped to synthetic national identity numbers (`000000-00-0001`) and
  phone numbers (`+60 00-000 0001`). Institutions use fictional panel bank and
  legal firm identities.
- **Bank Application Chains:** Each booking spawns 1 to 3 bank applications.
  Per-application approval probability defaults to 0.62, bridging the REHDA
  survey band (55% to 69%) and historical official benchmarks (74%). Individual
  approval probability scales inversely with the buyer's debt service ratio.
- **Temporal Dwell Times:** Complete document credit assessments consume 2 to 9
  working days; outright rejections resolve in 1 to 2 days (Association of Banks
  in Malaysia, Oct 2017). Approximately 35% of initial submissions trigger a
  document deficit loop (`documents_requested` followed by
  `documents_received`).
- **Temporal Cutoff:** The generator emits no events past `REFERENCE_DATE`
  (`2026-09-18`). Approximately 50% of resolved bookings sign an SPA within 30
  days.

### Case Derivation Rules

The function `summarizeCases` derives operational state directly from the event
stream:

```typescript
export interface CaseSummary {
  bookingId: string
  stage: Stage
  unknown: boolean
  bookingAgeDays: number
  daysSinceEvidence: number
  applications: { id: string; bank: string; status: ApplicationStatus }[]
  outstandingDocuments: DocumentKind[]
  risk: FinancingRisk
  stallReasons: string[]
  openTasks: number
}
```

Rules governing summary derivation include:

- **Stage Derivation:** Determined solely by confirmed events. Provisional,
  disputed, or superseded events never advance case stage. Funnel progression is
  monotonic: `booked` &rarr; `loan_applied` &rarr; `lo_issued` &rarr;
  `spa_signed` &rarr; `loan_agreement` &rarr; `disbursed`.
- **Application State:** Derived from specific application event histories:
  `'submitted'`, `'documents_pending'`, `'approved'`, `'rejected'`, or
  `'withdrawn'`.
- **Outstanding Documents:** An item is marked outstanding when a
  `documents_requested` event lacks a subsequent confirmed `documents_received`
  event for the same document kind.
- **Unknown Status Flag:** A live booking is marked `unknown = true` when no
  confirmed evidence has been recorded for 10 or more calendar days. Unknown
  cases are rendered explicitly in amber to alert staff of silence.
- **Stall Detection:** A booking accumulates short Title Case stall reasons when
  operational thresholds are exceeded:
  - `"No Confirmed Evidence For 7+ Days"`: Case has gone cold.
  - `"Document Outstanding For 5+ Days"`: Buyer or agent has not supplied a
    requested file.
  - `"Application Undecided After 9 Working Days"`: Banker processing time
    exceeds the ABM standard SLA.
  - `"Unresolved Disputed Event"`: Staff have contested an update, requiring
    adjudication.

## Forecast And Backtest Method

Mortar's cash forecasting engine (`packages/core/src/sim.ts`) replaces
uncalibrated face-value booking sums with stage-weighted statistical
probabilities.

### Statistical Forecast

The forecast measures the probability of a booking executing an SPA within 30
calendar days of the initial booking deposit:

- **Population Filtering:**
  - _Live Bookings:_ Active bookings that have not reached an exit stage
    (`cancelled`, `lapsed`, or `spa_signed`) and were booked fewer than 30 days
    prior to the evaluation date (`asOf`).
  - _Resolved Bookings:_ Cases that reached `spa_signed`, `cancelled`, `lapsed`,
    or exceeded 30 days of tenure before `asOf`.
- **Stratified Stage Rates:** Historical conversion probability is calculated
  from resolved bookings that attained a given stage and signed within 30 days.
  Rates are grouped by stage and age cohort (0–9 days, 10–19 days, 20–29 days).
  If an age cohort contains fewer than 8 resolved cases, the calculation falls
  back to the aggregate stage rate, and subsequently to the global baseline
  rate.
- **Binomial Confidence Intervals:** To accurately reflect small-sample
  uncertainty, every stage conversion rate is bounded by a Wilson 95% score
  interval. Brown, Cai, and DasGupta (2001) recommend Wilson or Jeffreys
  intervals for samples of 40 or fewer, where the textbook Wald interval is
  unreliable.
- **Monte Carlo Aggregate Distribution:** Expected signings equal the arithmetic
  sum of individual booking probabilities. High and low uncertainty bands
  represent the 10th and 90th percentiles of 2,000 seeded random outcome draws.

### Backtest Validation

The engine validates its calibration through temporal backtesting (`backtest`):

- **Cutoff Point:** Splits historical logs at `REFERENCE_DATE` minus 30 days
  (2026-08-19).
- **Strict Data Isolation:** Calibrates conversion probabilities using only
  events recorded prior to the cutoff date. It generates predictions for all
  bookings that were live on the cutoff date.
- **Scoring Against Truth:** Predicted probabilities are matched against the
  actual outcomes observed in the subsequent 30-day window from the full log.
- **Verification Metrics:** Reports the overall Brier score (mean squared
  probability error) and a four-bucket calibration table comparing mean forecast
  probabilities against observed signing proportions.
- **Interface Caption:** In accordance with documentation guidelines, the
  backtest card displays the caption: _"A Backtest On Simulated Data Proves The
  Method, Not The Business."_

### Parameter Assumptions

Every rate and threshold the simulation uses lives in `DEFAULT_ASSUMPTIONS` with
a label, unit, tag and source, matching the seed table in
[Front-End Simulation](research/company-brain/simulation.md). Untagged numbers
are assumptions:

| Parameter                         | Baseline             | Unit  | Tag        | Source                       |
| --------------------------------- | -------------------- | ----- | ---------- | ---------------------------- |
| Bank approval per application     | 0.62                 | rate  | Assumption | Between REHDA 55–69% and 74% |
| Bank decision, complete documents | 2–9 (rejections 1–2) | days  | Industry   | ABM, Oct 2017                |
| Submissions missing a document    | ~0.35                | rate  | Assumption | Assumptions panel            |
| Debt service ratio ceiling        | 0.40                 | rate  | Industry   | ABM, 2017                    |
| Mortgage interest rate            | 0.042                | rate  | Assumption | Assumptions panel            |
| Maximum loan tenure               | 35                   | years | Official   | BNM, Jul 2013                |
| Tenure age bound                  | Matures by age 70    | years | Assumption | Assumptions panel            |
| Margin cap, third home onward     | 0.70                 | rate  | Official   | BNM, Nov 2010                |
| Margin cap, first and second home | ~0.90                | rate  | Industry   | Press                        |
| Conversion horizon                | 30                   | days  | Assumption | Assumptions panel            |

## Financing-Risk Method

The financing-risk algorithm (`financingRisk`) calculates an advisory credit
flag for each buyer. It operates as an early warning for sales administration
rather than a blocking gate on bookings.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Financing Risk Pipeline                         │
│                                                                        │
│   Buyer Profile                    Statutory Caps                      │
│   • Age                            • Max Tenure: min(35, 70 - age) yrs │
│   • Gross Monthly Income           • Margin Cap: 70% if homes >= 2,    │
│   • Monthly Commitments                          90% otherwise         │
│   • Properties Owned                                                   │
│                 │                                │                     │
│                 ▼                                ▼                     │
│   Loan Amount = Price * Margin                                         │
│   Monthly Instalment = Annuity(Loan, Rate = 4.2%, Tenure)             │
│                                                                        │
│   Debt Service Ratio (DSR) = (Commitments + Instalment) / Gross Income │
│                                                                        │
│                 ┌────────────────────────────────┐                     │
│                 ▼                                ▼                     │
│   DSR > 40%                  DSR in [35%, 40%]           DSR < 35%     │
│                              or Income Doc Missing       and Complete  │
│         │                                │                     │       │
│         ▼                                ▼                     ▼       │
│    [HIGH RISK]                    [MEDIUM RISK]           [LOW RISK]   │
└────────────────────────────────────────────────────────────────────────┘
```

### Risk Calculation Steps

1. **Margin Ceiling Determination:** Evaluates previous residential property
   holdings. Under Bank Negara Malaysia rules (November 2010), purchasers owning
   two or more properties are capped at a 70% margin of financing. First- and
   second-time buyers default to about 90% (industry norm).
2. **Loan Principal:** Multiplies purchase price by the applicable financing
   margin:

   ```text
   LoanPrincipal = priceRm * marginOfFinancing
   ```

3. **Amortization Tenure:** Caps tenure at the BNM maximum of 35 years (July
   2013), further bounded so the loan ends by age 70 (an assumption):

   ```text
   TenureYears = min(35, 70 - buyer.age)
   ```

4. **Monthly Instalment Calculation:** Applies standard annuity amortization at
   an assumed 4.2% annual interest rate, with monthly rate `r = 0.042 / 12` and
   `n = TenureYears * 12` monthly payments:

   ```text
   MonthlyInstalment = LoanPrincipal * (r * (1 + r)^n) / ((1 + r)^n - 1)
   ```

5. **Debt Service Ratio (DSR):** Compares total monthly liabilities against
   gross verified monthly earnings:

   ```text
   DSR = (buyer.monthlyCommitmentsRm + MonthlyInstalment) / buyer.grossMonthlyIncomeRm
   ```

### Risk Categorization

- **High Risk:** Assigned if DSR exceeds the 0.40 (40%) threshold established by
  bank guidelines.
- **Medium Risk:** Assigned if DSR is within 5 percentage points of the ceiling
  (0.35 to 0.40), or while any income document is currently outstanding.
- **Low Risk:** Assigned when DSR is below 0.35 and all income documentation has
  been verified.
- **Reasons Output:** Populates structured explanation strings (e.g.,
  `"DSR of 44.2% exceeds 40% guideline"`,
  `"Third home capped at 70% financing margin"`).

## Jev Integration

The `@mortar/jev` package interfaces with the TypeSafe Jev model (`jev-latest`).
Jev is a probabilistic reasoning engine: it reads text only and emits typed
answers with confidence scores and probability distributions. It never generates
text.

### Fan-Out Job Specifications

Every intelligence task uses the fan-out pattern, dispatching multiple typed
questions (Choice, Score, Noul) across a single state payload.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Jev Fan-Out Pipeline                            │
│                                                                        │
│   Input State Context                                                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Sender: Banker (Apex Bank) | Time: 2026-09-16 15:30:00         │   │
│   │ Body: "Still need latest 3 months slip gaji ah, current one    │   │
│   │  only got June. Can get from buyer asap?"                      │   │
│   │ Case Summary: Loan submitted, 0 docs pending                   │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                 │                                                      │
│                 ├──────────────────┬──────────────────┐                │
│                 ▼                  ▼                  ▼                │
│          Question 1 (Choice) Question 2 (Choice) Question 3 (Noul)     │
│          Event Classification Document Kind      Needs Action?         │
│          [documents_requested] [payslip]         [Probability: 0.96]   │
│                 │                  │                  │                │
│                 └──────────────────┼──────────────────┘                │
│                                    ▼                                   │
│                        Combined Extraction Object                      │
│                        Confidence: 0.94 (Above 0.60)                   │
│                        Meta: { source: 'live', latencyMs: 412 }        │
└────────────────────────────────────────────────────────────────────────┘
```

The four operational jobs are structured as follows:

| Job Name      | State Context Supplied                                            | Target Questions And Primitives                                                                                                                                           |
| ------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extract`     | Message body, sender role, sender name, timestamp, case summary   | `event` (Choice: `ExtractedEvent`), `document` (Choice: `DocumentKind` \| `none`), `owner` (Choice: `OwnerRole` \| `none`), `withdrawalRisk` (Noul), `needsAction` (Noul) |
| `next_action` | Case summary, last 3 chronological messages, open tasks           | `action` (Choice: `NextAction`), `owner` (Choice: `OwnerRole`), `urgency` (Score: 0 to 2)                                                                                 |
| `playbooks`   | Case summary, current blocker, candidate playbooks                | `fit` (Score: 0 = does not apply, 1 = partly applies, 2 = directly applies; evaluated per candidate playbook)                                                             |
| `signals`     | Buyer messages with timestamps and response gaps computed in code | `responsiveness` (Score: 0 = unresponsive, 1 = slow, 2 = prompt), `hesitation` (Score: 0 = committed, 1 = some doubts, 2 = strong doubts)                                 |

### Question Design Rules

- **Self-Contained Criteria:** TypeSafe Jev does not transmit question IDs to
  the underlying model. Every question prompt contains its complete semantic
  definition, criteria, and distinction rules.
- **Explicit Fallbacks:** Every Choice question includes an explicit no-match
  option (`'no_update'`, `'none'`, `'wait'`) to prevent forced
  misclassification.
- **Confidence Threshold:** If an extraction yields overall confidence below
  0.60 (`JEV_REVIEW_THRESHOLD`), the UI renders a visible `"Needs Review"` tag.

### Fallback And Caching Ladder

The client relies on a four-tier fallback ladder managed by `JevService` to keep
user interaction responsive:

```text
Request Dispatched
        │
        ▼
   [API Key Present?] ──No──► [Cache Lookup] ──Hit──► Return Cached (source: 'cache')
        │                                        │
       Yes                                      Miss
        │                                        │
        ▼                                        ▼
  Call Jev Live (<3000ms)                  Return Unavailable (source: 'unavailable')
   ├── Success ──► Write to jev_answers ──► Return Live (source: 'live')
   └── Timeout / Error
           │
           ▼
     Check Exact Input Hash in jev_answers
      ├── Hit ──► Return Cached (source: 'cache')
      └── Miss ──► Check Latest Subject Answer
                    ├── Hit ──► Return Stale (source: 'cache', stale: true)
                    └── Miss ──► Return Unavailable (source: 'unavailable')
```

- **Input Hash:** Computed as the SHA-256 digest of stable canonical JSON
  representing `{ kind, state, questionVersion }`.
- **Precomputed Fixtures:** During build verification, `bun run jev:precompute`
  calls Jev live for an extraction on every fixture message; signals, next
  action and default-query playbooks for each story booking; and next actions
  for up to 25 stalled generated bookings, writing
  `server/fixtures/jev-cache.json`. This keeps demo executions under 120 calls
  and avoids live latency during presentations.

## Security, Secrets And Privacy

Mortar implements strict architectural guardrails to enforce privacy and
statutory compliance.

### Synthetic Data Guarantee

The system strictly handles synthetic data:

- **No Real Records:** No actual customer names, national identity card (NRIC)
  numbers, telephone numbers, or financial statements are ingested or stored.
- **Synthetic Identifiers:** Identity numbers use reserved formatting
  (`000000-00-XXXX`); telephone numbers use the fictional prefix
  `+60 00-000 XXXX`.
- **Demo Hygiene:** The spreadsheet import route (`/import`) is kept clear of
  live data during public demonstrations.

### Secret Management

- **Isolated Credentials:** Production and development credentials
  (`DATABASE_URL`, `TYPESAFE_API_KEY`) are stored in `.env`, which is symlinked
  locally and git-ignored.
- **Client Boundary:** The TypeSafe API key is used exclusively by the Bun
  server runtime. No client environment variables (`VITE_*`) expose API tokens
  to the browser.
- **Cloud Delivery:** Cloud Run receives database credentials and API keys via
  secure environment variables populated from GitHub Secrets during deployment.

### Statutory Compliance: PDPA

The Personal Data Protection (Amendment) Act 2024 took effect in phases
through 2025. Synthetic records describe no identifiable person, so the
prototype holds no personal data under the Act. The platform is still
architected for future corporate data onboarding:

- **72-Hour Breach Notification:** The event log preserves who reported and who
  verified every mutation, groundwork for the amendment's statutory incident
  reporting.
- **Automated Decision Guidelines:** PDPC guidelines published in May 2026 cover
  impact assessments, privacy by design, and automated decision-making; they
  will apply once the forecast scores real buyers. The design already keeps AI
  outputs advisory: human officers must explicitly verify all status transitions
  and legal filings.
- **Data Minimization:** Role-based views restrict loan document visibility.
  Sales administrators view case blocker classifications without accessing
  detailed personal financial documentation.

## Deploy And CI

The deployment pipeline is fully automated via GitHub Actions, containerizing
the application for serverless hosting on Google Cloud Run.

### Containerization

The build uses a multi-stage `Dockerfile` based on the official
`oven/bun:1.3.14-slim` image:

```dockerfile
FROM oven/bun:1.3.14-slim AS builder
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/ packages/
COPY frontend/ frontend/
COPY server/ server/
RUN bun install --frozen-lockfile
RUN cd frontend && bun run build

FROM oven/bun:1.3.14-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/server ./server
COPY --from=builder /app/frontend/dist ./frontend/dist
EXPOSE 8080
CMD ["bun", "server/src/index.ts"]
```

The container packages static client assets directly alongside the API runtime,
allowing one container instance to serve both web traffic and backend queries.

### Deployment Workflow

The workflow (`.github/workflows/deploy.yml`) runs on merges to `main`:

1. **Authentication:** Authenticates to Google Cloud using Workload Identity
   Federation (no service account keys stored in GitHub).
2. **Container Build:** Compiles and tags the Docker image in Google Artifact
   Registry.
3. **Cloud Run Rollout:** Deploys the container to Cloud Run in the
   `asia-southeast1` (Singapore) region with continuous health verification.
4. **Environment Configuration:** Injects `DATABASE_URL` (Neon production
   branch) and `TYPESAFE_API_KEY` directly from GitHub repository secrets.

### Continuous Integration (CI)

Every proposed change must satisfy local and remote verification gates:

- `bun run check`: Executes ESLint validation, TypeScript workspace
  typechecking, and the Vitest suites across all modules.
- `bun run format`: Formats code and documentation with Prettier (enforcing an
  80-column limit on Markdown files).
- `bun run test`: Executes unit and integration test suites using Vitest.

## Testing Strategy

Mortar enforces a strict automated testing regimen across the workspace
packages.

### Unit And Determinism Tests

Located in `packages/core/src/__tests__/`:

- **Deterministic Generation:** Verifies that invoking
  `generate({ seed: DEFAULT_SEED })` produces identical datasets across separate
  test runs.
- **Temporal Integrity:** Asserts that zero generated events possess an
  `occurredAt` timestamp later than `REFERENCE_DATE` (`2026-09-18`).
- **Funnel Progression:** Validates that each booking contains exactly one
  `booked` event, that stage sequences progress monotonically, and that exit
  states (`cancelled`, `lapsed`) terminate case progression.
- **Known-Value Mathematical Verification:**
  - _Wilson Score Interval:_ Asserts that 5 successes out of 10 observations
    yields an exact 95% confidence interval of `[0.2366, 0.7634]`.
  - _Annuity Instalment:_ Validates amortization math against verified baseline
    amortization tables.
- **Backtest Temporal Isolation:** Verifies that the backtest algorithm consumes
  no event recorded after `cutoffDate` during rate estimation.

### Service And Integration Tests

Located in `packages/jev/src/__tests__/` and `server/src/__tests__/`:

- **Jev Client Mocking:** Tests question generation, fan-out assembly, and
  response parsing against recorded TypeSafe API fixtures.
- **Fallback Ladder Verification:** Simulates API failures and network timeouts
  to confirm graceful degradation: live call &rarr; exact cache &rarr; stale
  cache &rarr; unavailable state.
- **Database Row Mappers:** Validates bidirectional mapping between PostgreSQL
  snake_case columns and TypeScript camelCase domain entities.
- **Reset Rate Limiting:** Confirms that `POST /api/admin/reset` rejects rapid
  repeated invocations with HTTP 429 until the 30-second cooldown expires.

### User Interface Verification

Located in `frontend/src/`:

- **Theme Compliance:** Verifies that UI components consume semantic CSS
  variables, rendering correctly in both Light and Dark modes.
- **Responsive Layout:** Asserts that layouts adapt properly across desktop
  (1440px) and mobile (375px) breakpoints.
- **Human-In-The-Loop Actions:** Validates that the review interface correctly
  renders provisional Jev proposals, allowing staff to confirm, dispute, or
  dismiss updates.

## Technical Risks And Build Flags

This section documents operational risks and flags specific architectural areas
that may evolve as the parallel build completes.

| Risk Area               | Failure Mode                                  | Severity | Mitigation Strategy                                                                                                          | Build Flag / Status                                                                   |
| ----------------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Jev Availability**    | Upstream API timeout or rate limiting in demo | High     | Precomputed fixtures in `jev-cache.json`; cache-first lookup on GET routes; client falls back to `source: 'cache'` smoothly  | Stable: Precompute script caches fixture calls before pitch recording                 |
| **Database Latency**    | Neon compute endpoint cold start (~1s idle)   | Medium   | Server ping on container boot; pre-warm database endpoint prior to recording pitch video                                     | Stable: Warm-up procedure documented in operational runbook                           |
| **SQL Prepared State**  | Bun SQL pool prepared statement failures      | Medium   | Disable client statement preparation (`prepare: false`) if pooled connection proxies mismanage statement identifiers         | Flagged: W2 server implementation to test pooled prepared statement behavior          |
| **DSR Sensitivity**     | Static 4.2% interest rate assumption          | Low      | Move interest rate into editable `DEFAULT_ASSUMPTIONS` panel, allowing live sensitivity modeling during financial review     | Flagged: W1 sim module exposes interest rate as an editable assumption                |
| **Cohort Sample Sizes** | Small sample sizes in deep funnel stages      | Medium   | Automatic fallback ladder in `forecast()`: cohort &rarr; stage aggregate &rarr; global baseline; Wilson confidence intervals | Stable: Minimum threshold fixed at 8 cases per cohort                                 |
| **Search Scaling**      | MiniSearch memory usage in client             | Low      | In-memory indexing is fast for the 24 to 30 playbook fixtures; if the catalog grows far beyond that, move search server-side | Roadmap: In-memory MiniSearch retained for prototype; vector search deferred to pilot |

## See Also

- [Product Description](PRODUCT.md): Problem context, operational leakage costs,
  and pilot roadmap.
- [Product Requirements Document](PRD.md): Detailed user personas, screen
  requirements, and acceptance criteria.
- [Design Specification](DESIGN.md): Design tokens, component rules, and visual
  house style.
- [Front-End Simulation](research/company-brain/simulation.md): Seed values,
  legal constraints, and simulation ethics.
- [Company-Brain Platform Concept](research/company-brain/README.md): Platform
  architecture evaluation and open-source benchmarks.
- [Practitioner Survey Findings](research/practitioner-survey/README.md):
  Empirical survey evidence from industry practitioners (n = 5).
- [Problem Statement](source/problem-statement.md): Original Chin Hin challenge
  brief and mission requirements.
- [Project README](README.md): Project overview and setup instructions.

## Sources

### Industry And Regulatory Baselines

- **Bank Negara Malaysia (BNM):** Monthly statistical bulletins, Table 1.10 and
  Table 1.12 (Financing applications, approvals, and disbursements by purpose,
  2024–2026).
- **Association of Banks in Malaysia (ABM):** Timely Processing of Housing Loan
  Applications guidelines (October 2017).
- **Real Estate and Housing Developers' Association (REHDA):** Property Industry
  Survey 2H2025 and Market Outlook 2026 (Loan rejection rates and take-up
  rates).
- **Federal Court of Malaysia:** _PJD Regency Sdn Bhd v. Tribunal Tuntutan
  Pembeli Rumah & Anor_ (19 January 2021; ruling on booking deposit dates and
  statutory late-delivery interest).
- **Housing Development Regulations:** Housing Development (Control and
  Licensing) Regulations 1989, Regulation 11(2) (Statutory prohibition on
  pre-SPA booking fees).
- **Statutory Data Protection:** Laws of Malaysia, Personal Data Protection Act
  2010 (Act 709) and Personal Data Protection (Amendment) Act 2024; Personal
  Data Protection Commission guidelines covering impact assessments, privacy by
  design, and automated decision-making (May 2026).

### Methodology And Technical Foundations

- **Binomial Confidence Estimation:** Brown, L. D., Cai, T. T., and DasGupta, A.
  (2001). _Interval Estimation for a Binomial Proportion_. Statistical Science,
  16(2), 101–133.
- **Synthetic Mortgage Benchmarking:** Columbia University (2026). _MortarBench:
  Evaluating Mortgage-Origination AI Agents on Synthetic Financial Dossiers_.
  arXiv:2606.19416.
- **TypeSafe AI:** TypeSafe SDK and Jev Specification
  (`https://docs.typesafe.ai/`). Fan-out pattern, Choice, Score, and Noul
  primitive definitions.
