import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Stage } from '@mortar/core'
import { BookingFilters, type BookingFilter } from '../BookingFilters'

// Radix Select scrolls the highlighted item into view on open; jsdom has no layout engine.
Element.prototype.scrollIntoView = vi.fn()

const FILTER: BookingFilter = { stage: 'all', waitingOn: 'all', risk: 'all', unknownOnly: false }

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
    expect(within(listbox).queryByText('With Bank')).toBeNull()
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
})
