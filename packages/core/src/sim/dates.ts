import type { IsoDate, IsoDateTime } from '../types'

const DAY_MS = 86_400_000

export function toEpoch(date: IsoDate): number {
  return Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)))
}

export function fromEpoch(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromEpoch(toEpoch(date) + days * DAY_MS)
}

/** Whole days from `from` to `to` (`to` − `from`). */
export function diffDays(from: IsoDate, to: IsoDate): number {
  return Math.round((toEpoch(to) - toEpoch(from)) / DAY_MS)
}

export function dateOf(dateTime: IsoDateTime): IsoDate {
  return dateTime.slice(0, 10)
}

function isWeekend(date: IsoDate): boolean {
  const day = new Date(toEpoch(date)).getUTCDay()
  return day === 0 || day === 6
}

/** `n` working days after `date`, skipping Saturdays and Sundays. */
export function addWorkDays(date: IsoDate, n: number): IsoDate {
  let d = date
  let left = n
  while (left > 0) {
    d = addDays(d, 1)
    if (!isWeekend(d)) left -= 1
  }
  return d
}

/** Working days strictly after `from`, up to and including `to`. */
export function workDaysBetween(from: IsoDate, to: IsoDate): number {
  let count = 0
  let d = from
  while (d < to) {
    d = addDays(d, 1)
    if (!isWeekend(d)) count += 1
  }
  return count
}

/** A timestamp at `hour:minute:second` in +08:00. */
export function stamp(date: IsoDate, hour: number, minute: number, second = 0): IsoDateTime {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${date}T${p(hour)}:${p(minute)}:${p(second)}+08:00`
}
