import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Stage } from '@mortar/core'
import { StagePill } from '../StagePill'

const CASES: { stage: Stage; label: string; tone: string }[] = [
  { stage: 'booked', label: 'Booked', tone: 'bg-status-neutral-bg' },
  { stage: 'loan_applied', label: 'With Bank', tone: 'bg-status-info-bg' },
  { stage: 'lo_issued', label: 'LO Issued', tone: 'bg-status-positive-bg' },
  { stage: 'loan_agreement', label: 'Loan Agreement', tone: 'bg-status-positive-bg' },
  { stage: 'disbursed', label: 'Disbursed', tone: 'bg-status-positive-bg' },
  { stage: 'spa_signed', label: 'SPA Signed', tone: 'bg-status-signed-bg' },
  { stage: 'cancelled', label: 'Cancelled', tone: 'bg-status-danger-bg' },
  { stage: 'lapsed', label: 'Lapsed', tone: 'bg-status-danger-bg' }
]

describe('StagePill', () => {
  it.each(CASES)('renders $stage as "$label" with the right tone', ({ stage, label, tone }) => {
    render(<StagePill stage={stage} />)
    expect(screen.getByText(label).className).toContain(tone)
  })
})
