/**
 * Jev wiring for the server. `DbJevCache` is the `JevCache` contract backed by
 * the `jev_answers` table — W3 passes it to `createJevService`. Until that
 * package lands, `unavailableJevService` stands in and answers every job with
 * `source: 'unavailable'`, so routes and tests exercise the fallback path.
 */
import type { JevCache, JevKind, JevMeta, JevService } from '@mortar/core'
import type { Database } from '../db/index'

export class DbJevCache implements JevCache {
  constructor(private db: Database) {}

  get<T>(kind: JevKind, subjectId: string, inputHash: string): Promise<{ answer: T; stale: boolean } | null> {
    return this.db.jevGet(kind, subjectId, inputHash) as Promise<{ answer: T; stale: boolean } | null>
  }

  async put<T>(kind: JevKind, subjectId: string, inputHash: string, answer: T, latencyMs: number): Promise<void> {
    await this.db.jevPut({ kind, subjectId, inputHash, answer, source: 'live', latencyMs })
  }
}

const unavailable = (): JevMeta => ({ source: 'unavailable', stale: false, latencyMs: null })

/** Neutral answers with zero confidence; the UI shows the Unavailable tag. */
export const unavailableJevService: JevService = {
  async extract({ message }) {
    return {
      messageId: message.id,
      event: { value: 'no_update', probabilities: {}, confidence: 0 },
      document: { value: 'none', probabilities: {}, confidence: 0 },
      owner: { value: 'none', probabilities: {}, confidence: 0 },
      withdrawalRisk: 0,
      needsAction: 0,
      meta: unavailable()
    }
  },
  async nextAction({ summary }) {
    return {
      bookingId: summary.bookingId,
      action: { value: 'wait', probabilities: {}, confidence: 0 },
      owner: { value: 'sales_admin', probabilities: {}, confidence: 0 },
      urgency: { score: 1, confidence: 0 },
      meta: unavailable()
    }
  },
  async rankPlaybooks({ summary, query, candidates }) {
    return {
      bookingId: summary.bookingId,
      query,
      results: candidates.map((c) => ({ playbookId: c.playbook.id, keywordScore: c.keywordScore, fit: null })),
      meta: unavailable()
    }
  },
  async signals({ bookingId }) {
    return {
      bookingId,
      responsiveness: { score: 1, confidence: 0 },
      hesitation: { score: 1, confidence: 0 },
      meta: unavailable()
    }
  }
}
