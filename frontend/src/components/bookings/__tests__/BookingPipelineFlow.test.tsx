import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BookingPipelineFlow, type PipelineCounts } from '../BookingPipelineFlow'

const MOCK_COUNTS: PipelineCounts = {
  buyer: { total: 11, stalled: 6 },
  bank: { total: 26, stalled: 12 },
  solicitor: { total: 16, stalled: 5 },
  spa: { total: 5 },
  developer: { total: 7, stalled: 2 }
}

describe('BookingPipelineFlow', () => {
  it('renders all five conveyance milestones with title Who Holds Each Booking', () => {
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
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    // Heading
    expect(screen.getByText('Who Holds Each Booking')).toBeTruthy()

    // 5 steps as buttons
    expect(screen.getByRole('button', { name: /Filter by Buyer/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Bank/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Solicitor/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Signed/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Filter by Us/i })).toBeTruthy()

    // Big figures
    expect(screen.getByText('11')).toBeTruthy()
    expect(screen.getByText('26')).toBeTruthy()
    expect(screen.getByText('16')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('7')).toBeTruthy()

    // Stall badges, on every step that can stall
    expect(screen.getByText('6 Stalled')).toBeTruthy()
    expect(screen.getByText('12 Stalled')).toBeTruthy()
    expect(screen.getByText('5 Stalled')).toBeTruthy()
    expect(screen.getByText('2 Stalled')).toBeTruthy()
  })

  it('carries no description line under any step, because every one of them truncated', () => {
    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: null, stalledOnly: false }}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    const strip = screen.getByTestId('booking-pipeline-flow')
    for (const prose of [
      'Awaiting payslips',
      'Submitted applications awaiting',
      'Letter Of Offer accepted',
      'Contract executed',
      'Actions & booking releases'
    ]) {
      expect(strip.textContent).not.toContain(prose)
    }
  })

  it('reads the signed step as a count alone, with no second Signed pill under it', () => {
    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: null, stalledOnly: false }}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    const signed = screen.getByRole('button', { name: /Filter by Signed/i })
    // The step reads as its title and its count, "Signed 5 signed". A second
    // "Signed" pill under it said the same thing twice.
    expect(signed.textContent).toBe('Signed5signed')
    expect(within(signed).queryByText(/Stalled/)).toBeNull()
  })

  it('clicking a step calls onSelect to filter to that holder', () => {
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
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    const bankCard = screen.getByRole('button', { name: /Filter by Bank/i })
    fireEvent.click(bankCard)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith({ stageId: 'bank', stalledOnly: false })
  })

  it('clicking an active step toggles it off and calls onClear', () => {
    const onSelect = vi.fn()
    const onClear = vi.fn()

    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: 'bank', stalledOnly: false }}
        onSelect={onSelect}
        onClear={onClear}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    const bankCard = screen.getByRole('button', { name: /Filter by Bank/i })
    fireEvent.click(bankCard)

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('clicking the Us step filters to developer cases', () => {
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
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    const usCard = screen.getByRole('button', { name: /Filter by Us/i })
    fireEvent.click(usCard)

    expect(onSelect).toHaveBeenCalledWith({ stageId: 'developer', stalledOnly: false })
  })

  it('clicking the Signed step filters to signed cases', () => {
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
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    const signedCard = screen.getByRole('button', { name: /Filter by Signed/i })
    fireEvent.click(signedCard)

    expect(onSelect).toHaveBeenCalledWith({ stageId: 'spa', stalledOnly: false })
  })

  it('sets aria-pressed on the selected step', () => {
    render(
      <BookingPipelineFlow
        counts={MOCK_COUNTS}
        selection={{ stageId: 'buyer', stalledOnly: false }}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Who Holds Each Booking/i }))

    const buyerCard = screen.getByRole('button', { name: /Filter by Buyer/i })
    expect(buyerCard.getAttribute('aria-pressed')).toBe('true')

    const bankCard = screen.getByRole('button', { name: /Filter by Bank/i })
    expect(bankCard.getAttribute('aria-pressed')).toBe('false')
  })
})
