import { createHash } from 'node:crypto'
import type { JevKind } from '@mortar/core'

/** SHA-256 of the stable JSON of the kind, the state and the question-set version. */
export function jevInputHash(kind: JevKind, state: unknown, version: number): string {
  return createHash('sha256').update(stableJson({ kind, state, version })).digest('hex')
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, sortKeys(item)])
    )
  }
  return value
}
