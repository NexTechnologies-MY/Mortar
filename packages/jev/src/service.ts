/**
 * `createJevService` implements the `JevService` contract over the TypeSafe SDK.
 * Live-first jobs (`extract`, `nextAction`) call Jev, cache the answer, and on
 * error or timeout fall back to the cache, then to neutral answers. Cache-first
 * jobs (`rankPlaybooks`, `signals`) try the exact input hash first. Without an
 * API key the service runs cache-only.
 */
import { TypeSafeClient } from '@typesafe-ai/sdk'
import type { EntryType, Questions, ResultFor } from '@typesafe-ai/sdk'
import type {
  BuyerSignals,
  Extraction,
  JevCache,
  JevKind,
  JevMeta,
  JevService,
  NextActionSuggestion,
  PlaybookRanking,
  ScoreAnswer
} from '@mortar/core'
import { jevInputHash } from './hash'
import { QUESTION_VERSION, extractJob, nextActionJob, playbooksJob, signalsJob } from './jobs'

const JEV_MODEL = 'jev-latest'

const UNAVAILABLE: JevMeta = { source: 'unavailable', stale: false, latencyMs: null }

export interface JevServiceOptions {
  apiKey?: string
  cache: JevCache
  timeoutMs?: number
  /** Injectable client for tests and the precompute script's usage metering. */
  client?: Pick<TypeSafeClient, 'systemOne'>
}

type AnswersOf<Q extends Questions> = { readonly [K in keyof Q]: ResultFor<Q[K]> }

export function createJevService(options: JevServiceOptions): JevService {
  const cache = options.cache
  const timeoutMs = options.timeoutMs ?? 3000
  const client =
    options.client ??
    (options.apiKey
      ? new TypeSafeClient({
          apiKey: options.apiKey,
          timeout: timeoutMs,
          retry: { maxRetries: 0 },
          defaultModel: JEV_MODEL
        })
      : null)

  async function cached<A extends { meta: JevMeta }>(kind: JevKind, subjectId: string, inputHash: string) {
    try {
      const hit = await cache.get<A>(kind, subjectId, inputHash)
      return hit ? { ...hit.answer, meta: { source: 'cache' as const, stale: hit.stale, latencyMs: null } } : null
    } catch {
      return null
    }
  }

  async function run<Q extends Questions, A extends { meta: JevMeta }>(job: {
    kind: JevKind
    subjectId: string
    cacheFirst: boolean
    state: EntryType
    questions: Q
    map: (answers: AnswersOf<Q>, meta: JevMeta) => A
    neutral: () => A
  }): Promise<A> {
    const inputHash = jevInputHash(job.kind, job.state, QUESTION_VERSION[job.kind])
    let staleFallback: A | null = null
    if (job.cacheFirst) {
      const hit = await cached<A>(job.kind, job.subjectId, inputHash)
      // Only an exact-hash hit is served; a stale answer is kept as the fallback
      // while Jev gets a live shot at the new input.
      if (hit && !hit.meta.stale) return hit
      staleFallback = hit
    }
    if (client) {
      try {
        const startedAt = Date.now()
        const result = await client.systemOne({ model: JEV_MODEL, state: job.state, questions: job.questions })
        const latencyMs = Date.now() - startedAt
        const answer = job.map(result.answers, { source: 'live', stale: false, latencyMs })
        try {
          await cache.put(job.kind, job.subjectId, inputHash, answer, latencyMs)
        } catch {
          // The cache is best-effort; a live answer still returns.
        }
        return answer
      } catch {
        // Fall through to the cached and neutral fallbacks.
      }
    }
    return staleFallback ?? (await cached<A>(job.kind, job.subjectId, inputHash)) ?? job.neutral()
  }

  const scoreAnswer = (answer: { score: number; confidence: number }): ScoreAnswer => ({
    score: answer.score,
    confidence: answer.confidence
  })

  return {
    extract(input) {
      const job = extractJob(input)
      return run({
        kind: 'extract',
        subjectId: input.message.id,
        cacheFirst: false,
        state: job.state,
        questions: job.questions,
        map: (answers, meta): Extraction => ({
          messageId: input.message.id,
          event: {
            value: answers.event.choice,
            probabilities: answers.event.probabilities,
            confidence: answers.event.confidence
          },
          document: {
            value: answers.document.choice,
            probabilities: answers.document.probabilities,
            confidence: answers.document.confidence
          },
          owner: {
            value: answers.owner.choice,
            probabilities: answers.owner.probabilities,
            confidence: answers.owner.confidence
          },
          withdrawalRisk: answers.withdrawalRisk.noul,
          needsAction: answers.needsAction.noul,
          meta
        }),
        neutral: (): Extraction => ({
          messageId: input.message.id,
          event: { value: 'no_update', probabilities: {}, confidence: 0 },
          document: { value: 'none', probabilities: {}, confidence: 0 },
          owner: { value: 'none', probabilities: {}, confidence: 0 },
          withdrawalRisk: 0.5,
          needsAction: 0.5,
          meta: UNAVAILABLE
        })
      })
    },

    nextAction(input) {
      const job = nextActionJob(input)
      return run({
        kind: 'next_action',
        subjectId: input.summary.bookingId,
        cacheFirst: false,
        state: job.state,
        questions: job.questions,
        map: (answers, meta): NextActionSuggestion => ({
          bookingId: input.summary.bookingId,
          action: {
            value: answers.action.choice,
            probabilities: answers.action.probabilities,
            confidence: answers.action.confidence
          },
          owner: {
            value: answers.owner.choice,
            probabilities: answers.owner.probabilities,
            confidence: answers.owner.confidence
          },
          urgency: scoreAnswer(answers.urgency),
          meta
        }),
        neutral: (): NextActionSuggestion => ({
          bookingId: input.summary.bookingId,
          action: { value: 'wait', probabilities: {}, confidence: 0 },
          owner: { value: 'sales_admin', probabilities: {}, confidence: 0 },
          urgency: { score: 1, confidence: 0 },
          meta: UNAVAILABLE
        })
      })
    },

    rankPlaybooks(input) {
      const job = playbooksJob(input)
      return run({
        kind: 'playbooks',
        subjectId: input.summary.bookingId,
        cacheFirst: true,
        state: job.state,
        questions: job.questions,
        map: (answers, meta): PlaybookRanking => ({
          bookingId: input.summary.bookingId,
          query: input.query,
          results: input.candidates.map((candidate) => ({
            playbookId: candidate.playbook.id,
            keywordScore: candidate.keywordScore,
            fit: scoreAnswer(answers[`fit_${candidate.playbook.id}`])
          })),
          meta
        }),
        neutral: (): PlaybookRanking => ({
          bookingId: input.summary.bookingId,
          query: input.query,
          results: input.candidates.map((candidate) => ({
            playbookId: candidate.playbook.id,
            keywordScore: candidate.keywordScore,
            fit: null
          })),
          meta: UNAVAILABLE
        })
      })
    },

    signals(input) {
      const job = signalsJob(input)
      return run({
        kind: 'signals',
        subjectId: input.bookingId,
        cacheFirst: true,
        state: job.state,
        questions: job.questions,
        map: (answers, meta): BuyerSignals => ({
          bookingId: input.bookingId,
          responsiveness: scoreAnswer(answers.responsiveness),
          hesitation: scoreAnswer(answers.hesitation),
          meta
        }),
        neutral: (): BuyerSignals => ({
          bookingId: input.bookingId,
          responsiveness: { score: 1, confidence: 0 },
          hesitation: { score: 1, confidence: 0 },
          meta: UNAVAILABLE
        })
      })
    }
  }
}
