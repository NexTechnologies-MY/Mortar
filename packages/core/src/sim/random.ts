/** Deterministic PRNG (mulberry32) and sampling helpers. Never `Math.random`. */
export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number
  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number
  chance(probability: number): boolean
  pick<T>(items: readonly T[]): T
  /** Roughly normal via a sum of three uniforms; range ±3 sd. */
  gaussian(mean: number, sd: number): number
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (items) => items[Math.floor(next() * items.length)],
    gaussian: (mean, sd) => mean + sd * 2 * (next() + next() + next() - 1.5)
  }
}

/** Weighted pick: entries of [item, weight]. */
export function weighted<T>(rng: Rng, entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let roll = rng.next() * total
  for (const [item, w] of entries) {
    roll -= w
    if (roll <= 0) return item
  }
  return entries[entries.length - 1][0]
}
