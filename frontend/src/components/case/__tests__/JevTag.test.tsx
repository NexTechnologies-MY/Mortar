import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { JevMeta } from '@mortar/core'
import { JevTag } from '../JevTag'

const CASES: { name: string; meta: JevMeta; label: string; tone: string }[] = [
  {
    name: 'live with latency',
    meta: { source: 'live', stale: false, latencyMs: 420 },
    label: 'Jev · Live 420 ms',
    tone: 'bg-status-positive-bg'
  },
  {
    name: 'live without latency',
    meta: { source: 'live', stale: false, latencyMs: null },
    label: 'Jev · Live',
    tone: 'bg-status-positive-bg'
  },
  {
    name: 'cached',
    meta: { source: 'cache', stale: false, latencyMs: 380 },
    label: 'Jev · Cached',
    tone: 'bg-status-neutral-bg'
  },
  {
    name: 'stale cache',
    meta: { source: 'cache', stale: true, latencyMs: 380 },
    label: 'Jev · Stale',
    tone: 'bg-status-warning-bg'
  },
  {
    name: 'unavailable',
    meta: { source: 'unavailable', stale: false, latencyMs: null },
    label: 'Jev · Unavailable',
    tone: 'bg-status-danger-bg'
  }
]

describe('JevTag', () => {
  it.each(CASES)('renders $name as "$label"', ({ meta, label, tone }) => {
    render(<JevTag meta={meta} />)
    expect(screen.getByText(label).className).toContain(tone)
  })
})
