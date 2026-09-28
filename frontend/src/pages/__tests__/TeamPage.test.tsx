import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_PROFILES, summarizeCases, type Snapshot } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { TeamPage } from '../TeamPage'
import { booking, snapshot } from './mockSnapshot'

let data: Snapshot

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: data, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => summarizeCases(data, data.meta.referenceDate)
}))

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function show() {
  return render(
    <MemoryRouter initialEntries={['/team']}>
      <PersonaProvider>
        <Routes>
          <Route path="/team" element={<TeamPage />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('TeamPage', () => {
  beforeEach(() => {
    localStorage.setItem('mortar.profile', 'manager')
    data = snapshot({ bookings: [booking('BK-9001', { bookingDate: '2026-09-03' })] })
  })

  it('opens on the four figures, each a way into the view behind it', () => {
    show()
    expect(screen.getByRole('heading', { level: 1, name: 'Team' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Open Bookings/ }).getAttribute('href')).toBe('/bookings')
    expect(screen.getByRole('link', { name: /Overdue Cases/ }).getAttribute('href')).toBe('/chase')
    expect(screen.getByRole('link', { name: /Value At Risk/ }).getAttribute('href')).toBe('/bookings')
    expect(screen.getByRole('link', { name: /Expected Signings In \d+ Days/ }).getAttribute('href')).toBe('/forecast')
  })

  it('lists one row per staff profile, the Manager excluded', () => {
    show()
    const table = screen.getByRole('table', { name: 'Bookings waiting on each person' })
    const staff = DEMO_PROFILES.filter((p) => p.persona !== 'manager')
    expect(within(table).getAllByRole('row')).toHaveLength(staff.length + 1)
    for (const person of staff) expect(within(table).getByRole('link', { name: person.name })).toBeTruthy()
    expect(within(table).queryByText('Robert Khoo')).toBeNull()
  })

  it('opens Bookings narrowed to the bookings waiting on the row’s person', () => {
    show()
    fireEvent.click(screen.getByTestId('team-row-loan-tan-mei-ling'))
    expect(screen.getByTestId('location').textContent).toBe('/bookings?waitingOn=loan-tan-mei-ling')
  })
})
