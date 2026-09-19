/** Small shared helpers for route handlers: JSON responses, path matching, body validation, ids. */
import type { Language } from '@mortar/core'

/** A database id for live writes: fixture ids are `PREFIX-nnnn-n`, so uuids never collide. */
export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

export function error(status: number, message: string): Response {
  return Response.json({ error: message }, { status })
}

/** `/api/messages/x/extract` → params `{ id: 'x' }`; `null` when the shape does not match. */
export function match(pathname: string, pattern: string): Record<string, string> | null {
  const have = pathname.split('/').filter(Boolean)
  const want = pattern.split('/').filter(Boolean)
  if (have.length !== want.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) params[want[i].slice(1)] = decodeURIComponent(have[i])
    else if (want[i] !== have[i]) return null
  }
  return params
}

/** Parses a JSON body into a plain object; `null` on anything else. */
export async function body(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = await req.json()
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value)
}

const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿]/
const MALAY =
  /\b(salam|saya|anda|dah|sudah|belum|akan|boleh|mahu|nak|tidak|tak|kepada|untuk|dengan|terima kasih|hari|bulan|slip gaji|surat|bayar|hantar|semalam|esok|minggu|tuan|puan|encik|cik)\b/i

/** Best-effort language tag for live messages; fixtures carry their own. */
export function detectLanguage(text: string): Language {
  const cjk = CJK.test(text)
  const malay = MALAY.test(text)
  if (cjk && /[a-z]/i.test(text)) return 'mixed'
  if (cjk) return 'zh'
  if (malay) return 'ms'
  return 'en'
}
