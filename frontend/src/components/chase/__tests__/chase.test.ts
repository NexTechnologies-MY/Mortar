import { describe, expect, it } from 'vitest'
import type { NextActionSuggestion } from '@mortar/core'
import { addDays, dueOnForUrgency, urgencyFor } from '../chase'

function suggestion(urgencyScore: number): NextActionSuggestion {
  return {
    bookingId: 'BK-9001',
    action: { value: 'request_document', probabilities: {}, confidence: 0.9 },
    owner: { value: 'sales', probabilities: {}, confidence: 0.9 },
    urgency: { score: urgencyScore, confidence: 0.9 },
    meta: { source: 'cache', stale: false, latencyMs: null }
  }
}

describe('urgencyFor', () => {
  it('maps Jev urgency scores to the spec vocabulary', () => {
    expect(urgencyFor(suggestion(1.8), 3)).toEqual({ label: 'Due Today', tone: 'warning', score: 2 })
    expect(urgencyFor(suggestion(1), 3)).toEqual({ label: 'In 2 Days', tone: 'neutral', score: 1 })
    expect(urgencyFor(suggestion(0.2), 3)).toEqual({ label: 'In 7 Days', tone: 'neutral', score: 0 })
  })

  it('clamps out-of-range urgency scores', () => {
    expect(urgencyFor(suggestion(4.9), 3).label).toBe('Due Today')
    expect(urgencyFor(suggestion(-1), 3).label).toBe('In 7 Days')
  })

  it('falls back to staleness wording without a suggestion', () => {
    expect(urgencyFor(undefined, 12)).toEqual({ label: 'Overdue 12 d', tone: 'danger', score: -1 })
    expect(urgencyFor(undefined, 8)).toEqual({ label: 'Overdue 8 d', tone: 'warning', score: -1 })
    expect(urgencyFor(undefined, 2)).toEqual({ label: 'In 2 Days', tone: 'neutral', score: -1 })
  })
})

describe('dueOnForUrgency', () => {
  it('aligns due dates with the urgency labels', () => {
    expect(dueOnForUrgency(2, '2026-09-18')).toBe('2026-09-18')
    expect(dueOnForUrgency(1, '2026-09-18')).toBe('2026-09-20')
    expect(dueOnForUrgency(0, '2026-09-18')).toBe('2026-09-25')
  })

  it('due date for BK-9001 urgency 1.79 lands on the reference date', () => {
    expect(dueOnForUrgency(1.79, '2026-09-18')).toBe('2026-09-18')
  })
})

describe('addDays', () => {
  it('crosses month boundaries', () => {
    expect(addDays('2026-09-30', 2)).toBe('2026-10-02')
  })
})
