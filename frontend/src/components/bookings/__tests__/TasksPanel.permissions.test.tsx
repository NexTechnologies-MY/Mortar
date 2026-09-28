import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Task } from '@mortar/core'
import { TasksPanel } from '../TasksPanel'
import { PersonaProvider } from '@/lib/persona'

const task: Task = {
  id: 'TSK-1',
  bookingId: 'BK-1',
  action: 'call_buyer',
  title: 'Call Buyer',
  ownerRole: 'loan_admin',
  ownerName: 'Tan Mei Ling',
  dueOn: '2026-09-19',
  status: 'open',
  origin: 'staff',
  createdAt: '2026-09-18T09:00:00+08:00',
  completedAt: null
}

describe('TasksPanel task status permissions', () => {
  it('shows completion to the named owner and Manager, hiding it from other profiles', () => {
    render(
      <PersonaProvider initialPersona="loan-admin">
        <TasksPanel tasks={[task]} onChanged={async () => {}} />
      </PersonaProvider>
    )
    expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
    cleanup()

    render(
      <PersonaProvider initialPersona="sales-admin">
        <TasksPanel tasks={[task]} onChanged={async () => {}} />
      </PersonaProvider>
    )
    expect(screen.queryByRole('button', { name: 'Complete' })).toBeNull()
    cleanup()

    render(
      <PersonaProvider initialPersona="manager">
        <TasksPanel tasks={[task]} onChanged={async () => {}} />
      </PersonaProvider>
    )
    expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
  })
})
