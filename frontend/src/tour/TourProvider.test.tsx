import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PersonaProvider, usePersona, type Persona } from '@/lib/persona'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { TourProvider, useTour } from './TourProvider'

const mocks = vi.hoisted(() => ({ snapshot: null as ReturnType<typeof buildSnapshot> | null }))

vi.mock('@/lib/data', () => ({ useSnapshot: () => ({ snapshot: mocks.snapshot }) }))

function Harness({ missingTargets = false }: { missingTargets?: boolean }) {
  const { start } = useTour()
  const { setPersona } = usePersona()
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output data-testid="location">{location.pathname}</output>
      <button type="button" onClick={() => start()}>
        Start tour
      </button>
      <button type="button" onClick={() => setPersona('legal-admin')}>
        Switch to Legal
      </button>
      <button type="button" onClick={() => navigate('/forecast')}>
        Leave tour route
      </button>
      <Routes>
        <Route
          path="*"
          element={
            <main>
              {!missingTargets ? (
                <>
                  <div data-tour="today-header">Today header</div>
                  <div data-tour="today-card">Today card</div>
                  <div data-tour="today-actions">Today actions</div>
                  <div data-tour="today-quick-view">Quick view</div>
                  <div data-tour="open-tasks">Open tasks</div>
                  <div data-tour="booking-holder">Booking holder</div>
                  <div data-tour="booking-filters">Booking filters</div>
                  <div data-tour="import-header">Import header</div>
                  <div data-tour="ask-mortar">Ask Mortar</div>
                  <div data-tour="case-status">Case status</div>
                  <div data-tour="case-message">Case message</div>
                  <div data-tour="legal-header">Legal header</div>
                  <div data-tour="legal-no-appointment">No appointment</div>
                  <div data-tour="legal-appointment-set">Appointment set</div>
                  <div data-tour="legal-panel-load">Panel load</div>
                </>
              ) : null}
            </main>
          }
        />
      </Routes>
      <div role="dialog" aria-label="Example dialog">
        <input aria-label="Dialog input" />
        <button type="button">Dialog button</button>
      </div>
    </>
  )
}

function renderTour(path = '/chase', persona: Persona = 'sales-admin', missingTargets = false) {
  window.localStorage.setItem('mortar.persona', persona)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PersonaProvider>
        <TourProvider>
          <Harness missingTargets={missingTargets} />
        </TourProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
}

function progress() {
  return screen.getByRole('navigation', { name: 'Walkthrough progress' })
}

describe('TourProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mocks.snapshot = buildSnapshot()
    Element.prototype.scrollIntoView = () => {}
  })

  it('starts for the active persona and progresses to a case resolved from the snapshot', async () => {
    renderTour('/bookings', 'loan-admin')
    fireEvent.click(screen.getByRole('button', { name: 'Start tour' }))
    expect(screen.getByTestId('location').textContent).toBe('/bookings')
    expect(progress().textContent).toContain('1 / 4')

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(progress().textContent).toContain('2 / 4')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toMatch(/^\/bookings\/BK-\d{4}$/))
    const selectedId = screen.getByTestId('location').textContent?.split('/').at(-1)
    expect(mocks.snapshot?.bookings.some((booking) => booking.id === selectedId)).toBe(true)
    expect(progress().textContent).toContain('3 / 4')
  })

  it('restarts at the first step when the persona changes during a tour', async () => {
    renderTour()
    fireEvent.click(screen.getByRole('button', { name: 'Start tour' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(progress().textContent).toContain('2 / 8')

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Legal' }))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/legal'))
    expect(progress().textContent).toContain('1 / 5')
  })

  it('ends when navigation leaves the route requested by the current step', async () => {
    renderTour()
    fireEvent.click(screen.getByRole('button', { name: 'Start tour' }))
    fireEvent.click(screen.getByRole('button', { name: 'Leave tour route' }))
    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Walkthrough progress' })).toBeNull())
    expect(screen.getByTestId('location').textContent).toBe('/forecast')
  })

  it('does not consume tour keys from inputs or dialogs, but advances from the page', () => {
    renderTour()
    fireEvent.click(screen.getByRole('button', { name: 'Start tour' }))
    const input = screen.getByRole('textbox', { name: 'Dialog input' })
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(progress().textContent).toContain('1 / 8')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(progress().textContent).toContain('1 / 8')

    fireEvent.keyDown(screen.getByRole('button', { name: 'Dialog button' }), { key: 'ArrowRight' })
    expect(progress().textContent).toContain('1 / 8')
    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    expect(progress().textContent).toContain('2 / 8')
  })

  it('keeps the caption available when a step has no matching target', () => {
    renderTour('/chase', 'sales-admin', true)
    fireEvent.click(screen.getByRole('button', { name: 'Start tour' }))
    expect(screen.getByText('Today shows the bookings that need a move and the tasks due today.')).toBeTruthy()
    expect(screen.getByRole('alert').className).toContain('bottom-5')
  })

  it('finishes the loan tour at that persona’s home', async () => {
    renderTour('/bookings', 'loan-admin')
    fireEvent.click(screen.getByRole('button', { name: 'Start tour' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toMatch(/^\/bookings\/BK-\d{4}$/))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Walkthrough progress' })).toBeNull())
    expect(screen.getByTestId('location').textContent).toBe('/bookings')
  })
})
