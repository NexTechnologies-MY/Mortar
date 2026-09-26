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

export function createAssistant(options: AssistantOptions) {
  const limiter = new RateLimiter()

  /** One round trip: the model, its tool calls, the results, and the answer. */
  async function ask(input: AssistantRequest, apiKey: string, caller?: AbortSignal): Promise<AssistantAnswer> {
    // One deadline for the whole request, the tool loop included. A fresh timer
    // per turn would let four rounds outlive the browser's own patience, and a
    // caller who has already gone away would keep paying for it.
    const controller = new AbortController()
    const budget = options.timeoutMs ?? ASSISTANT_TIMEOUT_MS
    const timer = setTimeout(() => controller.abort(), budget)
    if (caller) caller.addEventListener('abort', () => controller.abort(), { once: true })
    /** Every booking id the tools handed over in this request, so only those can become links. */
    const known = new Set<string>()
    if (input.bookingId) known.add(input.bookingId)

    try {
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
          return shape(
            parts
              .map((p) => p.text ?? '')
              .join(' ')
              .trim(),
            known
          )
        }
        const results: { name: string; text: string }[] = []
        for (const call of calls) {
          const name = call.name ?? ''
          const text = await runTool(name, (call.args ?? {}) as ToolInput, input.persona, options.db)
          for (const id of text.match(BOOKING_ID) ?? []) known.add(id)
          results.push({ name, text })
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
      return { answer: NO_ANSWER, citations: [] }
    } finally {
      clearTimeout(timer)
    }
  }

  /** `POST /api/assistant`. */
  return async function handleAssistant({ req }: { req: Request }): Promise<Response> {
    const parsed = readAssistantRequest(await body(req))
    if (parsed instanceof Response) return parsed
    if (!options.apiKey) return json({ fallback: true }, 503)
    const limited = limiter.check(clientIp(req))
    if (limited) return limited
    // A caller who closes the panel should not leave a model call running to
    // the end of its answer, so the deadline is also the request's own signal.
    const disconnect = new AbortController()
    req.signal.addEventListener('abort', () => disconnect.abort(), { once: true })
    try {
      return json(await ask(parsed, options.apiKey, disconnect.signal))
    } catch (e) {
      // A model failure is a server fault on our side, so it is logged (the
      // message, never the key, the image or the question) and refused as one.
      console.error('ask mortar:', e instanceof Error ? e.message : String(e))
      return modelErrorResponse(e)
    }
  }
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
  const cited = (trimmed.match(BOOKING_ID) ?? []).filter((id) => known.has(id))
  return { answer: trimmed, citations: [...new Set(cited)] }
}
