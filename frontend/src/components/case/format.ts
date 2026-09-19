/**
 * Case data formats — the spec's rules for money, days and dates.
 * Money: `RM 612,800` in lists, `RM 7.4m` in stat tiles, no sen.
 * Dates: `19 Sep 2026`. Days: `21 d` in tables, `21 days` in sentences.
 * Empty values render an em dash, never `0`, `N/A` or a blank space.
 */

const ringgit = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 0 })

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const EMPTY = '—'

/** `RM 612,800` — thousands separators, no sen. */
export function formatRm(value: number | null | undefined): string {
  return value == null ? EMPTY : `RM ${ringgit.format(value)}`
}

/** `RM 7.4m` / `RM 612.8k` — stat-tile abbreviation to one decimal place. */
export function formatRmCompact(value: number | null | undefined): string {
  if (value == null) return EMPTY
  if (Math.abs(value) >= 1_000_000) return `RM ${(value / 1_000_000).toFixed(1)}m`
  if (Math.abs(value) >= 1_000) return `RM ${(value / 1_000).toFixed(1)}k`
  return formatRm(value)
}

/** `19 Sep 2026` — parsed from the `YYYY-MM-DD` prefix so time zones never shift the day. */
export function formatDate(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
  if (!match) return EMPTY
  const [, year, month, day] = match
  const label = MONTHS[Number(month) - 1]
  return label ? `${Number(day)} ${label} ${year}` : EMPTY
}

/** `21 d` — the short table form. */
export function formatDays(days: number | null | undefined): string {
  return days == null ? EMPTY : `${days} d`
}

/** `21 days` / `1 day` — the conversational sentence form. */
export function formatDaysLong(days: number | null | undefined): string {
  if (days == null) return EMPTY
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

/** `73%` — whole percentages from a 0–1 probability. */
export function formatPercent(value: number | null | undefined): string {
  return value == null ? EMPTY : `${Math.round(value * 100)}%`
}
