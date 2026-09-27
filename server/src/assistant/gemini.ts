/**
 * The Gemini client: one `generateContent` call over `fetch`, with no new
 * dependency. The key travels in the `x-goog-api-key` header and reaches
 * nothing else — not the browser, not the log, not the tool results.
 *
 * The shapes below are the parts of the REST API the assistant uses. Anything
 * it does not recognise is ignored rather than guessed at, so a new field in a
 * response cannot break a parse.
 */
import { error } from '../util'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
/**
 * The whole request, tool loop included, is bounded by this. The timer is the
 * caller's, not this module's: a fresh timer per call would let four rounds run
 * for four times this while the browser has already given up.
 */
export const ASSISTANT_TIMEOUT_MS = 30_000

export interface GeminiFunctionCall {
  name?: string
  args?: Record<string, unknown>
}
export interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
  functionCall?: GeminiFunctionCall
  functionResponse?: { name: string; response: { result: string } }
}
export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}
export interface GeminiResponse {
  candidates?: {
    content?: { parts?: GeminiPart[] }
    finishReason?: string
  }[]
  /** A prompt or a tool turn that went over a limit, with the reason. */
  promptFeedback?: { blockReason?: string }
}

export interface GeminiOptions {
  apiKey: string
  model: string
  systemInstruction: string
  contents: GeminiContent[]
  tools: unknown[]
  /** The request's own deadline. Required: the timeout belongs to the request, not to one turn. */
  signal: AbortSignal
  fetchImpl?: typeof fetch
}

/**
 * One model turn, inside the caller's deadline. A non-2xx is read for Google's
 * own error text, which says what to do about it ("API key not valid"), but the
 * key itself is never part of that text and the whole error is never returned
 * to the browser.
 */
export async function callGemini(options: GeminiOptions): Promise<GeminiResponse> {
  const doFetch = options.fetchImpl ?? fetch
  try {
    const res = await doFetch(`${ENDPOINT}/${encodeURIComponent(options.model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': options.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.systemInstruction }] },
        contents: options.contents,
        tools: [{ functionDeclarations: options.tools }],
        // `AUTO`, not `ANY`: `ANY` requires a function call on every turn, so
        // the model could never sit down and write the answer. It asks for
        // facts until it has enough, then answers.
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        generationConfig: { maxOutputTokens: 1_024, temperature: 0.2 }
      }),
      signal: options.signal
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      // `await res.json()` on a Google error is not worth the bytes; the status
      // line carries the reason and the key is never in the body.
      throw new Error(`gemini ${res.status} ${res.statusText}${detail ? `: ${detail.slice(0, 200)}` : ''}`.trim())
    }
    return (await res.json()) as GeminiResponse
  } catch (e) {
    if (isAbort(e)) throw new Error('the model took too long to answer')
    throw e
  }
}

/** Whether a rejection is our deadline firing, whether the runtime says `AbortError` or `TimeoutError`. */
function isAbort(e: unknown): boolean {
  return e instanceof Error && (e.name === 'AbortError' || e.name === 'TimeoutError')
}

/** What the route sends back on a call that could not be made. */
export function modelErrorResponse(e: unknown): Response {
  const aborted = e instanceof Error && e.message === 'the model took too long to answer'
  return error(503, aborted ? 'Copilot Took Too Long. Try Again.' : 'Copilot Could Not Check. Try Again.')
}
