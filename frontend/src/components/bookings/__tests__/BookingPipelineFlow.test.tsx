import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PersonaProvider } from '@/lib/persona'
import { BookingPipelineFlow, type PipelineCounts } from '../BookingPipelineFlow'

const MOCK_COUNTS: PipelineCounts = {
  buyer: { total: 11, stalled: 6 },
  bank: { total: 26, stalled: 12 },
  solicitor: { total: 16, stalled: 5 },
  spa: { total: 5 },
  developer: { total: 7, stalled: 2 }
}

describe('BookingPipelineFlow', () => {
  it('renders all four conveyance milestones with big numbers and stall badges', () => {
    const onSelect = vi.fn()
    const onClear = vi.fn()

    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: null, stalledOnly: false }}
        onSelect={onSelect}
        onClear={onClear}
      />
    )

    // Heading
    expect(screen.getByText('Booking-to-SPA Pipeline & Bottleneck Flow')).toBeTruthy()

    // 4 stages
    expect(screen.getByRole('button', { name: /Filter by Client \/ Buyer/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Panel Bank/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Law Firm/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by SPA Signed/i })).toBeTruthy()

    // Big figures
    expect(screen.getByText('11')).toBeTruthy()
    expect(screen.getByText('26')).toBeTruthy()
    expect(screen.getByText('16')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()

    // Stall badges
    expect(screen.getByText('6 Stalled')).toBeTruthy()
    expect(screen.getByText('12 Stalled')).toBeTruthy()
    expect(screen.getByText('5 Stalled')).toBeTruthy()
    expect(screen.getByText('Legally Sold')).toBeTruthy()

    // Developer desk
    expect(screen.getByText(/Developer Desk:/)).toBeTruthy()
    expect(screen.getByText('7 cases')).toBeTruthy()
  })

  it('clicking Panel Bank card triggers onSelect with stalledOnly: true by default', () => {
    const onSelect = vi.fn()
    const onClear = vi.fn()

    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: null, stalledOnly: false }}
        onSelect={onSelect}
        onClear={onClear}
      />
    )

    const bankCard = screen.getByRole('button', { name: /Filter by Panel Bank/i })
    fireEvent.click(bankCard)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith({ stageId: 'bank', stalledOnly: true })
  })

  it('clicking an active stage toggles it off and calls onClear', () => {
    const onSelect = vi.fn()
    const onClear = vi.fn()

    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: 'bank', stalledOnly: true }}
        onSelect={onSelect}
        onClear={onClear}
      />
    )

    const bankCard = screen.getByRole('button', { name: /Filter by Panel Bank/i })
    fireEvent.click(bankCard)

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('lets user toggle between Stalled Only and All Cases when a stage is active', () => {
    const onSelect = vi.fn()
    const onClear = vi.fn()

    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: 'bank', stalledOnly: true }}
        onSelect={onSelect}
        onClear={onClear}
      />
    )

    // Sub-buttons on the active card
    const allCasesBtn = screen.getByRole('button', { name: /All Cases \(26\)/i })
    fireEvent.click(allCasesBtn)

    expect(onSelect).toHaveBeenCalledWith({ stageId: 'bank', stalledOnly: false })
  })

  it('clicking Reset Pipeline Filter calls onClear', () => {
    const onSelect = vi.fn()
    const onClear = vi.fn()

    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: 'bank', stalledOnly: true }}
        onSelect={onSelect}
        onClear={onClear}
      />
    )

    const resetBtn = screen.getByRole('button', { name: /Reset Pipeline Filter/i })
    fireEvent.click(resetBtn)

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('supports keyboard navigation with Enter key', () => {
    const onSelect = vi.fn()
    const onClear = vi.fn()

    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: null, stalledOnly: false }}
        onSelect={onSelect}
        onClear={onClear}
      />
    )

    const clientCard = screen.getByRole('button', { name: /Filter by Client \/ Buyer/i })
    fireEvent.keyDown(clientCard, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith({ stageId: 'buyer', stalledOnly: true })
  })
  it('highlights Client/Buyer as primary desk for Sales Admin', () => {
    render(
      <PersonaProvider initialPersona="sales-admin">
        <BookingPipelineFlow
          counts={MOCK_COUNTS}
          selection={{ stageId: null, stalledOnly: false }}
          onSelect={vi.fn()}
          onClear={vi.fn()}
        />
      </PersonaProvider>
    )

    const clientCard = screen.getByRole('button', { name: /Filter by Client \/ Buyer/i })
    expect(clientCard.textContent).toContain('Your Desk')
  })

  it('highlights Panel Bank as primary desk for Loan Admin', () => {
    render(
      <PersonaProvider initialPersona="loan-admin">
        <BookingPipelineFlow
          counts={MOCK_COUNTS}
          selection={{ stageId: null, stalledOnly: false }}
          onSelect={vi.fn()}
          onClear={vi.fn()}
        />
      </PersonaProvider>
    )

    const bankCard = screen.getByRole('button', { name: /Filter by Panel Bank/i })
    expect(bankCard.textContent).toContain('Your Desk')
  })

  it('highlights Law Firm and SPA as primary desk for Legal Admin', () => {
    render(
      <PersonaProvider initialPersona="legal-admin">
        <BookingPipelineFlow
          counts={MOCK_COUNTS}
          selection={{ stageId: null, stalledOnly: false }}
          onSelect={vi.fn()}
          onClear={vi.fn()}
        />
      </PersonaProvider>
    )

    const lawFirmCard = screen.getByRole('button', { name: /Filter by Law Firm/i })
    expect(lawFirmCard.textContent).toContain('Your Desk')
    const spaCard = screen.getByRole('button', { name: /Filter by SPA Signed/i })
    expect(spaCard.textContent).toContain('Your Desk')
  })
})
