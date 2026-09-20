import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Pagination, usePagination } from '../Pagination'

function Harness({ rows }: { rows: number[] }) {
  const { pageRows, pagination } = usePagination(rows)
  return (
    <>
      <ul>
        {pageRows.map((row) => (
          <li key={row}>{`Row ${row}`}</li>
        ))}
      </ul>
      <button type="button" onClick={() => pagination.onPageChange(1)}>
        Reset Page
      </button>
      <button type="button" onClick={() => pagination.onPageSizeChange(50)}>
        Set Size 50
      </button>
      <Pagination {...pagination} />
    </>
  )
}

const rows = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

describe('usePagination + Pagination', () => {
  it('pages a 30-row list 25 at a time', () => {
    render(<Harness rows={rows(30)} />)

    expect(screen.getByText('Showing 1 To 25 Of 30')).toBeTruthy()
    expect(screen.queryByText('Row 26')).toBeNull()
    expect(screen.getByRole('button', { name: 'Previous Page' })).toHaveProperty('disabled', true)

    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }))

    expect(screen.getByText('Showing 26 To 30 Of 30')).toBeTruthy()
    expect(screen.getByText('Row 30')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next Page' })).toHaveProperty('disabled', true)
  })

  it('clamps the page when the row count shrinks', () => {
    const { rerender } = render(<Harness rows={rows(60)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByText('Showing 51 To 60 Of 60')).toBeTruthy()

    rerender(<Harness rows={rows(30)} />)

    expect(screen.getByText('Showing 26 To 30 Of 30')).toBeTruthy()
  })

  it('returns to page one when the caller resets, e.g. on a filter change', () => {
    render(<Harness rows={rows(60)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByText('Showing 26 To 50 Of 60')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Reset Page' }))

    expect(screen.getByText('Showing 1 To 25 Of 60')).toBeTruthy()
  })

  it('shows every row again at a larger page size', () => {
    render(<Harness rows={rows(30)} />)

    fireEvent.click(screen.getByRole('button', { name: 'Set Size 50' }))

    expect(screen.getByText('Showing 1 To 30 Of 30')).toBeTruthy()
    expect(screen.getByText('Row 30')).toBeTruthy()
  })
})
