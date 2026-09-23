/**
 * Ball in court: who has to move next on a case — the buyer, a panel bank, the
 * solicitor, or the developer's own staff — and the move that unblocks it.
 * Read from the same `CaseSummary` the chase queue and the stall rules use, so
 * the answer cannot drift from them. Confirmed updates only, like the summary.
 */
import type { CaseSummary, NextAction } from './types'
import { DOCUMENT_LABELS } from './sim/cases'

export type BallHolder = 'buyer' | 'bank' | 'solicitor' | 'developer'

export interface BallInCourt {
  /** `null` once the SPA is signed or the booking has closed: nobody owes a move. */
  holder: BallHolder | null
  /** What the case is waiting for, as a Title Case phrase: `Maybank To Decide On The Loan`. */
  waitingFor: string
  /** The move that unblocks it; `null` when there is nothing left to chase. */
  nextMove: NextAction | null
  /** A stall rule has fired on the case. */
  stalled: boolean
}

/** `Payslip`, `Payslip And EPF Statement`, `Payslip, IC Copy And EPF Statement`. */
function listOf(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} And ${items[items.length - 1]}`
}

/**
 * First match wins, in the order a desk would unblock the case: an approved
 * loan waits on the solicitor for the SPA, whatever another bank still wants;
 * before that, documents the buyer owes stop a bank from acting, and a bank
 * holding an application owes a decision; anything else (a withdrawn buyer,
 * no bank yet, every bank declined) is the developer's own move.
 */
export function ballInCourt(summary: CaseSummary): BallInCourt {
  const stalled = summary.stallReasons.length > 0
  if (summary.stage === 'cancelled' || summary.stage === 'lapsed') {
    return { holder: null, waitingFor: 'Nothing, The Booking Has Closed', nextMove: null, stalled: false }
  }
  // The signed SPA itself, not a stage label: a loan agreement or disbursement
  // recorded without one leaves the case waiting on the SPA.
  if (summary.spaSigned) {
    return { holder: null, waitingFor: 'Nothing, The SPA Is Signed', nextMove: null, stalled: false }
  }

  // A buyer who has walked away outranks everything else: documents they still
  // owe and a bank's decision, approval included, no longer matter, and the unit
  // is the developer's to release. Read the summary's flag, not the applications:
  // an application the bank already decided is never marked withdrawn, and the
  // flag clears once a bank is submitted after the withdrawal (the buyer is back).
  if (summary.buyerWithdrew) {
    return { holder: 'developer', waitingFor: 'A Decision To Release The Unit', nextMove: 'review_release', stalled }
  }

  // A real letter of offer, not an SPA appointment alone: an appointment set
  // while a bank is still deciding leaves the case with that bank.
  if (summary.stage === 'lo_issued' && summary.daysSinceLoIssued !== null) {
    return summary.daysSinceSpaSet !== null
      ? { holder: 'solicitor', waitingFor: 'The Solicitor To Get The SPA Signed', nextMove: 'escalate_legal', stalled }
      : { holder: 'solicitor', waitingFor: 'The Solicitor To Schedule The SPA', nextMove: 'schedule_spa', stalled }
  }

  if (summary.outstandingDocuments.length > 0) {
    const documents = listOf(summary.outstandingDocuments.map((d) => DOCUMENT_LABELS[d]))
    return { holder: 'buyer', waitingFor: `${documents} From The Buyer`, nextMove: 'request_document', stalled }
  }
  const awaitingDocuments = summary.applications.find((a) => a.status === 'documents_pending')
  if (awaitingDocuments) {
    return {
      holder: 'buyer',
      waitingFor: `Documents For ${awaitingDocuments.bank} From The Buyer`,
      nextMove: 'request_document',
      stalled
    }
  }

  const withBank = summary.applications.filter((a) => a.status === 'submitted')
  if (withBank.length > 0) {
    return {
      holder: 'bank',
      waitingFor: `${listOf(withBank.map((a) => a.bank))} To Decide On The Loan`,
      nextMove: 'chase_banker',
      stalled
    }
  }

  if (summary.applications.length > 0) {
    return {
      holder: 'developer',
      waitingFor: 'A Submission To Another Panel Bank',
      nextMove: 'submit_another_bank',
      stalled
    }
  }
  return {
    holder: 'developer',
    waitingFor: 'The Loan Documents To Be Collected',
    nextMove: 'request_document',
    stalled
  }
}
