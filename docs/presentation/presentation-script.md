# Mortar: 30-Minute Presentation Script

Prepared for the NexTechnologies-MY/Mortar project, 28 September 2026. You are
the main presenter. This is one universal script: anyone joining the
presentation should learn the complete argument and workflow.

**Timing:** 30 minutes of presentation. Questions follow afterward. **Use:**
rehearse the wording, then speak from the short cue sheet. Do not read the
slides. Time includes operating the prototype, pauses and transitions.

**Presentation pages:** use `presentation.html` or `presentation-slides.pdf`
from this folder. The page numbers below refer to that new companion deck, not
the older 20-page qualification deck in the repository. The mapping to the older
deck is at the end of this document.

**Working prototype:** [Mortar on Render](https://mortar-d18f.onrender.com). All
demo buyers, projects and banks are synthetic. Aster Heights is a demo project,
not a verified Chin Hin development.

## Agenda And Timing

| Time        | Page                              | Topic                         | Purpose                                            |
| ----------- | --------------------------------- | ----------------------------- | -------------------------------------------------- |
| 00:00–01:00 | 1                                 | Business opening              | Establish the outcome                              |
| 01:00–01:30 | 2                                 | Agenda                        | Explain the route through the presentation         |
| 01:30–04:00 | 3                                 | Chin Hin company context      | Connect the solution to this business              |
| 04:00–06:00 | 4                                 | Evidence and unknowns         | Explain what we know and how we know               |
| 06:00–07:30 | 5                                 | Before: current workflow      | Show the operational gap                           |
| 07:30–09:30 | 6                                 | Our solution logic            | Explain how Mortar causes action                   |
| 09:30–10:15 | 7 → prototype `/settings`         | Demo boundaries               | Identify synthetic data and current state          |
| 10:15–12:15 | 8 → prototype `/chase`            | Daily work and task ownership | Demonstrate the first operational action           |
| 12:15–16:15 | 9 → prototype `/bookings/BK-9001` | Critical working workflow     | Confirm a blocker, record receipt, show the change |
| 16:15–18:00 | 10                                | Before and after              | Explain exactly what improved                      |
| 18:00–19:30 | 11 → prototype `/legal`           | Legal handoff                 | Demonstrate the next department's work             |
| 19:30–21:00 | 12 → prototype `/manager`         | Management intervention       | Show accountable escalation                        |
| 21:00–23:00 | 13 → prototype `/forecast`        | Forecast and uncertainty      | Explain what Finance can use                       |
| 23:00–24:00 | 14                                | Technology second             | Explain reliability after demonstrating value      |
| 24:00–26:00 | 15                                | Impact and measurement        | Derive an example without claiming results         |
| 26:00–28:00 | 16 → prototype `/import`          | Adoption                      | Show how daily use starts and continues            |
| 28:00–29:15 | 17                                | Built, proposed and unproven  | Make the prototype's maturity clear                |
| 29:15–30:00 | 18                                | Close and request             | Ask for a concrete pilot decision                  |

## 01 — Business Opening

**Time:** 00:00–01:00. **Screen:** page 1, “A booking is a promise. A verified
SPA is a conversion.” **Cue:** unit held → action → verified outcome.

**Say:**

“Imagine a project launches and the booking numbers look strong. Behind one of
those bookings, the bank is still waiting for the buyer's latest payslips. Sales
knows the buyer is interested. Loan Administration knows the file is incomplete.
Legal is waiting for the case to reach them.

The business question is very practical: who takes the next action, and how do
we know the booking actually moved forward?

We built Mortar to help the developer follow a booking through to a verified
Sale and Purchase Agreement, or identify a case that needs an authorised release
decision. Today I will show the working sequence: a blocker, an owner, a task,
evidence of what happened, and the resulting change to the case.”

**Delivery:** look at the audience. Pause after “who takes the next action?” Do
not open with the software stack or a list of AI features.

## 02 — Agenda

**Time:** 01:00–01:30. **Screen:** page 2, “Business → workflow → proof →
adoption.”

**Say:**

“I will start with Chin Hin's business context and the evidence behind our
choices. Then we will follow the workflow before and after Mortar, including the
critical steps in the prototype. After that, I will explain the forecast, the
expected impact calculation, and how a twelve-week pilot could be adopted.

We have reserved the full thirty minutes for the presentation. Questions can
follow afterward, and we can return to any case or calculation.”

## 03 — Why This Matters To Chin Hin

**Time:** 01:30–04:00. **Screen:** page 3. **Cue:** correct entity → buyer
journey → existing systems → business implication.

**Say:**

“We researched Chin Hin at two levels. Chin Hin Group Berhad is the broader
listed group. Chin Hin Group Property Berhad, or CHGP, is the property business
most directly relevant to this challenge. Figures from those two reporting
entities must be labelled separately.

CHGP's 2025 annual report describes a focus on first-time owners and urban
residential development. It reports approximately RM976.7 million in annual
revenue and RM2.18 billion in unbilled sales at year-end. Those are reported
company figures. They establish the scale and commercial context; they do not
tell us how many unsigned bookings are stuck.

Unbilled sales are contracted sales awaiting future recognition as projects
progress. They are not the same as the unsigned booking pool Mortar addresses.
Likewise, an SPA signing is not receipt of the entire property price.

The company's own first-homebuyer guide puts checking loan options and preparing
documents before signing agreements. That supports focusing on the handoff
between buyer documentation, bank assessment and legal execution.

There is also an important system context. Chin Hin announced a Kingdee ERP
transformation in July 2026. So our integration conversation must start with its
actual operational systems and approved exports. IFCA appears in one
practitioner's survey response; it is not evidence that Chin Hin uses IFCA.

Our interpretation is that Mortar should prove a small, useful follow-up
workflow within that existing environment. The sponsor's brief describes
fragmented booking information, but we have not audited Chin Hin's live files.
We would validate the gap with its staff before deciding where Mortar belongs.

We therefore propose starting with one project and one daily administrator, then
testing whether confirmed follow-up produces more timely, verified SPAs.”

**Evidence:**
[CHGP Annual Report 2025](https://cms.chinhinproperty.com/uploads/WEBSITE_Chin_Hin_Group_Property_Berhad_AR_2025_8757f6df1c.pdf),
printed pp. 2–3;
[first-homebuyer guide](https://chinhinproperty.com/first-homebuyer-guide/);
[One Chin Hin transformation, 29 July 2026](https://www.chinhingroup.com/news/shaping-the-next-chapter-the-one-chin-hin-transformation/).
Read `company-research.md` for the fuller briefing and source distinctions.

## 04 — Evidence, Assumptions And Unknowns

**Time:** 04:00–06:00. **Screen:** page 4. **Cue:** brief ≠ survey ≠ simulation.

**Say:**

“We use four evidence categories. First, the sponsor's challenge brief describes
the problem it wants addressed. Second, official company publications provide
business context. Third, our industry practitioner survey helps us prioritise
what to investigate. Fourth, the prototype uses simulated cases to demonstrate
the mechanics.

The current survey has eight anonymous respondents, collected between the
eighteenth and twenty-second of September. Seven named loan rejection or
insufficient financing as the single biggest leakage cause. All eight placed it
in their top three. Five named bank credit assessment as the stage where cases
get stuck. Seven wanted an earlier financing eligibility check.

This is a small convenience sample with mixed roles. Only one respondent covered
loan administration and legal work. These are counts of respondents, not
percentages of failed Chin Hin bookings. We cannot conclude that seven out of
eight Chin Hin failures are caused by financing.

The practitioner with loan and legal experience prioritised slow bank
processing. That matters: we must test both financing problems and delayed
follow-up, rather than assume one explanation covers every project.

Our own logic is to make financing concerns visible and chase recoverable
blockers early. We cannot overturn a bank's credit decision. We can help staff
complete documents, follow up, review alternative applications and escalate a
genuinely stalled case.

The missing evidence is Chin Hin's actual leakage rate, cause distribution,
staff workload and ordinary follow-up performance. Our pilot is designed to
collect that evidence. The blank interview template is not a completed interview
and we do not cite it as one.”

**Source:** repository `docs/research/practitioner-survey/README.md` and
`docs/source/problem-statement.md`. Say “7 of 8 respondents,” never “87.5% of
Chin Hin's bookings.”

## 05 — Before: The Workflow Gap

**Time:** 06:00–07:30. **Screen:** page 5. **Cue:** update arrives →
responsibility unclear → no verified next move.

**Say:**

“This is the workflow described by the brief, expressed as a concrete case. A
booking exists. The buyer and banker exchange messages. A document request
arrives. Someone has to identify the requirement, decide who should obtain it,
and make sure the reply gets back into the booking record.

When those steps are split across messages and departmental notes, a file can
remain marked ‘with bank’ even though the real next move belongs to the buyer or
an internal administrator. The important detail is who can act now.

The delay continues if no one owns the chase, no due date is set, or a reply is
not recorded. Legal may receive a case late, and management may see a booking
without understanding how much of the conversion journey remains.

This diagram is a model of the challenge, not a measured time-and-motion study
of Chin Hin. We would check it with Sales, Loan Administration and Legal. The
change we propose is to make the next move and its evidence explicit.”

**Action:** trace the diagram with the pointer. Do not introduce invented
current-process timings or say Chin Hin has no existing system.

## 06 — Our Solution Logic

**Time:** 07:30–09:30. **Screen:** page 6. **Cue:** evidence → blocker → owner →
task → confirmation → updated case.

**Say:**

“Mortar starts with a case record for each booking. It tracks loan and legal
events separately, because those activities can overlap. It also keeps bank
applications separate, so one rejected application does not automatically mean
the whole booking has failed.

Our first rule is that confirmed events drive the case state. A proposed
interpretation remains visible for review, but it does not move the milestone.
We retain when an event happened, when it was recorded, who reported it and who
verified it.

Our second rule is to translate the case into the next practical action. If a
document is outstanding, obtain it. If the complete application is waiting on a
bank beyond the configured threshold, chase the banker. If financing is approved
but no appointment is recorded, arrange the signing. If every reasonable
recovery route has ended, bring the case to an authorised person for review.

Our third rule is to turn that action into work with an owner and a due date.
Then the next reply must be recorded and verified. That closes the loop.

AI assists with interpreting short messages and suggesting actions. The business
workflow remains explainable through the event record and the rules. An
administrator can enter an update manually if the AI is unavailable or wrong.

This is our solution logic: finding a case is useful only if somebody takes the
next step and the system can show what happened afterward. We will now
demonstrate that loop on one synthetic booking.”

## 07 — Prepare The Audience For The Demo

**Time:** 09:30–10:15. **Screen:** page 7, then
[Settings](https://mortar-d18f.onrender.com/settings) as **Project Manager**.

**Action:** point to “Simulated Data,” seed and reference date. Do not press Add
Demo Data or Delete Demo Data during the presentation. Switch through the
top-right “Switch persona” menu to **Nurul Aina · Sales Admin** afterward.

**Say:**

“The interface is working software, and the cases are synthetic. This dataset
uses a fixed reference date, the eighteenth of September, so today on the screen
is the demo's day, not the calendar date of this presentation.

The numbers illustrate the workflow and calculation. They do not represent Chin
Hin's records, and they do not prove commercial improvement. The named profiles
demonstrate staff responsibilities and scoped case access; they are not
production identity verification.”

## 08 — Today: A Named Next Action

**Time:** 10:15–12:15. **Screen:** page 8 briefly, then
[Today](https://mortar-d18f.onrender.com/chase) as **Nurul Aina · Sales Admin**.
**Case:** BK-9001, unit A-12-03, Raymond Tan Wei Hong.

**Actions:**

1. Locate BK-9001 by its reference, not its position in the queue.
2. Point to the bank-delay blocker and the default “Call The Banker” action.
3. Point to Jev's alternative: “Ask For The Missing Document Instead.”
4. If the payslip task already exists, point to “Task Open,” owner and due date.
   If it does not, select **Do That Instead** for the document chase and show
   the created task. Use **Create Task** only if its visible action matches the
   task you intend to demonstrate.
5. Click the unit/buyer to open Quick View. Use its full-case link, or navigate
   directly to `/bookings/BK-9001`.

**Say:**

“This is the administrator's daily work. Each case tells us the blocker and the
next step. On Raymond's case, the confirmed record says the bank has not
decided. The default next step is to call the banker.

But there is also a banker message that suggests a more specific issue: missing
payslips. Jev offers that as an alternative. We have deliberately kept the
confirmed state and the proposed interpretation distinct.

Here is the action the system causes: an assigned document chase with a due
date. [If present: This task is already open for Nurul Aina.] [If absent: I
select the document action, and it becomes a task for the responsible staff
member.]

Mortar records the work; the administrator still contacts the buyer through the
existing approved channel. This button is not sending a WhatsApp message to the
buyer.

Now let us inspect the evidence. We can open the case from this queue, so the
administrator does not need to hunt through a separate departmental record.”

**Hold:** allow the audience to read the owner and due date for three seconds.
Current live state on 28 September already contained a BK-9001 payslip task.

## 09 — Critical Workflow: A Message Becomes Confirmed Evidence

**Time:** 12:15–16:15. **Screen:** page 9 briefly, then
[BK-9001](https://mortar-d18f.onrender.com/bookings/BK-9001). Remain **Nurul
Aina · Sales Admin** for the main demonstration.

**Actions and spoken cues:**

1. **Case header and tracks.** Point to “With Bank,” the loan track and the
   unconfirmed Documents Requested event.

   “The bank submission is confirmed. This document request is still a proposal.
   Notice that a confident AI reading has not become a fact.”

2. **Banker message.** Scroll to Kelvin Teo's message containing “latest 3
   months slip gaji.” Read the short relevant phrase, not the whole thread.

   “The banker is asking for the latest three months' payslips. Jev proposes
   Documents Requested, Payslip, Sales. A person reviews that interpretation.”

3. **Confirm request.** Select **Confirm** on that message's proposal. Wait for
   the refreshed case. Point to Payslip Outstanding / the buyer-document wait
   and the now-confirmed event.

   “I confirm the request. The case now reflects the missing document. The next
   action follows the evidence we just accepted.”

   **Pause for three seconds.** This is the first visible proof moment.

4. **Simulated buyer reply.** Select **Paste A Message**. Leave Sender Role as
   **Buyer** and the synthetic buyer name. Paste:

   `Hi Nurul, slip gaji 3 bulan dah saya hantar ke Mei Ling tadi. Dokumen semua lengkap ya.`

   Leave the timestamp on the demo's reference day and select **Add Message**.
   Wait for the proposal; show the source tag, especially if it says cached or
   unavailable.

   “For this demonstration, we simulate the buyer saying the payslips have
   reached Loan Administration. The system reads the reply, but a message
   claiming receipt still needs verification.”

5. **Verify receipt.** When Documents Received / Payslip appears, explain that
   the administrator has checked the receipt with Loan Administration in the
   demo scenario. Select **Confirm**. If the proposal is incorrect, dispute or
   dismiss it and use **Record An Update → Documents Received → Payslip** after
   verifying the simulated receipt. Choose **Apex Bank** when specifying the
   bank's document receipt; save with **Record Update**.

   “In the operating workflow, staff check that the document actually arrived.
   We represent that check here, then confirm the receipt. An AI interpretation
   alone is insufficient.”

6. **Show the changed case.** Return to the header and loan track. The payslip
   should no longer be outstanding. The case still awaits the bank decision.
   Expand **Show Full History** to show the confirming actor and dates.

   “The document blocker has cleared. We have not approved the mortgage. The
   bank still decides. What changed is the evidence, the next responsibility and
   the work required from the administrator.”

   **Pause for three seconds.** This is the second proof moment.

7. **Complete work deliberately.** Show the document task. Select **Complete**
   only when the demonstrated document-chase obligation has been fulfilled.
   Explain that confirming a receipt and completing a task are separate acts.

   “The task is completed after the work is done. The evidence remains in the
   case, so the next administrator can see why the blocker cleared.”

**Between actions, explain:**

“We have shown a complete local loop: identify the issue, assign the chase,
review the request, receive the reply, verify the receipt and update the case.
No bank or solicitor has been required to adopt a new portal.

Notice also that low financing risk did not mean this case was moving well.
Affordability and operational progress are different questions. We need both the
risk flag and the evidence-based workflow.”

**If the initial request is already confirmed:** show the recorded verifier and
continue with the receipt step. **If receipt is already confirmed:** use a
prepared recording of this same sequence or a rehearsed separate synthetic case.
Never pretend that an already-completed transition just happened.

**If AI takes too long:** after roughly ten seconds say, “The manual evidence
path is available while the model responds.” Demonstrate Record An Update. Do
not announce a live AI result when the source tag identifies a fallback.

## 10 — Before And After

**Time:** 16:15–18:00. **Screen:** page 10. Keep the case open in the adjacent
tab.

**Say:**

“Let us compare exactly what changed. Before review, the confirmed case said
‘with bank’, while the more specific document issue existed in a message and an
unconfirmed proposal. After review, the missing payslip became a recorded
blocker with a responsible next action.

Before the receipt was verified, the system could not safely treat the document
as received. After confirmation, the outstanding document cleared and the case
returned to waiting for the bank decision. The confirming person and timestamps
remain available.

We have demonstrated a change in operational state, not a measured reduction in
processing time. We have not shown a recovered sale or a faster bank approval.
Those are outcomes the pilot must measure.

The practical improvement is that the next person does not need to reconstruct
the file from memory. They can see the blocker, the action, the evidence and
what responsibility remains.

That is what the system causes: a specific follow-up and a verified handoff. The
screen is the interface to that behaviour.”

## 11 — Legal: An Approved Loan Still Needs A Signing

**Time:** 18:00–19:30. **Screen:** page 11, then
[Legal](https://mortar-d18f.onrender.com/legal) as **Arvind Raj · Legal Admin**.
Use the top-right persona menu; the current menu includes the person's name.

**Actions:** locate **BK-9006 / A-23A-02 / Chen Jia Hao** under No Appointment
Yet. Select **Record Appointment** to show the preset form. In a prepared
synthetic rehearsal, record the appointment as arranged on 18 September with the
appointment on 19 September, then show it under Appointment Set, Not Signed.
During a shared-demo walkthrough without a prepared state, show the form and
cancel. Say explicitly which demonstration you performed.

**Say:**

“Our first case is still awaiting the bank. This second synthetic case has an
approved loan, but no SPA appointment. It demonstrates the next handoff.

Legal's queue separates cases without an appointment from cases with an
appointment that have not signed. The next action here is to arrange and record
the appointment. The row opens the relevant update directly.

An appointment does not count as a signed SPA. Once Legal verifies execution,
they record the signing, and the case leaves this waiting queue. The business
metric counts that verified execution, not a scheduled date.

We also show panel workload, but the synthetic assignment of firms cannot
establish which real solicitor performs better.”

## 12 — Management: Cause An Internal Follow-Up

**Time:** 19:30–21:00. **Screen:** page 12, then
[Manager](https://mortar-d18f.onrender.com/manager) as **Project Manager ·
Manager**.

**Actions:** open **Suggestions**, then **Why This Case** on an overdue case.
Show **Request Follow-Up From [name]**. In the prepared demo, select it and show
**Follow-Ups Already Sent** or **Awaiting [name]**. Switch to that named
recipient through the persona menu and show the task on `/chase`. Do not click
multiple cases or duplicate an already-sent follow-up.

**Say:**

“The manager sees a cross-department view and the reason for the suggested
intervention. Here the trigger is a wait beyond the configured expectation.
These expectations are prototype settings, not measured service levels for Chin
Hin's banks or solicitors.

The manager's button creates or flags an internal follow-up for the person
responsible for the case. We can then open that person's Today page and see the
work assigned to them. This is a concrete change in accountability.

The word ‘sent’ here means an internal task has been assigned. It does not mean
an external banker received a WhatsApp message. Staff still use their existing
approved communication channels.

Ask MortarAI is available for staff questions, but this presentation's proof is
the case-and-task workflow. An answer is useful when it helps staff inspect the
evidence and choose an appropriate action.”

## 13 — Forecast: Explain The Estimate And Its Limits

**Time:** 21:00–23:00. **Screen:** page 13, then
[Forecast](https://mortar-d18f.onrender.com/forecast) as **Project Manager**.

**Actions:** show expected signings, forecast range and bookings in scope.
Expand **Stage Conversion Rates**, **How Well The Method Backtests** and
**Assumptions**. Read the values actually visible; avoid memorising a demo
number. The inspected state showed approximately 21, range 17–25, 50 bookings.

**Say:**

“Management should not treat every unsigned booking as certain to convert.
Mortar estimates the probability of a verified signing within thirty days of the
original booking date. That is the outcome horizon used here; it is not a
rolling forecast of cash arriving over the next thirty days.

The method looks at resolved cases that reached a similar stage at a similar
booking age. It uses a broader comparison when a narrow group has too few cases.
Then it adds the estimated probabilities across the live bookings. The range
comes from repeated simulated outcomes under those estimates.

Stage rates show the sample size and uncertainty. The accuracy check looks back
using the evidence available at the historical cutoff. It checks the method
against what subsequently happened in the dataset.

There are two limitations. First, the history here is synthetic, so this check
demonstrates the calculation rather than predictive performance on Chin Hin
records. Second, the range reflects the model's assumptions. It does not capture
every source of uncertainty or a market shock affecting many buyers at once.

During a pilot we would calibrate the rates on appropriate company cohorts,
compare against a simple baseline and evaluate held-out outcomes. We would also
reconcile signed SPAs with Legal.

Finance can use that as a more explicit conversion estimate. To estimate cash,
we would additionally need payment schedules, billing milestones and actual
collections. Multiplying expected SPAs by unit prices would not establish cash
brought forward.”

## 14 — Technology Second

**Time:** 23:00–24:00. **Screen:** page 14. **Cue:** one record → shared rules →
human verification → manual continuity.

**Say:**

“Now that the business workflow is visible, here is how we built it. The React
interface presents the desks. A Bun server reads and writes the PostgreSQL case
record. Shared TypeScript rules derive the stages, document blockers,
responsibility and forecast, so the desks use consistent logic.

Jev handles structured interpretation and suggestions. Ask MortarAI is a
separate assistant for staff questions. Confirmed evidence and statistical rules
drive the operational state and forecast.

The server keeps model credentials out of the browser. A cached answer is
labelled, and manual recording remains available. If an interpretation is wrong,
staff can dispute it and record the correct evidence.

The important engineering choice is that the daily workflow can continue without
a successful live model call.”

**Do not claim:** production SSO, a universally reliable three-second response,
automatic WhatsApp ingestion or independent production security approval.

## 15 — Derive The Business Impact

**Time:** 24:00–26:00. **Screen:** page 15. **Cue:** explicit assumption →
calculation → pilot replacement.

**Say:**

“We measure one primary outcome: the share of eligible cohort bookings that
reach a verified signed SPA within thirty days of booking. Eligibility and the
denominator must be defined before the pilot starts, so difficult cases are not
quietly excluded after the result is known.

Here is an illustrative impact calculation, not a claim about Chin Hin. Suppose
an audit identifies forty stalled bookings that could benefit from targeted
follow-up. Suppose ordinary follow-up converts twenty percent within thirty
days, and the assisted workflow converts forty percent.

Forty multiplied by the twenty-percentage-point difference gives eight
additional verified SPAs. At a five-point difference, the same group gives two
additional SPAs. At no difference, it gives none.

If those forty cases belong to a cohort of one hundred bookings, eight
additional signings would increase the whole cohort's rate by eight percentage
points. A twenty-point improvement in a subgroup is not a twenty-point
improvement across the entire cohort.

Every input in this example is an assumption. We replace the eligible case
count, baseline conversion and uplift with observed pilot data.

We also record how quickly unresolved units reach an authorised release decision
and how much staff effort the process requires. These are supporting checks. The
primary result remains verified SPA conversion, with an ordinary follow-up
comparison and a clear observation window.

More dashboard visits would not establish success. More confirmed conversions
would—and a credible comparison would tell us whether Mortar contributed.”

## 16 — How Adoption Actually Starts

**Time:** 26:00–28:00. **Screen:** page 16, then
[Add Bookings](https://mortar-d18f.onrender.com/import) as **Project Manager**
or **Nurul Aina · Sales Admin**. Select **Upload A Sheet** to show intake
without submitting a file during the talk. Keep a rehearsed synthetic sheet
ready if you want to demonstrate row review.

**Say:**

“Adoption begins with existing booking data. The working prototype supports
typed intake and spreadsheet upload with a review step. For the pilot we would
agree the export fields, booking identifiers and reconciliation process with the
existing system owner. We would avoid a second competing master record.

In the first two weeks, one project and one Sales Administrator establish the
baseline. They reconcile a sample of closed cases with Loan Administration and
Legal, identify the main recoverable blocker and agree the first playbooks.

In weeks three and four, the administrator uses the daily queue in a short
morning routine. They choose the next action, contact the relevant party through
existing channels, then record and verify the response. The manager reviews
overdue internal tasks. We measure whether this saves work or adds duplicate
entry.

For the outcome comparison, we propose an intake cohort enrolled between days
fifteen and forty-four, spanning the assisted-queue and live-operation periods.
A comparable group continues ordinary follow-up. Where practical, assignment is
randomised; otherwise, project, buyer mix, booking age and bank conditions need
to be accounted for. We agree the comparison with the sponsor before starting.

Each booking then gets the full thirty-day observation period. That ends by day
seventy-four, with Legal's reconciliation completed by day eighty-four. Weeks
five to eight are the main intervention period; weeks nine to twelve complete
the observation and audit.

Buyers, bankers and solicitors continue using their existing channels. The
internal administrator owns the new routine. We seek integration only after the
pilot shows where manual intake creates a real burden, and in alignment with
Chin Hin's existing transformation programme.”

## 17 — Built, Proposed And Still Unproven

**Time:** 28:00–29:15. **Screen:** page 17. **Cue:** demonstrated mechanism ≠
real-company impact.

**Say:**

“What exists today is the working case record, staff desks, task workflow,
message proposals with human review, manual updates, legal queue, management
follow-up and statistical forecast. The deployment uses synthetic records.

What remains proposed includes live-company calibration, production identity
controls and approved integration with existing operational systems. Automated
WhatsApp ingestion, document OCR and the more ambitious mortgage-rescue ideas
are not part of the workflow we demonstrated.

The unknown is the business effect. We have not measured additional SPAs,
inventory days saved or cash accelerated at Chin Hin. We have also not
established the company's current internal leakage causes or system-level
permissions.

Those boundaries determine the next step: a small, supervised pilot with a known
owner, an agreed comparison and verified outcomes. Every team member should be
able to explain that whole chain, including what the prototype does not yet
prove.”

## 18 — Close And Concrete Request

**Time:** 29:15–30:00. **Screen:** page 18. Stop operating the browser and look
at the audience.

**Say:**

“The change we are asking you to evaluate is simple: a stalled booking gets a
specific next action, a responsible person and a verified record of what
happened. Management then sees a conversion estimate grounded in that record.

We have demonstrated the workflow on synthetic cases. We propose testing it on
one suitable project with one administrator, approved data access and a
twelve-week evaluation of thirty-day verified SPA conversion.

The three things we need to agree are the pilot owner, the source of booking and
signing evidence, and the comparison against ordinary follow-up.

Thank you. We are ready to discuss the business logic, the workflow, the
implementation and the parts that still need validation.”

## Questions Everyone Should Be Able To Answer

| Likely Question                                  | Concise Answer                                                                                                                                                                                                           | Page To Return To |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Why does Chin Hin need this if it has ERP?       | We have not established that its existing modules cannot do this. The pilot tests a specific follow-up gap and should fit its system of record. Kingdee is publicly announced; actual project modules must be confirmed. | 3, 16             |
| What exactly changes after a click?              | A next action becomes an assigned task, or reviewed evidence changes the case's blocker and next responsibility. A manager's follow-up becomes internal work.                                                            | 8, 9, 12          |
| Can you solve a bank rejection?                  | We cannot change the bank decision. Staff can resolve missing documents, chase processing or review another application. Mortar supports that coordination.                                                              | 4, 6              |
| Is your survey representative?                   | No. Eight self-selected practitioners with mixed roles provide directional priorities, not Chin Hin's cause shares or conversion rates.                                                                                  | 4                 |
| Have you interviewed Chin Hin staff?             | The repository's practitioner interview template is blank. We do not present it as a completed interview. We have the brief, survey and public sources.                                                                  | 4                 |
| Have you increased conversion?                   | Not on company records. We demonstrated mechanics on synthetic data and proposed the comparison needed to measure impact.                                                                                                | 15, 17            |
| Where did the eight extra SPAs come from?        | Forty assumed eligible cases multiplied by an assumed 20-percentage-point uplift. It is an illustration, not an observed result.                                                                                         | 15                |
| Does a cleared payslip mean a recovered sale?    | No. It clears one verified blocker. The bank decision and signing remain separate milestones.                                                                                                                            | 9, 10             |
| Does Complete verify a milestone?                | Completing a task records work completion. A milestone requires its own confirmed case event.                                                                                                                            | 9                 |
| Is the forecast AI-generated?                    | No. It uses stage-and-age comparison rates and sums probabilities. The simulation and comparison assumptions still require company validation.                                                                           | 13                |
| What does thirty days mean?                      | Within thirty days of the original booking date, both for the proposed success metric and the prototype's signing target. It is not a cash horizon.                                                                      | 13, 15            |
| Does your range cover all uncertainty?           | No. It is a conditional simulation range. Data quality, rate-estimation uncertainty and correlated market changes require additional validation.                                                                         | 13                |
| What if the AI is wrong or unavailable?          | Review or dispute the proposal, then record verified evidence manually. Cached/unavailable sources are labelled.                                                                                                         | 9, 14             |
| Does the system automatically send WhatsApp?     | No. Staff paste messages and use existing channels. Internal follow-up assignment is not external message delivery.                                                                                                      | 8, 12, 17         |
| Is the 40% DSR a bank approval policy?           | It is a configurable prototype advisory threshold, not a universal bank policy or credit decision. Rates and eligibility vary.                                                                                           | 14, 17            |
| Does one rejected application close the booking? | No. Applications are tracked separately. The overall case can still have an active or approved alternative.                                                                                                              | 6                 |
| Who cancels or releases a unit?                  | An authorised person under company policy. Mortar can record that decision; it does not acquire authority from an AI score.                                                                                              | 6, 17             |
| How do you avoid gaming the metric?              | Define eligibility beforehand, keep difficult eligible cases in the denominator, give the whole cohort its observation window and reconcile executions with Legal.                                                       | 15, 16            |
| What if the pilot cohort is too small?           | Report uncertainty and operational findings. Do not claim reliable causal improvement from a few cases; extend observation or aggregate comparable cohorts.                                                              | 15, 16            |
| Who operates and maintains it?                   | Propose a named internal process owner plus a named technical owner. Their staffing, support time and costs must be agreed; free prototype hosting is not a production cost estimate.                                    | 16, 18            |
| Is it safe to load real buyer records now?       | The demo is not a production rollout. Approved access, identity controls, processing arrangements and retention rules are required before live data enters it.                                                           | 17                |

If you do not know: “We have not verified that yet. Our current assumption is
[state it]. We would check [specific data/person] before relying on it.” Do not
guess or pass every question to a specialist.

## Good Questions To Ask Chin Hin

1. Which system is the authoritative booking and unit record for the candidate
   pilot project, and how does it relate to the Kingdee transformation?
2. Who owns a booking's follow-up at each handoff today, and who can approve
   cancellation or unit release?
3. What evidence does Legal use to mark an SPA as executed, and can we reconcile
   that evidence with the booking identifier?
4. Of the last closed cohort, which failure causes and recoverable delays are
   recorded reliably?
5. Can we create a fair ordinary-follow-up comparison and give every enrolled
   booking its complete thirty-day observation window?
6. Which part of this workflow would remove duplicate work for your
   administrator, and which part would add it?

These questions are part of understanding the business. Ask relevant ones during
Q&A rather than claiming you already know the answers.

## Rehearsal And Demo Preparation

- Open the new deck and the Render app in separate tabs. Preload the app to
  avoid a cold start. Use a readable zoom, silence notifications and hide
  unrelated tabs.
- Check `/api/health`; it should report a healthy database. A configured model
  flag does not prove every live model call will succeed.
- Verify BK-9001's task and evidence state. Rehearsals change the shared demo.
  Prefer a dedicated disposable demo deployment for repeatable mutations. Do not
  delete shared demo data simply to make the script match.
- Have the buyer-reply text in a plain-text note. Confirm the proposer/source
  tag and the human verifier on screen.
- Prepare a short recording of the critical transition on synthetic data as a
  fallback. Say it is a recording if you use it.
- Rehearse named-profile switches: Nurul Aina, Arvind Raj and Project Manager.
  Current access is scoped; different profiles can see different case counts.
- Rehearse the manual Documents Received path and the Legal appointment form.
- Know the demo's fixed 18 September reference date. Distinguish event date,
  recorded date and a future appointment date.
- Time each section with the cue sheet. Never pad by reading every row. If you
  finish early, use the deeper explanation prompts below.
- Every member performs the full critical loop once and explains the survey,
  forecast, impact calculation and pilot without notes.
- Meaningful contributions must be real: evidence collection, workflow design,
  implementation, validation or pilot design. Do not invent authorship. Someone
  joining can present the section matching their actual contribution, while
  keeping this universal script's timing and argument.

## If A Section Finishes Early

Use these within its allocated time; do not extend the overall thirty minutes.

- **Company context:** explain unsigned booking versus contracted unbilled sale,
  using one synthetic unit rather than another financial statistic.
- **Evidence:** explain why a small mixed-role survey supports priorities but
  cannot estimate company leakage shares.
- **Demo:** ask the audience to look at the verifier and source; show the full
  event history and one separate bank application.
- **Forecast:** explain why a sample of three comparable cases is fragile and
  why the engine backs off to a broader comparison.
- **Impact:** calculate the five-point uplift scenario aloud: 40 × 0.05 = 2.
- **Adoption:** walk through the administrator's actual morning sequence: queue,
  action, existing communication channel, receipt check, recorded event.

## Mapping To The Existing Qualification Deck

The existing repository deck has 20 pages. Its page numbers are different. The
new companion deck avoids presenting stale evidence and role labels.

| New Page | Related Old Page | Important Difference                                                 |
| -------- | ---------------- | -------------------------------------------------------------------- |
| 1        | 1                | Business-led spoken opening                                          |
| 2        | None             | Explicit thirty-minute agenda                                        |
| 3        | None             | Official company context and Kingdee announcement                    |
| 4        | 4, 10            | Updated survey n = 8; no company cause-share claim                   |
| 5        | 2, 3             | Workflow before, without an unsupported measured baseline            |
| 6        | 5, 6, 7          | Four actual roles; evidence-to-action logic                          |
| 7        | 16               | Fixed demo date; named-profile session caveat                        |
| 8        | 8                | Today, Quick View and existing-task branch                           |
| 9        | 7, 9             | Actual request/receipt confirmation loop                             |
| 10       | None             | Explicit operational before/after                                    |
| 11       | 6                | Legal Admin is Arvind Raj; Finance is a beneficiary                  |
| 12       | None             | Current Manager follow-up workflow                                   |
| 13       | 11, 12           | Correct thirty-days-from-booking target and synthetic limits         |
| 14       | 10, 15           | Render deployment; separate Jev and Ask MortarAI                     |
| 15       | 17               | Uplift is illustrative; subgroup/cohort arithmetic explicit          |
| 16       | 18               | Coherent day 15–44 enrollment and day 74/84 completion               |
| 17       | 19               | Ask MortarAI exists; production identity/integrations still proposed |
| 18       | 20               | Working Render link and concrete pilot request                       |

Old page 13's financing assumptions and page 14's playbooks are useful backup
topics. Present the 40% DSR and other seed parameters as prototype assumptions,
not universally binding bank rules. Avoid the old deck's blanket PDPA claim,
outdated “no generative chatbot” line and unqualified legal exposure claims.
