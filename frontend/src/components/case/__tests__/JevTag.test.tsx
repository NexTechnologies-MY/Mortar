import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { JevMeta } from '@mortar/core'
import { JevTag } from '../JevTag'

const OUT_OF_DATE = 'Jev Read This Before The Latest Update. Ask Jev Again To Refresh.'

describe('JevTag', () => {
  it.each([
    { name: 'a live read', meta: { source: 'live', stale: false, latencyMs: 420 } as JevMeta },
    { name: 'a live read with no latency recorded', meta: { source: 'live', stale: false, latencyMs: null } as JevMeta }
  ])('keeps $name as a positive pill', ({ meta }) => {
    render(<JevTag meta={meta} />)
    expect(screen.getByText('Jev Checked Just Now').className).toContain('bg-status-positive-bg')
  })

  it('keeps an unavailable read as a danger pill', () => {
    render(<JevTag meta={{ source: 'unavailable', stale: false, latencyMs: null }} />)
    expect(screen.getByText('Jev Could Not Check').className).toContain('bg-status-danger-bg')
  })

  it('says nothing for a cached answer the case has not moved past', () => {
    // Six grey pills on one case said nothing a reader did not already know.
    const { container } = render(<JevTag meta={{ source: 'cache', stale: false, latencyMs: 380 }} />)
    expect(container.textContent).toBe('')
  })

  it('shows a stale cached answer as a clock that explains itself on hover', async () => {
    const { container } = render(<JevTag meta={{ source: 'cache', stale: true, latencyMs: 380 }} />)

    expect(container.textContent).toBe('')
    // Keyboard focus opens the tooltip just as hover does, and unlike hover it
    // takes no animation frame — jsdom never runs one.
    fireEvent.focus(screen.getByLabelText(OUT_OF_DATE))
    expect(await screen.findByText(OUT_OF_DATE)).toBeTruthy()
  })
})
