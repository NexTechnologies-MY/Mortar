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

    fireEvent.click(screen.getByLabelText('Filter By Stage'))
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('Disbursed')).toBeTruthy()
    expect(within(listbox).getByText('Cancelled')).toBeTruthy()
    expect(within(listbox).getByText('Lapsed')).toBeTruthy()
    // Only reachable through the Active tab — must not appear while Closed is showing.
    expect(within(listbox).queryByText('Booked')).toBeNull()
  })

  it('offers the pipeline stages, not the closed ones, when given the Active list', () => {
    render(<BookingFilters filter={FILTER} onChange={vi.fn()} shown={5} total={5} stages={ACTIVE_STAGES} />)

    fireEvent.click(screen.getByLabelText('Filter By Stage'))
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('Booked')).toBeTruthy()
    expect(within(listbox).getByText('SPA Signed')).toBeTruthy()
    expect(within(listbox).queryByText('Disbursed')).toBeNull()
  })

  it('reports the picked stage back through onChange', () => {
    const onChange = vi.fn()
    render(<BookingFilters filter={FILTER} onChange={onChange} shown={5} total={5} stages={ACTIVE_STAGES} />)

    fireEvent.click(screen.getByLabelText('Filter By Stage'))
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Booked'))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stage: 'booked' }))
  })

  it('toggles Stalled Only checkbox through onChange', () => {
    const onChange = vi.fn()
    render(<BookingFilters filter={FILTER} onChange={onChange} shown={5} total={5} stages={ACTIVE_STAGES} />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Stalled Only' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stalledOnly: true }))
  })

  it('renders Active and Closed tabs and calls onViewChange on tab switch', () => {
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

    expect(screen.getByRole('tab', { name: 'Active (20)' })).toBeTruthy()
    const closedTab = screen.getByRole('tab', { name: 'Closed (8)' })
    expect(closedTab).toBeTruthy()

    fireEvent.mouseDown(closedTab, { button: 0 })
    fireEvent.click(closedTab)
    expect(onViewChange).toHaveBeenCalledWith('closed')
  })
})
