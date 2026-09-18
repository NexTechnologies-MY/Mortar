import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from '../ScrollToTop'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ScrollToTop />
      <Routes>
        <Route path="/one" element={<Link to="/two">Two</Link>} />
        <Route path="/two" element={<Link to="/one">One</Link>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ScrollToTop', () => {
  it('scrolls to the top on mount and on navigation', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    renderAt('/one')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })

    fireEvent.click(screen.getByRole('link', { name: 'Two' }))
    expect(scrollTo).toHaveBeenCalledTimes(2)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })
})
