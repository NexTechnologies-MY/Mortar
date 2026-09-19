import { describe, expect, it } from 'vitest'
import { formatDate, formatDays, formatDaysLong, formatPercent, formatRm, formatRmCompact } from '../format'

describe('formatRm', () => {
  it('formats ringgit with separators and no sen', () => {
    expect(formatRm(612_800)).toBe('RM 612,800')
    expect(formatRm(1_580)).toBe('RM 1,580')
  })

  it('renders an em dash for empty values', () => {
    expect(formatRm(null)).toBe('—')
    expect(formatRm(undefined)).toBe('—')
  })
})

describe('formatRmCompact', () => {
  it('abbreviates to one decimal place', () => {
    expect(formatRmCompact(7_400_000)).toBe('RM 7.4m')
    expect(formatRmCompact(612_800)).toBe('RM 612.8k')
    expect(formatRmCompact(800)).toBe('RM 800')
  })
})

describe('formatDate', () => {
  it('formats ISO dates as "19 Sep 2026"', () => {
    expect(formatDate('2026-09-19')).toBe('19 Sep 2026')
  })

  it('takes the date part of a timestamp', () => {
    expect(formatDate('2026-09-18T09:30:00+08:00')).toBe('18 Sep 2026')
  })

  it('renders an em dash for empty or malformed values', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('soon')).toBe('—')
  })
})

describe('formatDays', () => {
  it('formats the short and long forms', () => {
    expect(formatDays(21)).toBe('21 d')
    expect(formatDaysLong(21)).toBe('21 days')
    expect(formatDaysLong(1)).toBe('1 day')
    expect(formatDays(null)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('rounds to a whole percentage', () => {
    expect(formatPercent(0.734)).toBe('73%')
    expect(formatPercent(null)).toBe('—')
  })
})
