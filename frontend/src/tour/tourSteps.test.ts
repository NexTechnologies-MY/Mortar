import { describe, expect, it } from 'vitest'
import { PERSONAS } from '@/lib/persona'
import { TOUR_STEPS } from './tourSteps'

describe('tour steps', () => {
  it('provides a navigable tour with a target and caption for every persona', () => {
    for (const { id } of PERSONAS) {
      expect(TOUR_STEPS[id].length).toBeGreaterThan(0)
      for (const step of TOUR_STEPS[id]) {
        expect(step.route).toMatch(/^\//)
        expect(step.target).toMatch(/^\[data-tour=/)
        expect(step.caption.length).toBeGreaterThan(0)
      }
    }
  })
})
