/**
 * `createProxySystemOne` adapts a local Anthropic-Messages-compatible model proxy
 * (such as CLIProxyAPI) to the `systemOne` surface `createJevService` expects, so
 * Jev can run without a TypeSafe API key. One `systemOne` call becomes one
 * `POST {url}/v1/messages`: the state and questions are rendered into a prompt
 * asking for per-question probabilities as a single JSON object, the response is
 * parsed, and probabilities are validated and renormalised into the exact
 * `ChoiceResponse` / `NoulResponse` / `ScoreResponse` shapes the SDK defines.
 *
 * The returned object is typed as `Pick<TypeSafeClient, 'systemOne'>` so it drops
 * straight into `createJevService({ client })`; the one internal cast papers over
 * `TypeSafeClient.systemOne` returning an `APIPromise` where we return a plain
 * `Promise` — the service only ever awaits the result.
 */
import type {
  ChoiceQuestion,
  EntryType,
  NoulQuestion,
  Question,
  Questions,
  ResultFor,
  ScoreQuestion,
  SystemOneRequest,
  SystemOneResult,
  TypeSafeClient,
  Usage
} from '@typesafe-ai/sdk'

export interface ProxySystemOneOptions {
  /** Base URL of the proxy, e.g. `http://127.0.0.1:PORT`. No trailing `/v1/messages`. */
  url: string
  apiKey: string
  /** The model the proxy should route to, e.g. `gemini-3-flash`. */
  model: string
  /** Per-request timeout in milliseconds. Default 45000. */
  timeoutMs?: number
  /** Injectable fetch for tests and alternate runtimes. Defaults to the global `fetch`. */
  fetch?: typeof fetch
}

interface AnthropicContentBlock {
  type: string
  text?: string
}

interface AnthropicMessageResponse {
  content?: AnthropicContentBlock[]
  usage?: { input_tokens?: number; output_tokens?: number }
}

const DEFAULT_TIMEOUT_MS = 45000

export function createProxySystemOne(options: ProxySystemOneOptions): Pick<TypeSafeClient, 'systemOne'> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const doFetch = options.fetch ?? fetch
  const baseUrl = options.url.replace(/\/+$/, '')

  async function systemOne<const Q extends Questions>(request: SystemOneRequest<Q>): Promise<SystemOneResult<Q>> {
    const prompt = buildPrompt(request.state, request.questions)
    const payload = await callProxy(doFetch, baseUrl, options.apiKey, options.model, prompt, timeoutMs)
    const text = extractText(payload)
    const parsed = parseJson(text)
    const raw = requireAnswers(parsed, request.questions)
    const answers = buildAnswers(request.questions, raw)
    return {
      model: options.model,
      answers: answers as { [K in keyof Q]: ResultFor<Q[K]> },
      usage: toUsage(payload.usage)
    }
  }

  return { systemOne } as unknown as Pick<TypeSafeClient, 'systemOne'>
}

// ---- HTTP -------------------------------------------------------------

async function callProxy(
  doFetch: typeof fetch,
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  timeoutMs: number
): Promise<AnthropicMessageResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response
  try {
    response = await doFetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: controller.signal
    })
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`jev proxy request timed out after ${timeoutMs}ms`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `jev proxy request failed: ${response.status} ${response.statusText}${body ? ` — ${body.slice(0, 500)}` : ''}`
    )
  }

  return (await response.json()) as AnthropicMessageResponse
}

function toUsage(usage: AnthropicMessageResponse['usage']): Usage {
  return {
    input_tokens: usage?.input_tokens ?? 0,
    output_tokens: usage?.output_tokens ?? 0
  }
}

// ---- Prompt -------------------------------------------------------------

function buildPrompt(state: EntryType, questions: Questions): string {
  const questionBlocks = Object.entries(questions)
    .map(([name, question]) => describeQuestion(name, question))
    .join('\n\n')

  return [
    'You are answering structured questions about the JSON state below for an internal property-sales tool.',
    'Judge the meaning of the state as a whole; do not pattern-match on isolated keywords.',
    '',
    'STATE:',
    JSON.stringify(state, null, 2),
    '',
    'QUESTIONS:',
    questionBlocks,
    '',
    'Respond with ONLY one JSON object, no prose and no markdown code fences, mapping every question name',
    'above to its probabilities object exactly as specified. Probabilities must be non-negative and the',
    'probabilities for each question must sum to 1.'
  ].join('\n')
}

function describeQuestion(name: string, question: Question): string {
  const instructions =
    question.instructions !== undefined && question.instructions !== null
      ? JSON.stringify(question.instructions)
      : '(none)'
  switch (question.type) {
    case 'choice':
      return describeChoice(name, question, instructions)
    case 'noul':
      return describeNoul(name, question, instructions)
    case 'score':
      return describeScore(name, question, instructions)
    default:
      return assertNever(question)
  }
}

function describeChoice(name: string, question: ChoiceQuestion, instructions: string): string {
  const options = Object.entries(question.criteria)
    .map(([label, description]) => `  - "${label}": ${JSON.stringify(description)}`)
    .join('\n')
  return [
    `"${name}" (choice) — ${instructions}`,
    'options:',
    options,
    `Answer: {"${name}": {"<label>": p, ...}} with one probability per option label above.`
  ].join('\n')
}

function describeNoul(name: string, question: NoulQuestion, instructions: string): string {
  const lines = [`"${name}" (noul, yes/no) — ${instructions}`]
  const trueDescription = question.criteria?.true
  const falseDescription = question.criteria?.false
  if (trueDescription !== undefined && trueDescription !== null)
    lines.push(`  - true: ${JSON.stringify(trueDescription)}`)
  if (falseDescription !== undefined && falseDescription !== null)
    lines.push(`  - false: ${JSON.stringify(falseDescription)}`)
  lines.push(`Answer: {"${name}": {"true": p, "false": p}}`)
  return lines.join('\n')
}

function describeScore(name: string, question: ScoreQuestion, instructions: string): string {
  const levels = question.criteria
    .map((description, index) => `  - ${index}: ${JSON.stringify(description)}`)
    .join('\n')
  return [
    `"${name}" (score, low to high) — ${instructions}`,
    'levels:',
    levels,
    `Answer: {"${name}": {"0": p, "1": p, ...}} with one probability per level index above.`
  ].join('\n')
}

function assertNever(value: never): never {
  throw new Error(`unhandled question type: ${JSON.stringify(value)}`)
}

// ---- Response parsing -----------------------------------------------------

function extractText(payload: AnthropicMessageResponse): string {
  // The first content block is often a `thinking` block with no text; never read content[0] blindly.
  const text = (payload.content ?? [])
    .filter(
      (block): block is AnthropicContentBlock & { text: string } =>
        block.type === 'text' && typeof block.text === 'string'
    )
    .map((block) => block.text)
    .join('')
  if (!text.trim()) throw new Error('jev proxy response had no text content')
  return text
}

function parseJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  const jsonText = start !== -1 && end !== -1 && end > start ? candidate.slice(start, end + 1) : candidate.trim()
  try {
    return JSON.parse(jsonText)
  } catch (error) {
    throw new Error(`jev proxy response was not valid JSON: ${(error as Error).message}`)
  }
}

function requireAnswers(parsed: unknown, questions: Questions): Record<string, unknown> {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('jev proxy response JSON was not an object')
  }
  const obj = parsed as Record<string, unknown>
  for (const name of Object.keys(questions)) {
    if (!(name in obj)) throw new Error(`jev proxy response is missing an answer for "${name}"`)
  }
  return obj
}

// ---- Normalisation and SDK shapes -----------------------------------------------------

/** Drops unknown labels, clamps negatives to 0, renormalises to sum 1, and spreads evenly if everything is 0. */
function normalizeDistribution(labels: string[], raw: unknown): Record<string, number> {
  const values: Record<string, number> = {}
  for (const label of labels) values[label] = 0
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    for (const [label, value] of Object.entries(raw as Record<string, unknown>)) {
      if (label in values && typeof value === 'number' && Number.isFinite(value)) {
        values[label] = Math.max(0, value)
      }
    }
  }
  const sum = labels.reduce((total, label) => total + values[label], 0)
  if (sum <= 0) {
    const even = 1 / labels.length
    for (const label of labels) values[label] = even
    return values
  }
  for (const label of labels) values[label] = values[label] / sum
  return values
}

function buildAnswers(questions: Questions, raw: Record<string, unknown>): Record<string, unknown> {
  const answers: Record<string, unknown> = {}
  for (const [name, question] of Object.entries(questions)) {
    answers[name] = buildAnswer(question, raw[name])
  }
  return answers
}

function buildAnswer(question: Question, raw: unknown): unknown {
  switch (question.type) {
    case 'choice':
      return buildChoiceAnswer(question, raw)
    case 'noul':
      return buildNoulAnswer(raw)
    case 'score':
      return buildScoreAnswer(question, raw)
    default:
      return assertNever(question)
  }
}

function buildChoiceAnswer(question: ChoiceQuestion, raw: unknown) {
  const labels = Object.keys(question.criteria)
  const distribution = normalizeDistribution(labels, raw)
  const selected = argmax(labels, distribution)
  return {
    type: 'choice' as const,
    choice: selected,
    confidence: distribution[selected],
    probabilities: distribution
  }
}

function buildNoulAnswer(raw: unknown) {
  const distribution = normalizeDistribution(['true', 'false'], raw)
  return { type: 'noul' as const, noul: distribution.true }
}

function buildScoreAnswer(question: ScoreQuestion, raw: unknown) {
  const labels = question.criteria.map((_, index) => String(index))
  const distribution = normalizeDistribution(labels, raw)
  const expectedScore = labels.reduce((total, label) => total + Number(label) * distribution[label], 0)
  const confidence = Math.max(...labels.map((label) => distribution[label]))
  const legend: Record<string, EntryType> = {}
  question.criteria.forEach((description, index) => {
    legend[String(index)] = description
  })
  return { type: 'score' as const, score: expectedScore, confidence, legend, probabilities: distribution }
}

function argmax(labels: string[], distribution: Record<string, number>): string {
  let best = labels[0]
  for (const label of labels) {
    if (distribution[label] > distribution[best]) best = label
  }
  return best
}
