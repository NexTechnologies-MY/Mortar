<a id="readme-top"></a>

<!-- PROJECT LOGO -->

<br />
<div align="center">
  <a href="https://github.com/NexTechnologies-MY/mortar">
    <img src="assets/hero.jpg" alt="Mortar" width="100%">
  </a>

  <h3>Mortar</h3>

  <p>
    <b>Know which bookings will really become sales.</b><br />
    One live view of every booking across Sales, Loan Admin and Legal, a daily
    chase list for the stuck ones, and a cash forecast built on bookings likely
    to sign.
    <br />
    <a href="https://mortar-ppdggwxxjq-as.a.run.app"><strong>Live Prototype »</strong></a>
    &middot;
    <a href="https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1">Figma</a>
    &middot;
    <a href="DESIGN.md">Design Spec</a>
    &middot;
    <a href="https://github.com/NexTechnologies-MY/mortar">Source</a>
    &middot;
    <a href="source/problem-statement.md">Problem Statement</a>
    &middot;
    <a href="source/interview.md">Practitioner Interview</a>
    &middot;
    <a href="../AGENTS.md">AGENTS</a>
    &middot;
    <a href="agents/notes.md">Project Notes</a>
    <br />
    Proposal PDF <em>To be added.</em>
    &middot;
    Pitch Video <em>To be added.</em>
    <br />
  </p>

[![TypeScript][TypeScript]][TypeScript-url] [![React][React]][React-url]
[![Vite][Vite]][Vite-url] [![Bun][Bun]][Bun-url]
[![Tailwind CSS][Tailwind-CSS]][Tailwind-CSS-url]
[![shadcn/ui][shadcn-ui]][shadcn-ui-url] [![Recharts][Recharts]][Recharts-url]
[![Vitest][Vitest]][Vitest-url] [![MIT][MIT]][MIT-url]

</div>

<!-- TABLE OF CONTENTS -->

## Table Of Contents

<details>
  <summary>Expand</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#the-problem">The Problem</a></li>
        <li><a href="#aims-and-objectives">Aims And Objectives</a></li>
        <li><a href="#target-users">Target Users</a></li>
        <li><a href="#similar-approaches-and-where-they-fall-short">Similar Approaches And Where They Fall Short</a></li>
        <li><a href="#ideation-and-process">Ideation And Process</a></li>
        <li><a href="#design-principles">Design Principles</a></li>
        <li><a href="#what-makes-it-different">What Makes It Different</a></li>
        <li><a href="#screenshots">Screenshots</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#architecture">Architecture</a></li>
        <li><a href="#tech-stack">Tech Stack</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#team">Team</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Mortar gives property developers one live view of every booking across Sales,
Loan Administration, and Legal, a daily chase list for stuck cases, and a cash
flow forecast built on bookings likely to convert into signed Sale & Purchase
Agreements (SPA).

Built for the YEI 3.0 Youth Innovation Sandbox by Kabel (Premium track) tackling
the Chin Hin Group property booking conversion challenge.

| Submission Field       | Detail                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| **Team**               | **NexTechnologies**: `@AlaskanTuna`, `@Andersonnn7788` _(roles to be added)_                   |
| **Problem Statement**  | Property Booking Conversion Intelligence, Chin Hin Group (Construction & Property Development) |
| **Challenge**          | YEI 3.0: Youth Innovation Sandbox by Kabel, Premium track                                      |
| **UI Prototype**       | [mortar-ppdggwxxjq-as.a.run.app](https://mortar-ppdggwxxjq-as.a.run.app)                       |
| **Proposal PDF**       | _To be added._ (due Sunday, 20 September 2026)                                                 |
| **Video Presentation** | _To be added._ (3 to 5 minute pitch video, due Sunday, 20 September 2026)                      |

<p align="right"><a href="#readme-top">&uarr;</a></p>

### The Problem

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

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Aims And Objectives

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
[Practitioner Interview](#practitioner-interview)).

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Target Users

The app is used as three personas, switched in the header. Each persona lands on
a different home route:

| User Persona                       | Role & Behaviour                                                      |
| ---------------------------------- | --------------------------------------------------------------------- |
| **Sales Administration Executive** | Primary user; works the daily chase list at `/chase`                  |
| **Loan Administration**            | Tracks loan and banker status across all live bookings at `/bookings` |
| **Finance**                        | Reads the risk-weighted forecast of expected signings at `/forecast`  |

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Similar Approaches And Where They Fall Short

| Approach                                            | Strengths                                   | Where It Falls Short                                |
| --------------------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| **Spreadsheets and WhatsApp groups**                | The incumbent; every team already uses them | Each team sees one slice; no ageing, no forecast    |
| **Property CRMs and sales-gallery booking systems** | Structured booking records                  | Stop at booking; the brief rules out a new CRM      |
| **Bank and panel-solicitor portals**                | Authoritative case status                   | Outside the developer's control; one case at a time |

> Every tool already holds one slice of a booking. **None of them shows whether
> it will sign.**

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Ideation And Process

#### Ideas We Considered

| Idea                                                    | Status      | Rationale                                                           |
| ------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| **Tracker plus chase list plus risk-weighted forecast** | **Kept**    | Runs on the existing booking spreadsheet; no new system to adopt    |
| **Stricter pre-qualification before booking**           | **Dropped** | Hurts launch momentum; Sales does not control bank credit decisions |
| **A new CRM**                                           | **Dropped** | Ruled out by the challenge brief                                    |
| **ML conversion predictor**                             | **Dropped** | Premature: no labelled conversion history to train on               |

#### Ideation Boards

_To be added._

#### Practitioner Interview

The evidence base for the leakage ranking is a structured interview with a
property development practitioner, recorded in
[`source/interview.md`](source/interview.md).

| Date           | Practitioner                                         | Status           |
| -------------- | ---------------------------------------------------- | ---------------- |
| _To be added._ | Property development practitioner, Penang, 20+ years | Findings pending |

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Design Principles

- **Build On The Spreadsheet They Already Use**: intake, not migration.
- **Push, Not Pull**: the chase list comes to them; nobody has to open a report.
- **One Number That Matters**: the percentage of bookings signing the SPA within
  30 days.
- **People Decide, AI Assists**: rules flag risk; AI drafts and checks, never
  makes credit decisions.
- **Synthetic Data Only**: the prototype ships invented bookings.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### What Makes It Different

#### Five Deliberate Choices

| Choice                                 | What Makes It Different                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Intake, not migration**              | The existing booking spreadsheet is the input; nobody changes how they work upstream           |
| **The chase list comes to them**       | Push, not pull: stuck bookings surface daily instead of waiting for someone to open a report   |
| **48-hour screening, not gatekeeping** | Every booking is screened within 48 hours; salvageable cases get chased, doomed units released |
| **Forecast weighted by stage**         | Each booking counts at the historical conversion rate of its current stage, not at face value  |
| **One number that matters**            | Success is bookings signing the SPA within 30 days: a cash outcome, not a dashboard            |

#### Competitor Comparison

| Capability                        | Spreadsheets + WhatsApp | Property CRMs | Bank / Solicitor Portals | Mortar  |
| --------------------------------- | :---------------------: | :-----------: | :----------------------: | :-----: |
| One shared live view across teams |           No            |    Partial    |            No            | **Yes** |
| Ageing and risk flags per booking |           No            |      No       |            No            | **Yes** |
| Daily chase list                  |           No            |      No       |            No            | **Yes** |
| Risk-weighted cash forecast       |           No            |      No       |            No            | **Yes** |
| Works without deploying a new CRM |         **Yes**         |      No       |         **Yes**          | **Yes** |

#### Boundaries And Uncertainties

- **Synthetic data**: the prototype runs on invented bookings; no real buyer
  data is touched.
- **No bank or solicitor access**: those systems are outside the developer's
  control; case status arrives via the people who chase it.
- **Interview findings pending**: the leakage ranking is not yet evidenced.
- **PDPA**: real buyer documents are personal data under Malaysia's PDPA and
  stay out of free-tier AI APIs.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Screenshots

| Resource                  | URL                                                                      | Access                                                          |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| **Interactive Prototype** | [mortar-ppdggwxxjq-as.a.run.app](https://mortar-ppdggwxxjq-as.a.run.app) | Live on Google Cloud Run in `asia-southeast1`                   |
| **Figma Design System**   | [Mortar Design System][Figma-url]                                        | Public, view only ([DESIGN.md](DESIGN.md) visual specification) |

Screenshots _To be added._

<p align="right"><a href="#readme-top">&uarr;</a></p>

### How It Works

The app shell, routes, and persona switch are built; the screens themselves walk
the primary user flows across personas.

| Route           | Surface        | Purpose                                                                                |
| --------------- | -------------- | -------------------------------------------------------------------------------------- |
| `/`             | Landing Page   | Public overview and entry point                                                        |
| `/sign-in`      | Sign-In        | Persona picker with no real authentication                                             |
| `/app`          | Persona Router | Opens persona home (Sales Admin `/chase`, Loan Admin `/bookings`, Finance `/forecast`) |
| `/chase`        | Chase List     | Daily list of stuck bookings and who to chase; Sales Admin home                        |
| `/bookings`     | Bookings       | Every live booking with stage and risk flags; Loan Admin home                          |
| `/bookings/:id` | Booking Detail | Stage timeline and missing-document checklist for one booking                          |
| `/forecast`     | Forecast       | Risk-weighted projection of expected signings; Finance home                            |
| `/import`       | Import         | Spreadsheet intake                                                                     |
| `/faq`          | FAQ            | Placeholder FAQ page                                                                   |

`/` is the landing page. `/sign-in` allows selecting a persona without
credentials. `/app` opens the active persona's default workspace (`/chase` for
Sales Admin, `/bookings` for Loan Admin, `/forecast` for Finance). The persona
switch lives in the header and persists in `localStorage` under
`mortar.persona`.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Features

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

### Architecture

#### System Architecture

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

#### Deployment And Hosting

Mortar builds to a static site with `bun run build` (`tsc -b && vite build`) and
is served by nginx in a Docker image.

The live prototype is hosted on Google Cloud Run in `asia-southeast1` at
[https://mortar-ppdggwxxjq-as.a.run.app](https://mortar-ppdggwxxjq-as.a.run.app).
Every push to `main` deploys automatically through GitHub Actions
([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)) with keyless
Workload Identity Federation.

#### Prototype Constraints And Guarantees

- **Synthetic data only**: the prototype ships invented bookings; real buyer
  documents stay out of the app and out of free-tier AI APIs.
- **No integrations**: no bank, solicitor, or CRM connections; the spreadsheet
  is the only input.
- **Placeholder screens**: the shell, routes, and persona switch are built;
  domain logic lands in the next stage.

#### Project Structure

```text
docs/
  README.md               Repository landing page and submission overview
  DESIGN.md               Visual specification and design system reference
  markdown-style.md       House Markdown style guide
  agents/                 Agent-facing docs: project notes, rtk, skills, coding rules
  source/                 Verbatim sources: problem statement, practitioner interview
  assets/                 README hero image and brand assets
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
.github/workflows/        CI and deployment workflows
.husky/                   Pre-commit hook (lint-staged)
AGENTS.md                 Agent instructions: stack, routes, rules
CLAUDE.md, GEMINI.md      Point at AGENTS.md
package.json              Bun workspaces and scripts
tsconfig.json             Root TypeScript config
eslint.config.mjs         Flat ESLint config
bun.lock                  Lockfile
Dockerfile                Multi-stage build (Bun build + nginx alpine)
nginx.conf                Static routing and asset headers
```

#### Documentation Index

| Document                                                     | Purpose & Primary Audience                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| [`AGENTS.md`](../AGENTS.md)                                  | Stack, routes, and rules for coding agents                    |
| [`DESIGN.md`](DESIGN.md)                                     | Visual specification and public Figma design system reference |
| [`agents/notes.md`](agents/notes.md)                         | File map, conventions, recipes, and gotchas                   |
| [`source/problem-statement.md`](source/problem-statement.md) | Verbatim challenge brief                                      |
| [`source/interview.md`](source/interview.md)                 | Practitioner interview notes and evidence log                 |
| [`markdown-style.md`](markdown-style.md)                     | House Markdown style guide                                    |

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Tech Stack

| Layer                    | Choice                                 | Rationale & Tradeoffs                                        |
| ------------------------ | -------------------------------------- | ------------------------------------------------------------ |
| **Frontend**             | React 19, react-router-dom 7, Vite 6   | Fast SPA rendering; no server rendering needed               |
| **Language**             | TypeScript strict                      | Shared domain rules between `@mortar/core` and the views     |
| **Tooling**              | Bun 1.3.14 workspaces                  | `frontend` plus `packages/*`; fast installs and scripts      |
| **Styling**              | Tailwind CSS 4, shadcn/ui (Radix)      | Token-based theme on accessible primitives                   |
| **Charts**               | Recharts 3                             | Forecast visualisation                                       |
| **State**                | React Context + `localStorage`         | Persona persists client-side; imported data stays in browser |
| **Tests**                | Vitest, Testing Library, jsdom         | Co-located unit tests in both workspaces                     |
| **Backend / Web Server** | nginx 1.27 in Docker image             | Serves compiled static assets with SPA routing fallback      |
| **AI**                   | Gemini via a small serverless function | Planned, not built                                           |
| **Hosting**              | Google Cloud Run (`asia-southeast1`)   | Keyless deployment via GitHub Actions Workload Identity Pool |

<p align="right"><a href="#readme-top">&uarr;</a></p>

<!-- GETTING STARTED -->

## Getting Started

Local development runs entirely client-side with no required API keys or backend
services. The prototype walks all persona workflows, so you can run and test
against `http://localhost:5173`.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Prerequisites

- [Bun 1.3.14](https://bun.sh/) — pinned by `package.json` (`packageManager`)
  and `bun.lock`.
- A modern desktop web browser.
- Optional: copy `.env.example` to `.env` if custom environment variables are
  introduced in future phases.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Installation

```sh
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Commands.**

```sh
bun run dev          # Start Vite dev server
bun run check        # Lint, typecheck, and test across all workspaces
bun run format       # Prettier formatting across the repository
bun run build        # Build frontend and packages for production
```

`bun run dev` runs Vite in `frontend` with hot module replacement.
`bun run check` runs `eslint --max-warnings 0`, `typecheck` across workspaces,
and `vitest`. `bun run build` runs `tsc -b && vite build` in `frontend` to
generate `dist/`.

<p align="right"><a href="#readme-top">&uarr;</a></p>

<!-- ROADMAP -->

## Roadmap

See [open issues](https://github.com/NexTechnologies-MY/mortar/issues) for a
full list of proposed features (and known issues).

| Timeline                       | Focus Area | Scope & Deliverables                           |
| ------------------------------ | ---------- | ---------------------------------------------- |
| **Day 1 (Thu 17–Fri 18 Sept)** | Core Build | `@mortar/core` rules, synthetic dataset, pages |
| **Day 2 (Sat 19 Sept)**        | Proposal   | Proposal PDF                                   |
| **Day 3 (Sun 20 Sept)**        | Pitch      | Pitch video and submission                     |

<p align="right"><a href="#readme-top">&uarr;</a></p>

<!-- CONTRIBUTING -->

## Team

Built by **NexTechnologies**.

<a href="https://github.com/NexTechnologies-MY/mortar/graphs/contributors"><img src="https://contrib.rocks/image?repo=NexTechnologies-MY/mortar" alt="Contributors" /></a>

<p align="right"><a href="#readme-top">&uarr;</a></p>

<!-- LICENSE -->

## License

Released under the [MIT License](../LICENSE).

<p align="right"><a href="#readme-top">&uarr;</a></p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [YEI 3.0: Youth Innovation Sandbox](https://kabel.my) — Kabel
- [Chin Hin Group](https://chinhin.com/) — Construction & Property Development
  problem statement
- [shadcn/ui](https://ui.shadcn.com/) — accessible UI component primitives
- [Radix UI](https://www.radix-ui.com/) — headless primitives underlying
  shadcn/ui
- [Lucide](https://lucide.dev/) — UI icons
- [Shields.io](https://shields.io)
- [contrib.rocks](https://contrib.rocks)

<p align="right"><a href="#readme-top">&uarr;</a></p>

<!-- MARKDOWN LINKS & IMAGES -->

[TypeScript]:
  https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React]:
  https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Vite]:
  https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[Bun]:
  https://img.shields.io/badge/Bun_1.3.14-000000?style=for-the-badge&logo=bun&logoColor=white
[Bun-url]: https://bun.sh/
[Tailwind-CSS]:
  https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-CSS-url]: https://tailwindcss.com/
[shadcn-ui]:
  https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
[shadcn-ui-url]: https://ui.shadcn.com/
[Recharts]: https://img.shields.io/badge/Recharts_3-FF6384?style=for-the-badge
[Recharts-url]: https://recharts.org/
[Vitest]:
  https://img.shields.io/badge/Vitest_3-6E9F18?style=for-the-badge&logo=vitest&logoColor=white
[Vitest-url]: https://vitest.dev/
[MIT]: https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge
[MIT-url]: ../LICENSE
[Figma-url]:
  https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1
