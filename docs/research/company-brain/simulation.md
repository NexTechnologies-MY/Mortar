# Front-End Simulation

The first Mortar prototype simulates the [company-brain concept](README.md)
entirely in the browser, on synthetic bookings. This page sets what the
simulation covers, how it generates data, the Malaysian values it starts from,
and how to present its numbers honestly. Researched on 19 September 2026.

Contents:

1.  [Scope](#scope)
1.  [Why The Company-Brain Tools Wait](#why-the-company-brain-tools-wait)
1.  [How The Simulation Works](#how-the-simulation-works)
1.  [Seed Values](#seed-values)
1.  [Legal And Domain Notes](#legal-and-domain-notes)
1.  [Synthetic Data And PDPA](#synthetic-data-and-pdpa)
1.  [Presenting Simulated Numbers](#presenting-simulated-numbers)
1.  [First Build](#first-build)
1.  [Open Questions](#open-questions)
1.  [See Also](#see-also)
1.  [Sources](#sources)

## Scope

Front-end only: no server, no database, no live AI calls and no real buyer data.
Everything runs in the React app and `@mortar/core`, which matches the
browser-only architecture in the [project README](/docs/README.md).

**In Scope:**

- Seeded synthetic bookings and case events, generated in `@mortar/core`.
- A stage-weighted forecast with ranges and a backtest, on `/forecast`.
- Follow-up tasks with owners, raised by stalled bookings, on `/chase`.
- Pre-written WhatsApp-style messages whose extracted updates staff confirm, on
  `/bookings/:id`.
- Keyword search over a small set of playbook records.

**Roadmap, Not Prototype:**

- Any company-brain engine from the concept page.
- Live AI extraction of messages and documents.
- Search by meaning across languages.
- OCR of scanned documents.
- Modelling banker and solicitor capacity as queues.
- Calibrating the rates on real, consented company data.

## Why The Company-Brain Tools Wait

All nine projects on the concept page exist and carry the licences it states.
None can run inside a static single-page app: each needs a server process, a
database or search engine, and usually an LLM or embedding key that must stay
server-side.

| Project  | Server Pieces It Needs                                                          |
| -------- | ------------------------------------------------------------------------------- |
| GBrain   | Bun CLI and MCP server; a company brain adds Postgres or Supabase, HTTPS, OAuth |
| Onyx     | API, worker, two model servers, Postgres, OpenSearch; about 10 GB RAM           |
| RAGFlow  | Elasticsearch or Infinity, MySQL, MinIO, Redis; 16 GB RAM or more               |
| Cognee   | Python service; an OpenAI key by default                                        |
| Graphiti | Python; Neo4j or FalkorDB; an OpenAI key by default                             |
| Khoj     | Server, Postgres with pgvector, code sandbox, SearxNG                           |
| Dify     | About ten containers plus a vector database                                     |

A live Gemini call has the same problem. Google's guidance is never to expose an
API key client-side, and a static nginx bundle has nowhere to hide one.

## How The Simulation Works

### Stages

Use the funnel from the [project README](/docs/README.md): booking, loan
application, Letter of Offer, SPA signed, loan agreement and disbursement, plus
cancelled and lapsed as exits. Conversion means reaching SPA signed.

Follow the concept's case model:

- **Separate Tracks:** loan progress and legal progress are separate tracks that
  can overlap.
- **Several Applications:** a booking can hold one to three bank applications.
  One rejection does not fail the booking.
- **Unknown Is Visible:** a booking with no recent evidence shows as unknown,
  never as progressing or failed.

### Generator

- **Method:** a stage-transition Monte Carlo. For each booking, draw the next
  outcome and a dwell time at every stage, and emit dated events. Full
  discrete-event simulation only pays off when modelling shared capacity such as
  a banker's queue, which is roadmap.
- **Random Numbers:** a seeded generator, either an inline `sfc32` or
  `mulberry32` or the `pure-rand` package. The same seed gives the same data,
  and the seed is shown on screen. Skip SimJS (last stable release 2012) and
  `seedrandom` (last published 2019).
- **Names And Places:** skip `@faker-js/faker`. It has no Malaysian locale and
  the full package is over 5 MiB minified. Hand-write short lists of Malay,
  Chinese and Indian names, a fictional project, fictional panel banks and
  fictional law firms.
- **Size And Date:** about 150 bookings against a fixed reference date, so
  screenshots match the pitch video.
- **Output:** one event log. Every screen, including "as of" views, derives from
  it.
- **Event Fields:** when it happened, when the system learned of it, who
  reported it, who verified it, and whether it is confirmed, provisional,
  disputed or superseded.

### Forecast And Backtest

- **Horizon:** 30 days from booking, the success number in the
  [project README](/docs/README.md). A booking signing on day 31 counts as a
  miss.
- **Stage Rate:** bookings that signed within the horizon, divided by resolved
  bookings that reached that stage, counting only cases resolved before the
  forecast date.
- **Small Samples:** give each rate a Wilson or Jeffreys interval. Brown, Cai
  and DasGupta (2001) recommend these for samples of 40 or fewer; the textbook
  Wald interval is unreliable there.
- **Expected Signings:** the sum of each live booking's probability. Give a
  range from repeated random draws of those bookings' outcomes.
- **Backtest:** cut the event log at a past date, estimate rates only from what
  was known then, forecast the following 30 days, and compare with what the
  simulation produced. Report the Brier score and a small table of predicted
  against observed signing rates.
- **Caveat:** a backtest on data the simulator produced proves the code works,
  not that the business behaves this way. Say so on screen.

### Messages And Proposed Updates

- **Fixtures:** 20 to 40 WhatsApp-style messages in English, Malay, Chinese and
  Manglish, each with its extracted update already attached, committed as JSON.
- **Review Step:** the case page shows each extraction as proposed. Staff
  confirm, dispute or dismiss it. This is the concept's human verification step,
  with no model running during the demo.
- **Offline Generation:** if an LLM writes the fixtures, prompt it with invented
  details only. Gemini's free tier may use submitted content to improve Google
  products, and human reviewers may read it.

### Playbook Search

- **Index:** MiniSearch over 20 to 50 playbook records, using the concept's
  knowledge-record fields: situation, evidence, action and rationale, limits,
  outcome, ownership and status.
- **Across Languages:** add hand-written synonyms so a Malay or Manglish query
  finds an English record, such as "slip gaji" for payslip and "LO" for Letter
  of Offer.
- **Later:** Orama supports hybrid keyword and vector search in the browser, but
  a multilingual embedding model such as `multilingual-e5-small` is about 118 MB
  even quantized.

## Seed Values

Each value is tagged **Official** (statute, BNM, court), **Industry** (press,
associations, surveys) or **Anecdotal** (buyer guides). Anything without a
source is an assumption and belongs on the in-app assumptions panel.

| Parameter                                   | Value                                            | Tag                | Source                   |
| ------------------------------------------- | ------------------------------------------------ | ------------------ | ------------------------ |
| Bank decision, complete documents           | 2–9 working days; rejections in 1–2 days         | Industry           | ABM, Oct 2017            |
| Booking to SPA, typical                     | 14–21 days                                       | Anecdotal          | Buyer guides             |
| Booking to SPA, documented case             | About 64 days                                    | Official           | _PJD Regency_ facts      |
| Residential loans approved ÷ applied, value | 42.1% (2024), 41.1% (2025), 38.9% (Jan–Jul 2026) | Official           | BNM tables 1.10 and 1.12 |
| Approval by number of applications          | About 74%                                        | Official           | BNM and ABM, 2016–17     |
| Rejection, RM500k–700k price band           | 31–45%, average 38%                              | Industry           | REHDA survey, 2H2025     |
| Developer take-up rate                      | 21% (2H2025), 38% (1H2025)                       | Industry           | REHDA survey, 2H2025     |
| Margin of financing                         | 70% cap from the third home; about 90% before it | Official, Industry | BNM, Nov 2010; press     |
| Maximum loan tenure                         | 35 years                                         | Official           | BNM, Jul 2013            |
| Debt service ratio                          | Instalments at most 40% of gross income          | Industry           | ABM, 2017                |
| Booking-to-SPA conversion rate              | No public figure exists                          | Assumption         | Assumptions panel        |
| Bank applications per booking               | One to three                                     | Assumption         | Assumptions panel        |

Reading the loan figures:

- **Value Ratio Is Not A Buyer Rate:** BNM's ratio divides a month's approvals
  by that month's applications, by value. Buyers apply at several banks, so it
  overstates rejection per buyer.
- **Per-Application Default:** set approval per application between the REHDA
  band (55–69% approved) and the older by-number figure (74%), and let the user
  change it.
- **Rejection Reasons:** REHDA lists income ineligibility, adverse credit
  history and inadequate documents. No official percentage breakdown exists.
- **Do Not Use:** "about 60% of B40 and M40 applications rejected" traces only
  to a secondary paper and is probably a misreading of the value ratio.

## Legal And Domain Notes

- **Booking Fees:** in Peninsular Malaysia, regulation 11(2) of the Housing
  Development (Control and Licensing) Regulations 1989, as amended in 2015,
  forbids collecting any payment the contract of sale does not provide for. Fees
  are still collected in practice, usually 2–3%. Sarawak's 2014 regulations
  carry the same ban. Sabah's 2008 rules allow up to 2.5%, from a 2011 reference
  copy; later amendments are unverified.
- **Late-Delivery Clock:** the Federal Court in _PJD Regency_ (19 January 2021)
  held that late-delivery damages run from the booking-fee date, not the SPA
  date.
- **No Statutory Deadline:** no law sets a time between booking and SPA, so the
  simulation should not model one. Any cut-off is developer policy.
- **Pending Reform:** on 8 May 2026 KPKT said it is studying an "Option to
  Purchase" clause in a Real Property Development Bill. It is a proposal, not
  law.
- **Rejected Before The SPA:** refunds follow developer policy. Mah Sing, for
  example, asks for two bank rejection letters, refunds within 30 calendar days
  and keeps an administration charge.
- **Rejected After The SPA:** under Schedule H clause 5(3) (2002 text), a buyer
  who proves income ineligibility owes 1% of the price and the developer refunds
  the rest within 21 days.
- **SPA Payment:** 10% is due on signing, less any booking fee.
- **Panels:** panel bankers at the sales gallery and panel solicitors are
  standard practice.

## Synthetic Data And PDPA

Fully invented, rule-generated records describe no identifiable person, so they
are not personal data. Re-identification risk only arises when synthetic data is
derived from real records.

- **No Real Seeds:** never derive the generator's values from a company
  spreadsheet.
- **Keep `/import` Clean:** load no real files during the demo.
- **Obviously Fake Identifiers:** IC and phone numbers that could not be real.
- **Fictional Names:** a fictional developer, project, banks and law firms, with
  no real logos.

The Personal Data Protection (Amendment) Act 2024 came into force in phases
during 2025. It added breach notification to the Commissioner within 72 hours, a
mandatory data protection officer, a right to data portability and a new test
for cross-border transfers. Guidelines issued in May 2026 cover impact
assessments, privacy by design and automated decision-making, which will apply
once the forecast scores real buyers.

## Presenting Simulated Numbers

- **Label Every Screen:** show "Simulated data" and the seed.
- **Show Assumptions:** an editable panel with each rate marked as a placeholder
  to calibrate on company data.
- **Re-Run Live:** change the seed during the demo to show the spread.
- **Mechanism, Not Impact:** present the simulation as how the system works.
  Never quote a simulated uplift as business impact.
- **Precedent:** Columbia's MortarBench evaluates mortgage-origination agents
  entirely on synthetic loan files.

## First Build

Two developers, split so neither blocks the other:

- **Developer A:** the generator, stage rates, forecast and backtest in
  `@mortar/core` with Vitest tests, then the forecast card on `/forecast`.
- **Developer B:** the message fixtures and proposed-update review on
  `/bookings/:id`, tasks with owners on `/chase`, and the playbook search.

## Open Questions

1.  Which playbook records do we write first, and who reviews them?
1.  Which seed values should the
    [practitioner interview](/docs/source/interview.md) replace once its
    findings are recorded?

## See Also

- [Company-brain concept](README.md): the platform this simulation demonstrates.
- [Problem statement](/docs/source/problem-statement.md): the Chin Hin challenge
  brief.
- [Practitioner interview](/docs/source/interview.md): field notes that will
  replace assumptions.

## Sources

Tools and libraries:

- [GBrain company-brain tutorial](https://github.com/garrytan/gbrain/blob/master/docs/tutorials/company-brain.md)
- [Onyx resourcing](https://docs.onyx.app/deployment/getting_started/resourcing)
- [RAGFlow](https://github.com/infiniflow/ragflow)
- [Graphiti](https://github.com/getzep/graphiti)
- [Microsoft GraphRAG](https://github.com/microsoft/graphrag)
- [Dify licence](https://github.com/langgenius/dify/blob/main/LICENSE)
- [pure-rand](https://github.com/dubzzz/pure-rand)
- [Faker localization](https://fakerjs.dev/guide/localization.html)
- [MiniSearch](https://github.com/lucaong/minisearch)
- [Orama](https://github.com/oramasearch/orama)
- [Binomial interval estimation (Brown, Cai, DasGupta)](http://www-stat.wharton.upenn.edu/~tcai/paper/html/Binomial-StatSci.html)
- [Gemini API terms](https://ai.google.dev/gemini-api/terms)
- [Gemini API key guidance](https://ai.google.dev/gemini-api/docs/api-key)
- [MortarBench](https://arxiv.org/abs/2606.19416)

Malaysian property and loans:

- [BNM table 1.10](https://www.bnm.gov.my/documents/20124/22857146/1.10.xlsx)
  and [table 1.12](https://www.bnm.gov.my/documents/20124/22857146/1.12.xlsx)
- [ABM on loan processing times](https://www.abm.org.my/press-releases/commercial-banks-housing-loan-applications-processed-on-timely-basis/)
- [REHDA 2H2025 survey (Malay Mail)](https://malaymail.com/news/malaysia/2026/03/13/financing-hurdles-bite-hard-as-malaysians-face-rising-loan-rejections-slowing-property-sales-rehda-warns/212485)
- [BNM 2010 property measures](https://www.bnm.gov.my/-/measures-in-promoting-a-stable-and-sustainable-property-market-and-sound-financial-and-debt-management-of-households)
- [Booking fees and regulation 11(2) (EdgeProp)](https://www.edgeprop.my/content/1895670/booking-fees-legalising-prohibited)
- [_PJD Regency_ commentary](https://ganlaw.my/2021/02/02/housing-developers-beware-the-aftermath-of-pjd-regency-sdn-bhd-v-tribunal-tuntutan-pembeli-rumah-anor/)
- [_PJD Regency_ dates (The Edge)](https://theedgemalaysia.com/article/date-booking-fees-deemed-start-late-delivery-charges-will-force-developers-review-their)
- [Schedule H, 2002 text](https://www.hba.org.my/laws/housing_reg/2002/Schedule_H.pdf)
- [Mah Sing booking FAQ](https://www.mahsing.com.my/frequently-asked-questions/booking-payment/)
- [PDPA amendments (DFDL)](https://www.dfdl.com/insights/legal-and-tax-updates/malaysia-implementation-of-the-personal-data-protection-amendment-act-2024/)
- [May 2026 PDPC guidelines (Baker McKenzie)](https://www.bakermckenzie.com/en/insight/publications/2026/05/malaysia-new-personal-data-protection-guidelines)
