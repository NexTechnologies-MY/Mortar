import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProbabilityBar } from '../ProbabilityBar'

describe('ProbabilityBar', () => {
  it('renders a meter with the whole percentage', () => {
    render(<ProbabilityBar probability={0.73} />)
    const meter = screen.getByRole('meter', { name: 'Probability' })
    expect(meter.getAttribute('aria-valuenow')).toBe('73')
    expect((meter.firstElementChild as HTMLElement).style.width).toBe('73%')
    expect(screen.getByText('73%')).not.toBeNull()
  })

  it('clamps probabilities outside 0–1', () => {
    render(<ProbabilityBar probability={1.4} />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100')
  })

  it('binds a status solid when a tone is given', () => {
    render(<ProbabilityBar probability={0.5} tone="info" />)
    expect((screen.getByRole('meter').firstElementChild as HTMLElement).className).toContain('bg-status-info')
  })
})
