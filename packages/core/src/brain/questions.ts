/**
 * The Ask question set. Each entry pairs a phrasing with a function that
 * computes its answer from the snapshot, so the numbers in the prose are the
 * numbers the screens show and cannot go stale. `predicate` restates the same
 * claim for the test, which checks the citations both ways.
 *
 * Every question here answers something no screen answers. Counts of stalled
 * bookings, expected signings and value at risk are deliberately absent: the
 * chase and forecast tiles already state them.
 *
 * Copy follows DESIGN.md Plain Language — desk words, no machine vocabulary —
 * and answer prose is sentence case ending in a full stop.
 */
import type { AskContext, AskQuestion, AskReply, CaseSummary, DocumentKind } from '../types'
import { count, days, isLive, isOpen, joinList, percent, rm, rmCompact, sumBy, tally } from './helpers'
/**
 * Document names as a sentence says them: lowercase, except the acronyms,
 * which DESIGN.md keeps in capitals.
 */
const DOCUMENT_WORDS: Record<DocumentKind, [singular: string, plural: string]> = {
  payslip: ['payslip', 'payslips'],
  epf_statement: ['EPF statement', 'EPF statements'],
  bank_statement: ['bank statement', 'bank statements'],
  ic_copy: ['IC copy', 'IC copies'],
  employment_letter: ['employment letter', 'employment letters'],
  tax_form: ['tax form', 'tax forms']
}
/** Bookings named in one answer: enough to act on, short enough to read. */
const CITE_LIMIT = 6
/** The industry guide for a loan decision, in working days (ABM, 2017). */
const DECISION_WINDOW = 9
/** Below this, a rejection rate is noise rather than a pattern. */
const MIN_APPLICATIONS_TO_RANK = 10
const priceOf = (ctx: AskContext, id: string) => ctx.snapshot.bookings.find((b) => b.id === id)?.priceRm ?? 0
const unitOf = (ctx: AskContext, id: string) => ctx.snapshot.bookings.find((b) => b.id === id)?.unit ?? id
const buyerOf = (ctx: AskContext, id: string) =>
  ctx.snapshot.bookings.find((b) => b.id === id)?.buyer.name ?? 'the buyer'
const firmOf = (ctx: AskContext, id: string) =>
  ctx.snapshot.bookings.find((b) => b.id === id)?.legalFirm ?? 'the panel firm'
const live = (ctx: AskContext) => ctx.cases.filter(isLive)
/** Biggest first: every list an answer names is ordered by what it would cost. */
const byValue = (ctx: AskContext) => (a: CaseSummary, b: CaseSummary) =>
  priceOf(ctx, b.bookingId) - priceOf(ctx, a.bookingId)
/** The bookings an answer names, largest value first. */
const cite = (ctx: AskContext, summaries: CaseSummary[]) =>
  [...summaries]
    .sort(byValue(ctx))
    .slice(0, CITE_LIMIT)
    .map((c) => c.bookingId)
/** The bank a live case is sitting with: its open application, else its last. */
function currentBank(summary: CaseSummary): string | null {
  const open = summary.applications.filter((a) => a.status === 'submitted' || a.status === 'documents_pending')
  const chosen = open[open.length - 1] ?? summary.applications[summary.applications.length - 1]
  return chosen?.bank ?? null
}
const openApplications = (summary: CaseSummary) =>
  summary.applications.filter((a) => a.status === 'submitted' || a.status === 'documents_pending')
const nothing = (text: string): AskReply => ({ text, citations: [] })
/** Cases that satisfy a predicate, for the citation set and the test alike. */
const matching = (ctx: AskContext, hit: (c: CaseSummary) => boolean) => ctx.cases.filter(hit)
// The claims. Each is used twice: to build the answer, and to test it.
// Quiet is the app's own `unknown` rule, not a second threshold invented here.
const goneQuiet = (c: CaseSummary) => isLive(c) && c.unknown
const awaitingDocument = (c: CaseSummary) => isLive(c) && c.outstandingDocuments.length > 0
const withBank = (c: CaseSummary) => isLive(c) && openApplications(c).length > 0
const onlyRejected = (c: CaseSummary) =>
  isLive(c) && c.applications.length > 0 && c.applications.every((a) => a.status === 'rejected')
/** Held up right now. Reads `stallReasons`, so it tracks `isOpen`, not the forecast horizon. */
const stalled = (c: CaseSummary) => isOpen(c) && c.stallReasons.length > 0
/**
 * The legal waiting room: loan approved, SPA unsigned, not exited. Note these
 * two claims deliberately skip `isLive` — a case that has sat past the 30-day
 * horizon is the one most worth naming, and `isLive` would drop exactly those.
 */
const awaitingSpa = (c: CaseSummary) => c.stage === 'lo_issued' && c.daysSinceLoIssued !== null
const spaSetUnsigned = (c: CaseSummary) => c.stage === 'lo_issued' && c.daysSinceSpaSet !== null
/** The bank holding the most live value; the exposure answer names it. */
function topBank(ctx: AskContext): string | null {
  const cases = live(ctx).filter((c) => currentBank(c) !== null)
  if (cases.length === 0) return null
  return [...tally(cases, (c) => currentBank(c) ?? '')]
    .map(([bank, group]) => ({ bank, value: sumBy(group, (c) => priceOf(ctx, c.bookingId)) }))
    .sort((a, b) => b.value - a.value)[0].bank
}
/** Rejection rate per bank over every application ever made. */
function rejectionRates(ctx: AskContext) {
  const byBank = tally(ctx.snapshot.applications, (a) => a.bank)
  const rejected = new Set(
    ctx.cases.flatMap((c) => c.applications.filter((a) => a.status === 'rejected').map((a) => a.id))
  )
  return (
    [...byBank]
      .map(([bank, apps]) => ({
        bank,
        total: apps.length,
        rejected: apps.filter((a) => rejected.has(a.id)).length
      }))
      // A bank with three applications can top a percentage table on one
      // rejection. Only rank banks we have actually used.
      .filter((b) => b.total >= MIN_APPLICATIONS_TO_RANK)
      .sort((a, b) => b.rejected / b.total - a.rejected / a.total)
  )
}
export const ASK_QUESTIONS: AskQuestion[] = [
  {
    id: 'ASK-001',
    question: 'What Is The Forecast Worth In Ringgit?',
    tags: ['forecast in ringgit', 'value', 'how much will sign', 'worth', 'rm', 'money', 'nilai', 'expected value'],
    desk: 'all',
    predicate: (ctx, id) => ctx.cases.some((c) => c.bookingId === id && isLive(c)),
    answer: (ctx) => {
      const cases = live(ctx)
      if (cases.length === 0) return nothing('No booking is live right now.')
      const total = sumBy(cases, (c) => priceOf(ctx, c.bookingId))
      const weighted = sumBy(ctx.forecast.perBooking, (p) => p.probability * priceOf(ctx, p.bookingId))
      return {
        text:
          `The ${count(cases.length, 'live booking')} on the books are worth ${rmCompact(total)}. ` +
          `Weighting each by how often its stage reaches signing, about ${rmCompact(weighted)} should sign ` +
          `within ${days(ctx.forecast.horizonDays)}.`,
        citations: cite(ctx, cases)
      }
    }
  },
  {
    id: 'ASK-002',
    question: 'What Is My Exposure By Bank?',
    tags: ['exposure', 'by bank', 'panel bank', 'concentration', 'which bank holds', 'pendedahan', 'spread'],
    desk: 'all',
    predicate: (ctx, id) => {
      const top = topBank(ctx)
      return ctx.cases.some((c) => c.bookingId === id && isLive(c) && currentBank(c) === top)
    },
    answer: (ctx) => {
      const cases = live(ctx).filter((c) => currentBank(c) !== null)
      if (cases.length === 0) return nothing('No live booking is sitting with a bank right now.')
      const banks = [...tally(cases, (c) => currentBank(c) ?? '')]
        .map(([bank, group]) => ({ bank, group, value: sumBy(group, (c) => priceOf(ctx, c.bookingId)) }))
        .sort((a, b) => b.value - a.value)
      const [first, ...others] = banks
      const total = sumBy(banks, (b) => b.value)
      const rest = others.slice(0, 2).map((b) => `${b.bank} ${rmCompact(b.value)}`)
      const tail = rest.length > 0 ? ` Then ${joinList(rest)}.` : ''
      return {
        text:
          `${rmCompact(total)} of live bookings sits with ${count(banks.length, 'bank')}. ` +
          `${first.bank} holds the most at ${rmCompact(first.value)} across ` +
          `${count(first.group.length, 'booking')}, ${percent(first.value / total)} of the total.${tail}`,
        citations: cite(ctx, first.group)
      }
    }
  },
  {
    id: 'ASK-003',
    question: 'Which Booking Would Hurt Most If It Fell Over?',
    tags: ['hurt most', 'biggest risk', 'worst case', 'most expensive at risk', 'largest', 'paling besar'],
    desk: 'all',
    cites: 3,
    predicate: (ctx, id) => ctx.cases.some((c) => c.bookingId === id && stalled(c)),
    answer: (ctx) => {
      const cases = matching(ctx, stalled)
      if (cases.length === 0) return nothing('Nothing is stalled right now.')
      const citations = cite(ctx, cases).slice(0, 3)
      const worst = cases.find((c) => c.bookingId === citations[0])
      if (!worst) return nothing('Nothing is stalled right now.')
      return {
        text:
          `${unitOf(ctx, worst.bookingId)} at ${rm(priceOf(ctx, worst.bookingId))}, bought by ` +
          `${buyerOf(ctx, worst.bookingId)}. Commitments plus the new instalment come to ` +
          `${percent(worst.risk.debtServiceRatio)} of income. ` +
          `Behind it: ${joinList(worst.stallReasons.map((r) => r.toLowerCase()))}.`,
        citations
      }
    }
  },
  {
    id: 'ASK-004',
    question: 'Which Documents Are We Still Chasing?',
    tags: ['documents', 'outstanding', 'payslip', 'slip gaji', 'dokumen', 'waiting on', 'paperwork', 'missing'],
    desk: 'sales-admin',
    predicate: (ctx, id) => ctx.cases.some((c) => c.bookingId === id && awaitingDocument(c)),
    answer: (ctx) => {
      const cases = matching(ctx, awaitingDocument)
      if (cases.length === 0) return nothing('No document is outstanding on a live booking.')
      const all = cases.flatMap((c) => c.outstandingDocuments)
      const kinds = [...tally(all, (d) => d)]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([kind, group]) => {
          const [one, many] = DOCUMENT_WORDS[kind as DocumentKind]
          return `${group.length} ${group.length === 1 ? one : many}`
        })
      const quietest = [...cases].sort((a, b) => b.daysSinceEvidence - a.daysSinceEvidence)[0]
      const citations = cite(ctx, cases)
      return {
        text:
          `${count(cases.length, 'booking')} are waiting on a document — ${joinList(kinds)}. ` +
          `The quietest is ${unitOf(ctx, quietest.bookingId)}, with no update for ` +
          `${days(quietest.daysSinceEvidence)}.`,
        citations,
        action: {
          label: `Chase All ${citations.length}`,
          bookingIds: citations,
          action: 'request_document',
          ownerRole: 'sales'
        }
      }
    }
  },
  {
    id: 'ASK-005',
    question: 'Who Has Gone Quiet?',
    tags: ['gone quiet', 'no update', 'silent', 'quiet buyers', 'senyap', 'cold', 'two weeks', 'not heard', 'stale'],
    desk: 'sales-admin',
    predicate: (ctx, id) => ctx.cases.some((c) => c.bookingId === id && goneQuiet(c)),
    answer: (ctx) => {
      const cases = matching(ctx, goneQuiet)
      if (cases.length === 0) return nothing('Every live booking has had a recent update.')
      const value = sumBy(cases, (c) => priceOf(ctx, c.bookingId))
      const worst = [...cases].sort((a, b) => b.daysSinceEvidence - a.daysSinceEvidence)[0]
      const citations = cite(ctx, cases)
      return {
        text:
          `${count(cases.length, 'booking')} have had no recent update, ${rmCompact(value)} in all. ` +
          `The longest silence is ${unitOf(ctx, worst.bookingId)} at ${days(worst.daysSinceEvidence)}.`,
        citations,
        action: {
          label: `Call All ${citations.length}`,
          bookingIds: citations,
          action: 'call_buyer',
          ownerRole: 'sales'
        }
      }
    }
  },
  {
    id: 'ASK-006',
    question: 'Which Bank Rejects Us Most?',
    tags: ['rejects', 'rejection', 'declined', 'turned down', 'ditolak', 'approval rate', 'which bank rejects'],
    desk: 'loan-admin',
    predicate: (ctx, id) => {
      const worst = rejectionRates(ctx)[0]
      return worst ? ctx.cases.some((c) => c.bookingId === id && isLive(c) && currentBank(c) === worst.bank) : false
    },
    answer: (ctx) => {
      const rates = rejectionRates(ctx)
      if (rates.length === 0) return nothing('No bank has taken enough applications to read a pattern from yet.')
      const [worst, ...others] = rates
      const rest = others.slice(0, 2).map((b) => `${b.bank} ${b.rejected} of ${b.total}`)
      const tail = rest.length > 0 ? ` Then ${joinList(rest)}.` : ''
      const stillThere = live(ctx).filter((c) => currentBank(c) === worst.bank)
      const open =
        stillThere.length > 0 ? ` ${count(stillThere.length, 'live booking')} still sit with ${worst.bank}.` : ''
      return {
        text:
          `Across ${count(ctx.snapshot.applications.length, 'application')}, ${worst.bank} turns down the ` +
          `most: ${worst.rejected} of ${worst.total}, ${percent(worst.rejected / worst.total)}.${tail}${open}`,
        citations: cite(ctx, stillThere)
      }
    }
  },
  {
    id: 'ASK-007',
    question: 'Am I Waiting On Buyers Or On Bankers?',
    tags: ['waiting on whom', 'buyers or bankers', 'who am i waiting', 'blocked by', 'tunggu siapa', 'holding up'],
    desk: 'loan-admin',
    predicate: (ctx, id) =>
      ctx.cases.some((c) => c.bookingId === id && withBank(c) && c.outstandingDocuments.length === 0),
    answer: (ctx) => {
      const waiting = matching(ctx, withBank)
      if (waiting.length === 0) return nothing('No application is with a bank right now.')
      const onBuyer = waiting.filter((c) => c.outstandingDocuments.length > 0)
      const onBank = waiting.filter((c) => c.outstandingDocuments.length === 0)
      const citations = cite(ctx, onBank)
      return {
        text:
          `${count(waiting.length, 'booking')} are with a bank. ${onBuyer.length} are held up by a document ` +
          `the buyer still owes; the other ${onBank.length} sit with the banker, ` +
          `who has ${DECISION_WINDOW} working days by the industry guide.`,
        citations,
        action:
          citations.length > 0
            ? {
                label: `Chase All ${citations.length} Bankers`,
                bookingIds: citations,
                action: 'chase_banker',
                ownerRole: 'loan_admin'
              }
            : undefined
      }
    }
  },
  {
    id: 'ASK-008',
    question: 'Who Was Turned Down With Nothing Else In Flight?',
    tags: ['rejected no second', 'another bank', 'resubmit', 'nothing else', 'only rejection', 'tiada bank lain'],
    desk: 'loan-admin',
    predicate: (ctx, id) => ctx.cases.some((c) => c.bookingId === id && onlyRejected(c)),
    answer: (ctx) => {
      const cases = matching(ctx, onlyRejected)
      if (cases.length === 0) return nothing('Every buyer who was turned down already has another application open.')
      const value = sumBy(cases, (c) => priceOf(ctx, c.bookingId))
      const citations = cite(ctx, cases)
      return {
        text:
          `${count(cases.length, 'booking')} were turned down with nothing else in flight, ` +
          `${rmCompact(value)} in all. One rejection does not fail a booking — another panel bank can still take it.`,
        citations,
        action: {
          label: `Submit All ${citations.length} Elsewhere`,
          bookingIds: citations,
          action: 'submit_another_bank',
          ownerRole: 'loan_admin'
        }
      }
    }
  },
  {
    id: 'ASK-009',
    question: 'What Is Waiting For Me To Confirm?',
    tags: ['confirm', 'unconfirmed', 'review', 'waiting for me', 'sahkan', 'pending review', 'approve'],
    desk: 'all',
    predicate: (ctx, id) => ctx.snapshot.events.some((e) => e.bookingId === id && e.status === 'provisional'),
    answer: (ctx) => {
      const pending = ctx.snapshot.events.filter((e) => e.status === 'provisional')
      if (pending.length === 0) return nothing('Nothing is waiting for you to confirm.')
      const bookings = tally(pending, (e) => e.bookingId)
      const cases = ctx.cases.filter((c) => bookings.has(c.bookingId))
      const stalled = cases.filter((c) => c.stallReasons.length > 0).length
      const tail =
        stalled > 0
          ? ` ${count(stalled, 'booking')} of them are held up, so one confirmation could clear the hold-up on its own.`
          : ''
      return {
        text:
          `${count(pending.length, 'update')} are waiting for someone to confirm them, across ` +
          `${count(bookings.size, 'booking')}.${tail}`,
        citations: cite(ctx, cases)
      }
    }
  },
  {
    id: 'ASK-010',
    question: 'What Is Sitting With The Lawyers?',
    tags: ['sitting with the lawyers', 'with the lawyers', 'legal queue', 'awaiting spa', 'peguam', 'law firm'],
    desk: 'legal-admin',
    predicate: (ctx, id) => ctx.cases.some((c) => c.bookingId === id && awaitingSpa(c)),
    answer: (ctx) => {
      const cases = matching(ctx, awaitingSpa)
      if (cases.length === 0) return nothing('Nothing is waiting on the lawyers right now.')
      const total = sumBy(cases, (c) => priceOf(ctx, c.bookingId))
      const longest = cases.reduce((a, b) => ((b.daysSinceLoIssued ?? 0) > (a.daysSinceLoIssued ?? 0) ? b : a))
      return {
        text:
          `${count(cases.length, 'booking')} worth ${rmCompact(total)} have an approved loan and an unsigned ` +
          `SPA. The longest, ${unitOf(ctx, longest.bookingId)} with ${firmOf(ctx, longest.bookingId)}, has sat ` +
          `${days(longest.daysSinceLoIssued ?? 0)} since the loan was approved.`,
        citations: cite(ctx, cases)
      }
    }
  },
  {
    id: 'ASK-011',
    question: 'Which SPA Appointments Were Set But Never Signed?',
    tags: ['appointment never signed', 'spa appointment', 'booked but not signed', 'temujanji', 'appointment passed'],
    desk: 'legal-admin',
    predicate: (ctx, id) => ctx.cases.some((c) => c.bookingId === id && spaSetUnsigned(c)),
    answer: (ctx) => {
      const cases = matching(ctx, spaSetUnsigned)
      if (cases.length === 0) return nothing('Every SPA appointment on the log has been signed.')
      const total = sumBy(cases, (c) => priceOf(ctx, c.bookingId))
      const firms = tally(cases, (c) => firmOf(ctx, c.bookingId))
      const longest = cases.reduce((a, b) => ((b.daysSinceSpaSet ?? 0) > (a.daysSinceSpaSet ?? 0) ? b : a))
      return {
        text:
          `${count(cases.length, 'booking')} worth ${rmCompact(total)} had an SPA appointment put on the log ` +
          `and still have no signing against them, across ${count(firms.size, 'firm')}. The oldest was set ` +
          `${days(longest.daysSinceSpaSet ?? 0)} ago on ${unitOf(ctx, longest.bookingId)}.`,
        citations: cite(ctx, cases)
      }
    }
  }
]
