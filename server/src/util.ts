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
    if (want[i].startsWith(':')) {
      try {
        params[want[i].slice(1)] = decodeURIComponent(have[i])
      } catch {
        return null
      }
    } else if (want[i] !== have[i]) return null
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
/** A real calendar day as `YYYY-MM-DD`; `2026-02-30` fails, where `Date.parse` alone would roll it over. */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false
  const time = Date.parse(`${value}T00:00:00Z`)
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value
}

const ISO_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
/** A timestamp with an explicit offset, `2026-09-17T21:05:00+08:00` or `…Z`; a bare local time is ambiguous. */
export function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = ISO_DATE_TIME.exec(value)
  return match !== null && isIsoDate(match[1]) && !Number.isNaN(Date.parse(value))
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
