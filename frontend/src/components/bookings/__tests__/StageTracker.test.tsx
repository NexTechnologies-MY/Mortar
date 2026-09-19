import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StageTracker } from '@/components/bookings/StageTracker'

describe('StageTracker', () => {
  it('is keyboard focusable so the segment tooltip can open', () => {
    render(<StageTracker stage="loan_applied" />)

    const trigger = screen.getByRole('img', { name: 'Stage 3 Of 5: Loan Submitted' })
    expect(trigger.tabIndex).toBe(0)
  })

  it('freezes cancelled cases at the last confirmed milestone', () => {
    render(<StageTracker stage="cancelled" confirmedKinds={new Set(['booked', 'loan_submitted'])} />)

    expect(screen.getByRole('img', { name: 'Stage 3 Of 5: Loan Submitted' })).toBeTruthy()
  })
})
