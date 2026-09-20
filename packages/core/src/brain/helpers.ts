/**
 * Shared helpers for the Ask question set: the live-booking test every answer
 * filters on, and the number and list formats the prose is written in.
 * Formats follow DESIGN.md Data Formats — money carries no sen, and durations
 * use the conversational form because answers are sentences, not table cells.
 */
import type { CaseSummary } from '../types'
import { HORIZON_DAYS } from '../sim/constants'
import { STAGE_RANK } from '../sim/cases'

/** Anything at or past a signed SPA is settled, including the exits. */
const SIGNED_RANK = STAGE_RANK.spa_signed

/**
 * A booking still in play: not yet signed, not an exit, and still inside the
 * horizon the forecast counts. Mirrors the `live` flag `deriveCase` computes
 * internally (`sim/cases.ts`), which `CaseSummary` does not carry.
 */
export function isLive(summary: CaseSummary): boolean {
  return isOpen(summary) && summary.bookingAgeDays < HORIZON_DAYS
}

/**
 * A booking still in play with no age ceiling — `isLive` minus the horizon.
 * Mirrors the `open` flag `deriveCase` computes, which is what `stallReasons`
 * is derived from. Any answer that reads `stallReasons` must filter on this:
 * filtering those on `isLive` would drop every case that has sat past 30 days,
 * which is precisely the set the chase list puts at the top.
 */
export function isOpen(summary: CaseSummary): boolean {
  return STAGE_RANK[summary.stage] < SIGNED_RANK
}

const ringgit = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 0 })

/** `RM 612,800` — the exact form, for a single booking. */
export function rm(value: number): string {
  return `RM ${ringgit.format(value)}`
}

/** `RM 7.4m` — the abbreviated form, for portfolio totals. */
export function rmCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `RM ${(value / 1_000_000).toFixed(1)}m`
  if (Math.abs(value) >= 1_000) return `RM ${(value / 1_000).toFixed(1)}k`
  return rm(value)
}

/** `21 days` / `1 day` — the sentence form. */
export function days(value: number): string {
  return `${value} ${value === 1 ? 'day' : 'days'}`
}

/** `3 bookings` / `1 booking` — a count with its noun. */
export function count(value: number, noun: string, plural = `${noun}s`): string {
  return `${value} ${value === 1 ? noun : plural}`
}

/** `73%` from a 0–1 share. */
export function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/** `a, b and c` — the sentence form for a short list. */
export function joinList(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/** Sum a number off every item. */
export function sumBy<T>(items: readonly T[], value: (item: T) => number): number {
  return items.reduce((total, item) => total + value(item), 0)
}

/** Group items into a Map, preserving first-seen order. */
export function tally<T>(items: readonly T[], key: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const bucket = out.get(k)
    if (bucket) bucket.push(item)
    else out.set(k, [item])
  }
  return out
}
