/**
 * Pure-helper tests for `util.ts`: the flag parse the boot seed and
 * `POST /api/admin/reset` share, the field-length cap, and the input checks
 * that reject a NUL byte or a year before 1.
 */
import { describe, expect, test } from 'bun:test'
import { isIsoDate, isIsoDateTime, isResetEnabled, isString, tooLong } from '../util'

describe('isResetEnabled', () => {
  test('unset leaves the reset on', () => {
    expect(isResetEnabled(undefined)).toBe(true)
  })

  test.each(['off', 'Off', 'OFF', 'false', 'False', '0', 'no', 'No', ' off '])('%p turns the reset off', (value) => {
    expect(isResetEnabled(value)).toBe(false)
  })

  test.each(['on', 'true', '1', 'yes', '', 'disabled'])('%p leaves the reset on', (value) => {
    expect(isResetEnabled(value)).toBe(true)
  })
})

describe('tooLong', () => {
  test('null at or under the limit', () => {
    expect(tooLong('name', 'x'.repeat(300), 300)).toBeNull()
  })

  test('a 400 response one character over the limit', async () => {
    const res = tooLong('name', 'x'.repeat(301), 300)
    expect(res).not.toBeNull()
    expect(res?.status).toBe(400)
    expect((await res?.json()) as { error: string }).toEqual({ error: 'name must be at most 300 characters' })
  })
})

describe('isString', () => {
  test('rejects a NUL byte anywhere in the value', () => {
    expect(isString('a\u0000b')).toBe(false)
    expect(isString('\u0000')).toBe(false)
  })

  test('accepts an ordinary non-empty string', () => {
    expect(isString('Tan Mei Ling')).toBe(true)
  })

  test('rejects an empty or all-whitespace string', () => {
    expect(isString('')).toBe(false)
    expect(isString('   ')).toBe(false)
  })
})

describe('isIsoDate', () => {
  test('rejects year 0000', () => {
    expect(isIsoDate('0000-01-01')).toBe(false)
  })

  test('accepts year 0001', () => {
    expect(isIsoDate('0001-01-01')).toBe(true)
  })

  test('still rejects a rolled-over calendar day', () => {
    expect(isIsoDate('2026-02-30')).toBe(false)
  })

  test('accepts a real date', () => {
    expect(isIsoDate('2026-09-18')).toBe(true)
  })
})

describe('isIsoDateTime', () => {
  test('rejects year 0000 via the shared date check', () => {
    expect(isIsoDateTime('0000-01-01T00:00:00+08:00')).toBe(false)
  })

  test('accepts a real offset timestamp', () => {
    expect(isIsoDateTime('2026-09-17T21:05:00+08:00')).toBe(true)
  })
})
