# Feature Ideas

Features proposed for Mortar that are written up but not built. They were first
set out in PR #46, in a product suggestions document and a project status
report, and none of them is in the prototype yet.

Each idea keeps a person in charge of the decision, as the PRD requires: Mortar
drafts, flags and counts, and staff approve. The figures are the proposals' own
worked examples, and each table states what a figure rests on.

Contents:

1.  [Early Financing Eligibility Check](#early-financing-eligibility-check)
1.  [Learned Durations And On-Time Follow-Ups](#learned-durations-and-on-time-follow-ups)
1.  [48-Hour Clean Exit](#48-hour-clean-exit)
1.  [LAD Burn Clock](#lad-burn-clock)
1.  [Mortgage Rescue Engine](#mortgage-rescue-engine)
1.  [See Also](#see-also)

## Early Financing Eligibility Check

**The Problem:** Mortar works out an advisory financing-risk flag for every
booking (PRD FR-3), but staff see it only after the booking is saved. In the
[practitioner survey](/docs/research/practitioner-survey/README.md), four of
five respondents chose an early eligibility check as the most helpful
improvement.

**The Idea:** Show the debt service ratio, the margin of financing and the risk
level while a booking is being entered. That covers Add Booking, the typed-in
booking table and the review step of a sheet import.

**The Boundary:** The check stays advisory. The PRD rules out stricter
pre-qualification that would slow a launch, so the flag prompts a follow-up and
never blocks a booking.

## Learned Durations And On-Time Follow-Ups

**The Problem:** Mortar flags a stall with the same fixed threshold for every
bank, law firm and buyer. The defaults are 9 working days for a bank decision
and 5 days for an outstanding document, set in the Assumptions panel.

**The Idea:** Learn typical durations from resolved cases instead, per panel
bank, per law firm and per type of buyer. The median becomes the expected
duration, and the 80th percentile marks the point where a case counts as late.

**How It Would Work:**

- **Expected Dates:** Each active case shows an expected date for its next
  milestone, and whether it is on track or overdue.
- **On-Time Follow-Ups:** A case that passes its learned threshold rises to the
  top of the chase queue with a drafted follow-up, which staff review and send
  themselves.
- **Partner Speed:** A management view compares how quickly each bank decides
  and how quickly each law firm completes SPAs.

## 48-Hour Clean Exit

**The Problem:** A booking that has clearly failed can stay open for weeks
before anyone records the cancellation, which keeps its unit off the market. The
proposal blames a reluctance to record cancellations that affect commission, and
slow refund paperwork.

**The Idea:** Flag a booking for exit once every recovery path has failed, and
let one staff approval close it within 48 hours.

**How It Would Work:**

- **Exit Triggers:** Two panel bank rejections with no guarantor, a formal
  withdrawal by the buyer, or 30 days without an active loan application.
- **One-Approval Exit:** The approval drafts the cancellation letter and the
  refund memo, then returns the unit to sale.
- **Waitlist Match:** If buyers are waiting for that type of unit, Sales Admin
  gets an alert.

| Figure                                                 | Value     | Rests On                                         |
| ------------------------------------------------------ | --------- | ------------------------------------------------ |
| Interest on a RM600,000 unit held for 60 days          | RM6,904   | An assumed bridging rate of 7% a year            |
| The same cost across 50 failed bookings                | RM345,200 | An assumed 200-unit launch with 25% fall-through |
| Launch enquiries that arrive in the first 30 days      | Over 65%  | Credited to REHDA, with no report named          |
| Extra cost of re-selling a unit at week 12, not week 2 | 2.5 times | Credited to REHDA, with no report named          |

**Sources:** None of these figures has a published source yet. The REHDA figures
need a named report, and the bridging rate should come from the developer's own
finance team.

## LAD Burn Clock

**The Problem:** In _PJD Regency_ (2021), the Federal Court held that
late-delivery damages run from the date the booking fee is paid, not the SPA
date. The PRD covers the ruling under Statutory And Legal Constraints. Every day
a booking waits for its SPA therefore uses up part of the statutory delivery
period, which is 36 months for a strata unit.

**The Idea:** Show each case's exposure on the Legal desk and in the case
header.

**How It Would Work:**

- **Window Used:** Days since the booking fee was paid, shown as a share of the
  delivery period.
- **Daily Exposure:** The damages that would accrue for each day of late
  delivery, at 10% a year of the purchase price.
- **Escalation:** A case with an approved loan and no signed SPA after 14 days
  alerts Legal Admin and the general manager.

| Figure                                           | Value    | Rests On                                     |
| ------------------------------------------------ | -------- | -------------------------------------------- |
| Daily exposure on a RM600,000 unit               | RM164.38 | The 10% a year LAD rate, on an assumed price |
| Share of a 36-month period used by a 60-day wait | 5.5%     | 60 of about 1,096 days                       |

**Care Needed:** The ruling rests on booking fees being unlawful under
Regulation 11(2), so showing this clock to a developer needs careful wording and
a lawyer's review.

## Mortgage Rescue Engine

**The Problem:** A loan rejection often ends a booking, even when the buyer
could still qualify another way. The proposal credits REHDA with rejection rates
of 40% to 45% for homes priced from RM500,000 to RM700,000, without naming a
report.

**The Idea:** Treat a rejection as a case to rescue. When a bank rejects a
buyer, Jev reads the reason and proposes a route back, and Loan Admin decides
whether to take it.

**How It Would Work:**

- **Unverifiable Income:** Buyers without formal income records, such as gig
  workers or the self-employed, go to the government's SJKP guarantee scheme
  with its alternative document list.
- **Debt Service Ratio Too High:** Buyers rejected on affordability are matched
  to step-up financing, which starts with lower instalments.
- **Resubmission Pack:** A card on the chase desk prepares the documents for
  resubmission.

| Figure                                            | Value           | Rests On                                   |
| ------------------------------------------------- | --------------- | ------------------------------------------ |
| Instalment on RM540,000 over 30 years at 4.2%     | RM2,640 a month | Standard amortisation                      |
| Interest-only instalment for the first five years | RM1,890 a month | A step-up structure, 28.4% lower           |
| Debt service ratio before and after               | 48% to 34.3%    | An implied income of about RM5,500 a month |

## See Also

- The [PRD](/docs/PRD.md) lists what the prototype leaves out of scope, and the
  questions still open.
- The [product overview](/docs/PRODUCT.md) sets out the production roadmap and
  the 12-week pilot.
- The [practitioner survey](/docs/research/practitioner-survey/README.md) holds
  the evidence behind the eligibility check.
