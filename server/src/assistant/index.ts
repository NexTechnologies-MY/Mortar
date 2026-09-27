/**
 * The assistant itself: the system prompt, the model, the read-only tools, and
 * the loop that runs until the model stops asking for facts.
 *
 * Grounding is by tool, not by retrieval. The model holds no facts of its own;
 * every number, name and date in an answer arrived through one of the five
 * tools in `tools.ts`, computed from the same snapshot the desks read. That is
 * the whole safety story, and the prompt restates it so the model does not
 * have to be trusted to remember it.
 */
import type { Database } from '../../db/index'
import type { StaffProfile } from '@mortar/core'
import { canAccessBooking, createAssignmentAccessContext, REFERENCE_DATE } from '@mortar/core'
import { scopeSnapshot } from '@mortar/core'
import { clientIp, readAssistantRequest, RateLimiter, type AssistantRequest } from './guardrails'
import { ASSISTANT_TIMEOUT_MS, callGemini, modelErrorResponse, type GeminiContent } from './gemini'
import { systemPrompt } from './prompt'
import { runTool, TOOL_DECLARATIONS, type ToolInput } from './tools'
import { body, json } from '../util'

/**
 * A flash-lite model, measured on this desk's prompts against the same
 * question set the Jev proxy runs: correct at a fifth of the latency, and
 * cheap enough that a whole desk can ask all morning.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'
/**
 * Four rounds of tools. In practice one does it — a question that needs two is
 * a question with a second part — but the cap is what stops a model that keeps
 * asking from running the clock out on the caller.
 */
export const MAX_TOOL_ROUNDS = 4
/** A booking id, as it appears in an answer and in the citation chips. */
const BOOKING_ID = /\bBK-\d{3,6}\b/g

export interface AssistantOptions {
  db: Database
  /** From `GEMINI_API_KEY`. Without it the route answers 503 and the panel falls back. */
  apiKey: string | null
  /** From `GEMINI_MODEL`; `||`, not `??`, because `.env.example` ships it empty. */
  model?: string
  /**
   * How long the whole request may take, tool loop included. A fixed
   * `ASSISTANT_TIMEOUT_MS` in production; shortened in the test that proves the
   * loop shares one deadline rather than one per round.
   */
  timeoutMs?: number
  /** Injected in tests so the model call can be faked. */
  fetchImpl?: typeof fetch
}

export interface AssistantAnswer {
  answer: string
  /** The booking ids the answer names, for the panel to link. */
  citations: string[]
}

export type AssistantStreamEvent =
  | { type: 'tool_call'; label: string }
  | { type: 'tool_result'; label: string }
  | { type: 'answer'; answer: AssistantAnswer }
  | { type: 'follow_ups'; questions: string[] }
  | { type: 'error'; message: string }

export function createAssistant(options: AssistantOptions) {
  const limiter = new RateLimiter()
  const canAccess = async (bookingId: string, profile: StaffProfile): Promise<boolean> => {
    const booking = await options.db.getBooking(bookingId)
    if (!booking) return false
    const context = createAssignmentAccessContext(await options.db.caseData(), REFERENCE_DATE)
    return canAccessBooking(booking, profile, context)
  }

  /** One round trip: the model, its tool calls, the results, and the answer. */
  async function ask(
    input: AssistantRequest,
    apiKey: string,
    caller?: AbortSignal,
    emit?: (event: AssistantStreamEvent) => void,
    profile?: StaffProfile
  ): Promise<AssistantAnswer> {
    // One deadline for the whole request, the tool loop included. A fresh timer
    // per turn would let four rounds outlive the browser's own patience, and a
    // caller who has already gone away would keep paying for it.
    const controller = new AbortController()
    const budget = options.timeoutMs ?? ASSISTANT_TIMEOUT_MS
    const timer = setTimeout(() => controller.abort(), budget)
    if (caller) caller.addEventListener('abort', () => controller.abort(), { once: true })
    /** Every booking id the tools handed over in this request, so only those can become links. */
    let allowedBookingIds = new Set<string>()
    const known = new Set<string>()
    const usedTools = new Set<string>()

    try {
      allowedBookingIds = new Set(
        scopeSnapshot(await options.db.snapshot(), profile!).bookings.map((booking) => booking.id)
      )
      if (input.bookingId && allowedBookingIds.has(input.bookingId)) known.add(input.bookingId)
      const contents: GeminiContent[] = [
        ...input.history.flatMap((turn) => [
          { role: 'user' as const, parts: [{ text: turn.question }] },
          { role: 'model' as const, parts: [{ text: turn.answer }] }
        ]),
        { role: 'user' as const, parts: userParts(input) }
      ]

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const response = await callGemini({
          apiKey,
          model: options.model || DEFAULT_GEMINI_MODEL,
          systemInstruction: systemPrompt(input.persona),
          contents,
          tools: TOOL_DECLARATIONS as unknown as unknown[],
          signal: controller.signal,
          fetchImpl: options.fetchImpl
        })
        const candidate = response.candidates?.[0]
        if (!candidate) {
          // Blocked, or nothing came back. The reason is never the caller's to
          // fix, so it is not sent on.
          return { answer: NO_ANSWER, citations: [] }
        }
        const parts = candidate.content?.parts ?? []
        const calls = parts.flatMap((part) => (part.functionCall ? [part.functionCall] : []))
        if (calls.length === 0) {
          const answer = shape(
            parts
              .map((p) => p.text ?? '')
              .join(' ')
              .trim(),
            known
          )
          emit?.({ type: 'answer', answer })
          // The answer decides what a person can follow up on, so the chips are
          // built from its citations rather than from the tools alone: a chip
          // that named a booking the answer never mentioned would be a guess.
          emit?.({ type: 'follow_ups', questions: followUps(usedTools, answer.citations) })
          return answer
        }
        const results: { name: string; text: string }[] = []
        for (const call of calls) {
          const name = call.name ?? ''
          const label = toolLabel(name)
          if (label) {
            usedTools.add(name)
            emit?.({ type: 'tool_call', label })
          }
          const text = await runTool(name, (call.args ?? {}) as ToolInput, profile!, options.db)
          for (const id of text.match(BOOKING_ID) ?? []) if (allowedBookingIds.has(id)) known.add(id)
          results.push({ name, text })
          if (label) emit?.({ type: 'tool_result', label })
        }
        contents.push({ role: 'model', parts })
        contents.push({
          role: 'user',
          parts: results.map((r) => ({
            functionResponse: { name: r.name, response: { result: r.text } }
          }))
        })
      }
      // The model was still asking for facts when the cap closed the loop. Its
      // answers so far are not in hand, so say so rather than answer blind.
      const answer = { answer: NO_ANSWER, citations: [] }
      emit?.({ type: 'answer', answer })
      emit?.({ type: 'follow_ups', questions: followUps(usedTools, []) })
      return answer
    } finally {
      clearTimeout(timer)
    }
  }

  /** `POST /api/assistant`. */
  const handleAssistant: ((ctx: { req: Request; profile: StaffProfile }) => Promise<Response>) & {
    stream?: (ctx: { req: Request; profile: StaffProfile }) => Promise<Response>
  } = async function ({ req, profile }: { req: Request; profile: StaffProfile }): Promise<Response> {
    const posted = await body(req)
    const parsed = readAssistantRequest(posted ? { ...posted, persona: profile.persona } : null)
    if (parsed instanceof Response) return parsed
    if (parsed.bookingId) {
      if (!(await canAccess(parsed.bookingId, profile))) return json({ error: 'booking not found' }, 404)
    }
    if (!options.apiKey) return json({ fallback: true }, 503)
    const limited = limiter.check(clientIp(req))
    if (limited) return limited
    // A caller who closes the panel should not leave a model call running to
    // the end of its answer, so the deadline is also the request's own signal.
    const disconnect = new AbortController()
    req.signal.addEventListener('abort', () => disconnect.abort(), { once: true })
    try {
      return json(await ask(parsed, options.apiKey, disconnect.signal, undefined, profile))
    } catch (e) {
      // A model failure is a server fault on our side, so it is logged (the
      // message, never the key, the image or the question) and refused as one.
      console.error('ask mortar:', e instanceof Error ? e.message : String(e))
      return modelErrorResponse(e)
    }
  }
  handleAssistant.stream = async ({ req, profile }: { req: Request; profile: StaffProfile }): Promise<Response> => {
    const posted = await body(req)
    const parsed = readAssistantRequest(posted ? { ...posted, persona: profile.persona } : null)
    if (parsed instanceof Response) return parsed
    if (parsed.bookingId) {
      if (!(await canAccess(parsed.bookingId, profile))) return json({ error: 'booking not found' }, 404)
    }
    if (!options.apiKey) return json({ fallback: true }, 503)
    const limited = limiter.check(clientIp(req))
    if (limited) return limited
    const encoder = new TextEncoder()
    const disconnect = new AbortController()
    let canceled = false
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: AssistantStreamEvent) => {
          if (!canceled) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
        const onAbort = () => disconnect.abort()
        req.signal.addEventListener('abort', onAbort, { once: true })
        void ask(parsed, options.apiKey!, disconnect.signal, send, profile)
          .catch((e) => {
            if (disconnect.signal.aborted) return
            console.error('ask mortar:', e instanceof Error ? e.message : String(e))
            send({ type: 'error', message: 'Copilot Could Not Check. Try Again.' })
          })
          .finally(() => {
            req.signal.removeEventListener('abort', onAbort)
            if (!canceled) controller.close()
          })
      },
      cancel() {
        canceled = true
        disconnect.abort()
      }
    })
    return new Response(stream, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' } })
  }
  return handleAssistant
}

function toolLabel(name: string): string | null {
  const labels: Record<string, string> = {
    find_bookings: 'Looking Up Bookings',
    get_case: 'Reading A Booking',
    get_my_queue: 'Checking Your Queue',
    get_forecast_summary: 'Checking The Forecast',
    search_playbooks: 'Reading The Playbooks'
  }
  return labels[name] ?? null
}

/** Four chips, the number the panel shows. */
const CHIP_COUNT = 4

/**
 * The four questions offered under an answer, in the tools' own order of
 * specificity: whatever the answer cited first, then the best general question
 * for each tool it used, and finally the general case queue — never fewer, so a
 * model that called nothing at all still offers something to ask.
 *
 * A chip that named a booking the answer did not mention would be a guess at
 * something the person cannot see, so only the answer's own citations are named.
 */
function followUps(tools: ReadonlySet<string>, cited: readonly string[]): string[] {
  const specific: string[] = []
  const [focus] = cited
  if (focus) {
    specific.push(`What Is Blocking ${focus}?`, `Who Holds ${focus} Now?`, `What Changed On ${focus} Recently?`)
  }
  const general = toolFollowUps(tools)
  return [
    ...specific,
    ...general,
    'Which Booking Is Oldest?',
    'Who Owns The Next Step?',
    'What Should We Follow Up Today?'
  ]
    .filter((question, index, all) => all.indexOf(question) === index)
    .slice(0, CHIP_COUNT)
}

/** The chips each tool earns on its own, most specific first, deduped across
 * the tools one answer used. Every tool the assistant can call has a set, so a
 * question never falls through to a set chosen for a different tool. */
function toolFollowUps(tools: ReadonlySet<string>): string[] {
  const sets: Record<string, readonly string[]> = {
    search_playbooks: [
      'Which Booking Needs This Next?',
      'What Should I Ask The Bank?',
      'Which Documents Are Still Missing?',
      'Who Owns The Next Step?'
    ],
    get_forecast_summary: [
      'Which Bookings Are At Risk?',
      'What Could Delay These Signings?',
      'Which Cases Need Attention Today?',
      'How Does This Compare By Project?'
    ],
    get_case: ['Which Documents Are Still Missing?', 'Who Owns The Next Step?', 'What Should I Ask The Bank?'],
    find_bookings: ['Which Of These Is The Oldest?', 'Who Owns The Next Step?', 'What Should We Follow Up Today?'],
    get_my_queue: ['Who Owns The Next Step?', 'What Is Blocking The Case?', 'What Should We Follow Up Today?']
  }
  return [...tools].flatMap((name) => sets[name] ?? [])
}

/** What the panel shows when the model gave no answer to ground. */
const NO_ANSWER = "Mortar's data does not hold the answer to that. Try asking which bookings it is waiting on."

/** The question itself, and the photo with it when one came. */
function userParts(input: AssistantRequest): { text?: string; inlineData?: { mimeType: string; data: string } }[] {
  const onCase = input.bookingId ? ` The person is looking at booking ${input.bookingId} on screen.` : ''
  const image = input.image
    ? {
        text: `The person attached this image with the question. Read it, and say what it says about the booking.${onCase}`,
        inlineData: { mimeType: input.image.mimeType, data: input.image.data }
      }
    : null
  return image ? [image, { text: input.question }] : [{ text: `${input.question}${onCase}` }]
}

/**
 * The answer as sent: the model's own words, kept as written, plus the booking
 * ids it named, which the panel turns into links. An id is only linked when a
 * tool handed it over in this request or the panel was already looking at it, so
 * a booking that does not exist can never be a link. An id the tools gave and
 * the model chose not to mention is simply not cited.
 */
function shape(answer: string, known: ReadonlySet<string>): AssistantAnswer {
  const trimmed = answer.trim()
  if (trimmed.length === 0) return { answer: NO_ANSWER, citations: [] }
  const safe = trimmed.replace(BOOKING_ID, (id) => (known.has(id) ? id : '[unavailable booking]'))
  const cited = (safe.match(BOOKING_ID) ?? []).filter((id) => known.has(id))
  return { answer: safe, citations: [...new Set(cited)] }
}
