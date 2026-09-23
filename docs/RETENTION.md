# Data Retention: Mortar

Mortar's rule for how long a booking's record must be kept, and why. It is
written for the developer's own staff, and for whoever deploys Mortar against
real buyer data.

Contents:

1.  [The Retention Rule](#the-retention-rule)
1.  [Why: The Law](#why-the-law)
1.  [What Mortar Does Today](#what-mortar-does-today)
1.  [Open Decisions](#open-decisions)
1.  [See Also](#see-also)

## The Retention Rule

Every booking that became a transaction is kept for 7 years, along with its
whole record: the event log, loan applications, tasks (the Chase List) and
messages. A transaction means money was received, forfeited, refunded or
disbursed, or a Sale and Purchase Agreement (SPA) was signed.

Bookings that never became a transaction, such as a buyer who withdrew before
paying anything, are not covered by that duty. How long to keep those instead is
an open decision; see [Open Decisions](#open-decisions).

## Why: The Law

Two laws set the 7 years. The two personal-data rules pull the other way: keep
personal data no longer than it is needed, unless another law says so.

| Law                                                        | Requirement                                                                                                                                                                                     | Clock                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Companies Act 2016 (Act 777), s245(3)                      | "The company shall retain the records referred to in subsection (1) for seven years after the completion of the transactions or operations to which the entries relate."                        | From completion of each transaction.                         |
| Income Tax Act 1967 (Act 53), s82(1)(a)                    | Keep "sufficient records for a period of seven years from the end of the year to which any income from that business relates".                                                                  | From the end of that year.                                   |
| Personal Data Protection Act 2010 (Act 709), s10(1)        | "The personal data processed for any purpose shall not be kept longer than is necessary for the fulfilment of that purpose."                                                                    | No fixed period: only as long as the purpose lasts.          |
| Personal Data Protection Standard 2015, Retention Standard | "Keep personal data no longer than necessary unless there are requirements by other legal provisions" and "Prepare a personal data disposal schedule for inactive data with a 24 month period." | A disposal schedule for inactive data, on a 24-month period. |

The Housing Development (Control and Licensing) Act 1966 requires a developer to
keep proper records, but names no retention period. AMLA 2001 s17 sets 6 years
for reporting institutions; its schedule names estate agency practice, not
developers, so it does not appear to cover a developer selling its own units.

**Not Legal Advice:** this is a summary for the team, not legal advice; confirm
it with the company's lawyer.

Sources: the [Laws Of Malaysia](https://lom.agc.gov.my) portal carries the full
text of each Act, and the
[Personal Data Protection Standard 2015 (PDF)](https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2024/07/LatestStandard.pdf)
carries the Retention Standard quoted above.

## What Mortar Does Today

- Nothing in normal use deletes a booking, an event, a task or a message. A
  completed task is marked done, not removed.
- **Undo This Import** removes an import's bookings only while none of them has
  any activity beyond its booked record (no update, message, task or bank
  application). The import's own record stays, stamped with who undid it and
  when (`imports.undone_by`, `imports.undone_at`), so every removal leaves a
  trace.
- **Reset Demo Data** (Settings) wipes and reseeds the whole database. It exists
  for the public demo only. A server holding real data must set
  `MORTAR_DEMO_RESET=off`; `POST /api/admin/reset` then refuses with 403 and
  changes nothing.
- Backups: the database host's own history covers days, not years. A 7-year
  guarantee needs regular exports of the database, kept for 7 years, outside the
  app. This is a hosting task, not something the app does today.

## Open Decisions

For the company to settle with its lawyer:

1.  How long to keep bookings that never became a transaction, and whether to
    delete them or strip the personal details (name, IC, phone, income,
    commitments) once that period ends. PDPA points to a short period; the PDP
    Standard's 24-month disposal schedule for inactive data is one reference
    point.
1.  Whether any in-house sales staff are licensed estate agents under the
    Valuers, Appraisers and Estate Agents Act 1981 (Act 242), which could bring
    AMLA's 6-year record-keeping into scope for that work.
1.  Who runs and keeps the 7-year exports.

## See Also

- https://github.com/DrxgClanPC/Mortar/issues/19
- https://github.com/DrxgClanPC/Mortar/issues/10
