import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Snapshot } from '@mortar/core'
import { DEFAULT_SEED, PLAYBOOKS, REFERENCE_DATE, STORIES, generate } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AskPanel } from '../AskPanel'

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), postTask: vi.fn(), askAssistantStream: vi.fn() }))

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

vi.mock('@/lib/api', () => ({ askAssistantStream: mocks.askAssistantStream, postTask: mocks.postTask }))

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

/** The server refusing to run a model, which is what an unset key looks like. */
const noModel = () => {
  const err = new Error('Ask MortarAI is not set up')
  Object.assign(err, { status: 503 })
  return Promise.reject(err)
}

const ask = (question: string) =>
  fireEvent.change(screen.getByLabelText('Ask about your bookings'), { target: { value: question } })
const submit = () => fireEvent.click(screen.getByRole('button', { name: /^Ask$/ }))
const chip = (text: string) => fireEvent.click(screen.getByText(text))

describe('AskPanel', () => {
  beforeEach(() => {
    mocks.refresh.mockReset()
    mocks.postTask.mockReset().mockResolvedValue({})
    mocks.askAssistantStream.mockReset().mockImplementation(async (_input, onEvent) => {
      onEvent({ type: 'answer', answer: { answer: 'Nothing to add.', citations: [] } })
      onEvent({
        type: 'follow_ups',
        questions: ['Who owns the next step?', 'What is blocked?', 'Which booking is oldest?', 'What needs follow up?']
      })
    })
  })

  it('is titled Ask MortarAI, and says where the answers come from', () => {
    renderPanel()
    expect(screen.getByText('Ask MortarAI')).toBeTruthy()
    expect(screen.getByText("Answers Come From Mortar's Data. Check Before Acting.")).toBeTruthy()
  })

  it('offers the desk its own questions before anything is typed', () => {
    renderPanel()
    const chip = screen.getByText('Which Documents Are We Still Chasing?')
    expect(chip).toBeTruthy()
    // A design-system Button, not a bare element: the panel has no controls of
    // its own shape.
    expect(chip.closest('button')?.className).toContain('border-input')
    expect(screen.getAllByRole('button').filter((button) => button.textContent?.includes('?'))).toHaveLength(4)
  })

  it('sends the question, the desk, and the last few exchanges', async () => {
    renderPanel()
    ask('Which bookings are stuck with the bank?')
    submit()
    await waitFor(() => expect(mocks.askAssistantStream).toHaveBeenCalledTimes(1))
    expect(mocks.askAssistantStream.mock.calls[0][0]).toMatchObject({
      question: 'Which bookings are stuck with the bank?',
      persona: 'sales-admin',
      history: []
    })
  })

  it('shows the answer the server gave, with every booking it named as a link', async () => {
    mocks.askAssistantStream.mockImplementation(async (_input, onEvent) => {
      onEvent({ type: 'tool_call', label: 'Looking Up Bookings' })
      onEvent({ type: 'tool_result', label: 'Looking Up Bookings' })
      onEvent({
        type: 'answer',
        answer: {
          answer: 'BK-0001 is with Apex Bank and BK-0002 is waiting on a payslip.',
          citations: ['BK-0001', 'BK-0002']
        }
      })
      onEvent({
        type: 'follow_ups',
        questions: ['Which booking is oldest?', 'Who owns the next step?', 'What is blocked?', 'What needs follow up?']
      })
    })
    renderPanel()
    ask('what is stuck?')
    submit()
    await waitFor(() => expect(screen.getByText(/is with Apex Bank/)).toBeTruthy())
    expect(screen.getByText("From Mortar's Data")).toBeTruthy()
    const links = screen.getAllByRole('link').filter((a) => a.textContent?.startsWith('BK-'))
    expect(links.map((a) => a.textContent)).toEqual(['BK-0001', 'BK-0002'])
    expect(links[0].getAttribute('href')).toBe('/bookings/BK-0001')
    expect(screen.getAllByRole('button').filter((button) => button.textContent?.includes('?'))).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: /checks completed/i }))
    expect(screen.getByText('Looking Up Bookings')).toBeTruthy()
  })

  it('reads the next question in the light of the last one', async () => {
    renderPanel()
    ask('which bookings are stuck with the bank?')
    submit()
    await waitFor(() => expect(mocks.askAssistantStream).toHaveBeenCalledTimes(1))
    ask('and the oldest one?')
    submit()
    await waitFor(() => expect(mocks.askAssistantStream).toHaveBeenCalledTimes(2))
    expect(mocks.askAssistantStream.mock.calls[1][0].history).toEqual([
      { question: 'which bookings are stuck with the bank?', answer: 'Nothing to add.' }
    ])
  })

  it('falls back to the scripted answer when the server has no model', async () => {
    mocks.askAssistantStream.mockImplementation(noModel)
    renderPanel()
    chip('Which Documents Are We Still Chasing?')
    await waitFor(() => expect(screen.getByText(/are waiting on a document/)).toBeTruthy())
    expect(screen.getByText('Counted From Your Bookings')).toBeTruthy()
    // The scripted answer still offers its task button, with its links.
    expect(screen.getByRole('button', { name: /^Chase All/ })).toBeTruthy()
    expect(screen.getAllByRole('link').some((a) => a.textContent?.startsWith('BK-'))).toBe(true)
  })

  it('falls back the same way when the request never lands', async () => {
    mocks.askAssistantStream.mockImplementation(noModel)
    renderPanel()
    ask('Which documents are we still chasing?')
    submit()
    await waitFor(() => expect(screen.getByText(/are waiting on a document/)).toBeTruthy())
  })

  it('offers no task button for a model answer, and never claims to have made one', async () => {
    renderPanel()
    ask('what is stuck?')
    submit()
    await waitFor(() => expect(screen.getByText('Nothing to add.')).toBeTruthy())
    expect(screen.queryByRole('button', { name: /^Chase All/ })).toBeNull()
  })

  it('says so plainly when neither the model nor the script has an answer', async () => {
    mocks.askAssistantStream.mockImplementation(noModel)
    renderPanel()
    ask('what is the weather')
    submit()
    await waitFor(() => expect(screen.getByText(/do not hold the answer to that/)).toBeTruthy())
    // The suggestions come back, so a miss still leaves somewhere to go.
    expect(screen.getByText('Which Documents Are We Still Chasing?')).toBeTruthy()
  })

  it('refuses an image that is not one, before it is sent', async () => {
    renderPanel()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const pdf = new File(['%PDF-1.4'], 'letter.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [pdf] } })
    await waitFor(() => expect(screen.getByText(/is not an image/i)).toBeTruthy())
    expect(mocks.askAssistantStream).not.toHaveBeenCalled()
  })

  it('sends a photo with the question when one is attached', async () => {
    const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], 'bank-letter.jpg', { type: 'image/jpeg' })
    // jsdom's FileReader never fires against a detached File, so the read is
    // stubbed to hand back the base64 the component sends on.
    class StubReader {
      onload: ((e: ProgressEvent) => void) | null = null
      onerror: ((e: ProgressEvent) => void) | null = null
      result: string | null = null
      readAsDataURL() {
        this.result = 'data:image/jpeg;base64,/9j/4AAQ'
        this.onload?.(new ProgressEvent('load'))
      }
    }
    vi.stubGlobal('FileReader', StubReader)
    try {
      renderPanel()
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [jpeg] } })
      await waitFor(() => expect(screen.getByText('bank-letter.jpg')).toBeTruthy())
      ask('what does this letter say?')
      submit()
      await waitFor(() => expect(mocks.askAssistantStream).toHaveBeenCalled())
      expect(mocks.askAssistantStream.mock.calls[0][0].image).toEqual({ mimeType: 'image/jpeg', data: '/9j/4AAQ' })
      // Sent with the question, and cleared afterwards so it is not sent twice.
      await waitFor(() => expect(screen.queryByText('bank-letter.jpg')).toBeNull())
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('raises one chase per booking a scripted answer named, then refreshes', async () => {
    mocks.askAssistantStream.mockImplementation(noModel)
    renderPanel()
    chip('Which Documents Are We Still Chasing?')
    await waitFor(() => expect(screen.getByText(/are waiting on a document/)).toBeTruthy())
    const cited = screen.getAllByRole('link').filter((a) => a.textContent?.startsWith('BK-')).length
    fireEvent.click(screen.getByRole('button', { name: /^Chase All/ }))
    await waitFor(() => expect(mocks.postTask).toHaveBeenCalledTimes(cited))
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
    expect(screen.getByText("On Today's List")).toBeTruthy()
  })

  it('keeps the answer still once it has been given', async () => {
    mocks.askAssistantStream.mockImplementation(noModel)
    renderPanel()
    chip('Which Documents Are We Still Chasing?')
    await waitFor(() => expect(screen.getByText(/are waiting on a document/)).toBeTruthy())
    const answer = screen.getByText(/are waiting on a document/).textContent
    fireEvent.click(screen.getByRole('button', { name: /^Chase All/ }))
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled())
    expect(screen.getByText(/are waiting on a document/).textContent).toBe(answer)
  })
})
