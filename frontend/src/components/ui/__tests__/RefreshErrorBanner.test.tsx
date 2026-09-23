import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'

describe('RefreshErrorBanner', () => {
  it('shows a plain default sentence and calls onRetry from Try Again', () => {
    const onRetry = vi.fn()
    render(<RefreshErrorBanner onRetry={onRetry} />)

    expect(screen.getByText('Could Not Refresh. Showing The Last Loaded Data.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('accepts a page-specific message', () => {
    render(<RefreshErrorBanner onRetry={vi.fn()} message="Could Not Refresh The Chase List." />)

    expect(screen.getByText('Could Not Refresh The Chase List.')).toBeTruthy()
  })
})
