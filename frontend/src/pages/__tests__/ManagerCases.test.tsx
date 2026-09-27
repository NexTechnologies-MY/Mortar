import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { summarizeCases, type Snapshot } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { booking, nextAction, snapshot } from './mockSnapshot'

let data: Snapshot
vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: data, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => summarizeCases(data, data.meta.referenceDate)
}))
vi.mock('@/lib/api', () => ({ postTask: vi.fn().mockResolvedValue({}), fetchNextAction: vi.fn() }))
import { postTask } from '@/lib/api'
import { ManagerCases } from '@/components/manager/ManagerCases'

function show() {
  return render(
    <MemoryRouter>
      <PersonaProvider>
        <ManagerCases suggestionsOnly />
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('compact manager cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('mortar.profile', 'manager')
    const row = booking('BK-9001', { bookingDate: '2026-09-03' })
    data = snapshot({
      bookings: [row],
      events: [
        {
          id: 'EV-1',
          bookingId: row.id,
          applicationId: null,
          track: 'sales',
          kind: 'booked',
          occurredAt: '2026-09-03T09:00:00+08:00',
          recordedAt: '2026-09-03T09:00:00+08:00',
          reportedBy: 'Test',
          verifiedBy: 'Test',
          status: 'confirmed',
          source: 'staff',
          messageId: null,
          document: null,
          note: null
        }
      ],
      nextActions: [nextAction(row.id, 'request_document', 'sales_admin')]
    })
  })

  it('shows overdue duration and a supported score while folding evidence and routing the action', async () => {
    show()
    expect(screen.getByRole('link', { name: 'A-12-03 · Raymond Tan Wei Hong' })).toBeTruthy()
    expect(screen.getByText('8 days overdue · 114% overdue · Jev: 90% For This Action')).toBeTruthy()
    expect(screen.queryByText(/15 days elapsed/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Why This Case' }))
    expect(screen.getByText(/15 days elapsed; 7 expected/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Request Follow-Up From Nurul Aina' }))
    await waitFor(() =>
      expect(postTask).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerRole: 'sales_admin',
          ownerName: 'Nurul Aina',
          managerFlaggedBy: 'Project Manager'
        })
      )
    )
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('does not invent a percentage from stale AI output', () => {
    data.nextActions[0].meta.stale = true
    show()
    expect(screen.getByText(/Timing-Based Follow-Up/)).toBeTruthy()
    expect(screen.queryByText(/Jev: 90%/)).toBeNull()
  })

  it('flags an equivalent ordinary task, and keeps completed follow-ups secondary until new evidence', () => {
    data.tasks = [
      {
        id: 'TASK-1',
        bookingId: 'BK-9001',
        action: 'request_document',
        title: 'Collect Documents',
        ownerRole: 'sales_admin',
        ownerName: 'Nurul Aina',
        dueOn: '2026-09-18',
        status: 'open',
        origin: 'staff',
        createdAt: '2026-09-18T09:00:00+08:00',
        completedAt: null
      }
    ]
    const view = show()
    expect(screen.getByRole('button', { name: 'Flag Task For Nurul Aina' })).toBeTruthy()
    view.unmount()
    data.tasks[0] = {
      ...data.tasks[0],
      status: 'done',
      managerFlaggedBy: 'Project Manager',
      completedAt: '2026-09-18T10:00:00+08:00'
    }
    show()
    expect(screen.getByText('No New Follow-Ups Needed.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Follow-Ups Already Sent (1)' })).toBeTruthy()
  })
})
