# Mortar Product Overview

Mortar is an internal operations platform for Malaysian property developers that
converts property unit bookings into verified Sale & Purchase Agreements (SPAs).
It unifies fragmented data across Sales, Loan Administration, Legal, and Finance
into an evidence-backed case workflow with a daily chase queue, reviewed staff
playbooks, and statistical cash forecasting. All numbers in this document derive
from industry research, an anonymous practitioner survey (n = 5), and public
regulatory data, evaluated on synthetic bookings.

Contents:

1.  [The Problem And Its Cost](#the-problem-and-its-cost)
1.  [Who Uses Mortar](#who-uses-mortar)
1.  [What Mortar Does](#what-mortar-does)
1.  [How It Works In One Flow](#how-it-works-in-one-flow)
1.  [Where AI Helps And Where People Decide](#where-ai-helps-and-where-people-decide)
1.  [Evidence From Research And Industry](#evidence-from-research-and-industry)
1.  [The Success Measure](#the-success-measure)
1.  [What Mortar Is Not](#what-mortar-is-not)
1.  [Roadmap And The 12-Week Pilot](#roadmap-and-the-12-week-pilot)
1.  [See Also](#see-also)

## The Problem And Its Cost

When a Malaysian property project launches, the sales team quickly secures unit
bookings during the initial campaign. Management celebrates the launch as an
immediate commercial success. However, over the subsequent months, a substantial
share of those bookings quietly falls apart before reaching an executed Sale and
Purchase Agreement (SPA).

A buyer's bank mortgage application may be rejected, incomplete documentation
may languish unnoticed, buyers may reconsider their purchase, or case files may
sit untouched with panel bankers. Because developers lack a unified tracking
system, these stalled cases slip through organizational cracks while holding
physical inventory off the market.

| Dimension         | Operational Reality                                      | Business Impact                                                |
| ----------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Inventory lock    | Units held off market for 6 to 12 weeks                  | Units cannot be sold to ready secondary buyers                 |
| Sunk expenses     | Marketing spend, agent commissions, legal retainer hours | Accrues unrecoverable costs on unconsummated sales             |
| Campaign drift    | Units re-released late in marketing cycle                | Buyer demographic has changed and original pricing logic fails |
| Legal liability   | Statutory delivery clock begins on booking fee date      | Exposes developer to late-delivery damages under _PJD Regency_ |
| Siloed visibility | Sales, Loan Admin, and Legal maintain separate notes     | Management cannot determine conversion probabilities           |
| Cash distortion   | Corporate cash flow forecasts rely on gross bookings     | Forecasts count unearned booking revenue at full face value    |

In Peninsular Malaysia, the legal risk of extended booking stalls was cemented
by the Federal Court in _PJD Regency Sdn Bhd v Tribunal Tuntutan Pembeli Rumah_
(2021). The court ruled that statutory liquidated ascertained damages (LAD) for
late delivery run from the date the booking fee is collected, not the date the
SPA is signed. Holding a stalled booking for 64 days or more directly cuts into
construction timeframes and multiplies financial exposure.

```text
200 Launch Bookings (RM 600,000 average unit price)
└── Gross Reported Sales: RM 120,000,000
    ├── 80% Convert To Signed SPA: RM 96,000,000 Realized Revenue
    └── 20% Booking Leakage: RM 24,000,000 In Phantom Sales
        └── 40 Units Locked For 6–12 Weeks Without Cash Realization
```

This dynamic creates an acute organizational tension between departments. Sales
fears that stricter buyer pre-qualification will dampen booking velocity and
kill launch momentum. Finance knows that unweighted bookings are not cash,
warning that counting them at face value distorts treasury planning.

Mortar resolves this tension without throttling front-end sales. Instead of
imposing rigid pre-qualification gates that block bookings, Mortar screens every
case within 48 hours. It equips staff to chase salvageable bookings
systematically while surfacing unsalvageable cases early so inventory can be
re-released promptly.

## Who Uses Mortar

Mortar provides a single operational environment tailored for three distinct
internal staff personas. Staff switch roles via the header persona menu, which
persists the active role in browser storage and routes them to their dedicated
workspace.

### Sales Administration

Sales administrators act as the primary operational engine for stalled bookings.
In Mortar, Sales Admin Nurul Aina starts her working day on the Chase List
(`/chase`).

- **Morning Routine:** Opens the chase queue to review stalled bookings filtered
  by urgency and financing risk.
- **Actionable Blockers:** Inspects plain-language blocker descriptions (for
  example, an income document overdue for five days or a banker waiting on
  clarification).
- **Task Assignment:** Reviews Jev-generated next-action suggestions and creates
  assigned follow-up tasks with one click.
- **Buyer Outreach:** Uses vetted playbooks to draft targeted buyer requests via
  existing WhatsApp communication channels.

### Loan Administration

Credit and loan administration executives monitor mortgage progress across panel
banks. Loan Admin Tan Mei Ling spends her day on the Bookings desk (`/bookings`)
and individual case files (`/bookings/:id`).

- **Application Oversight:** Tracks parallel bank submissions, recognizing that
  one buyer may apply to three banks simultaneously.
- **Evidence Review:** Validates incoming banker messages and document receipts
  against structured criteria.
- **Status Verification:** Confirms, disputes, or dismisses AI-extracted event
  proposals so only verified milestones advance the case.
- **Document Management:** Monitors outstanding checklists (payslips, EPF
  statements, employment letters, tax forms) to prevent submission delays.

### Finance Operations

Finance executives manage liquidity, working capital projections, and panel
solicitor performance. Finance Executive Arvind Raj anchors his workflow on the
Forecast desk (`/forecast`).

- **Conversion Projections:** Replaces raw booking numbers with expected SPA
  signings over a rolling 30-day horizon.
- **Statistical Ranges:** Evaluates expected signings bounded by 10th to 90th
  percentile Monte Carlo simulation intervals.
- **Survival Benchmarks:** Audits stage-specific transition rates equipped with
  Wilson 95% confidence intervals.
- **Model Governance:** Inspects backtest calibration tables and Brier scores,
  stress-testing assumptions using seed adjustments.

### Persona Comparison

| Persona     | Representative Staff | Home Route  | Core Responsibility                       | Primary Value Delivered                                        |
| ----------- | -------------------- | ----------- | ----------------------------------------- | -------------------------------------------------------------- |
| Sales Admin | Nurul Aina           | `/chase`    | Works daily chase list of stuck bookings  | Unblocks documentation and accelerates buyer responses         |
| Loan Admin  | Tan Mei Ling         | `/bookings` | Oversees multi-bank mortgage applications | Eliminates application dwell time and verifies evidence        |
| Finance     | Arvind Raj           | `/forecast` | Audits conversion probabilities and cash  | Produces dependable cash projections based on real stage rates |

## What Mortar Does

Mortar turns fragmented communications into a transparent ledger of case
milestones. It acts as an operational bridge between raw booking data and legal
execution.

### Centralized Case Workspace

Every unit booking receives a dedicated case dossier (`/bookings/:id`). The
workspace maintains an immutable, timestamped event log capturing when events
occurred, when Mortar learned of them, who reported them, and who verified them.

Loan and legal workflows proceed on separate, overlapping tracks. A delay in
bank approval does not halt preliminary legal file preparation, and a rejection
from one bank does not mark a multi-application booking as failed. Bookings
lacking fresh evidence for ten or more days are marked explicitly as unknown,
preventing stale cases from masquerading as healthy pipeline.

### High-Density Ledger Design

Mortar adheres to the strict interface rules defined in the
[Design Specification](DESIGN.md). Built for focused operational work, the
interface functions as a digital paper ledger:

- **Restrained Visual Tone:** Clean paper backgrounds, flat white cards, 1px
  hairline borders, and 6px border radii. Decorative gradients, floating drop
  shadows, and glassmorphism are banned.
- **Rigorous Typography:** Set exclusively in Geist for interface text and Geist
  Mono for unit codes, booking reference numbers, and financial data.
- **Calibrated Color Tokens:** Orange is strictly reserved for primary user
  actions and row selection. Status is communicated through six semantic tones
  (positive, warning, danger, info, neutral, signed), always accompanied by
  explicit text.

### Core Operational Capabilities

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Mortar Workspace Engine                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│    Case Ledger    │    Chase Queue    │       Forecast Engine          │
│   (/bookings)     │     (/chase)      │         (/forecast)            │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ • Parallel tracks │ • Plain blockers  │ • 30-day conversion horizon    │
│ • Evidence audits │ • Jev suggestions │ • Wilson 95% confidence bands  │
│ • Document status │ • One-click tasks │ • Monte Carlo percentile range │
│ • Multi-bank logs │ • Urgency sorting │ • Historical backtest audits   │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

The system includes a searchable library of reviewed staff playbooks. When a
booking encounters an obstacle—such as an income shortfall or a slow panel
banker—Mortar surfaces reviewed guidance tagged with English, Malay, and
Manglish search terms (`slip gaji`, `LO`, `surat tawaran`).

## How It Works In One Flow

To understand Mortar in practice, consider the lifecycle of booking `BK-9001`,
spanning initial deposit through to confirmed execution.

```text
[1. Deposit] ──► [2. Banker Chat] ──► [3. Jev Extract] ──► [4. Verification]
 Unit booked       Manglish message     Typed proposal        Staff confirms
 RM 612,800        requests slip        payslip pending       status updates
     │                                                              │
     ▼                                                              ▼
[8. Execution] ◄── [7. Live Clear] ◄── [6. Playbook] ◄─── [5. Chase Queue]
 SPA executed       Malay message        Staff follows         Stall flagged
 10% paid           sent & cleared       vetted rules          task created
```

1.  **Deposit And Ingestion:** A buyer reserves Unit B-12-03 (RM 612,800) with a
    deposit. The booking enters Mortar via the spreadsheet intake (`/import`).
    Mortar calculates initial financing metrics: a 90% loan margin, monthly
    instalment of RM 2,750, and a debt service ratio of 36% against verified
    gross income.
2.  **Information Intake:** The assigned panel banker sends a message via
    WhatsApp: "Income doc tak complete la, need latest 3 months payslip for
    credit assessment."
3.  **Fast Extraction:** The embedded Jev service processes the message text. It
    identifies the event as `documents_requested`, flags the document as
    `payslip`, designates `loan_admin` as the recipient owner, and attaches
    confidence scores.
4.  **Human Verification:** Loan Admin Tan Mei Ling reviews the proposal in the
    case evidence log. She clicks Confirm. Mortar records a confirmed event,
    updates the loan track to "Documents pending", and starts an evidence clock.
5.  **Chase Queue Activation:** Five days elapse with no submission. Mortar's
    deterministic stall rule triggers: "Document Outstanding 5+ Days". The case
    surfaces at the top of the Chase List (`/chase`). Jev suggests a next
    action: "Request payslip from buyer, owner Sales, due today." Sales Admin
    Nurul Aina clicks Create Task.
6.  **Playbook Guidance:** Nurul queries the playbooks panel for "slip gaji".
    Mortar returns the vetted "Missing Income Documents" playbook, which advises
    requesting the latest three months of bank statements concurrently to
    prevent secondary credit queries.
7.  **Live Resolution:** The buyer responds in Malay: "Salam, saya dah emailkan
    slip gaji 3 bulan terkini kepada banker semalam." Nurul pastes the text into
    the case message box. Jev analyzes the Malay text live in under three
    seconds, returning `documents_received` for `payslip`. Nurul confirms the
    extraction. The outstanding requirement clears, and the stall flag is
    removed.
8.  **Execution And Forecast:** The bank issues a Letter of Offer within four
    days. The panel solicitor schedules the signing appointment. The buyer signs
    the SPA and disburses the 10% deposit. Mortar records the confirmed
    `spa_signed` event. The completed conversion instantly feeds into the
    empirical stage-transition dataset on `/forecast`.

## Where AI Helps And Where People Decide

Mortar enforces a strict architectural boundary between automated assistance and
human authority. AI accelerates clerical extraction and semantic retrieval, but
it is never permitted to make operational or financial decisions.

### Division Of Operational Responsibility

| Operational Domain     | AI Role (TypeSafe Jev)                                      | Human Or Deterministic Governance                                     |
| ---------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| Message processing     | Extracts candidate dates, document types, and event classes | Staff confirm identity matches and verify material facts              |
| Staff knowledge        | Retrieves and ranks vetted playbooks by contextual fit      | Experienced managers author, review, and approve playbook text        |
| Task coordination      | Proposes next actions and estimates follow-up urgency       | Staff assign responsibilities, execute actions, and manage partners   |
| Buyer sentiment        | Evaluates message response gaps and hesitation patterns     | Sales agents interpret relationship context and buyer motives         |
| Financing risk         | Computes nothing; deterministic rules evaluate debt ratios  | Credit staff evaluate documentation; commercial banks decide credit   |
| Legal milestones       | Assembles chronological document trails for case review     | Panel solicitors confirm statutory execution of the agreement         |
| Conversion forecasting | Explains underlying statistical distributions               | Mathematical algorithms compute rates; Finance owns assumptions       |
| Inventory management   | Highlights persistent stalls exceeding policy limits        | Authorized executives review evidence and authorize unit cancellation |

### The Jev Boundary And Resilience

Mortar integrates TypeSafe Jev as a server-side classification and scoring
engine. Jev accepts plain text and returns structured, typed TypeScript objects
with probabilities and confidence values; it never generates arbitrary text.

```text
Incoming Message ──► Jev Fan-Out Request ──► Structured Output
(English, Malay,     (Single API call with   (Event Choice, Document Choice,
Chinese, Manglish)    typed questions)        Urgency Score, Confidence)
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   Confidence >= 0.60                Confidence < 0.60
   Direct Staff Confirm              Flagged "Needs Review"
```

To guarantee system resilience during demo presentations and production network
outages, Jev interactions follow a multi-tier fallback hierarchy:

1.  **Live Execution:** Live calls execute with a 3,000 millisecond timeout. On
    success, the response is cached and returned with `source: 'live'`.
2.  **Exact Cache Hit:** If the network request fails or times out, Mortar
    fetches the cached response matching the exact input hash, returning
    `source: 'cache'`.
3.  **Subject Stale Fallback:** If an exact hash is unavailable, Mortar returns
    the latest cached response for that booking with `stale: true`.
4.  **Graceful Degradation:** If no cache exists, the system returns neutral
    structural fallbacks with `source: 'unavailable'`, allowing staff to record
    case milestones manually without interruption.

Page navigation routes never wait on live AI processing. GET endpoints are
cache-first, preserving sub-second page transitions across the application.

## Evidence From Research And Industry

Mortar's architectural priorities and simulation assumptions rest on empirical
data gathered from industry practitioners and published regulatory records.
Every metric reflects verified Malaysian property realities rather than
unsupported estimates.

### Industry Practitioner Survey Findings

On 18 September 2026, an anonymous survey of five property development
practitioners (n = 5) across sales marketing, project management, finance, and
construction assessed conversion bottlenecks. Full survey responses are
documented in the [Practitioner Survey](research/practitioner-survey/README.md).

```text
Ranked Causes Of Booking Leakage (n = 5):
1. Loan Rejection / Financing Failure ── [5 of 5: Single Biggest Cause]
2. Buyer Withdrawal / Mind Change    ── [4 of 5: Named In Top Three]
3. Incomplete Buyer Documentation    ── [3 of 5: Named In Top Three]
4. Property Valuation Shortfall      ── [2 of 5: Named In Top Three]
```

The survey established four critical operational realities:

- **The Primary Bottleneck:** 5 of 5 respondents cited loan rejection or
  insufficient financing as the single largest cause of leakage. 4 of 5
  identified bank credit assessment as the specific stage where cases stall.
- **Conversion Reality:** 3 of 5 practitioners reported that historically, only
  0 to 2 out of every 10 bookings successfully convert to a signed SPA.
- **Dwell Durations:** Practitioners confirmed that unresolved bookings
  routinely sit between 3 to 4 weeks (2 of 5) or more than 8 weeks (2 of 5)
  before units are re-released.
- **Support For Automation:** Checking documents for missing items (3 of 5) and
  suggesting next actions (2 of 5) were identified as safe areas for AI. Only 1
  of 5 supported using AI for conversion risk, validating Mortar's reliance on
  statistical forecasting over generative LLM predictions.

### Official And Industry Benchmarks

Mortar calibrates its case engine and assumptions against public data compiled
in the [Front-End Simulation](research/company-brain/simulation.md) study:

| Parameter                     | Calibrated Value                               | Source Classification    | Authoritative Source                          |
| ----------------------------- | ---------------------------------------------- | ------------------------ | --------------------------------------------- |
| Bank decision turnaround      | 2–9 working days (rejections in 1–2 days)      | Industry Benchmark       | Association of Banks in Malaysia (ABM, 2017)  |
| Documented booking-to-SPA     | Approximately 64 days                          | Official Legal Record    | _PJD Regency_ Federal Court Case Facts (2021) |
| Mortgage approval by value    | 42.1% (2024), 41.1% (2025), 38.9% (2026)       | Official Regulatory Data | Bank Negara Malaysia Tables 1.10 and 1.12     |
| Mortgage approval by count    | Approximately 74% of applications              | Official Regulatory Data | Bank Negara Malaysia and ABM (2016–2017)      |
| Loan rejection (RM 500k–700k) | 31% to 45% (average 38%)                       | Industry Association     | REHDA Property Industry Survey (2H2025)       |
| Developer sales take-up       | 21% in 2H2025 (down from 38% in 1H2025)        | Industry Association     | REHDA Property Industry Survey (2H2025)       |
| Margin of financing cap       | 70% cap on third property onward; 90% prior    | Official Regulatory Rule | Bank Negara Malaysia Guidelines (Nov 2010)    |
| Maximum loan tenure           | 35 years or age 70 (`min(35, 70 - age)`)       | Official Regulatory Rule | Bank Negara Malaysia Circular (Jul 2013)      |
| Debt service ratio cap        | Monthly instalments capped at 40% gross income | Industry Guideline       | Association of Banks in Malaysia (2017)       |

## The Success Measure

Mortar avoids vanity engagement metrics such as dashboard views, login counts,
or generated AI tokens. Success is defined by one business metric readable
within a single operating quarter.

### The 30-Day Verified SPA Metric

The governing North Star for Mortar is:

$$\text{Success Metric} = \frac{\text{Bookings With Verified Signed SPA Within 30 Days}}{\text{Total Eligible Bookings In Cohort}} \times 100$$

This metric delivers three distinct operational advantages:

1.  **Definitive Commercial Value:** A signed SPA accompanied by the mandatory
    10% deposit payment represents an executed legal contract of sale. It
    directly releases construction stage billing and secures cash flow.
2.  **Quarterly Evaluation Window:** A 30-day tracking window allows a developer
    to enroll an intake cohort between day 15 and day 44 of a quarter, conclude
    all observation by day 74, and reconcile legal audits by day 84.
3.  **Halts Inventory Holding Drag:** Anecdotal buyer guides cite 14 to 21 days
    for smooth conversions, while survey data proves stalled cases drag past
    eight weeks. Enforcing a 30-day horizon forces early unblocking or prompt
    unit release.

### Illustrative Cohort Economics

To illustrate the financial impact of systematic follow-up, consider an active
development cohort evaluated in the
[Company-Brain Concept](research/company-brain/README.md) analysis:

```text
Cohort Intake: 100 Total Unit Bookings
├── 60 Bookings Progress Normally On Standard Tracks
└── 40 Stalled Bookings Flagged In Mortar Chase Queue
    ├── Baseline Unassisted Conversion (20%):  8 Signed SPAs
    └── Mortar Assisted Conversion (40%):     16 Signed SPAs
        └── Net Gain: 8 Additional Executed Agreements
```

At an average unit price of RM 600,000, recovering eight additional bookings
represents:

$$\text{Recovered Sales Value} = 8 \text{ Units} \times \text{RM } 600,000 = \text{RM } 4,800,000$$

For the entire 100-unit cohort, this targeted intervention lifts overall
booking-to-SPA conversion from 68% to 76%—an 8-percentage-point gain in realized
sales. Even under a highly conservative assumption where conversion improves by
only 5 percentage points, the intervention recovers 2 additional SPAs, securing
RM 1,200,000 in accelerated revenue.

## What Mortar Is Not

To ensure strategic clarity among executive sponsors, evaluators, and technical
partners, Mortar defines clear functional boundaries:

- **Not A Customer Relationship Manager (CRM):** Mortar does not capture sales
  gallery foot traffic, run advertising campaigns, or log marketing leads. It
  receives unit bookings after a deposit is paid.
- **Not An Autonomous Decider:** Mortar never unilaterally cancels bookings,
  forfeits buyer deposits, or modifies official legal agreements. Human staff
  must confirm every milestone.
- **Not A Generative Chatbot:** Mortar does not engage in free-form generative
  conversations with external buyers. AI interactions are restricted to
  structured classification and extraction.
- **Not A Customer-Facing Portal:** Mortar is an internal operational tool
  designed exclusively for developer personnel, panel bankers, and panel
  solicitors.
- **Not A Privacy Risk:** In strict compliance with the Malaysian Personal Data
  Protection Act (PDPA), the prototype operates exclusively on synthetic
  datasets. Names, phone numbers, and identity cards are generated pseudonyms
  that touch no real consumer records.

## Roadmap And The 12-Week Pilot

Mortar is structured for phased organizational deployment. The current working
prototype proves the underlying case mechanics, setting the stage for a
controlled 12-week on-site pilot.

### Current Prototype Versus Production Roadmap

| System Component   | Prototype Capability                                             | Production Roadmap                                                      |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Domain logic       | Pure TypeScript `@mortar/core` with seeded Monte Carlo generator | Engine calibrated against historical developer ERP data                 |
| Data persistence   | Server with pooled Neon PostgreSQL database                      | Enterprise PostgreSQL cluster with automated point-in-time recovery     |
| Staff interfaces   | React 19 single-page application with persona routing            | Single sign-on (SSO) integration with role-based access control         |
| Intelligence layer | TypeSafe Jev client with local cache fallbacks                   | Hybrid cloud deployment with dedicated VPC endpoints                    |
| Document intake    | Structured spreadsheet parser (`/import`)                        | Bidirectional API integration with developer ERP systems (such as IFCA) |
| Communications     | Manual message logging and simulated threads                     | Automated WhatsApp Business Cloud API webhook synchronization           |
| Document scanning  | Pre-extracted fixture data and manual verification               | Automated OCR ingestion pipeline (Docling / RAGFlow) for PDF pay slips  |

### The 12-Week Implementation Plan

The pilot deployment follows a structured twelve-week timeline designed to
demonstrate measurable conversion gains within a single operating quarter:

```text
Weeks 1–2: Intake & Baseline ──► Weeks 3–4: Assisted Queue
• Ingest booking spreadsheets    • Deploy /chase with Sales Admin
• Reconcile historical cases     • Activate live Jev message parsing
• Author reviewed playbooks      • Resolve identity match errors
          │                                  │
          ▼                                  ▼
Weeks 9–12: Audit & Rollout  ◄── Weeks 5–8: Live Intervention
• Reconcile executed SPAs        • Enroll live booking cohort
• Measure 30-day conversion      • Run daily chase & playbook matching
• Calculate recovered capital    • Conduct weekly case review audits
```

- **Weeks 1–2 (Intake And Baseline):** Connect existing booking spreadsheet
  exports. Reconcile historical closed cases over the prior six months to
  establish the baseline 30-day conversion rate. Deploy the case ledger and
  action queue for one active project and one Sales Administration Executive.
  Capture the first 25 reviewed staff playbooks.
- **Weeks 3–4 (Assisted Queue Operation):** Run the daily chase queue with Sales
  Admin and Loan Admin staff. Introduce Jev message extraction for incoming
  banker and buyer communications. Reconcile imported records and refine
  matching logic without altering existing external workflows.
- **Weeks 5–8 (Live Intervention Cohort):** Enroll all new bookings from an
  active project launch. Apply Jev-recommended next actions and playbook
  guidance. Conduct weekly cross-department case reviews examining both
  successfully recovered cases and confirmed cancellations.
- **Weeks 9–12 (Verification And Evaluation):** Close the 30-day observation
  window for all enrolled cohort bookings. Work with Legal to audit verified,
  executed SPAs. Compare conversion performance against the historical baseline.
  Quantify additional executed agreements, inventory days saved, and working
  capital brought forward to justify group-wide rollout.

## See Also

- [Product Requirements Document](PRD.md): Detailed functional requirements,
  screen specifications, and acceptance criteria.
- [Technical Requirements Document](TRD.md): System architecture, database
  schema, Jev integration design, and deployment infrastructure.
- [Design Specification](DESIGN.md): Visual tokens, component specifications,
  and layout rules for the Mortar interface.
- [Project Overview](README.md): Repository architecture, developer quickstart,
  and container runtime details.
- [Company-Brain Concept](research/company-brain/README.md): Foundational
  platform research on case records, playbooks, and knowledge capture.
- [Front-End Simulation](research/company-brain/simulation.md): Seed parameters,
  legal notes, and rules for honest presentation of simulated data.
- [Practitioner Survey](research/practitioner-survey/README.md): Empirical
  findings on conversion bottlenecks and leakage causes from Malaysian industry
  professionals (n = 5).
- [Problem Statement](source/problem-statement.md): Original Chin Hin Group
  hackathon challenge brief for booking-to-SPA conversion intelligence.
