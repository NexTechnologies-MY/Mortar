# Mortar Brief

Mortar is our entry to YEI 3.0, answering a challenge that Chin Hin Group set on
the Kabel DXP platform. This brief covers the competition, the challenge in the
sponsor's own words, a plain-language reading of it, how Mortar answers it, and
the evidence rules we work under.

From Problem Overview to How Do You Know It Worked?, the headings, bold labels
and short lead-in sentences are ours, while the challenge text itself is quoted
word for word. The two sections after it are entirely our own words.

Contents:

1.  [The Competition](#the-competition)
1.  [Problem Overview](#problem-overview)
1.  [Your Mission](#your-mission)
1.  [Tension](#tension)
1.  [Constraints](#constraints)
1.  [How Do You Know It Worked?](#how-do-you-know-it-worked)
1.  [The Challenge In Plain Terms](#the-challenge-in-plain-terms)
1.  [How Mortar Answers The Brief](#how-mortar-answers-the-brief)
1.  [The Practitioner Interview](#the-practitioner-interview)
1.  [See Also](#see-also)

## The Competition

The competition is YEI 3.0: Youth Innovation Sandbox, run on the Kabel DXP
platform. The challenge is titled "Property Booking Conversion Intelligence". It
was set by Chin Hin Group, a construction and property development group.

### Competition Rounds

The table below lists the rounds the team has reached so far.

| Round         | What It Asks For                                                          | Status      |
| ------------- | ------------------------------------------------------------------------- | ----------- |
| Qualification | Proposal PDF and a 3 to 5 minute pitch video by Sunday, 20 September 2026 | Passed      |
| Preliminary   | Project refinement and a pitch to Chin Hin Group in early October 2026    | In Progress |

The team is currently in the preliminary round. This stage is about refining
what the team already built and getting it ready for the pitch to Chin Hin Group
in early October 2026.

## Problem Overview

### What Happens After A Launch

A property project launches. Sales books [X] units in the first month, and the
launch is reported as a success.

However, over the following months, a meaningful share of those bookings never
converts to a signed Sale and Purchase Agreement (SPA). The buyer's loan may be
rejected, the buyer may withdraw, paperwork may stall, or the case may sit with
a panel banker and quietly die.

### What A Stalled Booking Costs

Each booking can hold a unit off the market for [six to twelve] weeks. During
this period, it also consumes marketing spend, agent commission accruals, and
legal panel time.

When the unit is eventually re-released, it may be at a point in the campaign
where the buyer profile has changed and the original pricing logic no longer
holds.

### Why Nobody Can See It Today

Currently, nobody in the group can clearly tell, for a live project, how many
booked units are likely to convert to signed SPAs. The Sales team knows which
cases feel shaky, Credit and Loan Administration know which bankers are slow,
and Legal knows which cases have been sitting.

However, these teams do not share a single view of the booking-to-SPA conversion
process, while the developer's cash flow forecast is built on bookings.

**About The Brackets:** The square brackets around `[X]` and `[six to twelve]`
appear in the original brief, which leaves those values unstated.

## Your Mission

The brief frames the mission as a single question.

> How might you improve booking-to-SPA conversion and give the business a
> clearer view of which bookings are likely to convert?

### What The Brief Asks Us To Deliver

The brief outlines seven specific deliverables that the team must address.

- **Rank The Causes:** Identify what is actually causing booking leakage, in
  order of size, and demonstrate how you know rather than guess.
- **Find Where Bookings Stall:** Analyse where bookings are getting stuck or
  lost, such as loan rejection, buyer withdrawal, paperwork delays, or slow bank
  processing.
- **Propose A Measurable Change:** Propose at least one practical change with a
  measurable number attached, such as units recovered, weeks of inventory
  released, or cash brought forward.
- **Show The Derivation:** Show how you derived the expected impact of the
  proposed change.
- **Join Up The Three Teams:** Demonstrate how Sales, Credit/Loan
  Administration, and Legal information could be brought together to provide a
  clearer view of live bookings and expected conversion.
- **Place AI Honestly:** Identify where AI genuinely helps in an environment
  where information sits across structured systems, WhatsApp conversations,
  scanned documents, and the knowledge of loan administration staff — and where
  using AI may be premature.
- **Build Something Usable:** Build the component or solution you propose and
  bring it working, as something a Sales Administration Executive could actually
  use in their day-to-day work.

## Tension

The brief names two perspectives that pull against each other. It asks for an
answer that respects both.

### The Sales View

Sales does not control bank credit decisions and may be concerned that stricter
buyer pre-qualification could reduce the number of bookings and affect launch
momentum.

### The Finance View

Finance views a booking that does not convert as not being a sale, while it
still consumes inventory, marketing resources, and other costs. Forecasting cash
based on bookings therefore creates a risk of forecasting from a number that is
known to be unreliable.

### The Balance To Strike

The challenge is not to make one team the problem, but to find a practical way
to address both perspectives.

## Constraints

The brief sets firm limits on time, resources and authority.

- **Time And Resources:** 12 weeks. No new CRM, no consultant, no vendor.
- **Authority:** You have no authority over the sales director, the panel
  bankers, or the panel solicitors — and two of those three do not work for us
  at all.
- **Ownership:** Whatever exists at the end of the first fortnight, you built
  yourself.

## How Do You Know It Worked?

The brief defines success as a single number.

- **One Number:** Success should be measured through one number that can be read
  within one quarter.
- **A Real Outcome:** It must represent a real business outcome, behaviour, or
  cash movement — not a dashboard or a report that someone has to open.

## The Challenge In Plain Terms

This section restates the brief in our own words for anyone new to the project.
The quoted sections above remain the source of truth.

### The Core Problem

A booking is a promise to buy, not a sale, yet the developer forecasts cash as
if it were one. The real sale is the signed SPA, often weeks later, and nobody
watches the whole gap between the two.

### Where Bookings Leak

Each step between booking and SPA has a different owner, and two of them work
outside the developer.

```text
Booking ──► Loan Applications ──► Letter Of Offer ──► SPA Signed
 Sales       Loan Admin            Panel Banker         Legal And Panel
                                   (External)           Solicitor (External)
```

A booking can fail at any step. Loan rejection is the cause practitioners name
most, followed by buyer withdrawal and incomplete documents. Other cases sit
with a slow banker or solicitor until they quietly die.

### Why Nobody Can See It

Each team holds part of the picture, and nothing joins the parts together.

| Team       | What It Knows                 | Where That Knowledge Lives             |
| ---------- | ----------------------------- | -------------------------------------- |
| Sales      | Which buyers feel shaky       | Agents' memory and WhatsApp            |
| Loan Admin | Which bankers are slow        | WhatsApp, spreadsheets and bank emails |
| Legal      | Which cases have been sitting | Correspondence with panel law firms    |

So no one can say how many live bookings will actually sign. That missing view
is the "intelligence" in the challenge title.

### Why The Obvious Fix Fails

Screening buyers harder before booking looks like the answer, and most surveyed
practitioners want an early financing check. But Sales resists any gate that
slows a launch, and the brief rules out making one team the problem. The answer
must manage bookings better after they happen, not block them.

### What The Constraints Rule Out

- **No New CRM:** the tool works beside existing systems, fed by spreadsheet
  import.
- **No Authority Over Banks Or Solicitors:** the tool is for our own staff to
  chase them, not for them to use.
- **Messy Evidence:** information arrives through WhatsApp, scans and staff
  memory, so AI can read it and propose updates while people confirm them.

## How Mortar Answers The Brief

### Not A Buyer Screening Tool

Mortar is often misread as a tool that predicts which buyers will pull out. A
prediction alone changes nothing. Mortar accepts every booking, watches it until
it signs or fails, and prompts action when it starts to slip.

Knowing a booking is at risk leads to one of three outcomes.

| Outcome           | What Mortar Provides                                                                   | Who Benefits           |
| ----------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| Save It           | The stall reason in plain words, a suggested next action, an owned task and a playbook | Sales and Loan Admin   |
| Release It        | Persistent stalls surfaced early, so an executive can cancel and resell the unit       | Inventory and pricing  |
| Count It Honestly | A forecast that weights each booking by its stage's conversion rate, not face value    | Finance and management |

The only screening is an advisory financing-risk chip on each booking, based on
the debt service ratio and margin of financing. It says "watch this one
closely", never "reject".

### A Day In Mortar

Each persona starts on its own desk and works one part of the same case record.

| Who                  | Starts On   | Daily Loop                                                                                          |
| -------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| Intake               | `/import`   | Load bookings from the existing spreadsheet or system export, each becoming a case with a risk chip |
| Sales Admin          | `/chase`    | Work only the cases that need a person today, create a task, follow the playbook, message the buyer |
| Loan Admin           | `/bookings` | Track up to three bank applications per booking and chase any undecided past the bank's window      |
| Legal Admin          | `/legal`    | Clear approved loans without a signed SPA, oldest first, split into never scheduled and unsigned    |
| Finance / Management | `/forecast` | Read expected SPAs from live bookings, weighted by stage                                            |

When a buyer or banker replies, staff paste the message into the case. AI
proposes what it means, such as "payslip received", and nothing becomes a fact
until a person confirms it. The loop is: booking, stall detected, case chased,
then either saved or released early, with the forecast updating as cases move.

The [product overview](/docs/PRODUCT.md#how-it-works-in-one-flow) follows one
booking through this loop step by step.

### The Brief's Deliverables, Mapped

| Brief Asks For              | Mortar's Answer                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Rank The Causes             | Practitioner survey and industry research, ranked with counts                       |
| Find Where Bookings Stall   | Stage tracking and stall rules on every case                                        |
| Propose A Measurable Change | The daily chase queue, sized with a worked uplift example                           |
| Show The Derivation         | The illustrative impact calculation in the product overview                         |
| Join Up The Three Teams     | One case record with a desk for each of Sales, Loan Admin and Legal                 |
| Place AI Honestly           | AI reads messages and proposes updates, people confirm, the forecast is statistical |
| Build Something Usable      | Today, the Sales Admin's home screen                                                |
| One Number                  | The 30-day verified SPA rate                                                        |

## The Practitioner Interview

[The interview template](/docs/source/interview.md) holds field notes from one
industry practitioner, and those notes were meant to serve as evidence for the
proposal. The interview runs over WhatsApp, by text or voice note. The
practitioner stays anonymous throughout.

### Interview Ground Rules

The template sets four ground rules for how the interview is recorded and cited.

- **Citation:** Cite the practitioner only as "property development
  practitioner, Penang, 20+ years". Never name the person or their company.
- **Figures:** Record no confidential figures. Rough ranges and "usually"
  answers are fine.
- **Recording:** Record each answer verbatim first, then interpret it under
  Notes.
- **Tagging:** Tag every number as `interview`, `public` or `assumption`. The
  `public` tag covers BNM and NAPIC figures.

### Interview Questions

The template asks six questions, quoted here exactly as written.

| No. | Topic                          | Question                                                                                                                                      |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Conversion And Timing          | Out of 10 bookings, roughly how many end up signing the SPA? Usually how long from booking to SPA?                                            |
| 2   | Why Bookings Fail              | Top 3 reasons bookings fail? (loan rejected, buyer backs out, documents stuck, bank slow, valuation too low, others)                          |
| 3   | Tracking And Who Notices First | Where is booking status tracked (system, Excel, WhatsApp groups)? When a case gets stuck, who notices first: sales, loan admin or the lawyer? |
| 4   | Cancellation And Booking Fee   | After how long do you cancel a stuck booking and release the unit? Is the booking fee refunded if the loan is rejected?                       |
| 5   | Loan Pre-Check Before Booking  | Do you check the buyer's loan eligibility before accepting a booking? Why or why not?                                                         |
| 6   | What The Forecast Counts       | Does management forecast cash from bookings or from signed SPAs?                                                                              |

### What The Interview Should Produce

The template ends with two findings tables, a list of implications and a list of
follow-ups.

The first table ranks the top three causes of failed bookings. Each row records
the cause, its share of failed bookings, the evidence behind it and the source.

The second table records six key numbers, each with its value and source tag:

- The booking to SPA conversion rate
- The typical number of days from booking to SPA
- The number of days before a stuck booking is released
- The booking fee and its refund policy
- The number of banks each buyer applies to
- Whether the forecast counts bookings or signed SPAs

The implications list records what the findings mean for Mortar. The follow-ups
list records anything that still needs checking after the session.

### Where The Interview Stands

As of 27 September 2026, the team has no property sales practitioner available
to interview, so the template will stay blank through the preliminary round and
no figure in the proposal cites it. The product documents draw their evidence
from industry research, an anonymous
[practitioner survey](/docs/research/practitioner-survey/README.md) of eight
respondents, and public regulatory data.

## See Also

The following documents provide additional context, requirements and research
for the Mortar project.

- The [problem statement](/docs/source/problem-statement.md) contains the
  challenge, transcribed verbatim from the Kabel DXP project page.
- The [practitioner interview template](/docs/source/interview.md) provides the
  field note structure and ground rules for practitioner interviews.
- The [product overview](/docs/PRODUCT.md) covers the operational problem, the
  user personas and what Mortar does.
- The [product requirements document](/docs/PRD.md) details the functional
  requirements and acceptance criteria for the application.
- The [technical requirements document](/docs/TRD.md) outlines the system
  architecture, data model and APIs.
- The [design guide](/docs/DESIGN.md) describes the design system that every
  screen follows.
- The [project notes](/docs/agents/notes.md) give a file map, recipes and known
  gotchas for working in the code.
- The [practitioner survey](/docs/research/practitioner-survey/README.md)
  presents the findings of the anonymous practitioner survey of eight
  respondents.
