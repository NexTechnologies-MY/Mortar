import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { summarizeCases, type Snapshot, type Task } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { ChasePage } from '../ChasePage'
import { booking, nextAction, snapshot } from './mockSnapshot'

// Radix Select scrolls the highlighted item into view on open; jsdom has no layout engine.
Element.prototype.scrollIntoView = vi.fn()

let data: Snapshot

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: data, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => summarizeCases(data, data.meta.referenceDate)
}))
vi.mock('@/lib/api', () => ({ postTask: vi.fn().mockResolvedValue({}), fetchNextAction: vi.fn() }))

import { postTask } from '@/lib/api'

function show() {
  return render(
    <MemoryRouter initialEntries={['/chase']}>
      <PersonaProvider>
        <ChasePage />
      </PersonaProvider>
    </MemoryRouter>
  )
}

function followUp(overrides: Partial<Task> = {}): Task {
  return {
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
    completedAt: null,
    managerFlaggedBy: 'Robert Khoo',
    ...overrides
  }
}

describe("The Manager's Today", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('mortar.profile', 'manager')
    // Booked on 3 Sep and nothing confirmed since: 15 days against an expected 7.
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

  it('draws an overdue case as a Today card, with no percentage or Jev score, and routes the follow-up', async () => {
    show()
    expect(screen.getByText('1 Overdue Case · 0 Follow-Ups Awaiting Reply')).toBeTruthy()

    const card = screen.getByTestId('manager-card-BK-9001')
    expect(within(card).getByText('Overdue 8 d')).toBeTruthy()
    expect(within(card).getByText('Waiting On')).toBeTruthy()
    expect(within(card).getByText('Nurul Aina')).toBeTruthy()
    expect(within(card).getByRole('link', { name: 'Open Case' }).getAttribute('href')).toBe('/bookings/BK-9001')
    expect(document.body.textContent).not.toMatch(/%/)
    expect(document.body.textContent).not.toMatch(/Jev:/)

    fireEvent.click(within(card).getByRole('button', { name: 'Request Follow-Up' }))
    await waitFor(() =>
      expect(postTask).toHaveBeenCalledWith(
        expect.objectContaining({ ownerRole: 'sales_admin', ownerName: 'Nurul Aina', managerFlaggedBy: 'Robert Khoo' })
      )
    )
  })

  it('moves a case with an open follow-up into Follow-Ups You Sent, awaiting a reply', () => {
    data.tasks = [followUp()]
    show()

    expect(screen.queryByTestId('manager-card-BK-9001')).toBeNull()
    expect(screen.getByText('Every Overdue Case Already Has A Follow-Up.')).toBeTruthy()
    const sent = screen.getByRole('region', { name: 'Follow-ups you sent' })
    expect(within(sent).getByText('Awaiting Reply')).toBeTruthy()
    expect(screen.getByText('1 Overdue Case · 1 Follow-Up Awaiting Reply')).toBeTruthy()
  })

  it('keeps a completed follow-up there, answered, until new evidence arrives', () => {
    data.tasks = [followUp({ status: 'done', completedAt: '2026-09-18T10:00:00+08:00' })]
    show()

    const sent = screen.getByRole('region', { name: 'Follow-ups you sent' })
    expect(within(sent).getByText('Answered')).toBeTruthy()
    expect(screen.queryByTestId('manager-card-BK-9001')).toBeNull()
  })

  it('points to the busiest desk on Team', () => {
    show()
    const busiest = screen.getByRole('link', { name: /Busiest Desk/ })
    expect(busiest.getAttribute('href')).toBe('/team')
    expect(within(busiest).getByText('Nurul Aina')).toBeTruthy()
  })
})
