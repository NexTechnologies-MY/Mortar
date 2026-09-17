<a id="readme-top"></a>

<div align="center">
  <img src="assets/hero.jpg" alt="Mortar" width="100%">

  <h3>Mortar</h3>

  <p>
    <b>Know which bookings will really become sales.</b><br />
    One live view of every booking across Sales, Loan Admin and Legal, a daily chase list for the stuck ones, and a cash
    forecast built on bookings likely to sign.
  </p>

![TypeScript](https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/Bun_1.3.14-000000?style=for-the-badge&logo=bun&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts_3-FF6384?style=for-the-badge)
![Vitest](https://img.shields.io/badge/Vitest_3-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

Live Prototype _To be added._ · Proposal PDF _To be added._ · Pitch Video _To be
added._ · [Problem Statement](source/problem-statement.md) ·
[Practitioner Interview](source/interview.md) · [AGENTS](../AGENTS.md) ·
[Project Notes](agents/notes.md)

</div>

| Submission Field       | Detail                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| **Team**               | **NexTechnologies**: `@AlaskanTuna`, plus one teammate _(handle and roles to be added)_        |
| **Problem Statement**  | Property Booking Conversion Intelligence, Chin Hin Group (Construction & Property Development) |
| **Challenge**          | YEI 3.0: Youth Innovation Sandbox by Kabel, Premium track                                      |
| **UI Prototype**       | _To be added._                                                                                 |
| **Proposal PDF**       | _To be added._ (due Sunday, 20 September 2026)                                                 |
| **Video Presentation** | _To be added._ (3 to 5 minute pitch video, due Sunday, 20 September 2026)                      |

## Table Of Contents

<details>
  <summary>Expand</summary>
  <ol>
    <li>
      <a href="#1-project-overview">Project Overview</a>
      <ol>
        <li><a href="#11-the-problem">The Problem</a></li>
        <li><a href="#12-aims-and-objectives">Aims And Objectives</a></li>
        <li><a href="#13-target-users">Target Users</a></li>
        <li><a href="#14-similar-approaches-and-where-they-fall-short">Similar Approaches And Where They Fall Short</a></li>
        <li><a href="#15-our-solution">Our Solution</a></li>
      </ol>
    </li>
    <li>
      <a href="#2-ideation--process">Ideation & Process</a>
      <ol>
        <li><a href="#21-ideas-we-considered">Ideas We Considered</a></li>
        <li><a href="#22-ideation-boards">Ideation Boards</a></li>
        <li><a href="#23-practitioner-interview">Practitioner Interview</a></li>
      </ol>
    </li>
    <li>
      <a href="#3-design--prototype">Design & Prototype</a>
      <ol>
        <li><a href="#31-core-interface-walkthrough">Core Interface Walkthrough</a></li>
        <li><a href="#32-design-principles">Design Principles</a></li>
      </ol>
    </li>
    <li>
      <a href="#4-what-makes-it-different">What Makes It Different</a>
      <ol>
        <li><a href="#41-five-deliberate-choices">Five Deliberate Choices</a></li>
        <li><a href="#42-competitor-comparison">Competitor Comparison</a></li>
        <li><a href="#43-boundaries-and-uncertainties">Boundaries And Uncertainties</a></li>
      </ol>
    </li>
    <li>
      <a href="#5-technical-architecture--feasibility">Technical Architecture & Feasibility</a>
      <ol>
        <li><a href="#51-system-architecture">System Architecture</a></li>
        <li><a href="#52-tech-stack">Tech Stack</a></li>
        <li><a href="#53-deployment-and-hosting">Deployment And Hosting</a></li>
        <li><a href="#54-prototype-constraints--guarantees">Prototype Constraints & Guarantees</a></li>
        <li><a href="#55-build-plan">Build Plan</a></li>
      </ol>
    </li>
    <li>
      <a href="#6-repository-layout--documentation">Repository Layout & Documentation</a>
      <ol>
        <li><a href="#61-project-structure">Project Structure</a></li>
        <li><a href="#62-documentation-index">Documentation Index</a></li>
      </ol>
    </li>
    <li><a href="#7-team">Team</a></li>
  </ol>
</details>

---

## 1. Project Overview

### 1.1 The Problem

A property project launches, sales books units in the first month, and the
launch is reported as a success. But a meaningful share of those bookings never
reaches a signed Sale & Purchase Agreement (SPA): loans are rejected, buyers
withdraw, paperwork stalls, or the case sits with a panel banker and quietly
dies.

Each booking can hold a unit off the market for six to twelve weeks while it
consumes marketing spend, agent commission accruals, and legal panel time.
Nobody can say, for a live project, how many booked units are likely to convert
— and the developer's cash flow forecast is built on bookings.

**The Funnel** runs from booking to disbursement:

1. Booking (small fee)
2. Loan application(s), often several banks at once
3. Letter of Offer
4. SPA signed (buyer pays 10%)
5. Loan agreement (panel solicitor)
6. Bank disburses progressively

Sales, Credit/Loan Administration, and Legal each hold one piece of that funnel.
Nobody sees the whole:

| Team                             | What They Hold                                 |
| -------------------------------- | ---------------------------------------------- |
| **Sales**                        | Knows which cases feel shaky                   |
| **Credit / Loan Administration** | Knows which bankers are slow                   |
| **Legal**                        | Knows which cases have been sitting            |
| **Finance**                      | Forecasts cash on bookings that may never sign |

**Illustrative Only:** 200 launch bookings at RM600k with 20% never converting
is RM24M of reported sales that is not real.

### 1.2 Aims And Objectives

Mortar is measured by one number that can be read within one quarter: the
percentage of bookings that sign the SPA within 30 days of booking.

| Target Area                | Core Objective                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------- |
| **Ranked Leakage Causes**  | Order the causes of booking leakage by size with evidence, not guesses              |
| **One Shared View**        | Bring Sales, Loan Admin and Legal into a single view of live bookings               |
| **Daily Chase List**       | Surface the stuck bookings each day instead of waiting for someone to open a report |
| **Risk-Weighted Forecast** | Weight expected cash by how likely each booking is to sign                          |

Evidence for the leakage ranking comes from a practitioner interview plus public
Bank Negara and NAPIC data (see
[2.3 Practitioner Interview](#23-practitioner-interview)).

### 1.3 Target Users

The app is used as three personas, switched in the header. Each persona lands on
a different home route:

| User Persona                       | Role & Behaviour                                                      |
| ---------------------------------- | --------------------------------------------------------------------- |
| **Sales Administration Executive** | Primary user; works the daily chase list at `/chase`                  |
| **Loan Administration**            | Tracks loan and banker status across all live bookings at `/bookings` |
| **Finance**                        | Reads the risk-weighted forecast of expected signings at `/forecast`  |

### 1.4 Similar Approaches And Where They Fall Short

| Approach                                            | Strengths                                   | Where It Falls Short                                |
| --------------------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| **Spreadsheets and WhatsApp groups**                | The incumbent; every team already uses them | Each team sees one slice; no ageing, no forecast    |
| **Property CRMs and sales-gallery booking systems** | Structured booking records                  | Stop at booking; the brief rules out a new CRM      |
| **Bank and panel-solicitor portals**                | Authoritative case status                   | Outside the developer's control; one case at a time |

> Every tool already holds one slice of a booking. **None of them shows whether
> it will sign.**

### 1.5 Our Solution

Import the booking spreadsheet the team already uses, then track every booking
from fee to disbursement with rules-based risk flags, a daily chase list, and a
forecast weighted by conversion.

| Feature                    | Job                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| **Spreadsheet Import**     | Intake the booking sheet the team already maintains; nobody changes how they work upstream |
| **Stage Timeline**         | Per-booking timeline from booking to disbursement with a missing-document checklist        |
| **Risk Flags**             | Rules-based flags for days stuck in stage, missing documents, and loan status              |
| **Chase List**             | Daily list of who to chase today, with WhatsApp click-to-chat links                        |
| **Risk-Weighted Forecast** | Each booking times the historical conversion rate of its current stage                     |

Mortar does not block bookings with stricter pre-qualification. Every booking is
screened within 48 hours; the salvageable ones get chased, and doomed units are
released early.

**Where AI Helps** and **Where AI Is Premature**:

| Where AI Helps                                               | Where AI Is Premature                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| Checking uploaded loan documents for completeness            | A machine-learning conversion predictor without labelled history |
| Turning a WhatsApp thread with a banker into a status update | Anything that makes credit decisions                             |
| Drafting chase messages in English, Malay or Chinese         |                                                                  |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## 2. Ideation & Process

### 2.1 Ideas We Considered

| Idea                                                    | Status      | Rationale                                                           |
| ------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| **Tracker plus chase list plus risk-weighted forecast** | **Kept**    | Runs on the existing booking spreadsheet; no new system to adopt    |
| **Stricter pre-qualification before booking**           | **Dropped** | Hurts launch momentum; Sales does not control bank credit decisions |
| **A new CRM**                                           | **Dropped** | Ruled out by the challenge brief                                    |
| **ML conversion predictor**                             | **Dropped** | Premature: no labelled conversion history to train on               |

### 2.2 Ideation Boards

_To be added._

### 2.3 Practitioner Interview

The evidence base for the leakage ranking is a structured interview with a
property development practitioner, recorded in
[`source/interview.md`](source/interview.md).

| Date           | Practitioner                                         | Status           |
| -------------- | ---------------------------------------------------- | ---------------- |
| _To be added._ | Property development practitioner, Penang, 20+ years | Findings pending |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## 3. Design & Prototype

The prototype is not yet deployed:

| Resource                  | URL            | Access         |
| ------------------------- | -------------- | -------------- |
| **Interactive Prototype** | _To be added._ | _To be added._ |

### 3.1 Core Interface Walkthrough

The app shell, routes, and persona switch are built; the screens themselves are
placeholders today. Screenshots _To be added._

| Route           | Surface        | Purpose                                                         |
| --------------- | -------------- | --------------------------------------------------------------- |
| `/chase`        | Chase List     | Daily list of stuck bookings and who to chase; Sales Admin home |
| `/bookings`     | Bookings       | Every live booking with stage and risk flags; Loan Admin home   |
| `/bookings/:id` | Booking Detail | Stage timeline and missing-document checklist for one booking   |
| `/forecast`     | Forecast       | Risk-weighted projection of expected signings; Finance home     |
| `/import`       | Import         | Spreadsheet intake                                              |

`/` redirects to the active persona's home. The persona switch (Sales Admin,
Loan Admin, Finance) lives in the header and persists in `localStorage` under
`mortar.persona`.

### 3.2 Design Principles

- **Build On The Spreadsheet They Already Use**: intake, not migration.
- **Push, Not Pull**: the chase list comes to them; nobody has to open a report.
- **One Number That Matters**: the percentage of bookings signing the SPA within
  30 days.
- **People Decide, AI Assists**: rules flag risk; AI drafts and checks, never
  makes credit decisions.
- **Synthetic Data Only**: the prototype ships invented bookings.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## 4. What Makes It Different

### 4.1 Five Deliberate Choices

| Choice                                 | What Makes It Different                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Intake, not migration**              | The existing booking spreadsheet is the input; nobody changes how they work upstream           |
| **The chase list comes to them**       | Push, not pull: stuck bookings surface daily instead of waiting for someone to open a report   |
| **48-hour screening, not gatekeeping** | Every booking is screened within 48 hours; salvageable cases get chased, doomed units released |
| **Forecast weighted by stage**         | Each booking counts at the historical conversion rate of its current stage, not at face value  |
| **One number that matters**            | Success is bookings signing the SPA within 30 days: a cash outcome, not a dashboard            |

### 4.2 Competitor Comparison

| Capability                        | Spreadsheets + WhatsApp | Property CRMs | Bank / Solicitor Portals | Mortar  |
| --------------------------------- | :---------------------: | :-----------: | :----------------------: | :-----: |
| One shared live view across teams |           No            |    Partial    |            No            | **Yes** |
| Ageing and risk flags per booking |           No            |      No       |            No            | **Yes** |
| Daily chase list                  |           No            |      No       |            No            | **Yes** |
| Risk-weighted cash forecast       |           No            |      No       |            No            | **Yes** |
| Works without deploying a new CRM |         **Yes**         |      No       |         **Yes**          | **Yes** |

### 4.3 Boundaries And Uncertainties

- **Synthetic data**: the prototype runs on invented bookings; no real buyer
  data is touched.
- **No bank or solicitor access**: those systems are outside the developer's
  control; case status arrives via the people who chase it.
- **Interview findings pending**: the leakage ranking is not yet evidenced.
- **PDPA**: real buyer documents are personal data under Malaysia's PDPA and
  stay out of free-tier AI APIs.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## 5. Technical Architecture & Feasibility

### 5.1 System Architecture

The prototype runs entirely in the browser: imported data never leaves the
client, and all domain logic is pure TypeScript in `@mortar/core`.

```text
Booking spreadsheet (the one the team already uses)
        |
        |  /import
        v
+--------------------------------------+
| @mortar/core  (pure TypeScript)      |
| stages, risk flags,                  |
| risk-weighted forecast, chase list   |
+------------------+-------------------+
                   |
                   v
React views per persona:
/chase  /bookings  /bookings/:id  /forecast

Planned, not built: a small Gemini serverless function for
document completeness checks, banker-thread status updates,
and draft chase messages.
```

### 5.2 Tech Stack

| Layer        | Choice                                 | Rationale & Tradeoffs                                        |
| ------------ | -------------------------------------- | ------------------------------------------------------------ |
| **Frontend** | React 19, react-router-dom 7, Vite 6   | Fast SPA rendering; no server rendering needed               |
| **Language** | TypeScript strict                      | Shared domain rules between `@mortar/core` and the views     |
| **Tooling**  | Bun 1.3.14 workspaces                  | `frontend` plus `packages/*`; fast installs and scripts      |
| **Styling**  | Tailwind CSS 4, shadcn/ui (Radix)      | Token-based theme on accessible primitives                   |
| **Charts**   | Recharts 3                             | Forecast visualisation                                       |
| **State**    | React Context + `localStorage`         | Persona persists client-side; imported data stays in browser |
| **Tests**    | Vitest, Testing Library, jsdom         | Co-located unit tests in both workspaces                     |
| **Backend**  | None (prototype phase)                 | Static site; deterministic demo with no secrets or keys      |
| **AI**       | Gemini via a small serverless function | Planned, not built                                           |
| **Hosting**  | Static site                            | Host to be decided                                           |

### 5.3 Deployment And Hosting

Mortar builds to a static site with `bun run build` (`tsc -b && vite build`).
Host to be decided.

### 5.4 Prototype Constraints & Guarantees

- **Synthetic data only**: the prototype ships invented bookings; real buyer
  documents stay out of the app and out of free-tier AI APIs.
- **No integrations**: no bank, solicitor, or CRM connections; the spreadsheet
  is the only input.
- **Placeholder screens**: the shell, routes, and persona switch are built;
  domain logic lands in the next stage.

### 5.5 Build Plan

| Timeline                       | Focus Area | Scope & Deliverables                           |
| ------------------------------ | ---------- | ---------------------------------------------- |
| **Day 1 (Thu 17–Fri 18 Sept)** | Core Build | `@mortar/core` rules, synthetic dataset, pages |
| **Day 2 (Sat 19 Sept)**        | Proposal   | Proposal PDF                                   |
| **Day 3 (Sun 20 Sept)**        | Pitch      | Pitch video and submission                     |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## 6. Repository Layout & Documentation

<a id="layout"></a>

### 6.1 Project Structure

```text
docs/
  README.md               Repository landing page and submission overview
  markdown-style.md       House Markdown style guide
  agents/                 Agent-facing docs: project notes, rtk, skills, coding rules
  source/                 Verbatim sources: problem statement, practitioner interview
  assets/                 README hero image
frontend/                 The app: React 19 + Vite
  index.html              Entry point (fonts, no-FOUC theme script)
  components.json         shadcn/ui configuration
  vite.config.ts          Dev server and Vitest configuration
  tsconfig.json           Frontend TypeScript config
  public/                 Static assets
  src/
    components/           layout/, ui/ (shadcn primitives), charts/
    hooks/                Theme hook
    lib/                  Persona context, stores, formatters, tests
    pages/                One file per route
packages/
  core/                   @mortar/core: shared TypeScript (Persona type today)
.github/workflows/        CI
.husky/                   Pre-commit hook (lint-staged)
AGENTS.md                 Agent instructions: stack, routes, rules
CLAUDE.md, GEMINI.md      Point at AGENTS.md
package.json              Bun workspaces and scripts
tsconfig.json             Root TypeScript config
eslint.config.mjs         Flat ESLint config
bun.lock                  Lockfile
```

### 6.2 Documentation Index

| Document                                                     | Purpose & Primary Audience                    |
| ------------------------------------------------------------ | --------------------------------------------- |
| [`AGENTS.md`](../AGENTS.md)                                  | Stack, routes, and rules for coding agents    |
| [`agents/notes.md`](agents/notes.md)                         | File map, conventions, recipes, and gotchas   |
| [`source/problem-statement.md`](source/problem-statement.md) | Verbatim challenge brief                      |
| [`source/interview.md`](source/interview.md)                 | Practitioner interview notes and evidence log |
| [`markdown-style.md`](markdown-style.md)                     | House Markdown style guide                    |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## 7. Team

Built by **NexTechnologies**.

<div align="center">
<table>
  <tr>
    <td align="center" width="50%">
      <a href="https://github.com/AlaskanTuna"><img src="https://github.com/AlaskanTuna.png" width="88" alt="Adam" /></a><br />
      <b>Adam</b><br />
      <a href="https://github.com/AlaskanTuna">@AlaskanTuna</a><br />
      <sub>_To be added._</sub>
    </td>
    <td align="center" width="50%">
      <b>_To be added._</b><br />
      <sub>_To be added._</sub>
    </td>
  </tr>
</table>
</div>

<p align="right"><a href="#readme-top">&uarr;</a></p>
