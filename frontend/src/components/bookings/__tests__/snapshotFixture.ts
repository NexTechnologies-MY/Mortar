/**
 * A mocked snapshot for the bookings page tests: a small generated dataset
 * plus the eight story fixtures, a cached Jev extraction and its provisional
 * proposal on the BK-9001 banker message, one open task, buyer signals and a
 * playbook ranking — everything the pages need without a server.
 */

import {
  DEFAULT_SEED,
  PLAYBOOKS,
  REFERENCE_DATE,
  STORIES,
  generate,
  type BuyerSignals,
  type CaseEvent,
  type Extraction,
  type PlaybookRanking,
  type Snapshot,
  type Task
} from '@mortar/core'

export const EXTRACTION_9001: Extraction = {
  messageId: 'MSG-9001-4',
  event: {
    value: 'documents_requested',
    probabilities: { documents_requested: 0.94 },
    confidence: 0.91
  },
  document: { value: 'payslip', probabilities: { payslip: 0.97 }, confidence: 0.93 },
  owner: { value: 'loan_admin', probabilities: { loan_admin: 0.8 }, confidence: 0.88 },
  withdrawalRisk: 0.05,
  needsAction: 0.95,
  meta: { source: 'cache', stale: false, latencyMs: null }
}

export const PROPOSAL_9001: CaseEvent = {
  id: 'EV-9001-J1',
  bookingId: 'BK-9001',
  applicationId: 'APP-9001-1',
  track: 'loan',
  kind: 'documents_requested',
  occurredAt: '2026-09-16T15:30:00+08:00',
  recordedAt: '2026-09-16T15:31:00+08:00',
  reportedBy: 'Jev',
  verifiedBy: null,
  status: 'provisional',
  source: 'jev',
  messageId: 'MSG-9001-4',
  document: 'payslip',
  note: '94% Probability'
}

export const TASK_9001: Task = {
  id: 'TSK-9001-1',
  bookingId: 'BK-9001',
  action: 'request_document',
  title: 'Request Latest Three Months Payslips From Buyer',
  ownerRole: 'sales_admin',
  ownerName: 'Nurul Aina',
  dueOn: '2026-09-18',
  status: 'open',
  origin: 'jev',
  createdAt: '2026-09-17T09:00:00+08:00',
  completedAt: null
}

export const SIGNALS_9001: BuyerSignals = {
  bookingId: 'BK-9001',
  responsiveness: { score: 2, confidence: 0.9 },
  hesitation: { score: 0, confidence: 0.85 },
  meta: { source: 'cache', stale: false, latencyMs: null }
}

export const RANKING_9001: PlaybookRanking = {
  bookingId: 'BK-9001',
  query: 'missing documents',
  results: [
    { playbookId: 'PB-001', keywordScore: 1, fit: { score: 2, confidence: 0.92 } },
    { playbookId: 'PB-020', keywordScore: 0.7, fit: { score: 1, confidence: 0.7 } }
  ],
  meta: { source: 'cache', stale: false, latencyMs: null }
}

export function buildSnapshot(): Snapshot {
  const generated = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 20 })
  return {
    bookings: [...generated.bookings, ...STORIES.map((s) => s.booking)],
    applications: [...generated.applications, ...STORIES.flatMap((s) => s.applications)],
    events: [...generated.events, ...STORIES.flatMap((s) => s.events), PROPOSAL_9001],
    messages: STORIES.flatMap((s) => s.messages),
    playbooks: PLAYBOOKS,
    tasks: [TASK_9001],
    extractions: [EXTRACTION_9001],
    signals: [SIGNALS_9001],
    nextActions: [],
    meta: { seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, resetAt: null }
  }
}
