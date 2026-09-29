<a id="readme-top"></a>

<br />
<div align="center">
  <img src="assets/hero.jpg" alt="Mortar" width="100%">

  <h3>Mortar</h3>

  <p>
    <b>Know which bookings will really become sales.</b><br />
    One live view of every booking across Sales, Loan Admin and Legal — the
    daily Today queue for the stuck ones, and a cash forecast that only counts
    bookings likely to sign.
  </p>

[![TypeScript][TypeScript-badge]][TypeScript-url]
[![React][React-badge]][React-url] [![Vite][Vite-badge]][Vite-url]
[![Bun][Bun-badge]][Bun-url] [![Tailwind][Tailwind-badge]][Tailwind-url]
[![shadcn/ui][shadcn-badge]][shadcn-url]
[![Recharts][Recharts-badge]][Recharts-url]
[![Vitest][Vitest-badge]][Vitest-url] [![MIT][MIT-badge]][LICENSE]

<a href="https://mortar-d18f.onrender.com"><strong>Live Demo »</strong></a>
&middot;
<a href="https://github.com/NexTechnologies-MY/Mortar/issues/new/choose">Report
A Bug</a> &middot;
<a href="https://github.com/NexTechnologies-MY/Mortar/issues/new/choose">Request
A Feature</a> <br />
</div>

## Table of Contents

<details>
  <summary>Expand</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
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
        <li><a href="#run-jev-locally">Run Jev Locally</a></li>
        <li><a href="#ask-mortarai-mortarais-gemini-engine">Ask MortarAI</a></li>
        <li><a href="#test-database">Test Database</a></li>
        <li><a href="#project-structure">Project Structure</a></li>
      </ul>
    </li>
    <li><a href="#team">Team</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

A property project launches, Sales books units in the first month, and the
launch is reported as a success. But a meaningful share of those bookings never
reaches a signed Sale & Purchase Agreement (SPA): loans are rejected, buyers
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

Read next: [Design Spec](DESIGN.md) ·
[Problem Statement](source/problem-statement.md) ·
[Interview](source/interview.md) · [AGENTS](../AGENTS.md) ·
[Product Overview](PRODUCT.md) · [Product Requirements](PRD.md) ·
[Technical Requirements](TRD.md)

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

### Screenshots

Every shot below is the running app on the seeded demo dataset. The data is
simulated; the screens are not mockups.

<table>
  <tr>
    <td width="33%">
      <img src="assets/screens/landing.webp" alt="The Mortar landing page" width="100%">
      <br /><strong>Landing</strong>
      <br />The public entry point: the claim, and how the three desks fit together.
    </td>
    <td width="33%">
      <img src="assets/screens/today.webp" alt="The Today desk as Sales Admin" width="100%">
      <br /><strong>Today · Sales Admin</strong>
      <br />Nurul Aina's daily desk. Stalled bookings first, each with the rule-based next step, beside a rail of figures and tasks.
    </td>
    <td width="33%">
      <img src="assets/screens/today-manager.webp" alt="The Today desk as Manager" width="100%">
      <br /><strong>Today · Manager</strong>
      <br />Robert Khoo's desk: the overdue cases nobody has followed up yet, drawn as the same chase cards.
    </td>
  </tr>
  <tr>
    <td width="33%">
      <img src="assets/screens/team.webp" alt="The Team page of desk loads" width="100%">
      <br /><strong>Team</strong>
      <br />One row per staff profile: who is holding bookings up, how long, and what that wait is worth.
    </td>
    <td width="33%">
      <img src="assets/screens/profile-menu.webp" alt="The profile menu open from the top bar avatar" width="100%">
      <br /><strong>Profile Menu</strong>
      <br />The avatar carries the signed-in persona and its two figures; it opens the five demo profiles.
    </td>
    <td width="33%">
      <img src="assets/screens/bookings.webp" alt="The bookings ledger" width="100%">
      <br /><strong>Bookings</strong>
      <br />Loan Admin's desk. Every booking with age, stage, who it is waiting on, and financing risk.
    </td>
  </tr>
  <tr>
    <td width="33%">
      <img src="assets/screens/case.webp" alt="A single booking case page" width="100%">
      <br /><strong>Case Page</strong>
      <br />One booking end to end: loan and legal tracks, Waiting On and next move, messages, tasks and evidence.
    </td>
    <td width="33%">
      <img src="assets/screens/legal.webp" alt="The legal queue awaiting SPA execution" width="100%">
      <br /><strong>Legal</strong>
      <br />What sits between an approved loan and a signed SPA, with whom, and for how long.
    </td>
    <td width="33%">
      <img src="assets/screens/forecast.webp" alt="The forecast of projected signings" width="100%">
      <br /><strong>Forecast</strong>
      <br />Expected signings inside 30 days, with stage conversion rates, over a stack of the documents behind the figure.
    </td>
  </tr>
  <tr>
    <td width="33%">
      <img src="assets/screens/import.webp" alt="The Add Bookings intake page" width="100%">
      <br /><strong>Add Bookings</strong>
      <br />Upload a booking sheet or type them in, review row by row, and send to the main desks.
    </td>
    <td width="33%">
      <img src="assets/screens/settings.webp" alt="The settings and demo data page" width="100%">
      <br /><strong>Settings</strong>
      <br />The demo dataset: seed, reference date, record counts, and a reset.
    </td>
    <td width="33%">
      <img src="assets/screens/proposal.webp" alt="Jev proposing a case update on a banker message" width="100%">
      <br /><strong>Jev Proposal</strong>
      <br />Jev reads each message and proposes an update. Staff confirm, dispute or dismiss.
    </td>
  </tr>
</table>

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

### How It Works

The funnel runs from booking fee to bank disbursement:

1.  Booking (small fee)
1.  Loan application(s), often several banks at once
1.  Letter of Offer
1.  SPA signed (buyer pays 10%)
1.  Loan agreement (panel solicitor)
1.  Bank disburses progressively

Sales, Credit/Loan Admin and Legal each hold one slice of that funnel and no
existing tool shows the whole. Mortar's input is the booking spreadsheet the
team already maintains — intake, not migration — and its rules push the daily
Today queue instead of waiting for somebody to open a report.

The app is used as four personas, switched from the profile menu in the header
and persisted in `localStorage` under `mortar.profile` (with `mortar.persona`
still written alongside it). Five named demo profiles sit behind the four
personas: two Sales Admins, one Loan Admin, one Legal Admin and one Manager.

| Persona     | Home Route  | Job                                                        |
| ----------- | ----------- | ---------------------------------------------------------- |
| Sales Admin | `/chase`    | Works the Today queue of stuck bookings                    |
| Loan Admin  | `/bookings` | Tracks loan and banker status across bookings              |
| Legal Admin | `/legal`    | Works the queue of unsigned SPAs by how long they have sat |
| Manager     | `/chase`    | Works Decisions For You: the overdue cases, then escalates |

| Route           | Purpose                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/`             | Public landing page                                                                                                                  |
| `/sign-in`      | Named demo profile picker and signed session cookie, no password                                                                     |
| `/app`          | Redirects to the active persona's home                                                                                               |
| `/chase`        | Today: who to chase today, with rule-based next steps, blocker reasons, and WhatsApp click-to-chat links                             |
| `/team`         | Team: every desk's load side by side, most overdue first, with Open Bookings, Overdue Cases, Value At Risk and Expected Signings     |
| `/bookings`     | Bookings: unit pipeline, Who Holds Each Booking filter, and side sheet quick view; hand-entry Add Booking and closed Excel export    |
| `/bookings/:id` | Case page: single-sentence status header, dual tracks, button-driven updates, and verbal Jev readings                                |
| `/legal`        | Legal: SPA execution queue with No Appointment Yet and Appointment Set, Not Signed sections, with inline appointment/signing dialogs |
| `/forecast`     | Forecast: projected signings, accuracy score sentence, the supporting document stack, and where bookings died                        |
| `/import`       | Add Bookings: upload a spreadsheet or type bookings in directly, with row-by-row review                                              |
| `/faq`          | FAQ                                                                                                                                  |
| `/settings`     | Settings: demo dataset controls, reset, server health, and folded layouts                                                            |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

### Features

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

Every persona gets the same Today; Sales Admin and the Manager land on it, and
Loan Admin and Legal Admin on their own queues. The desk colours mark the role
and the avatar, never a status, and the top bar carries only a silhouette
avatar, so the signed-in profile, its figures and the switcher live in one
popover.

Measured, not estimated.

|                               |        |
| ----------------------------- | ------ |
| App pages                     | **12** |
| API routes                    | **15** |
| Personas                      | **4**  |
| Demo profiles                 | **5**  |
| Funnel stages tracked         | **6**  |
| Shared packages               | **2**  |
| Backend services              | **1**  |
| Real buyer records in the app | **0**  |

The shell, routes, and profile menu are built and deployed, and the screens walk
the primary flows on seeded bookings. The `@mortar/core` domain rules — stage
tracking, risk flags, Today queue, risk-weighted forecast — are in place behind
a Bun API reading Postgres.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

### Architecture

Four staff personas handle case messages from buyers, bankers and lawyers in one
web app. A single Bun process serves the frontend and API, while `@mortar/core`
keeps the browser and server on the same rules. The server sends classifications
to Jev through TypeSafe, answers staff questions with Google Gemini, and stores
case history in Neon PostgreSQL. Render hosts the service after GitHub Actions
checks pass.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/architecture-dark.svg">
  <img alt="Mortar architecture: buyers, bankers and lawyers send case messages to four staff personas, who use a web app and API backed by shared core, Neon PostgreSQL, Jev and Gemini; GitHub Actions gates Render deployment. The technology stack follows." src="assets/architecture-light.svg" width="100%">
</picture>

<details>
  <summary>Text version</summary>

```text
Buyers · bankers · lawyers
        |  case messages and documents
        v
Sales · Loan · Legal · Manager
        |  work queues and case review
        v
Mortar web app (React SPA)  ── GET snapshot · POST writes ──>  Bun API
        |                                                       |  one process also serves frontend/dist
        | @mortar/core                                          +── SQL ──> Neon PostgreSQL
        | (same rules in browser + server)                      +── classify ──> Jev (TypeSafe)
        |                                                       +── answers ──> Gemini (Google)

GitHub Actions checks gate deployment to Render in Singapore.
```

</details>

| Piece            | Runs                     | Job                                                       |
| ---------------- | ------------------------ | --------------------------------------------------------- |
| `frontend/`      | Built to `frontend/dist` | React 19 + Vite SPA, served by the Bun process            |
| `server/`        | Render                   | `Bun.serve`: static assets, `/api/*`, SQL schema on boot  |
| `packages/core/` | Browser and server       | `@mortar/core`: contract types, domain rules, forecasting |
| `packages/jev/`  | Server only              | `@mortar/jev`: TypeSafe Jev client, questions, fallbacks  |
| `docs/`          | Repo                     | This file, the design spec, sources, agent notes          |

Every push to `main` deploys automatically to Render, in Singapore, once its CI
checks pass.

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

### Tech Stack

| Layer    | Choice                                                     |
| -------- | ---------------------------------------------------------- |
| Frontend | React 19, react-router 7, Vite 6, TypeScript               |
| Backend  | Bun HTTP server, `@mortar/core` and `@mortar/jev`          |
| Database | Postgres, schema and seed applied on first boot            |
| Tooling  | Bun 1.3.14 workspaces (`frontend`, `packages/*`, `server`) |
| Styling  | Tailwind CSS 4, shadcn/ui (Radix)                          |
| Charts   | Recharts 3                                                 |
| State    | React Context for persona; case data from `/api`           |
| Tests    | Vitest, Testing Library, jsdom                             |
| Serving  | One Bun process serves `/api/*` and `frontend/dist`        |
| AI       | MortarAI: Jev (TypeSafe SDK) and Gemini (`assistant/`)     |
| Hosting  | Render web service, Free instance (Singapore)              |

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Getting Started

The app needs Postgres. Copy `.env.example` to `.env` at the repo root and set
`DATABASE_URL`; an empty database is fine, because the server applies the schema
and seeds the canonical dataset on first boot.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Prerequisites

- [Bun 1.3.14](https://bun.sh/), pinned by `packageManager` in `package.json`
- Postgres 17
- A modern desktop browser

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Installation

1.  Clone the repository.

    ```sh
    git clone https://github.com/NexTechnologies-MY/Mortar.git
    cd Mortar
    ```

1.  Start Postgres, and copy `.env.example` to `.env` at the repo root with
    `DATABASE_URL` pointing at it.

    ```sh
    docker run -d --name mortar-pg -e POSTGRES_PASSWORD=mortar \
      -e POSTGRES_DB=mortar -p 5432:5432 postgres:17-alpine
    ```

1.  Install the workspaces and start the app.

    ```sh
    bun install
    bun run dev        # frontend :5173, API :8787
    ```

```sh
bun run dev        # Start the Bun API and the Vite dev server together
bun run check      # Lint, typecheck, and test across workspaces
bun run format     # Prettier formatting across the repository
bun run build      # tsc -b && vite build → frontend/dist/
bun run db:reset   # Re-seed the database deterministically
```

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Run Jev Locally

Without `TYPESAFE_API_KEY` set, Jev serves only precomputed answers. Setting
`JEV_PROXY_URL` (with `TYPESAFE_API_KEY` still unset) points Jev at a local
Anthropic-Messages-compatible model proxy, such as CLIProxyAPI, instead, so
Jev's live path can be exercised without a TypeSafe key.

```sh
JEV_PROXY_URL=http://127.0.0.1:PORT     # base URL, no trailing /v1/messages
JEV_PROXY_KEY=                          # the proxy's x-api-key
JEV_PROXY_MODEL=gemini-3.5-flash-lite   # model to route to (default shown)
```

**Warning:** case data is sent as a prompt to whatever model sits behind the
proxy. Use this only with made-up demo data, never with real buyer or booking
information.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Ask MortarAI (MortarAI's Gemini Engine)

MortarAI is Mortar's AI layer: Jev classifies messages, and Gemini answers staff
questions in Ask MortarAI. Ask MortarAI connects to Google's Gemini API over
`fetch` (`POST /api/assistant`) to answer questions grounded in the live
snapshot using five read-only tools. Set `GEMINI_API_KEY` in `.env` to enable
it:

```sh
GEMINI_API_KEY=                         # Google Gemini API key
GEMINI_MODEL=gemini-3.5-flash-lite      # Optional model (default shown)
```

Without a key, the endpoint returns 503 and the UI falls back to scripted
answers. **Data caveat:** On Gemini's free tier, prompts and answers may be used
by Google to improve products; use only with simulated demo data. Real buyer
data requires a paid tier or Vertex AI under a PDPA data processing agreement.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Test Database

The database integration test suite (`server/db/__tests__/integration.test.ts`)
reads `TEST_DATABASE_URL`:

```sh
TEST_DATABASE_URL=postgres://...        # Dedicated test Postgres connection
```

Tests skip when unset and never read `DATABASE_URL`, which often points at
production. The suite seeds an empty test database once on first boot and cleans
up its test rows. Never point `TEST_DATABASE_URL` at production. The team test
database is the separate Neon project `mortar-test`.

<p align="right"><a href="#readme-top">&uarr;</a></p>

### Project Structure

```text
docs/            This file, DESIGN.md, sources, agent notes
frontend/        The app: React 19 + Vite SPA
  src/pages/     One file per route
  src/components/layout/, ui/ (shadcn), charts/
  src/lib/       Persona context, stores, formatters
packages/core/   @mortar/core: shared TypeScript domain rules
packages/jev/    @mortar/jev: proposals, playbooks, answer cache
server/          Bun API over Postgres; also serves frontend/dist
  db/            Schema, seed, and row mappers
  src/           Routes, Jev cache, static handler, assistant/
.github/         CI workflow, contributor guide and templates
Dockerfile       Bun build → Bun alpine runtime
AGENTS.md        Agent instructions: stack, routes, rules
```

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Team

Built by **NexTechnologies**.

<p align="center">
  <a href="https://github.com/AlaskanTuna"><img src="assets/team/AlaskanTuna.png" width="72" alt="AlaskanTuna"></a>
  <a href="https://github.com/Andersonnn7788"><img src="assets/team/Andersonnn7788.png" width="72" alt="Andersonnn7788"></a>
  <a href="https://github.com/DrxgClanPC"><img src="assets/team/DrxgClanPC.png" width="72" alt="DrxgClanPC"></a>
  <a href="https://github.com/chaosiris"><img src="assets/team/chaosiris.png" width="72" alt="chaosiris"></a>
</p>

<p align="center">
  <a href="https://github.com/AlaskanTuna"><sub>@AlaskanTuna</sub></a>
  &middot;
  <a href="https://github.com/Andersonnn7788"><sub>@Andersonnn7788</sub></a>
  &middot;
  <a href="https://github.com/DrxgClanPC"><sub>@DrxgClanPC</sub></a>
  &middot;
  <a href="https://github.com/chaosiris"><sub>@chaosiris</sub></a>
</p>

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## License

Released under the [MIT License](../LICENSE).

<p align="right"><a href="#readme-top">&uarr;</a></p>

---

## Acknowledgments

- The YEI 3.0 Youth Innovation Sandbox by [Kabel](https://kabel.my) and
  [Chin Hin Group](https://chinhin.com/), for the challenge and the sponsor
- [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/),
  and [Lucide](https://lucide.dev/)
- [TypeSafe](https://docs.typesafe.ai/) and
  [Google Gemini](https://ai.google.dev/), for MortarAI's two engines
- Everyone who answered the anonymous practitioner survey behind the leakage
  ranking

<p align="right"><a href="#readme-top">&uarr;</a></p>

[TypeScript-badge]:
  https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React-badge]:
  https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Vite-badge]:
  https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[Bun-badge]:
  https://img.shields.io/badge/Bun_1.3.14-000000?style=for-the-badge&logo=bun&logoColor=white
[Bun-url]: https://bun.sh/
[Tailwind-badge]:
  https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[shadcn-badge]:
  https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
[shadcn-url]: https://ui.shadcn.com/
[Recharts-badge]:
  https://img.shields.io/badge/Recharts_3-FF6384?style=for-the-badge
[Recharts-url]: https://recharts.org/
[Vitest-badge]:
  https://img.shields.io/badge/Vitest_3-6E9F18?style=for-the-badge&logo=vitest&logoColor=white
[Vitest-url]: https://vitest.dev/
[MIT-badge]: https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge
