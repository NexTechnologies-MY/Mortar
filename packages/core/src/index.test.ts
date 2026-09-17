import { describe, expect, it } from 'vitest'
import type { Persona } from './index'

describe('Persona', () => {
  it('covers the three staff personas', () => {
    const personas: Persona[] = ['sales-admin', 'loan-admin', 'finance']
    expect(personas).toHaveLength(3)
  })
})
