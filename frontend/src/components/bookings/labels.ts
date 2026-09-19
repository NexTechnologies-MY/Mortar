/**
 * Shared Title Case labels for the bookings screens — event kinds, documents,
 * application status, sender and task roles — plus the timestamp format the
 * message and evidence views share.
 */

import type { ApplicationStatus, DocumentKind, EventKind, ExtractedEvent, NextAction, SenderRole } from '@mortar/core'
import { formatDate } from '@/components/case/format'

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  booked: 'Booked',
  buyer_contacted: 'Buyer Contacted',
  buyer_hesitant: 'Buyer Hesitant',
  buyer_withdrew: 'Buyer Withdrew',
  cancelled: 'Cancelled',
  lapsed: 'Lapsed',
  loan_submitted: 'Loan Submitted',
  documents_requested: 'Documents Requested',
  documents_received: 'Documents Received',
  valuation_shortfall: 'Valuation Shortfall',
  loan_approved: 'Loan Approved',
  loan_rejected: 'Loan Rejected',
  loan_agreement_signed: 'Loan Agreement Signed',
  disbursed: 'Disbursed',
  spa_appointment_set: 'SPA Appointment Set',
  spa_signed: 'SPA Signed'
}

export const EXTRACTED_EVENT_LABELS: Record<ExtractedEvent, string> = {
  loan_approved: 'Loan Approved',
  loan_rejected: 'Loan Rejected',
  documents_requested: 'Documents Requested',
  documents_received: 'Documents Received',
  valuation_shortfall: 'Valuation Shortfall',
  buyer_hesitant: 'Buyer Hesitant',
  buyer_withdrawing: 'Buyer Withdrawing',
  spa_appointment: 'SPA Appointment',
  spa_signed: 'SPA Signed',
  no_update: 'No Update'
}

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  payslip: 'Payslip',
  epf_statement: 'EPF Statement',
  bank_statement: 'Bank Statement',
  ic_copy: 'IC Copy',
  employment_letter: 'Employment Letter',
  tax_form: 'Tax Form'
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  documents_pending: 'Documents Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn'
}

export const NEXT_ACTION_LABELS: Record<NextAction, string> = {
  request_document: 'Request Document',
  chase_banker: 'Chase Banker',
  submit_another_bank: 'Submit Another Bank',
  call_buyer: 'Call Buyer',
  schedule_spa: 'Schedule SPA',
  escalate_legal: 'Escalate Legal',
  review_release: 'Review Release',
  wait: 'Wait'
}

export const SENDER_ROLE_LABELS: Record<SenderRole, string> = {
  buyer: 'Buyer',
  banker: 'Banker',
  solicitor: 'Solicitor',
  sales_agent: 'Sales Agent'
}

/** `16 Sep 2026 · 15:30` — date in house format plus the +08:00 wall-clock time. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const time = value.slice(11, 16)
  return time ? `${formatDate(value)} · ${time}` : formatDate(value)
}
