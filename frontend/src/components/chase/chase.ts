/**
 * Chase-queue presentation helpers: labels for Jev's next actions, the due
 * date an urgency score implies, and the staff name an owner role resolves to
 * for a booking. Kept component-free so cards and tests share them.
 */
import { PERSONA_STAFF } from '@mortar/core'
import type { Booking, DocumentKind, NextAction, NextActionSuggestion, OwnerRole } from '@mortar/core'
import { OWNER_ROLE_LABELS } from '@/components/case'

export const NEXT_ACTION_LABELS: Record<NextAction, string> = {
  request_document: 'Request Document',
  chase_banker: 'Chase Banker',
  submit_another_bank: 'Submit To Another Bank',
  call_buyer: 'Call Buyer',
  schedule_spa: 'Schedule SPA',
  escalate_legal: 'Escalate To Legal',
  review_release: 'Review Release',
  wait: 'Wait For Update'
}

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  payslip: 'Payslip',
  epf_statement: 'EPF Statement',
  bank_statement: 'Bank Statement',
  ic_copy: 'IC Copy',
  employment_letter: 'Employment Letter',
  tax_form: 'Tax Form'
}

/** Urgency pill copy: Jev's 0–2 score, or staleness when no suggestion exists. */
export type Urgency = { label: string; tone: 'danger' | 'warning' | 'neutral'; score: number }

export function urgencyFor(suggestion: NextActionSuggestion | undefined, daysSinceEvidence: number): Urgency {
  if (suggestion) {
    const score = Math.min(2, Math.max(0, Math.round(suggestion.urgency.score)))
    if (score === 2) return { label: 'Due Today', tone: 'warning', score }
    if (score === 1) return { label: 'Due This Week', tone: 'neutral', score }
    return { label: 'Within A Week', tone: 'neutral', score }
  }
  if (daysSinceEvidence >= 10) return { label: `Overdue ${daysSinceEvidence} d`, tone: 'danger', score: -1 }
  if (daysSinceEvidence >= 7) return { label: `Stale ${daysSinceEvidence} d`, tone: 'warning', score: -1 }
  return { label: 'Watch', tone: 'neutral', score: -1 }
}

/** The staff name a suggested owner role resolves to on this booking. */
export function ownerName(role: OwnerRole, booking: Booking): string {
  switch (role) {
    case 'sales':
      return booking.salesOwner
    case 'sales_admin':
      return PERSONA_STAFF['sales-admin'].name
    case 'loan_admin':
      return booking.loanOwner
    case 'legal':
      return booking.legalFirm
  }
}

/** `YYYY-MM-DD` `days` after `isoDate`. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Task due date from the suggestion's urgency: today, within this week, within a week. */
export function dueOnForUrgency(urgencyScore: number, referenceDate: string): string {
  const score = Math.round(urgencyScore)
  return addDays(referenceDate, score >= 2 ? 0 : score === 1 ? 2 : 7)
}

/** A short task title from the suggestion and case context. */
export function taskTitle(suggestion: NextActionSuggestion, booking: Booking, document?: DocumentKind): string {
  const buyer = booking.buyer.name
  switch (suggestion.action.value) {
    case 'request_document':
      return `Request ${document ? DOCUMENT_LABELS[document] : 'Documents'} From ${buyer}`
    case 'chase_banker':
      return `Chase Banker On ${booking.unit}`
    case 'submit_another_bank':
      return `Submit ${buyer} To Another Bank`
    case 'call_buyer':
      return `Call ${buyer}`
    case 'schedule_spa':
      return `Schedule SPA For ${booking.unit}`
    case 'escalate_legal':
      return `Escalate ${booking.unit} To Legal`
    case 'review_release':
      return `Review Release For ${booking.unit}`
    case 'wait':
      return `Follow Up On ${booking.unit}`
  }
}

/** The label used by the owner filter, shared by suggestions and task groups. */
export function ownerRoleLabel(role: OwnerRole): string {
  return OWNER_ROLE_LABELS[role]
}
