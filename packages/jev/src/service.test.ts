import { describe, expect, it } from 'vitest'
import type { TypeSafeClient } from '@typesafe-ai/sdk'
import type { CaseSummary, JevCache, JevKind, Message, Playbook } from '@mortar/core'
import { QUESTION_VERSION, createJevService, extractJob, jevInputHash, playbooksJob } from './index'

type JevClient = Pick<TypeSafeClient, 'systemOne'>

interface CapturedRequest {
  model?: string
  state: unknown
  questions: Record<string, { type?: string; criteria?: unknown }>
}

function fakeClient(behaviour: object | ((request: CapturedRequest) => object)) {
  const calls: CapturedRequest[] = []
  const client = {
    systemOne: async (request: CapturedRequest) => {
      calls.push(request)
      const result = typeof behaviour === 'function' ? behaviour(request) : behaviour
      return { model: 'jev-latest', answers: result, usage: { input_tokens: 100, output_tokens: 20 } }
    }
  }
  return { client: client as unknown as JevClient, calls }
}

function failingClient(error: Error = new Error('jev down')) {
  const calls: CapturedRequest[] = []
  const client = {
    systemOne: async (request: CapturedRequest) => {
      calls.push(request)
      throw error
    }
  }
  return { client: client as unknown as JevClient, calls }
}

class MemoryCache implements JevCache {
  entries: { kind: JevKind; subjectId: string; inputHash: string; answer: unknown; latencyMs: number }[] = []

  get<T>(kind: JevKind, subjectId: string, inputHash: string) {
    const exact = [...this.entries]
      .reverse()
      .find((entry) => entry.kind === kind && entry.subjectId === subjectId && entry.inputHash === inputHash)
    if (exact) return Promise.resolve({ answer: exact.answer as T, stale: false })
    const latest = [...this.entries].reverse().find((entry) => entry.kind === kind && entry.subjectId === subjectId)
    return Promise.resolve(latest ? { answer: latest.answer as T, stale: true } : null)
  }

  put<T>(kind: JevKind, subjectId: string, inputHash: string, answer: T, latencyMs: number) {
    this.entries.push({ kind, subjectId, inputHash, answer, latencyMs })
    return Promise.resolve()
  }
}

const summary = (overrides: Partial<CaseSummary> = {}): CaseSummary => ({
  bookingId: 'BK-9001',
  stage: 'loan_applied',
  unknown: false,
  bookingAgeDays: 12,
  daysSinceEvidence: 6,
  daysSinceLoIssued: null,
  daysSinceSpaSet: null,
  applications: [{ id: 'LA-1', bank: 'Fictional Bank A', status: 'documents_pending' }],
  outstandingDocuments: ['payslip'],
  risk: {
    level: 'low',
    loanRm: 450000,
    instalmentRm: 2000,
    debtServiceRatio: 0.3,
    marginOfFinancing: 0.9,
    reasons: []
  },
  stallReasons: ['Document Outstanding 5+ Days'],
  openTasks: 0,
  ...overrides
})

const message = (overrides: Partial<Message> = {}): Message => ({
  id: 'MSG-1',
  bookingId: 'BK-9001',
  senderRole: 'banker',
  senderName: 'Encik Farid',
  language: 'mixed',
  sentAt: '2026-09-17T14:00:00+08:00',
  body: 'Payslip 3 bulan buyer dah hantar semalam.',
  origin: 'live',
  ...overrides
})

const playbook = (overrides: Partial<Playbook>): Playbook => ({
  id: 'PB-01',
  title: 'Missing Income Documents',
  situation: 'The banker is waiting on payslips.',
  evidence: '',
  action: 'Request the outstanding documents.',
  rationale: '',
  limits: '',
  outcome: '',
  author: 'A',
  reviewer: 'R',
  reviewedOn: '2026-09-01',
  status: 'approved',
  tags: ['payslip'],
  ...overrides
})

const extractAnswers = {
  event: {
    type: 'choice',
    choice: 'documents_received',
    confidence: 0.92,
    probabilities: { documents_received: 0.92, no_update: 0.05, documents_requested: 0.03 }
  },
  document: { type: 'choice', choice: 'payslip', confidence: 0.9, probabilities: { payslip: 0.9, none: 0.1 } },
  owner: { type: 'choice', choice: 'loan_admin', confidence: 0.8, probabilities: { loan_admin: 0.8 } },
  withdrawalRisk: { type: 'noul', noul: 0.05 },
  needsAction: { type: 'noul', noul: 0.3 }
}

describe('extract', () => {
  it('fans out one request and maps the answers', async () => {
    const { client, calls } = fakeClient(extractAnswers)
    const cache = new MemoryCache()
    const jev = createJevService({ client, cache })

    const extraction = await jev.extract({ message: message(), summary: summary() })

    expect(calls).toHaveLength(1)
    expect(calls[0].model).toBe('jev-latest')
    expect(extraction.messageId).toBe('MSG-1')
    expect(extraction.event.value).toBe('documents_received')
    expect(extraction.event.confidence).toBe(0.92)
    expect(extraction.event.probabilities.documents_received).toBe(0.92)
    expect(extraction.document.value).toBe('payslip')
    expect(extraction.owner.value).toBe('loan_admin')
    expect(extraction.withdrawalRisk).toBe(0.05)
    expect(extraction.needsAction).toBe(0.3)
    expect(extraction.meta.source).toBe('live')
    expect(extraction.meta.stale).toBe(false)
    expect(typeof extraction.meta.latencyMs).toBe('number')
    expect(cache.entries).toHaveLength(1)
    expect(cache.entries[0].kind).toBe('extract')
    expect(cache.entries[0].subjectId).toBe('MSG-1')
  })

  it('builds the full question set with described options and a no-match outcome', async () => {
    const { client, calls } = fakeClient(extractAnswers)
    const jev = createJevService({ client, cache: new MemoryCache() })

    await jev.extract({ message: message(), summary: summary() })

    const { state, questions } = calls[0]
    expect(JSON.stringify(state)).toContain('Payslip 3 bulan buyer dah hantar semalam.')
    expect(questions.event.type).toBe('choice')
    expect(Object.keys(questions.event.criteria as object)).toContain('no_update')
    expect(Object.keys(questions.document.criteria as object)).toContain('none')
    expect(Object.keys(questions.owner.criteria as object)).toContain('none')
    expect(questions.withdrawalRisk.type).toBe('noul')
    expect(questions.needsAction.type).toBe('noul')
  })

  it('falls back to the exact cached answer on a live error', async () => {
    const { client } = failingClient()
    const cache = new MemoryCache()
    const inputHash = jevInputHash(
      'extract',
      extractJob({ message: message(), summary: summary() }).state,
      QUESTION_VERSION.extract
    )
    cache.entries.push({
      kind: 'extract',
      subjectId: 'MSG-1',
      inputHash,
      answer: cachedExtraction(),
      latencyMs: 10
    })
    const jev = createJevService({ client, cache })

    const extraction = await jev.extract({ message: message(), summary: summary() })
    expect(extraction.meta).toEqual({ source: 'cache', stale: false, latencyMs: null })
    expect(extraction.event.value).toBe('documents_received')
  })

  it('returns the latest cached answer as stale when the input changed', async () => {
    const { client } = failingClient()
    const cache = new MemoryCache()
    cache.entries.push({
      kind: 'extract',
      subjectId: 'MSG-1',
      inputHash: 'older-hash',
      answer: cachedExtraction({ event: { value: 'documents_requested', probabilities: {}, confidence: 0.7 } }),
      latencyMs: 10
    })
    const jev = createJevService({ client, cache })

    const extraction = await jev.extract({ message: message(), summary: summary() })
    expect(extraction.meta.source).toBe('cache')
    expect(extraction.meta.stale).toBe(true)
    expect(extraction.event.value).toBe('documents_requested')
  })

  it('answers neutrally when live fails and nothing is cached', async () => {
    const { client } = failingClient()
    const jev = createJevService({ client, cache: new MemoryCache() })

    const extraction = await jev.extract({ message: message(), summary: summary() })
    expect(extraction.meta.source).toBe('unavailable')
    expect(extraction.event.value).toBe('no_update')
    expect(extraction.document.value).toBe('none')
    expect(extraction.owner.value).toBe('none')
    expect(extraction.withdrawalRisk).toBe(0.5)
  })

  it('runs cache-only when no key and no client are configured', async () => {
    const jev = createJevService({ cache: new MemoryCache() })
    const extraction = await jev.extract({ message: message(), summary: summary() })
    expect(extraction.meta.source).toBe('unavailable')
  })
})

const cachedExtraction = (overrides: Record<string, unknown> = {}) => ({
  messageId: 'MSG-1',
  event: { value: 'documents_received', probabilities: {}, confidence: 0.9 },
  document: { value: 'payslip', probabilities: {}, confidence: 0.9 },
  owner: { value: 'loan_admin', probabilities: {}, confidence: 0.8 },
  withdrawalRisk: 0.05,
  needsAction: 0.3,
  meta: { source: 'live', stale: false, latencyMs: 400 },
  ...overrides
})

describe('nextAction', () => {
  const answers = {
    action: { type: 'choice', choice: 'request_document', confidence: 0.95, probabilities: { request_document: 0.95 } },
    owner: { type: 'choice', choice: 'sales', confidence: 0.8, probabilities: { sales: 0.8 } },
    urgency: { type: 'score', score: 1.8, confidence: 0.9, legend: {}, probabilities: { '2': 0.8, '1': 0.2 } }
  }

  it('maps action, owner and urgency and keeps only the last three messages in state', async () => {
    const { client, calls } = fakeClient(answers)
    const jev = createJevService({ client, cache: new MemoryCache() })
    const messages = ['m1', 'm2', 'm3', 'm4'].map((id, i) =>
      message({ id, body: `body ${id}`, sentAt: `2026-09-1${i}T10:00:00+08:00` })
    )

    const suggestion = await jev.nextAction({ summary: summary(), recentMessages: messages })

    expect(suggestion.action.value).toBe('request_document')
    expect(suggestion.owner.value).toBe('sales')
    expect(suggestion.urgency.score).toBe(1.8)
    expect(suggestion.meta.source).toBe('live')
    const stateJson = JSON.stringify(calls[0].state)
    expect(stateJson).not.toContain('body m1')
    expect(stateJson).toContain('body m4')
    expect(calls[0].questions.urgency.type).toBe('score')
  })
})

describe('rankPlaybooks', () => {
  const candidates = [
    { playbook: playbook({ id: 'PB-01' }), keywordScore: 1 },
    { playbook: playbook({ id: 'PB-02', title: 'Second Bank Submission' }), keywordScore: 0.5 }
  ]
  const answers = {
    'fit_PB-01': { type: 'score', score: 2, confidence: 0.95, legend: {}, probabilities: { '2': 0.95 } },
    'fit_PB-02': { type: 'score', score: 0.4, confidence: 0.7, legend: {}, probabilities: { '0': 0.6 } }
  }
  const input = () => ({ summary: summary(), query: 'missing payslip', candidates })

  it('asks one fit Score per candidate and maps them back', async () => {
    const { client, calls } = fakeClient(answers)
    const jev = createJevService({ client, cache: new MemoryCache() })

    const ranking = await jev.rankPlaybooks(input())

    expect(Object.keys(calls[0].questions)).toEqual(['fit_PB-01', 'fit_PB-02'])
    expect(calls[0].questions['fit_PB-01'].type).toBe('score')
    expect(ranking.results[0]).toEqual({ playbookId: 'PB-01', keywordScore: 1, fit: { score: 2, confidence: 0.95 } })
    expect(ranking.results[1].fit?.score).toBe(0.4)
    expect(ranking.meta.source).toBe('live')
  })

  it('serves an exact cache hit without calling Jev', async () => {
    const { client, calls } = fakeClient(answers)
    const cache = new MemoryCache()
    const job = playbooksJob(input())
    const inputHash = jevInputHash('playbooks', job.state, QUESTION_VERSION.playbooks)
    cache.entries.push({
      kind: 'playbooks',
      subjectId: 'BK-9001',
      inputHash,
      answer: {
        bookingId: 'BK-9001',
        query: 'missing payslip',
        results: [{ playbookId: 'PB-01', keywordScore: 1, fit: { score: 2, confidence: 0.9 } }],
        meta: { source: 'live', stale: false, latencyMs: 300 }
      },
      latencyMs: 300
    })
    const jev = createJevService({ client, cache })

    const ranking = await jev.rankPlaybooks(input())
    expect(calls).toHaveLength(0)
    expect(ranking.meta.source).toBe('cache')
    expect(ranking.results[0].fit?.score).toBe(2)
  })

  it('calls Jev live when the only cached ranking is for a different input', async () => {
    const { client, calls } = fakeClient(answers)
    const cache = new MemoryCache()
    cache.entries.push({
      kind: 'playbooks',
      subjectId: 'BK-9001',
      inputHash: 'older-hash',
      answer: {
        bookingId: 'BK-9001',
        query: 'earlier query',
        results: [{ playbookId: 'PB-02', keywordScore: 0.5, fit: { score: 1, confidence: 0.5 } }],
        meta: { source: 'live', stale: false, latencyMs: 300 }
      },
      latencyMs: 300
    })
    const jev = createJevService({ client, cache })

    const ranking = await jev.rankPlaybooks(input())
    expect(calls).toHaveLength(1)
    expect(ranking.meta.source).toBe('live')
    expect(ranking.meta.stale).toBe(false)
    expect(ranking.results[0].fit?.score).toBe(2)
  })

  it('serves the stale cached ranking only after the live call fails', async () => {
    const { client, calls } = failingClient()
    const cache = new MemoryCache()
    cache.entries.push({
      kind: 'playbooks',
      subjectId: 'BK-9001',
      inputHash: 'older-hash',
      answer: {
        bookingId: 'BK-9001',
        query: 'earlier query',
        results: [{ playbookId: 'PB-02', keywordScore: 0.5, fit: { score: 1, confidence: 0.5 } }],
        meta: { source: 'live', stale: false, latencyMs: 300 }
      },
      latencyMs: 300
    })
    const jev = createJevService({ client, cache })

    const ranking = await jev.rankPlaybooks(input())
    expect(calls).toHaveLength(1)
    expect(ranking.meta.source).toBe('cache')
    expect(ranking.meta.stale).toBe(true)
    expect(ranking.query).toBe('earlier query')
  })

  it('returns null fits when nothing is available', async () => {
    const { client } = failingClient()
    const jev = createJevService({ client, cache: new MemoryCache() })
    const ranking = await jev.rankPlaybooks(input())
    expect(ranking.meta.source).toBe('unavailable')
    expect(ranking.results.every((r) => r.fit === null)).toBe(true)
  })
})

describe('signals', () => {
  it('computes response gaps in state and maps both scores', async () => {
    const answers = {
      responsiveness: { type: 'score', score: 1.9, confidence: 0.9, legend: {}, probabilities: { '2': 0.9 } },
      hesitation: { type: 'score', score: 0.2, confidence: 0.9, legend: {}, probabilities: { '0': 0.9 } }
    }
    const { client, calls } = fakeClient(answers)
    const jev = createJevService({ client, cache: new MemoryCache() })
    const messages = [
      message({ id: 'B1', senderRole: 'banker', sentAt: '2026-09-15T10:00:00+08:00' }),
      message({ id: 'B2', senderRole: 'buyer', sentAt: '2026-09-15T12:00:00+08:00', body: 'ok noted' }),
      message({ id: 'B3', senderRole: 'buyer', sentAt: '2026-09-16T12:00:00+08:00', body: 'sent already' })
    ]

    const signals = await jev.signals({ bookingId: 'BK-9001', messages })

    expect(signals.responsiveness.score).toBe(1.9)
    expect(signals.hesitation.score).toBe(0.2)
    const state = calls[0].state as { buyer_messages: { hours_since_previous_message: number | null }[] }
    expect(state.buyer_messages).toHaveLength(2)
    expect(state.buyer_messages[0].hours_since_previous_message).toBe(2)
    expect(state.buyer_messages[1].hours_since_previous_message).toBe(24)
  })

  it('calls Jev live on a hash miss even when older signals are cached', async () => {
    const answers = {
      responsiveness: { type: 'score', score: 1, confidence: 0.8, legend: {}, probabilities: { '1': 0.8 } },
      hesitation: { type: 'score', score: 0, confidence: 0.8, legend: {}, probabilities: { '0': 0.8 } }
    }
    const { client, calls } = fakeClient(answers)
    const cache = new MemoryCache()
    cache.entries.push({
      kind: 'signals',
      subjectId: 'BK-9001',
      inputHash: 'older-hash',
      answer: {
        bookingId: 'BK-9001',
        responsiveness: { score: 0, confidence: 0.5 },
        hesitation: { score: 2, confidence: 0.5 },
        meta: { source: 'live', stale: false, latencyMs: 200 }
      },
      latencyMs: 200
    })
    const jev = createJevService({ client, cache })

    const signals = await jev.signals({ bookingId: 'BK-9001', messages: [message()] })
    expect(calls).toHaveLength(1)
    expect(signals.meta.source).toBe('live')
    expect(signals.responsiveness.score).toBe(1)
  })
})

describe('jevInputHash', () => {
  it('is stable across key order and changes with the state', () => {
    const a = jevInputHash('extract', { x: 1, y: { b: 2, a: 1 } }, 1)
    const b = jevInputHash('extract', { y: { a: 1, b: 2 }, x: 1 }, 1)
    expect(a).toBe(b)
    expect(jevInputHash('extract', { x: 2 }, 1)).not.toBe(a)
    expect(jevInputHash('extract', { x: 1 }, 2)).not.toBe(a)
  })
})
