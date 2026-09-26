import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { UnitAutocompleteInput } from '@/components/import/UnitAutocompleteInput'

describe('UnitAutocompleteInput', () => {
  const sampleAvailableUnits = ['A-01-01', 'A-01-02', 'A-12-05', 'A-12-08', 'A-15-01']

  it('renders input with combobox role and shows unsold units when clicked', () => {
    const onChange = vi.fn()
    render(
      <UnitAutocompleteInput value="" onChange={onChange} availableUnits={sampleAvailableUnits} placeholder="A-12-08" />
    )

    const input = screen.getByRole('combobox')
    expect(input).toBeTruthy()

    // Focus / click opens dropdown
    fireEvent.focus(input)

    expect(screen.getByText(/5 available/i)).toBeTruthy()
    expect(screen.getByText('A-01-01')).toBeTruthy()
    expect(screen.getByText('A-12-05')).toBeTruthy()
  })

  it('filters units in real time as the user types words or numbers', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <UnitAutocompleteInput value="" onChange={onChange} availableUnits={sampleAvailableUnits} />
    )

    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    expect(screen.getByText('A-01-01')).toBeTruthy()

    // User types "12"
    rerender(<UnitAutocompleteInput value="12" onChange={onChange} availableUnits={sampleAvailableUnits} />)

    expect(screen.getByText(/2 available/i)).toBeTruthy()
    expect(screen.getByText('A-12-05')).toBeTruthy()
    expect(screen.getByText('A-12-08')).toBeTruthy()
    expect(screen.queryByText('A-01-01')).toBeNull()
  })

  it('selects clicked unit from dropdown and invokes onChange', () => {
    const onChange = vi.fn()
    render(<UnitAutocompleteInput value="" onChange={onChange} availableUnits={sampleAvailableUnits} />)

    const input = screen.getByRole('combobox')
    fireEvent.focus(input)

    const option = screen.getByText('A-12-08')
    fireEvent.mouseDown(option)

    expect(onChange).toHaveBeenCalledWith('A-12-08')
  })

  it('shows helpful notice when no unsold units match the search query', () => {
    const onChange = vi.fn()
    render(<UnitAutocompleteInput value="Z-99" onChange={onChange} availableUnits={sampleAvailableUnits} />)

    const input = screen.getByRole('combobox')
    fireEvent.focus(input)

    expect(screen.getByText(/No unsold units found/i)).toBeTruthy()
    expect(screen.getByText(/No units match "Z-99" in this range/i)).toBeTruthy()
  })
})
