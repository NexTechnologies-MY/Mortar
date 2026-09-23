import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '@mortar/core'
import { ChaseTasks } from '@/components/chase/ChaseTasks'

function LocationEcho() {
  return <div data-testid="location">{useLocation().pathname}</div>
}

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'TASK-1',
    bookingId: 'BK-9001',
    action: 'request_document',
    title: 'Request Payslip From Raymond Tan Wei Hong',
    ownerRole: 'sales',
    ownerName: 'Nurul Aina',
    dueOn: '2026-09-20',
    status: 'open',
    origin: 'jev',
    createdAt: '2026-09-16T00:00:00+08:00',
    completedAt: null,
    ...overrides
  }
}

function renderTasks(tasks: Task[], onComplete: (task: Task) => void) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ChaseTasks tasks={tasks} completing={new Set()} onComplete={onComplete} />} />
        <Route path="/bookings/:id" element={<LocationEcho />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ChaseTasks', () => {
  it('opens the booking case page when a task row title is clicked', () => {
    renderTasks([task()], vi.fn())

    const link = document.querySelector('a[href="/bookings/BK-9001"]')!
    fireEvent.click(link)

    expect(screen.getByTestId('location').textContent).toBe('/bookings/BK-9001')
  })

  it('completes a task without navigating away', () => {
    const onComplete = vi.fn()
    const t = task()
    renderTasks([t], onComplete)

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))

    expect(onComplete).toHaveBeenCalledWith(t)
    expect(screen.queryByTestId('location')).toBeNull()
  })
})
