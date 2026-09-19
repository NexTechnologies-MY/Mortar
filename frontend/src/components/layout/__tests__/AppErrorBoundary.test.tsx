import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AppErrorBoundary } from '../AppErrorBoundary'

function Thrower(): never {
  throw new Error('boom')
}

describe('AppErrorBoundary', () => {
  const originalLocation = window.location

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('shows the recovery card when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>
    )

    expect(screen.getByText('Something Went Wrong')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy()
  })

  it('recovers to /app, which redirects to the persona home', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign, reload: vi.fn(), href: originalLocation.href }
    })

    render(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Back To App' }))

    expect(assign).toHaveBeenCalledWith('/app')
  })
})
