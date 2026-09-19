import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PLAYBOOKS, REFERENCE_DATE, summarizeCases, type PlaybookRanking } from '@mortar/core'
import { fetchPlaybooks } from '@/lib/api'
import { PlaybooksPanel } from '@/components/bookings/PlaybooksPanel'
import { buildSnapshot } from './snapshotFixture'

vi.mock('@/lib/api', () => ({
  fetchPlaybooks: vi.fn()
}))

const SNAPSHOT = buildSnapshot()
const SUMMARY = summarizeCases(
  {
    bookings: SNAPSHOT.bookings,
    applications: SNAPSHOT.applications,
    events: SNAPSHOT.events,
    tasks: SNAPSHOT.tasks
  },
  REFERENCE_DATE
).find((c) => c.bookingId === 'BK-9001')!

/** Two fitting playbooks ahead of three Jev scored as no fit. */
const RANKING: PlaybookRanking = {
  bookingId: 'BK-9001',
  query: 'missing payslip',
  results: [
    { playbookId: 'PB-001', keywordScore: 1, fit: { score: 2, confidence: 0.9 } },
    { playbookId: 'PB-007', keywordScore: 0.8, fit: { score: 1, confidence: 0.7 } },
    { playbookId: 'PB-005', keywordScore: 0.6, fit: { score: 0, confidence: 0.9 } },
    { playbookId: 'PB-013', keywordScore: 0.5, fit: { score: 0, confidence: 0.8 } },
    { playbookId: 'PB-015', keywordScore: 0.4, fit: { score: 0, confidence: 0.8 } }
  ],
  meta: { source: 'cache', stale: false, latencyMs: null }
}

const titleOf = (id: string) => PLAYBOOKS.find((p) => p.id === id)!.title

function renderPanel() {
  return render(<PlaybooksPanel bookingId="BK-9001" summary={SUMMARY} playbooks={PLAYBOOKS} refreshKey={0} />)
}

describe('PlaybooksPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchPlaybooks).mockResolvedValue(RANKING)
  })

  it('lists only the fitting playbooks and folds the rest behind a count control', async () => {
    renderPanel()

    expect(await screen.findByText(titleOf('PB-001'))).toBeTruthy()
    expect(screen.getByText(titleOf('PB-007'))).toBeTruthy()
    expect(screen.getByText('Direct Fit')).toBeTruthy()
    expect(screen.getByText('Partial Fit')).toBeTruthy()
    expect(screen.queryByText(titleOf('PB-005'))).toBeNull()
    expect(screen.getByRole('button', { name: 'Show 3 More' })).toBeTruthy()
    expect(screen.queryByText('No Fit')).toBeNull()
  })

  it('unfolds the no-fit playbooks behind one click and re-folds', async () => {
    renderPanel()

    fireEvent.click(await screen.findByRole('button', { name: 'Show 3 More' }))

    expect(screen.getByText(titleOf('PB-005'))).toBeTruthy()
    expect(screen.getByText(titleOf('PB-013'))).toBeTruthy()
    expect(screen.getAllByText('No Fit').length).toBe(3)
    expect(screen.getByRole('button', { name: 'Show Fewer' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Show Fewer' }))
    expect(screen.queryByText(titleOf('PB-005'))).toBeNull()
  })

  it('keeps the search box and the ranking caption', async () => {
    renderPanel()

    expect(await screen.findByText('Ranked For “missing payslip”')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Search Playbooks' })).toBeTruthy()
  })
})
