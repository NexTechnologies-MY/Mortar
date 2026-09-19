import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EvidencePill, type EvidenceState } from '../EvidencePill'

const CASES: { status: EvidenceState; label: string; tone: string }[] = [
  { status: 'confirmed', label: 'Confirmed', tone: 'bg-status-positive-bg' },
  { status: 'provisional', label: 'Provisional', tone: 'bg-status-warning-bg' },
  { status: 'disputed', label: 'Disputed', tone: 'bg-status-danger-bg' },
  { status: 'superseded', label: 'Superseded', tone: 'bg-status-neutral-bg' },
  { status: 'fresh', label: 'Fresh', tone: 'bg-status-positive-bg' },
  { status: 'unknown', label: 'Unknown', tone: 'bg-status-warning-bg' }
]

describe('EvidencePill', () => {
  it.each(CASES)('renders $status as "$label" with the right tone', ({ status, label, tone }) => {
    render(<EvidencePill status={status} />)
    expect(screen.getByText(label).className).toContain(tone)
  })
})
