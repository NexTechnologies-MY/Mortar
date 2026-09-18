<a id="readme-top"></a>

<div align="center">
  <img src="assets/hero.jpg" alt="Mortar" width="100%">

  <h3>Mortar</h3>

  <p>
    <b>Know which bookings will really become sales.</b><br />
    One live view of every booking across Sales, Loan Admin and Finance — a
    daily chase list for the stuck ones, and a cash forecast that only counts
    bookings likely to sign.
  </p>

![TypeScript](https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/Bun_1.3.14-000000?style=for-the-badge&logo=bun&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts_3-FF6384?style=for-the-badge)
![Vitest](https://img.shields.io/badge/Vitest_3-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

[Live Prototype](https://mortar-ppdggwxxjq-as.a.run.app) ·
[Figma](https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1)
· [Design Spec](DESIGN.md) · [Problem Statement](source/problem-statement.md) ·
[Interview](source/interview.md) · [AGENTS](../AGENTS.md)

</div>

## Table of Contents

<details>
  <summary>Expand</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#the-one-rule-that-governs-everything">The One Rule That Governs Everything</a></li>
    <li><a href="#how-it-works">How It Works</a></li>
    <li><a href="#what-is-built">What Is Built</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#limitations">Limitations</a></li>
    <li><a href="#team">Team</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

---

## About The Project

A property project launches, Sales books units in the first month, and the
launch is reported as a success. But a meaningful share of those bookings never
reaches a signed Sale &amp; Purchase Agreement (SPA): loans are rejected, buyers
withdraw, paperwork stalls, or the case sits with a panel banker and quietly
dies.

Each booking can hold a unit off the market for six to twelve weeks while it
consumes marketing spend, agent commission accruals, and legal panel time.
Nobody can say, for a live project, how many booked units are likely to convert
— and the developer's cash flow forecast is built on bookings.

**Illustrative only:** 200 launch bookings at RM600k with 20% never converting
is RM24M of reported sales that is not real.

Built by **NexTechnologies** for the YEI 3.0 Youth Innovation Sandbox by Kabel
(Premium track), tackling the Chin Hin Group property booking conversion
challenge. Proposal PDF and pitch video are due Sunday, 20 September 2026.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## The One Rule That Governs Everything

**A booking is never counted as cash at face value.**

Every booking enters the forecast at the historical conversion rate of its
current stage — enforced in `@mortar/core`, not in a dashboard label somebody
could forget to apply. The consequences are worn openly:

- The forecast can only move toward honesty as evidence arrives; a stalled
  booking drags the number down instead of inflating it
- Success is one number, readable within a quarter: the percentage of bookings
  that sign the SPA within 30 days — a cash outcome, not a dashboard
- Every booking is screened within 48 hours; the salvageable get chased and
  doomed units are released early, rather than blocking bookings upstream with
  stricter pre-qualification

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## How It Works

The funnel runs from booking fee to bank disbursement:

1. Booking (small fee)
2. Loan application(s), often several banks at once
3. Letter of Offer
4. SPA signed (buyer pays 10%)
5. Loan agreement (panel solicitor)
6. Bank disburses progressively

Sales, Credit/Loan Admin, Legal and Finance each hold one slice of that funnel
and no existing tool shows the whole. Mortar's input is the booking spreadsheet
the team already maintains — intake, not migration — and its rules push a daily
chase list instead of waiting for somebody to open a report.

The app is used as three personas, switched in the header and persisted in
`localStorage`:

| Persona     | Home Route  | Job                                            |
| ----------- | ----------- | ---------------------------------------------- |
| Sales Admin | `/chase`    | Works the daily chase list of stuck bookings   |
| Loan Admin  | `/bookings` | Tracks loan and banker status across bookings  |
| Finance     | `/forecast` | Reads the risk-weighted projection of signings |

| Route           | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `/`             | Public landing page                                           |
| `/sign-in`      | Persona picker, no real authentication                        |
| `/app`          | Redirects to the active persona's home                        |
| `/bookings`     | Every live booking with stage and risk flags                  |
| `/bookings/:id` | Stage timeline and missing-document checklist for one booking |
| `/chase`        | Who to chase today, with WhatsApp click-to-chat links         |
| `/forecast`     | Each booking weighted by its stage's conversion rate          |
| `/import`       | Spreadsheet intake                                            |
| `/faq`          | FAQ                                                           |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## What Is Built

Measured, not estimated.

|                               |       |
| ----------------------------- | ----- |
| Live routes                   | **9** |
| Personas                      | **3** |
| Funnel stages tracked         | **6** |
| Shared packages               | **1** |
| Backend services              | **0** |
| Real buyer records in the app | **0** |

The shell, routes, and persona switch are built and deployed; the screens walk
the primary flows on synthetic bookings. The `@mortar/core` domain rules — stage
tracking, risk flags, chase list, weighted forecast — land in the next stage.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Architecture

One deployable and one shared library. The prototype runs entirely in the
browser: imported data never leaves the client, and all domain logic is pure
TypeScript in `@mortar/core`.

```text
Booking spreadsheet (the one the team already uses)
        |
        |  /import
        v
+-------------------------------+
| @mortar/core (pure TypeScript)|
| stages, risk flags, chase list|
| risk-weighted forecast        |
+---------------+---------------+
                |
                v
React views per persona:
/chase  /bookings  /bookings/:id  /forecast
```

| Piece       | Runs      | Job                                              |
| ----------- | --------- | ------------------------------------------------ |
| `frontend/` | Cloud Run | React 19 + Vite SPA, served by nginx in Docker   |
| `packages/` | Imported  | `@mortar/core`: shared types and domain rules    |
| `docs/`     | Repo      | This file, the design spec, sources, agent notes |

Every push to `main` deploys automatically through GitHub Actions to Cloud Run
in `asia-southeast1`, with keyless Workload Identity Federation.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Tech Stack

| Layer    | Choice                                            |
| -------- | ------------------------------------------------- |
| Frontend | React 19, react-router 7, Vite 6, TypeScript      |
| Tooling  | Bun 1.3.14 workspaces (`frontend`, `packages/*`)  |
| Styling  | Tailwind CSS 4, shadcn/ui (Radix)                 |
| Charts   | Recharts 3                                        |
| State    | React Context + `localStorage`, data stays client |
| Tests    | Vitest, Testing Library, jsdom                    |
| Serving  | nginx 1.27 in a multi-stage Docker image          |
| AI       | Gemini via a small serverless function — planned  |
| Hosting  | Google Cloud Run (`asia-southeast1`)              |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Getting Started

Everything runs client-side; no API keys or backend services are required.

```sh
bun install
bun run dev        # http://localhost:5173
```

```sh
bun run dev        # Start Vite dev server
bun run check      # Lint, typecheck, and test across workspaces
bun run format     # Prettier formatting across the repository
bun run build      # tsc -b && vite build → dist/
```

Prerequisites: [Bun 1.3.14](https://bun.sh/) (pinned by `packageManager` in
`package.json`) and a modern desktop browser.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Project Structure

```text
docs/            This file, DESIGN.md, sources, agent notes
frontend/        The app: React 19 + Vite SPA
  src/pages/     One file per route
  src/components/layout/, ui/ (shadcn), charts/
  src/lib/       Persona context, stores, formatters
packages/core/   @mortar/core: shared TypeScript domain rules
.github/         CI and Cloud Run deploy workflows
Dockerfile       Bun build → nginx alpine
AGENTS.md        Agent instructions: stack, routes, rules
```

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Limitations

- **Synthetic data only.** The prototype ships invented bookings; no real buyer
  data is touched.
- **No integrations.** No bank, solicitor, or CRM connections — the spreadsheet
  is the only input, and case status arrives via the people who chase it.
- **Interview findings pending.** The leakage ranking rests on a practitioner
  interview ([`source/interview.md`](source/interview.md)) whose findings are
  not yet recorded.
- **PDPA.** Real buyer documents are personal data under Malaysia's PDPA and
  stay out of free-tier AI APIs.
- **AI is an assistant, not a decider.** Rules flag risk; AI may draft and check
  documents and messages, but it never makes credit decisions.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Team

Built by **NexTechnologies** (`@AlaskanTuna`, `@Andersonnn7788`).

<a href="https://github.com/NexTechnologies-MY/mortar/graphs/contributors"><img src="https://contrib.rocks/image?repo=NexTechnologies-MY/mortar" alt="Contributors" /></a>

---

## License

Released under the [MIT License](../LICENSE).

<sub>
Thanks to [YEI 3.0 / Kabel](https://kabel.my), [Chin Hin
Group](https://chinhin.com/), [shadcn/ui](https://ui.shadcn.com/),
[Radix UI](https://www.radix-ui.com/), and [Lucide](https://lucide.dev/).
</sub>
