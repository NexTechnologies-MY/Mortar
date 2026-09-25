# Mortar — Project Brief & Status Report

**Project Name**: Mortar  
**Repository**: [NexTechnologies-MY/Mortar](https://github.com/NexTechnologies-MY/Mortar)  
**Local
Workspace**: `D:\Leegal Kneegar HDD\New folder\Mortar`  
**Live Prototype**:
[https://mortar-ppdggwxxjq-as.a.run.app](https://mortar-ppdggwxxjq-as.a.run.app)  
**Date**:
September 22, 2026

---

## 1. Executive Summary

**Mortar** is an operational intelligence and conversion-acceleration platform
built for Malaysian property developers, developed as a submission for **YEI 3.0
(Youth Innovation Sandbox by Kabel DXP)** addressing the problem statement from
**Chin Hin Group** (Construction & Property Development).

### The Core Problem: Booking-to-SPA Conversion Leakage

- When a property project launches, sales may book hundreds of units in the
  first month.
- However, a large percentage never convert into signed **Sale & Purchase
  Agreements (SPAs)** because loans get rejected, buyers withdraw, paperwork
  stalls, or panel bankers fail to follow up.
- Each stalled booking holds a property unit off the market for **6 to 12
  weeks**, consuming marketing expenses, sales agent commission accruals, and
  legal panel capacity.
- Developers often mistakenly forecast cash flows based on bookings rather than
  executed SPAs.
- Teams (Sales, Loan Admin/Credit, Legal) operate in silos with fragmented data
  in spreadsheets, WhatsApp chats, and paper files.

### Mortar's Solution

- **Shared Case Record**: Unifies Sales, Loan Administration, and Legal desks
  around a single case record per booking.
- **North Star Metric**: Focuses on the **30-day verified SPA conversion rate**.
- **Actionable Chase Queue**: Highlights stalled cases with concrete next steps
  before deadlines lapse.
- **Intelligence Layer (TypeSafe Jev)**: Extracts structured status proposals
  from pasted banker/buyer WhatsApp messages so administrators don't have to
  manually interpret updates.
- **Statistical Forecasting & Leakage Recovery**: Calibrated Monte Carlo
  simulation that projects conversions and calculates recovered inventory weeks
  and revenue brought forward.

---

## 2. Technical Architecture & Stack

| Layer              | Technologies Used                                          | Details                                                                                                                                      |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**       | React 19, Vite 6, React Router 7, TypeScript               | Single-page application with persona routing (Sales Admin, Legal, Management).                                                               |
| **Styling & UI**   | Tailwind CSS 4, shadcn/ui (Radix UI), Lucide Icons         | Clean editorial "paper & ink" aesthetic with full dark/light theme support.                                                                  |
| **Charts**         | Recharts 3                                                 | Visualizing stage conversion rates, forecast backtests, and firm capacity.                                                                   |
| **Backend**        | Bun 1.3 HTTP Server (`Bun.serve`)                          | Hosts `/api/*` endpoints and serves pre-built `frontend/dist` static assets.                                                                 |
| **Database**       | PostgreSQL (Neon pooled)                                   | Normalized schema (`bookings`, `loan_applications`, `events`, `messages`, `tasks`, `jev_answers`). Schema and seed are auto-applied on boot. |
| **Shared Core**    | `@mortar/core` (TypeScript)                                | Pure TypeScript package containing domain models, Monte Carlo simulator, and forecasting logic, shared across frontend and server.           |
| **AI Integration** | `@mortar/jev`                                              | TypeSafe Jev client with a precomputed SQLite/JSON fallback cache for deterministic offline demos.                                           |
| **Infrastructure** | Google Cloud Run (`asia-southeast1`)                       | Containerized Bun Alpine runtime deployed via GitHub Actions using keyless Workload Identity Federation.                                     |
| **Demo Pipeline**  | Node.js, Python, Playwright, ffmpeg, Kokoro/Chatterbox TTS | Automated headless browser recording pipeline for 5-minute timed demo videos.                                                                |

---

## 3. Current Project Status

- **Git Status**: Clean `main` branch (`746ee4f`), fully synced with remote
  `origin/main`.
- **Pull Requests**: 45 PRs merged. **0 open PRs**.
- **Issues**: Issue #1 (FAQ content) closed. **0 open issues**.
- **CI/CD**: GitHub Actions workflows passing (`CI` and `Deploy Prototype`).
- **Live Deployment**: Healthy (`200 OK` on
  `https://mortar-ppdggwxxjq-as.a.run.app`).
- **Deliverables Completed**:
  - Full working prototype deployed on Cloud Run.
  - Interactive pitch deck (`docs/demo/mortar-pitch-deck.html` and `.pdf`).
  - Architecture diagram (`docs/assets/architecture.svg`).
  - Practitioner survey analysis (`docs/research/practitioner-survey/README.md`,
    n=5).
  - Automated walkthrough recording suite (`scripts/demo/`).

---

## 4. What You Can Do (Action Items & Opportunities)

### A. Immediate / Low Effort

1. **Fill Out the Practitioner Interview (`docs/source/interview.md`)**:
   - The README explicitly lists as a limitation: _"Interview findings pending.
     The leakage ranking rests on a practitioner interview
     (`source/interview.md`) whose findings are not yet recorded."_
   - Recording notes from an experienced property practitioner will close this
     documented gap.
2. **Clean Up Remote Feature Branches**:
   - The remote repository still has 4 stale branches that have already been
     integrated into `main`:
     - `origin/design/landing-a`
     - `origin/design/landing-b`
     - `origin/design/landing-shell`
     - `origin/feat/demo-recorder`
   - You can safely delete these remote branches.

### B. Product & Feature Enhancements (Medium Effort)

3. **Wire Up Spreadsheet Import (`frontend/src/pages/ImportPage.tsx`)**:
   - Currently, `/import` has a drop zone UI but parsing is not implemented.
   - Adding a client-side parser (using `xlsx` or `papaparse`) to map Excel/CSV
     columns to Mortar's booking schema would turn the mockup into an
     operational import tool.
4. **Early Financing Eligibility Pre-Check Rule**:
   - The practitioner survey unanimously highlighted financing rejection as the
     #1 cause of booking leakage (5/5), with 4/5 respondents demanding early
     eligibility checks.
   - You can add an advisory DSR (Debt Service Ratio) / Margin of Financing
     calculator to the booking creation flow so admins get an immediate
     early-warning risk badge.
5. **Run & Verify Demo Recording Pipeline**:
   - In `scripts/demo/`, run the test suite (`node --test`) and verify if the
     demo video (`demo.mp4`) needs rendering or updating if presentation timing
     changes.

### C. Strategic / Enterprise Roadmap (Longer Horizon)

6. **IFCA / ERP Integration Specification**:
   - Practitioners explicitly noted that Malaysian developers rely on IFCA.
     Creating an ingestion adapter or schema translation layer for IFCA export
     files would significantly increase enterprise viability.
7. **WhatsApp Business Cloud API Webhook**:
   - Replace manual pasting of banker/buyer messages with an inbound webhook
     that automatically feeds messages into Jev for extraction.
