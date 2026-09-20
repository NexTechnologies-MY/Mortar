import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Snapshot } from '@mortar/core'
import { DEFAULT_SEED, PLAYBOOKS, REFERENCE_DATE, STORIES, generate } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AskPanel } from '../AskPanel'

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), postTask: vi.fn() }))

// The canonical dataset, so the answers under test are the real ones rather
// than a fixture that could disagree with what ships.
const generated = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })
const SNAP: Snapshot = {
  bookings: [...generated.bookings, ...STORIES.map((s) => s.booking)],
  applications: [...generated.applications, ...STORIES.flatMap((s) => s.applications)],
  events: [...generated.events, ...STORIES.flatMap((s) => s.events)],
  messages: STORIES.flatMap((s) => s.messages),
  playbooks: PLAYBOOKS,
  tasks: [],
  extractions: [],
  signals: [],
  nextActions: [],
  meta: { seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, resetAt: null }
}

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: SNAP, loading: false, error: null, refresh: mocks.refresh }),
  useCases: () => []
}))

vi.mock('@/lib/api', () => ({ postTask: mocks.postTask }))

vi.mock('@/components/ui/toastConfig', () => ({
  notify: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }
}))

function renderPanel() {
  return render(
    <MemoryRouter>
      <PersonaProvider>
        <Dialog open>
          <DialogContent>
            <AskPanel onNavigate={vi.fn()} />
          </DialogContent>
        </Dialog>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('AskPanel', () => {
  beforeEach(() => {
    mocks.refresh.mockReset()
    mocks.postTask.mockReset().mockResolvedValue({})
  })

  it('offers the desk its own questions before anything is typed', () => {
    renderPanel()
    expect(screen.getByText('Which Documents Are We Still Chasing?')).toBeTruthy()
  })

  it('answers a suggested question and says where the answer came from', () => {
    renderPanel()
    fireEvent.click(screen.getByText('Which Documents Are We Still Chasing?'))
    expect(screen.getByText(/are waiting on a document/)).toBeTruthy()
    expect(screen.getByText('Counted From Your Bookings')).toBeTruthy()
  })

  it('links every booking it names through to that case', () => {
    renderPanel()
    fireEvent.click(screen.getByText('Which Documents Are We Still Chasing?'))
    const link = screen.getAllByRole('link').find((a) => a.textContent?.startsWith('BK-'))
    expect(link?.getAttribute('href')).toMatch(/^\/bookings\/BK-/)
  })

  it('says so plainly when it cannot answer, instead of guessing', () => {
    renderPanel()
    fireEvent.change(screen.getByLabelText('Ask about your bookings'), { target: { value: 'what is the weather' } })
    fireEvent.click(screen.getByRole('button', { name: /^Ask$/ }))
    expect(screen.getByText(/cannot answer that one yet/)).toBeTruthy()
    // The suggestions come back, so a miss still leaves somewhere to go.
    expect(screen.getByText('Which Documents Are We Still Chasing?')).toBeTruthy()
  })

  it('raises one chase per booking it named, then refreshes', async () => {
    renderPanel()
    fireEvent.click(screen.getByText('Which Documents Are We Still Chasing?'))
    const cited = screen.getAllByRole('link').filter((a) => a.textContent?.startsWith('BK-')).length
    fireEvent.click(screen.getByRole('button', { name: /^Chase All/ }))
    await waitFor(() => expect(mocks.postTask).toHaveBeenCalledTimes(cited))
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
    expect(screen.getByText('On The Chase List')).toBeTruthy()
  })

  it('credits Jev for the chases it proposed', async () => {
    renderPanel()
    fireEvent.click(screen.getByText('Which Documents Are We Still Chasing?'))
    fireEvent.click(screen.getByRole('button', { name: /^Chase All/ }))
    await waitFor(() => expect(mocks.postTask).toHaveBeenCalled())
    for (const [input] of mocks.postTask.mock.calls) {
      expect(input.origin).toBe('jev')
    }
  })

  it('keeps the answer still once it has been given', async () => {
    renderPanel()
    fireEvent.click(screen.getByText('Which Documents Are We Still Chasing?'))
    const answer = screen.getByText(/are waiting on a document/).textContent
    fireEvent.click(screen.getByRole('button', { name: /^Chase All/ }))
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
    expect(screen.getByText(/are waiting on a document/).textContent).toBe(answer)
  })
})
