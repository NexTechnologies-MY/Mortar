import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { FaqPage } from '@/pages/FaqPage'

describe('FaqPage', () => {
  it('renders its page title', () => {
    render(
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Frequently Asked Questions' })).toBeTruthy()
  })
})
