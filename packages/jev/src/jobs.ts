/**
 * One fan-out request per Jev job: the state and question set for each of the
 * four jobs. Question names are for code only, so every instruction carries its
 * full meaning and each option is defined in the criteria.
 */
import { choice, noul, score } from '@typesafe-ai/sdk'
import type { CaseSummary, JevKind, Message, Playbook } from '@mortar/core'

/** Bump a job's version when its state shape or question wording changes; it feeds the input hash. */
export const QUESTION_VERSION: Record<JevKind, number> = {
  extract: 2,
  next_action: 1,
  playbooks: 1,
  signals: 1
}

function caseState(summary: CaseSummary) {
  return {
    booking_id: summary.bookingId,
    stage: summary.stage,
    unknown: summary.unknown,
    booking_age_days: summary.bookingAgeDays,
    days_since_evidence: summary.daysSinceEvidence,
    applications: summary.applications.map((application) => ({ bank: application.bank, status: application.status })),
    outstanding_documents: summary.outstandingDocuments,
    financing_risk: {
      level: summary.risk.level,
      debt_service_ratio: summary.risk.debtServiceRatio,
      reasons: summary.risk.reasons
    },
    stall_reasons: summary.stallReasons,
    open_tasks: summary.openTasks
  }
}

function messageState(message: Message) {
  return {
    sender_role: message.senderRole,
    sender_name: message.senderName,
    sent_at: message.sentAt,
    body: message.body
  }
}

export function extractJob(input: { message: Message; summary: CaseSummary }) {
  const state = { message: messageState(input.message), case: caseState(input.summary) }
  const questions = {
    event: choice(
      'Which progress event does this message report for the booking? Judge the meaning of the whole message, not single keywords; pick no_update when nothing moved.',
      {
        loan_approved: 'The bank approved the loan application or issued the Letter of Offer.',
        loan_rejected: 'The bank rejected or declined the loan application.',
        documents_requested: 'Someone asks the buyer or staff to provide a document.',
        documents_received: 'A requested document was sent, attached or confirmed as received.',
        valuation_shortfall: "The bank's valuation came in below the purchase price.",
        buyer_hesitant: 'The buyer voices doubts or compares other projects, without withdrawing.',
        buyer_withdrawing: 'The buyer wants to cancel or withdraw the booking.',
        spa_appointment: 'A Sale and Purchase Agreement signing appointment is arranged or confirmed.',
        spa_signed:
          'The Sale and Purchase Agreement (SPA) itself was signed. Signing a booking form, a loan application form or a Letter of Offer is not an SPA signing.',
        no_update: 'No progress event: small talk, acknowledgements or an unclear message.'
      }
    ),
    document: choice('Which document does the message mainly concern, if any?', {
      payslip: 'Payslip or salary slip (slip gaji).',
      epf_statement: 'EPF or KWSP contribution statement.',
      bank_statement: 'Bank account statement.',
      ic_copy: 'Identity card or MyKad copy.',
      employment_letter: 'Employment or confirmation letter.',
      tax_form: 'Income tax form such as the BE form.',
      none: 'The message is not about a document.'
    }),
    owner: choice('Who should handle the next step raised by this message, if anyone?', {
      sales: 'The sales agent who owns the buyer relationship.',
      sales_admin: 'Sales administration staff who coordinate bookings.',
      loan_admin: 'Loan administration staff who deal with bankers.',
      legal: 'The law firm handling the SPA.',
      none: 'Nobody needs to act on this message.'
    }),
    withdrawalRisk: noul('Is the buyer showing signs of withdrawing or disengaging from this booking?', {
      true: 'The message mentions cancelling, pulling out, serious doubts or going silent.',
      false: 'The buyer is engaged, or the message is routine business.'
    }),
    needsAction: noul('Does this message require a staff follow-up action?', {
      true: 'Staff must chase, request, confirm, schedule or escalate something.',
      false: 'No follow-up is needed; the message is informational only.'
    })
  }
  return { state, questions }
}

export function nextActionJob(input: { summary: CaseSummary; recentMessages: Message[] }) {
  const state = {
    case: caseState(input.summary),
    recent_messages: input.recentMessages.slice(-3).map(messageState)
  }
  const questions = {
    action: choice('What is the single most useful next action to move this booking toward SPA signing?', {
      request_document: 'Chase an outstanding document from the buyer.',
      chase_banker: 'Follow up with the banker on a pending application.',
      submit_another_bank: 'Prepare and submit an application to another bank.',
      call_buyer: 'Call the buyer to keep them engaged or resolve doubts.',
      schedule_spa: 'Arrange or confirm an SPA signing appointment.',
      escalate_legal: 'Escalate to the law firm on a legal-track matter.',
      review_release: 'Review a pending release, refund or approval step.',
      wait: 'Nothing useful to chase; let the current step complete.'
    }),
    owner: choice('Who should own that next action?', {
      sales: 'The sales agent who owns the buyer relationship.',
      sales_admin: 'Sales administration staff who coordinate bookings.',
      loan_admin: 'Loan administration staff who deal with bankers.',
      legal: 'The law firm handling the SPA.'
    }),
    urgency: score('How soon should that action happen?', [
      'Within a week is fine; the case is progressing normally.',
      'This week; the case is slowing down and needs attention.',
      'Today; the booking is stalled or at risk of falling through.'
    ])
  }
  return { state, questions }
}

export function playbooksJob(input: {
  summary: CaseSummary
  query: string
  candidates: { playbook: Playbook; keywordScore: number }[]
}) {
  const state = {
    case: caseState(input.summary),
    blocker: input.summary.stallReasons[0] ?? null,
    query: input.query,
    candidates: input.candidates.map((candidate) => ({
      id: candidate.playbook.id,
      title: candidate.playbook.title,
      situation: candidate.playbook.situation,
      action: candidate.playbook.action,
      limits: candidate.playbook.limits
    }))
  }
  const questions = Object.fromEntries(
    input.candidates.map((candidate, index) => [
      `fit_${candidate.playbook.id}`,
      score(`How well does the playbook at \`candidates[${index}]\` apply to this case's current blocker and query?`, [
        'Does not apply to this case.',
        'Partly applies; the situation is related but some conditions differ.',
        'Directly applies to the current blocker.'
      ])
    ])
  )
  return { state, questions }
}

export function signalsJob(input: { bookingId: string; messages: Message[] }) {
  const ordered = [...input.messages].sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1))
  const state = {
    buyer_messages: ordered
      .filter((message) => message.senderRole === 'buyer')
      .map((message) => {
        const index = ordered.indexOf(message)
        const previous = index > 0 ? ordered[index - 1] : null
        const gapHours = previous
          ? Math.round(((Date.parse(message.sentAt) - Date.parse(previous.sentAt)) / 3_600_000) * 10) / 10
          : null
        return { sent_at: message.sentAt, hours_since_previous_message: gapHours, body: message.body }
      })
  }
  const questions = {
    responsiveness: score('How responsive is the buyer, judging by reply speed and engagement?', [
      'Unresponsive: long silences or ignored chases.',
      'Slow: replies eventually, sometimes only after reminders.',
      'Prompt: replies quickly and shares updates proactively.'
    ]),
    hesitation: score('How hesitant is the buyer about proceeding with the purchase?', [
      'Committed: no doubts expressed.',
      'Some doubts: questions, comparisons or delays, but still engaged.',
      'Strong doubts: mentions cancelling, other projects or money problems.'
    ])
  }
  return { state, questions }
}

/** The default playbooks query for a case: derived from its blocker, as the GET route does. */
export function defaultPlaybookQuery(summary: CaseSummary): string {
  const document = summary.outstandingDocuments[0]
  if (document) return `missing ${document.replace(/_/g, ' ')}`
  if (summary.stallReasons.length > 0) return summary.stallReasons.join(' ')
  return `${summary.stage.replace(/_/g, ' ')} follow-up`
}
