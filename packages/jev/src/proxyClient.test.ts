import { describe, expect, it } from 'vitest'
import { choice, noul, score } from '@typesafe-ai/sdk'
import type { CaseSummary, JevCache, JevKind, Message } from '@mortar/core'
import { createJevService } from './service'
import { createProxySystemOne } from './proxyClient'

interface FetchCall {
  url: string
  init: RequestInit
}

interface FakeResponse {
  status?: number
  body?: unknown
  text?: string
}

function fakeFetch(respond: (call: FetchCall) => FakeResponse) {
  const calls: FetchCall[] = []
  const fetchFn = (async (url: string, init?: RequestInit) => {
    const call: FetchCall = { url, init: init ?? {} }
    calls.push(call)
    const { status = 200, body, text } = respond(call)
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => body,
      text: async () => text ?? JSON.stringify(body)
    } as unknown as Response
  }) as typeof fetch
  return { fetchFn, calls }
}

function anthropicText(text: string, extraBlocks: { type: string; text?: string }[] = []) {
  return {
    content: [...extraBlocks, { type: 'text', text }],
    usage: { input_tokens: 111, output_tokens: 22 }
  }
}

const colorQuestions = {
  color: choice('Pick the color mentioned.', { red: 'Red things', blue: 'Blue things', green: 'Green things' })
}

function client(fetchFn: typeof fetch, overrides: Partial<{ timeoutMs: number; model: string }> = {}) {
  return createProxySystemOne({
    url: 'http://proxy.test',
    apiKey: 'secret-key',
    model: overrides.model ?? 'gemini-3-flash',
    timeoutMs: overrides.timeoutMs,
    fetch: fetchFn
  })
}

describe('createProxySystemOne', () => {
  it('sends one Anthropic Messages request with the expected shape and headers', async () => {
    const { fetchFn, calls } = fakeFetch(() => ({
      body: anthropicText(JSON.stringify({ color: { red: 0.7, blue: 0.2, green: 0.1 } }))
    }))

    const proxy = client(fetchFn)
    await proxy.systemOne({ model: 'jev-latest', state: { text: 'the sky is red-ish' }, questions: colorQuestions })

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('http://proxy.test/v1/messages')
    const headers = calls[0].init.headers as Record<string, string>
    expect(headers['x-api-key']).toBe('secret-key')
    expect(headers['anthropic-version']).toBe('2023-06-01')
    expect(headers['content-type']).toBe('application/json')
    const sentBody = JSON.parse(calls[0].init.body as string) as {
      model: string
      max_tokens: number
      messages: { role: string; content: string }[]
    }
    expect(sentBody.model).toBe('gemini-3-flash')
    expect(sentBody.max_tokens).toBe(4096)
    expect(sentBody.messages).toHaveLength(1)
    expect(sentBody.messages[0].role).toBe('user')
    expect(sentBody.messages[0].content).toContain('color')
    expect(sentBody.messages[0].content).toContain('red-ish')
  })

  it('maps a choice question to argmax, confidence, and full probabilities', async () => {
    const { fetchFn } = fakeFetch(() => ({
      body: anthropicText(JSON.stringify({ color: { red: 0.7, blue: 0.2, green: 0.1 } }))
    }))

    const result = await client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })

    expect(result.answers.color.type).toBe('choice')
    expect(result.answers.color.choice).toBe('red')
    expect(result.answers.color.confidence).toBeCloseTo(0.7)
    expect(result.answers.color.probabilities.red).toBeCloseTo(0.7)
    expect(result.answers.color.probabilities.blue).toBeCloseTo(0.2)
    expect(result.answers.color.probabilities.green).toBeCloseTo(0.1)
    expect(result.usage).toEqual({ input_tokens: 111, output_tokens: 22 })
    expect(result.model).toBe('gemini-3-flash')
  })

  it('maps a noul question to P(true)', async () => {
    const yesNoQuestions = { urgent: noul('Is this urgent?', { true: 'Urgent', false: 'Not urgent' }) }
    const { fetchFn } = fakeFetch(() => ({
      body: anthropicText(JSON.stringify({ urgent: { true: 0.3, false: 0.7 } }))
    }))

    const result = await client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: yesNoQuestions })

    expect(result.answers.urgent.type).toBe('noul')
    expect(result.answers.urgent.noul).toBeCloseTo(0.3)
  })

  it('maps a score question to an expected value, confidence, and legend', async () => {
    const urgencyQuestions = { urgency: score('How urgent?', ['low', 'medium', 'high']) }
    const { fetchFn } = fakeFetch(() => ({
      body: anthropicText(JSON.stringify({ urgency: { '0': 0.1, '1': 0.2, '2': 0.7 } }))
    }))

    const result = await client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: urgencyQuestions })

    expect(result.answers.urgency.type).toBe('score')
    expect(result.answers.urgency.score).toBeCloseTo(1.6)
    expect(result.answers.urgency.confidence).toBeCloseTo(0.7)
    expect(result.answers.urgency.legend).toEqual({ '0': 'low', '1': 'medium', '2': 'high' })
    expect(result.answers.urgency.probabilities['0']).toBeCloseTo(0.1)
    expect(result.answers.urgency.probabilities['1']).toBeCloseTo(0.2)
    expect(result.answers.urgency.probabilities['2']).toBeCloseTo(0.7)
  })

  it('skips a leading thinking block that carries no text', async () => {
    const { fetchFn } = fakeFetch(() => ({
      body: anthropicText(JSON.stringify({ color: { red: 1, blue: 0, green: 0 } }), [{ type: 'thinking' }])
    }))

    const result = await client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })

    expect(result.answers.color.choice).toBe('red')
  })

  it('strips a markdown code fence around the JSON', async () => {
    const fenced = '```json\n' + JSON.stringify({ color: { red: 0, blue: 1, green: 0 } }) + '\n```'
    const { fetchFn } = fakeFetch(() => ({ body: anthropicText(fenced) }))

    const result = await client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })

    expect(result.answers.color.choice).toBe('blue')
  })

  it('drops unknown labels and clamps negatives before renormalising to sum 1', async () => {
    const { fetchFn } = fakeFetch(() => ({
      body: anthropicText(JSON.stringify({ color: { red: 3, blue: -1, green: 1, purple: 5 } }))
    }))

    const result = await client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })

    // red=3, blue clamped to 0, green=1, purple (unknown) dropped -> sum 4 -> red .75, blue 0, green .25
    expect(result.answers.color.probabilities.red).toBeCloseTo(0.75)
    expect(result.answers.color.probabilities.blue).toBeCloseTo(0)
    expect(result.answers.color.probabilities.green).toBeCloseTo(0.25)
    expect(result.answers.color.choice).toBe('red')
  })

  it('spreads evenly across labels when every probability is zero or negative', async () => {
    const { fetchFn } = fakeFetch(() => ({
      body: anthropicText(JSON.stringify({ color: { red: 0, blue: -2, green: 0 } }))
    }))

    const result = await client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })

    expect(result.answers.color.probabilities.red).toBeCloseTo(1 / 3)
    expect(result.answers.color.probabilities.blue).toBeCloseTo(1 / 3)
    expect(result.answers.color.probabilities.green).toBeCloseTo(1 / 3)
  })

  it('throws when the response is missing an answer for a question', async () => {
    const { fetchFn } = fakeFetch(() => ({ body: anthropicText(JSON.stringify({ notColor: {} })) }))

    await expect(
      client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })
    ).rejects.toThrow(/missing an answer for "color"/)
  })

  it('throws when the response text is not valid JSON', async () => {
    const { fetchFn } = fakeFetch(() => ({ body: anthropicText('sorry, I cannot answer that') }))

    await expect(
      client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })
    ).rejects.toThrow(/not valid JSON/)
  })

  it('throws on an HTTP error status', async () => {
    const { fetchFn } = fakeFetch(() => ({ status: 500, text: 'internal error' }))

    await expect(
      client(fetchFn).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })
    ).rejects.toThrow(/500/)
  })

  it('throws when the request times out', async () => {
    const hangingFetch = (async (_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const error = new Error('The operation was aborted')
          error.name = 'AbortError'
          reject(error)
        })
      })) as typeof fetch

    await expect(
      client(hangingFetch, { timeoutMs: 20 }).systemOne({ model: 'jev-latest', state: 'x', questions: colorQuestions })
    ).rejects.toThrow(/timed out/)
  })
})

class MemoryCache implements JevCache {
  entries: { kind: JevKind; subjectId: string; inputHash: string; answer: unknown; latencyMs: number }[] = []

  get<T>(kind: JevKind, subjectId: string, inputHash: string) {
    const exact = [...this.entries]
      .reverse()
      .find((entry) => entry.kind === kind && entry.subjectId === subjectId && entry.inputHash === inputHash)
    return Promise.resolve(exact ? { answer: exact.answer as T, stale: false } : null)
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
  buyerWithdrew: false,
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

describe('createJevService over the proxy client', () => {
  it('answers nextAction end-to-end through the proxy with meta.source live', async () => {
    const answerJson = {
      action: {
        request_document: 0.85,
        chase_banker: 0.05,
        submit_another_bank: 0,
        call_buyer: 0.05,
        schedule_spa: 0,
        escalate_legal: 0,
        review_release: 0,
        wait: 0.05
      },
      owner: { sales: 0.1, sales_admin: 0.1, loan_admin: 0.7, legal: 0.1 },
      urgency: { '0': 0.1, '1': 0.2, '2': 0.7 }
    }
    const { fetchFn } = fakeFetch(() => ({ body: anthropicText(JSON.stringify(answerJson)) }))
    const proxy = createProxySystemOne({
      url: 'http://proxy.test',
      apiKey: 'secret-key',
      model: 'gemini-3-flash',
      fetch: fetchFn
    })
    const jev = createJevService({ cache: new MemoryCache(), client: proxy })

    const suggestion = await jev.nextAction({ summary: summary(), recentMessages: [message()] })

    expect(suggestion.action.value).toBe('request_document')
    expect(suggestion.owner.value).toBe('loan_admin')
    expect(suggestion.urgency.score).toBeCloseTo(1.6)
    expect(suggestion.meta.source).toBe('live')
    expect(suggestion.meta.stale).toBe(false)
  })
})
