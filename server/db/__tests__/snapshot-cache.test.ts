import { describe, expect, test } from 'bun:test'
import { cacheBodies, cacheSnapshot, forgetOnWrite } from '../snapshot-cache'

const counting = () => {
  let loads = 0
  return { load: async () => ({ build: ++loads }), loads: () => loads }
}

describe('cacheSnapshot', () => {
  test('concurrent and repeated reads share one build until the time limit', async () => {
    let now = 0
    const { load, loads } = counting()
    const cache = cacheSnapshot(load, 10_000, () => now)
    const [a, b] = await Promise.all([cache.get(), cache.get()])
    expect(a).toBe(b)
    now = 9_999
    expect(await cache.get()).toBe(a)
    expect(loads()).toBe(1)
    now = 10_000
    expect(await cache.get()).not.toBe(a)
    expect(loads()).toBe(2)
  })

  test('forget makes the next read build again', async () => {
    const { load, loads } = counting()
    const cache = cacheSnapshot(load, 10_000, () => 0)
    const first = await cache.get()
    cache.forget()
    expect(await cache.get()).not.toBe(first)
    expect(loads()).toBe(2)
  })

  test('a failed build is not kept', async () => {
    let fail = true
    let loads = 0
    const cache = cacheSnapshot(
      async () => {
        loads += 1
        if (fail) throw new Error('down')
        return { ok: true }
      },
      10_000,
      () => 0
    )
    await expect(cache.get()).rejects.toThrow('down')
    fail = false
    expect(await cache.get()).toEqual({ ok: true })
    expect(loads).toBe(2)
  })
})

describe('forgetOnWrite', () => {
  test('forgets once a write settles, whether it worked or not, and never for a read', async () => {
    let forgotten = 0
    const target = forgetOnWrite(
      {
        read: async () => 'r',
        write: async (x: number) => x * 2,
        fails: async (): Promise<void> => {
          throw new Error('no')
        }
      },
      new Set(['read'] as const),
      () => {
        forgotten += 1
      }
    )
    expect(await target.read()).toBe('r')
    expect(forgotten).toBe(0)
    expect(await target.write(2)).toBe(4)
    expect(forgotten).toBe(1)
    await expect(target.fails()).rejects.toThrow('no')
    expect(forgotten).toBe(2)
  })
})

describe('cacheBodies', () => {
  test('renders each key once per snapshot', async () => {
    let renders = 0
    const body = cacheBodies<{ v: number }>()
    const render = (s: { v: number }) => {
      renders += 1
      return JSON.stringify(s)
    }
    const snapshot = Promise.resolve({ v: 1 })
    expect(await body(snapshot, 'manager', render)).toBe('{"v":1}')
    expect(await body(snapshot, 'manager', render)).toBe('{"v":1}')
    await body(snapshot, 'sales', render)
    expect(renders).toBe(2)
    await body(Promise.resolve({ v: 2 }), 'manager', render)
    expect(renders).toBe(3)
  })
})
