/**
 * Jev helpers shared by the server and the browser (lane W3).
 * Signatures are part of the contract.
 */
import MiniSearch from 'minisearch'
import type { CaseEvent, CaseSummary, EventKind, ExtractedEvent, Extraction, Message, Playbook, Track } from './types'

/** Answers below this confidence are shown as "Needs Review" in the UI. */
export const JEV_REVIEW_THRESHOLD = 0.6

const STATUS_RANK: Record<Playbook['status'], number> = { approved: 0, draft: 1, superseded: 2, retired: 3 }

/** Keyword search over playbooks, including Malay and Manglish synonyms in `tags`. */
export function searchPlaybooks(
  playbooks: Playbook[],
  query: string,
  limit = 10
): { playbook: Playbook; keywordScore: number }[] {
  if (!query.trim()) {
    return playbooks
      .filter((playbook) => playbook.status === 'approved')
      .slice(0, limit)
      .map((playbook) => ({ playbook, keywordScore: 0 }))
  }
  const index = new MiniSearch({
    fields: ['title', 'situation', 'action', 'tags'],
    searchOptions: { boost: { tags: 2 }, prefix: true, fuzzy: 0.2 }
  })
  index.addAll(
    playbooks.map((playbook) => ({
      id: playbook.id,
      title: playbook.title,
      situation: playbook.situation,
      action: playbook.action,
      tags: playbook.tags.join(' ')
    }))
  )
  const byId = new Map(playbooks.map((playbook) => [playbook.id, playbook]))
  const hits = index
    .search(query)
    .flatMap((hit) => {
      const playbook = byId.get(hit.id as string)
      return playbook ? [{ playbook, score: hit.score }] : []
    })
    .sort((a, b) => STATUS_RANK[a.playbook.status] - STATUS_RANK[b.playbook.status])
    .slice(0, limit)
  const top = hits[0]?.score ?? 0
  return hits.map(({ playbook, score }) => ({ playbook, keywordScore: top > 0 ? score / top : 0 }))
}

const EVENT_MAP: Partial<Record<ExtractedEvent, { track: Track; kind: EventKind }>> = {
  loan_approved: { track: 'loan', kind: 'loan_approved' },
  loan_rejected: { track: 'loan', kind: 'loan_rejected' },
  documents_requested: { track: 'loan', kind: 'documents_requested' },
  documents_received: { track: 'loan', kind: 'documents_received' },
  valuation_shortfall: { track: 'loan', kind: 'valuation_shortfall' },
  buyer_hesitant: { track: 'sales', kind: 'buyer_hesitant' },
  buyer_withdrawing: { track: 'sales', kind: 'buyer_withdrew' },
  spa_appointment: { track: 'legal', kind: 'spa_appointment_set' },
  spa_signed: { track: 'legal', kind: 'spa_signed' }
}

/** Turn an extraction into a provisional event for staff review; `null` for `no_update`. */
export function proposalFromExtraction(
  extraction: Extraction,
  message: Message,
  summary: CaseSummary
): Omit<CaseEvent, 'id' | 'recordedAt'> | null {
  const target = EVENT_MAP[extraction.event.value]
  if (!target) return null
  const probability = extraction.event.probabilities[extraction.event.value] ?? 0
  const openApplications = summary.applications.filter(
    (application) => application.status === 'submitted' || application.status === 'documents_pending'
  )
  return {
    bookingId: message.bookingId,
    applicationId: target.track === 'loan' ? (openApplications[openApplications.length - 1]?.id ?? null) : null,
    track: target.track,
    kind: target.kind,
    occurredAt: message.sentAt,
    reportedBy: 'Jev',
    verifiedBy: null,
    status: 'provisional',
    source: 'jev',
    messageId: message.id,
    document: extraction.document.value === 'none' ? null : extraction.document.value,
    note: `${Math.round(probability * 100)}% Probability`
  }
}
