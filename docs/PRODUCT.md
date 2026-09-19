# Mortar Product Overview

Mortar is an internal operations platform for Malaysian property developers that
helps property unit bookings reach a verified Sale & Purchase Agreement (SPA).
It unifies fragmented data across Sales, Loan Administration, Legal, and Finance
into an evidence-backed case workflow with a daily chase queue, reviewed staff
playbooks, and a stage-weighted conversion forecast. All numbers in this
document derive from industry research, an anonymous practitioner survey (n =
5), and public regulatory data, evaluated on synthetic bookings.

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
SPA is signed. In that case, booking to SPA took about 64 days, so every stalled
week counts against the delivery clock.

No public figure exists for Malaysian booking-to-SPA conversion. In our
practitioner survey, three of five respondents said only 0 to 2 of every 10
bookings reach a signed SPA, one said 7 to 8, and one was unsure: the leakage is
real, and its size is exactly what nobody can currently see.

This dynamic creates an acute organizational tension between departments. Sales
fears that stricter buyer pre-qualification will dampen booking velocity and
kill launch momentum. Finance knows that unweighted bookings are not cash,
warning that counting them at face value distorts treasury planning.

Mortar resolves this tension without throttling front-end sales. Instead of
imposing rigid pre-qualification gates that block bookings, Mortar surfaces
every stalled case in a daily queue. It equips staff to chase salvageable
bookings systematically while surfacing unsalvageable cases early so inventory
can be re-released promptly.

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
  one booking can carry up to three bank applications at once.
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
- **Stage Conversion Benchmarks:** Audits stage-specific conversion rates
  equipped with Wilson 95% confidence intervals and sample sizes.
- **Model Governance:** Inspects backtest calibration tables and Brier scores,
  stress-testing assumptions using seed adjustments.

### Persona Comparison

| Persona     | Representative Staff | Home Route  | Core Responsibility                       | Primary Value Delivered                                     |
| ----------- | -------------------- | ----------- | ----------------------------------------- | ----------------------------------------------------------- |
| Sales Admin | Nurul Aina           | `/chase`    | Works daily chase list of stuck bookings  | Surfaces each stall reason with a suggested next action     |
| Loan Admin  | Tan Mei Ling         | `/bookings` | Oversees multi-bank mortgage applications | Flags applications undecided past the bank guideline window |
| Finance     | Arvind Raj           | `/forecast` | Audits conversion probabilities and cash  | Produces stage-weighted projections with stated uncertainty |

## What Mortar Does

Mortar turns fragmented communications into a transparent ledger of case
milestones. It acts as an operational bridge between raw booking data and legal
execution.

### Centralized Case Workspace

Every unit booking receives a dedicated case dossier (`/bookings/:id`). The
workspace maintains a timestamped, auditable event log capturing when events
occurred, when Mortar learned of them, who reported them, and who verified them.

Loan and legal workflows proceed on separate, overlapping tracks. A delay in
bank approval does not halt preliminary legal file preparation, and a rejection
from one bank does not mark a multi-application booking as failed. A live
booking with no confirmed event for ten or more days shows as unknown,
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
 RM 550,000        requests slip        payslip pending       status updates
     │                                                              │
     ▼                                                              ▼
[8. Execution] ◄── [7. Live Clear] ◄── [6. Playbook] ◄─── [5. Chase Queue]
 SPA executed       Malay message        Staff follows         Stall flagged
 10% paid           sent & cleared       vetted rules          task created
```

1.  **Deposit And Ingestion:** A buyer reserves Unit A-12-03 in the fictional
    Aster Heights project (RM 550,000) with a booking fee. Mortar calculates
    initial financing metrics: a 90% financing margin, a monthly instalment of
    about RM 2,250, and a debt service ratio of about 30% against the buyer's
    gross income.
2.  **Information Intake:** The panel banker (Apex Bank) sends a Manglish
    message: "Still need latest 3 months slip gaji ah, current one only got
    June. Can get from buyer asap?"
3.  **Fast Extraction:** The embedded Jev service processes the message text. It
    identifies the event as `documents_requested`, flags the document as
    `payslip`, designates `loan_admin` as the recipient owner, and attaches
    confidence scores.
4.  **Human Verification:** Sales Admin Nurul Aina reviews the proposal in the
    case evidence log. She clicks Confirm. Mortar records a confirmed event,
    updates the loan track to "Documents pending", and shows who reported and
    who verified it.
5.  **Chase Queue Activation:** The bank application passes nine working days
    without a decision, so Mortar's stall rule flags the case. It surfaces at
    the top of the Chase List (`/chase`). Jev suggests a next action: request
    the payslip from the buyer, owner Sales, due today. Sales Admin Nurul Aina
    clicks Create Task.
6.  **Playbook Guidance:** Nurul queries the playbooks panel for "slip gaji".
    Mortar returns the vetted "Missing Income Documents" playbook, which advises
    asking the buyer for the exact missing month's payslip through the company
    HR portal and alerting the banker on receipt.
7.  **Live Resolution:** The buyer responds in Malay: "Salam, saya dah emailkan
    slip gaji 3 bulan terkini kepada banker semalam." Nurul pastes the text into
    the case message box. Jev analyzes the Malay text live in under three
    seconds, returning `documents_received` for `payslip`. Nurul confirms the
    extraction. The outstanding requirement clears, and the stall flag is
    removed.
8.  **Execution And Forecast:** The bank issues its Letter of Offer, the panel
    solicitor sets the SPA appointment, and the buyer signs the SPA, paying the
    10% sum due on signing less the booking fee. Each milestone lands in the log
    as a confirmed event, and the resolved case feeds the stage conversion rates
    on `/forecast`.

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
   Staff Confirms Proposal           Flagged "Needs Review"
```

To keep the product working through demo presentations and network outages, Jev
interactions follow a multi-tier fallback hierarchy:

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

Page navigation never waits on live AI processing. GET endpoints are
cache-first, keeping page transitions responsive across the application.

## Evidence From Research And Industry

Mortar's architectural priorities and simulation assumptions rest on empirical
data gathered from industry practitioners and published regulatory records.
Every metric reflects verified Malaysian property realities rather than
unsupported estimates.

### Industry Practitioner Survey Findings

On 18 September 2026, five industry practitioners (n = 5) across mixed roles —
sales and project marketing, project management, finance, construction, and one
unstated — answered an anonymous survey on conversion bottlenecks. Full survey
responses are documented in the
[Practitioner Survey](research/practitioner-survey/README.md).

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
- **Conversion Reality:** 3 of 5 practitioners estimated that only 0 to 2 out of
  every 10 bookings reach a signed SPA; one put it at 7 to 8 and one was unsure.
- **Dwell Durations:** The typical time from booking to SPA ran 3 to 4 weeks (2
  of 5) or more than 8 weeks (2 of 5). A failed booking's unit took 3 to 4 weeks
  to release for 2 of 5 respondents; one reported more than 12 weeks.
- **Support For Automation:** Checking documents for missing items (3 of 5) and
  suggesting next actions (2 of 5) were identified as safe areas for AI. Only 1
  of 5 supported using AI for conversion risk, validating Mortar's reliance on
  statistical forecasting over generative LLM predictions.

### Official And Industry Benchmarks

Mortar calibrates its case engine and assumptions against public data compiled
in the [Front-End Simulation](research/company-brain/simulation.md) study, which
tags each value Official, Industry, Anecdotal or Assumption:

| Parameter                     | Calibrated Value                                 | Tag                | Source                                  |
| ----------------------------- | ------------------------------------------------ | ------------------ | --------------------------------------- |
| Bank decision turnaround      | 2–9 working days; rejections in 1–2 days         | Industry           | Association of Banks in Malaysia (2017) |
| Documented booking-to-SPA     | About 64 days                                    | Official           | _PJD Regency_ case facts (2021)         |
| Mortgage approval by value    | 42.1% (2024), 41.1% (2025), 38.9% (Jan–Jul 2026) | Official           | Bank Negara Malaysia tables 1.10, 1.12  |
| Mortgage approval by count    | About 74% of applications                        | Official           | Bank Negara Malaysia and ABM (2016–17)  |
| Loan rejection (RM 500k–700k) | 31% to 45%, average 38%                          | Industry           | REHDA survey, 2H2025                    |
| Developer sales take-up       | 21% (2H2025), 38% (1H2025)                       | Industry           | REHDA survey, 2H2025                    |
| Margin of financing cap       | 70% from the third home; about 90% before it     | Official, Industry | Bank Negara Malaysia (Nov 2010); press  |
| Maximum loan tenure           | 35 years                                         | Official           | Bank Negara Malaysia (Jul 2013)         |
| Debt service ratio            | Instalments at most 40% of gross income          | Industry           | Association of Banks in Malaysia (2017) |

Two simulation parameters are assumptions rather than cited figures: the
generator's per-application approval rate defaults to 0.62, set between the
REHDA band (55% to 69% approved) and the older by-number figure (74%), and loan
tenure is further bounded so the loan ends by age 70 (`min(35, 70 - age)`
years).

## The Success Measure

Mortar avoids vanity engagement metrics such as dashboard views, login counts,
or generated AI tokens. Success is defined by one business metric readable
within a single operating quarter.

### The 30-Day Verified SPA Metric

The governing North Star for Mortar is:

**30-day verified SPA rate** = bookings that sign a verified SPA within 30 days
of booking, divided by all eligible bookings in the cohort.

This metric delivers three distinct operational advantages:

1.  **Definitive Commercial Value:** A signed SPA, with the 10% payment due on
    signing, represents an executed legal contract of sale. It is the conversion
    the brief asks us to measure, though cash still depends on payment
    milestones.
2.  **Quarterly Evaluation Window:** A 30-day tracking window allows a developer
    to enroll an intake cohort between day 15 and day 44 of a quarter, conclude
    all observation by day 74, and reconcile legal audits by day 84.
3.  **Halts Inventory Holding Drag:** Anecdotal buyer guides cite 14 to 21 days
    for smooth conversions, while two of five surveyed practitioners put booking
    to SPA at more than eight weeks. Enforcing a 30-day horizon forces early
    unblocking or prompt unit release.

### Illustrative Impact, Not A Finding

The [Company-Brain Concept](research/company-brain/README.md) works one example.
Suppose an audit finds 40 eligible, stalled bookings, and targeted document
follow-up lifts their 30-day conversion from 20% to 40%:

```text
Expected additional SPAs = 40 x (40% - 20%) = 8 bookings
```

With only a 5-point uplift, the same intervention gives 2 additional SPAs. If
the 40 cases sit within a 100-booking cohort, 8 additional SPAs would raise the
cohort's rate by 8 percentage points. These are planning assumptions to replace
with pilot data. Mortar does not convert them into cash: signing an SPA is not
receiving the price, and cash forecasting needs actual payment amounts and
dates.

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
- **Not A Customer-Facing Portal:** Mortar is an internal operational tool for
  developer personnel. Panel bankers and panel solicitors keep their existing
  channels; their participation does not require a new portal.
- **Not A Privacy Risk:** The prototype operates exclusively on synthetic data.
  Names, phone numbers, and identity cards are invented values that describe no
  identifiable person, so the prototype holds no personal data under the
  Personal Data Protection Act.

## Roadmap And The 12-Week Pilot

Mortar is structured for phased organizational deployment. The current working
prototype exercises the underlying case mechanics on synthetic data, setting the
stage for a controlled 12-week on-site pilot.

### Current Prototype Versus Production Roadmap

| System Component   | Prototype Capability                                             | Production Roadmap                                                      |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Domain logic       | Pure TypeScript `@mortar/core` with seeded Monte Carlo generator | Engine calibrated against historical developer ERP data                 |
| Data persistence   | Server with pooled Neon PostgreSQL database                      | Enterprise PostgreSQL cluster with automated point-in-time recovery     |
| Staff interfaces   | React 19 single-page application with persona routing            | Single sign-on (SSO) integration with role-based access control         |
| Intelligence layer | TypeSafe Jev client with local cache fallbacks                   | Hybrid cloud deployment with dedicated VPC endpoints                    |
| Document intake    | Structured spreadsheet parser (`/import`)                        | Bidirectional API integration with developer ERP systems (such as IFCA) |
| Communications     | Staff paste messages; simulated and live threads                 | Automated WhatsApp Business Cloud API webhook synchronization           |
| Document scanning  | None — messages and updates arrive as pasted text                | Automated OCR ingestion pipeline (Docling / RAGFlow) for PDF pay slips  |

### The 12-Week Implementation Plan

The pilot deployment follows the twelve-week timeline from the company-brain
concept, designed to read the intervention's effect within one quarter:

```text
Weeks 1–2: Intake & Baseline ──► Weeks 3–4: Assisted Queue
• Ingest booking spreadsheets    • Run daily queue, one admin
• Reconcile closed-case sample   • Add Jev extraction where it helps
• Author first playbooks         • Resolve identity match errors
          │                                  │
          ▼                                  ▼
Weeks 9–12: Audit & Rollout  ◄── Weeks 5–8: Live Intervention
• Reconcile executed SPAs        • Enroll live booking cohort
• Measure 30-day conversion      • Record actions and outcomes
• Estimate effect, decide next   • Review failed and signed cases
```

- **Weeks 1–2 (Intake And Baseline):** Connect existing booking spreadsheet
  exports. Reconcile a sample of closed cases, identify the largest evidenced
  operational gap, and deploy the case ledger and action queue for one active
  project and one Sales Administration Executive. Capture a few reviewed staff
  playbooks.
- **Weeks 3–4 (Assisted Queue Operation):** Run the daily chase queue with one
  administrator. Introduce Jev message extraction where it removes a
  demonstrated burden. Reconcile imported records and correct matching errors
  without altering existing external workflows.
- **Weeks 5–8 (Live Intervention Cohort):** Enroll bookings made between day 15
  and day 44, applying Jev-suggested next actions and playbook guidance while a
  comparable group stays on ordinary follow-up. Review failed and successful
  cases together and record actions and outcomes.
- **Weeks 9–12 (Verification And Evaluation):** Close the 30-day observation
  window for all enrolled cohort bookings. Work with Legal to audit verified,
  executed SPAs. Compare the assisted group against ordinary follow-up and
  quantify additional executed agreements and inventory days released — without
  converting signed SPAs into cash, which needs payment amounts and dates — to
  decide whether broader rollout is justified.

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
