import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Table, TableBody, TableCell, TableRow } from '../table'

/** jsdom never lays anything out, so `scrollWidth`/`clientWidth`/`scrollLeft`
 * are always 0; stub them the way a real overflowing (or fitted) table would
 * report them, so the cue's overflow detection has something to read. */
function setScrollGeometry(
  el: HTMLElement,
  { scrollWidth, clientWidth, scrollLeft = 0 }: { scrollWidth: number; clientWidth: number; scrollLeft?: number }
) {
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth })
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth })
  Object.defineProperty(el, 'scrollLeft', { configurable: true, value: scrollLeft, writable: true })
}

function renderTable() {
  return render(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>Row</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

describe('Table scroll cue (issue L10)', () => {
  it('shows no cue when nothing overflows, as at a desktop width', () => {
    const { container } = renderTable()
    const tableContainer = container.querySelector('[data-slot="table-container"]') as HTMLElement
    setScrollGeometry(tableContainer, { scrollWidth: 400, clientWidth: 400 })
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(tableContainer.getAttribute('data-scroll-fade')).toBeNull()
    expect(tableContainer.style.maskImage).toBe('')
  })

  it('shows a right-edge fade once the table overflows its container', () => {
    const { container } = renderTable()
    const tableContainer = container.querySelector('[data-slot="table-container"]') as HTMLElement
    setScrollGeometry(tableContainer, { scrollWidth: 900, clientWidth: 400, scrollLeft: 0 })
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(tableContainer.getAttribute('data-scroll-fade')).toBe('right')
    expect(tableContainer.style.maskImage).toContain('linear-gradient')
  })

  it('clears the cue once scrolled all the way to the end', () => {
    const { container } = renderTable()
    const tableContainer = container.querySelector('[data-slot="table-container"]') as HTMLElement
    setScrollGeometry(tableContainer, { scrollWidth: 900, clientWidth: 400, scrollLeft: 0 })
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(tableContainer.getAttribute('data-scroll-fade')).toBe('right')

    setScrollGeometry(tableContainer, { scrollWidth: 900, clientWidth: 400, scrollLeft: 500 })
    act(() => {
      tableContainer.dispatchEvent(new Event('scroll'))
    })
    expect(tableContainer.getAttribute('data-scroll-fade')).toBeNull()
  })

  it('keeps the container overflow-x-auto so the table itself still scrolls (existing behaviour)', () => {
    const { container } = renderTable()
    const tableContainer = container.querySelector('[data-slot="table-container"]')!
    expect(tableContainer.className).toContain('overflow-x-auto')
  })
})
