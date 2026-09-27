/**
 * The guards around the model call: what may be sent, how often, and for how
 * long. These hold whatever the model says back, so a bad request is refused
 * here rather than turned into a prompt.
 *
 * Nothing in this file logs. The key, the image and the words of a question all
 * stay out of the log by construction.
 */
import type { Persona } from '@mortar/core'
import { error } from '../util'

/** A question, not a document: enough to ask about a case, short of a pasted letter. */
export const MAX_QUESTION_CHARS = 1_000
/** The most turns carried forward; the rest of the exchange is dropped, oldest first. */
export const MAX_HISTORY_TURNS = 6
/** One turn of history is a question and its answer. */
export type HistoryTurn = { question: string; answer: string }
/** A photo of a bank letter, a form or a WhatsApp screenshot. */
export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024
/** Four megabytes of image is about 5.6 megabytes of base64, which is why the limit is on the decoded bytes. */
const MAX_IMAGE_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3 / 4) * 4 + 4
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/
/** The shape of a booking id. No `g` flag: `test` on a global regex keeps state between calls. */
const BOOKING_ID = /^bk-\d{3,6}$/i

/** How fast one address may ask. */
export const REQUESTS_PER_MINUTE = 8
/** How much the whole server may ask, in a day. Guards the free tier, not one person. */
export const REQUESTS_PER_DAY = 300
const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * 60 * 1000
/** Trim the record of an address often enough that it cannot grow without bound. */
const IP_KEEP_MS = 10 * MINUTE_MS
const MAX_TRACKED_IPS = 5_000

export const PERSONAS: readonly Persona[] = ['sales-admin', 'loan-admin', 'legal-admin', 'manager']

export interface AssistantImage {
  mimeType: (typeof IMAGE_MIME_TYPES)[number]
  /** Base64, no data-URL prefix. */
  data: string
}

export interface AssistantRequest {
  question: string
  persona: Persona
  bookingId: string | null
  history: HistoryTurn[]
  image: AssistantImage | null
}

/**
 * Checks a posted body and reads it into the shape the model call takes, or
 * returns the 400 to send. Rejecting here means a bad question never reaches
 * the model and never costs a token.
 */
export function readAssistantRequest(body: Record<string, unknown> | null): AssistantRequest | Response {
  if (!body) return error(400, 'expected a JSON object body')
  if (typeof body.question !== 'string' || body.question.trim().length === 0) {
    return error(400, 'question is required')
  }
  if (body.question.length > MAX_QUESTION_CHARS) {
    return error(400, `question must be at most ${MAX_QUESTION_CHARS} characters`)
  }
  if (!PERSONAS.includes(body.persona as Persona)) {
    return error(400, `persona must be one of: ${PERSONAS.join(', ')}`)
  }
  let bookingId: string | null = null
  if (body.bookingId != null) {
    // The prompt quotes this id back at the model, so it has to look like one
    // before it gets that far. Anything else is a bad request, not a question.
    if (typeof body.bookingId !== 'string' || !BOOKING_ID.test(body.bookingId.trim())) {
      return error(400, 'bookingId must be a booking id, e.g. BK-0042')
    }
    bookingId = body.bookingId.trim().toUpperCase()
  }

  let history: HistoryTurn[] = []
  if (body.history != null) {
    if (!Array.isArray(body.history)) return error(400, 'history must be an array of { question, answer } turns')
    const turns: HistoryTurn[] = []
    for (const turn of body.history) {
      if (turn === null || typeof turn !== 'object' || Array.isArray(turn)) {
        return error(400, 'history must be an array of { question, answer } turns')
      }
      const { question, answer } = turn as Record<string, unknown>
      if (typeof question !== 'string' || typeof answer !== 'string') {
        return error(400, 'history must be an array of { question, answer } turns')
      }
      if (question.length > MAX_QUESTION_CHARS || answer.length > 2_000) return error(400, 'a history turn is too long')
      turns.push({ question, answer })
    }
    // The last six, oldest dropped: enough to follow a thread, short enough that
    // a long panel cannot run the prompt up the size.
    history = turns.slice(-MAX_HISTORY_TURNS)
  }

  let image: AssistantImage | null = null
  if (body.image != null) {
    if (typeof body.image !== 'object' || Array.isArray(body.image)) {
      return error(400, 'image must be { mimeType, data }')
    }
    const { mimeType, data } = body.image as Record<string, unknown>
    if (!IMAGE_MIME_TYPES.includes(mimeType as (typeof IMAGE_MIME_TYPES)[number])) {
      return error(400, `image mimeType must be one of: ${IMAGE_MIME_TYPES.join(', ')}`)
    }
    if (typeof data !== 'string' || data.length === 0) return error(400, 'image data is required')
    if (data.length > MAX_IMAGE_CHARS) return error(400, 'That image is over 4 MB. Attach a smaller one.')
    if (!BASE64.test(data)) return error(400, 'image data must be base64')
    // The decoded size is what is actually sent, and the limit is on it: base64
    // carries three bytes in four characters, so a body can be 33% over the
    // line and still read as under it.
    if (Math.floor((data.length * 3) / 4) > MAX_IMAGE_BYTES) {
      return error(400, 'That image is over 4 MB. Attach a smaller one.')
    }
    image = { mimeType: mimeType as AssistantImage['mimeType'], data }
  }

  return {
    question: body.question.trim(),
    persona: body.persona as Persona,
    bookingId,
    history,
    image
  }
}

/**
 * In-memory limits, in the order they are checked: the whole server's daily
 * budget first, because that is the one that protects the free tier, then the
 * address's own minute. In process memory on purpose — a restart clearing the
 * count is the right trade against running a store for it.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>()
  private day: number[] = []

  /** `null` when the request may go ahead, or the 429 to send. */
  check(ip: string, now: number = Date.now()): Response | null {
    if (this.day.filter((at) => now - at < DAY_MS).length >= REQUESTS_PER_DAY) {
      return error(429, 'Ask Mortar has answered its daily allowance. Try again tomorrow.')
    }
    const recent = (this.hits.get(ip) ?? []).filter((at) => now - at < MINUTE_MS)
    if (recent.length >= REQUESTS_PER_MINUTE) {
      return error(429, 'Too Many Questions At Once. Wait A Moment And Try Again.')
    }
    recent.push(now)
    this.hits.set(ip, recent)
    this.day.push(now)
    this.forget(now)
    return null
  }

  /** Drops addresses that have gone quiet, so the map cannot grow forever. */
  private forget(now: number): void {
    for (const [ip, times] of this.hits) {
      if (times.every((at) => now - at >= IP_KEEP_MS)) this.hits.delete(ip)
    }
    this.day = this.day.filter((at) => now - at < DAY_MS)
    if (this.hits.size <= MAX_TRACKED_IPS) return
    // Still enormous after trimming: drop the least recently seen.
    const newest = (times: number[]) => times[times.length - 1] ?? 0
    const seen = [...this.hits.entries()].sort((a, b) => newest(b[1]) - newest(a[1]))
    for (const [ip] of seen.slice(MAX_TRACKED_IPS)) this.hits.delete(ip)
  }
}

/** The address a request came from, behind Cloud Run's proxy or a local proxy. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first && first.length > 0 ? first : 'local'
}
