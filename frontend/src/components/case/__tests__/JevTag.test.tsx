import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { JevMeta } from '@mortar/core'
import { JevTag } from '../JevTag'

const CASES: { name: string; meta: JevMeta; label: string; tone: string }[] = [
  {
    name: 'live',
    meta: { source: 'live', stale: false, latencyMs: 420 },
    label: 'Jev Checked Just Now',
    tone: 'bg-status-positive-bg'
  },
  {
    name: 'live with no latency recorded',
    meta: { source: 'live', stale: false, latencyMs: null },
    label: 'Jev Checked Just Now',
    tone: 'bg-status-positive-bg'
  },
  {
    name: 'cached',
    meta: { source: 'cache', stale: false, latencyMs: 380 },
    label: 'Jev Checked Earlier',
    tone: 'bg-status-neutral-bg'
  },
  {
    name: 'stale cache',
    meta: { source: 'cache', stale: true, latencyMs: 380 },
    label: "Jev's Answer May Be Out Of Date",
    tone: 'bg-status-warning-bg'
  },
  {
    name: 'unavailable',
    meta: { source: 'unavailable', stale: false, latencyMs: null },
    label: 'Jev Could Not Check',
    tone: 'bg-status-danger-bg'
  }
]

describe('JevTag', () => {
  it.each(CASES)('renders $name as "$label"', ({ meta, label, tone }) => {
    render(<JevTag meta={meta} />)
    expect(screen.getByText(label).className).toContain(tone)
  })
})
