import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Stage } from '@mortar/core'
import { BookingFilters, type BookingFilter } from '../BookingFilters'

// Radix Select scrolls the highlighted item into view on open; jsdom has no layout engine.
Element.prototype.scrollIntoView = vi.fn()

const FILTER: BookingFilter = { stage: 'all', risk: 'all', stalledOnly: false, unknownOnly: false }

// The Active tab's stages (every non-closed one) and the Closed tab's (issue M10).
const ACTIVE_STAGES: Stage[] = ['booked', 'loan_applied', 'lo_issued', 'loan_agreement', 'spa_signed']
const CLOSED_STAGES: Stage[] = ['disbursed', 'cancelled', 'lapsed']

describe('BookingFilters', () => {
  it('offers only the stages passed in, not every stage in the pipeline (issue M10)', () => {
    render(<BookingFilters filter={FILTER} onChange={vi.fn()} shown={8} total={8} stages={CLOSED_STAGES} />)

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    const menu = screen.getByRole('dialog')
    expect(within(menu).getByRole('checkbox', { name: 'Disbursed' })).toBeTruthy()
    expect(within(menu).getByRole('checkbox', { name: 'Cancelled' })).toBeTruthy()
    expect(within(menu).getByRole('checkbox', { name: 'Lapsed' })).toBeTruthy()
    // Only reachable through the Active tab — must not appear while Closed is showing.
    expect(within(menu).queryByRole('checkbox', { name: 'Booked' })).toBeNull()
  })

  it('offers the pipeline stages, not the closed ones, when given the Active list', () => {
    render(<BookingFilters filter={FILTER} onChange={vi.fn()} shown={5} total={5} stages={ACTIVE_STAGES} />)

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    const menu = screen.getByRole('dialog')
    expect(within(menu).getByRole('checkbox', { name: 'Booked' })).toBeTruthy()
    expect(within(menu).getByRole('checkbox', { name: 'SPA Signed' })).toBeTruthy()
    expect(within(menu).queryByRole('checkbox', { name: 'Disbursed' })).toBeNull()
  })

  it('reports the picked stage back through onChange', () => {
    const onChange = vi.fn()
    render(<BookingFilters filter={FILTER} onChange={onChange} shown={5} total={5} stages={ACTIVE_STAGES} />)

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Booked' }))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stage: 'booked' }))
  })

  it('toggles Stalled Only checkbox through onChange', () => {
    const onChange = vi.fn()
    render(<BookingFilters filter={FILTER} onChange={onChange} shown={5} total={5} stages={ACTIVE_STAGES} />)

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Stalled Only' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stalledOnly: true }))
  })

  it('renders Active and Closed filter options and calls onViewChange on selection', () => {
    const onViewChange = vi.fn()
    render(
      <BookingFilters
        filter={FILTER}
        onChange={vi.fn()}
        shown={5}
        total={5}
        stages={ACTIVE_STAGES}
        view="active"
        onViewChange={onViewChange}
        activeCount={20}
        closedCount={8}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    expect(screen.getByRole('checkbox', { name: 'Active (20)' })).toBeTruthy()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Closed (8)' }))
    expect(onViewChange).toHaveBeenCalledWith('closed')
  })
})
