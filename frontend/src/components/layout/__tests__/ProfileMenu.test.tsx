import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PERSONA_STORAGE_KEY, PersonaProvider } from '@/lib/persona'
import { snapshot, stalledCase } from '@/pages/__tests__/mockSnapshot'
import { ProfileMenu } from '../ProfileMenu'

const mocks = vi.hoisted(() => ({ signOut: vi.fn(() => Promise.resolve()) }))

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({
    snapshot: snapshot({
      tasks: [
        {
          id: 'TASK-1',
          bookingId: 'BK-9001',
          action: 'request_document',
          title: 'Request Payslip From Raymond Tan Wei Hong',
          ownerRole: 'sales_admin',
          ownerName: 'Nurul Aina',
          dueOn: '2026-09-18',
          status: 'open',
          origin: 'staff',
          createdAt: '2026-09-16T00:00:00+08:00',
          completedAt: null
        }
      ]
    }),
    loading: false,
    error: null,
    refresh: vi.fn()
  }),
  useCases: () => [stalledCase('BK-9001'), stalledCase('BK-0040')]
}))

vi.mock('@/lib/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/session')>()),
  signOut: mocks.signOut
}))

function LocationProbe() {
  return <p data-testid="location">{useLocation().pathname}</p>
}

function renderMenu(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PersonaProvider>
        <ProfileMenu />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </PersonaProvider>
    </MemoryRouter>
  )
}

function openPanel(name = 'Nurul Aina, Sales Admin. Open profile menu') {
  fireEvent.click(screen.getByRole('button', { name }))
  return screen.getByRole('dialog', { name: 'Profile' })
}

function openSwitcher(panel: HTMLElement, name = 'Nurul Aina, Sales Admin. Switch profile') {
  fireEvent.keyDown(within(panel).getByRole('button', { name }), { key: 'ArrowDown' })
  return screen.getByRole('menu')
}

afterEach(() => window.localStorage.clear())

describe('ProfileMenu', () => {
  it('shows only the avatar in the top bar, with the name and role as its accessible name', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Nurul Aina, Sales Admin. Open profile menu' })
    expect(trigger.textContent).toBe('')
  })

  it("opens on the persona card with Today's two figures and a Sign Out", () => {
    renderMenu()
    const panel = openPanel()

    expect(within(panel).getByText('Signed In As')).toBeTruthy()
    const card = within(panel).getByRole('button', { name: 'Nurul Aina, Sales Admin. Switch profile' })
    expect(within(card).getByText('Stalled Bookings').nextElementSibling?.textContent).toBe('2')
    expect(within(card).getByText('Due Today').nextElementSibling?.textContent).toBe('1')
    expect(screen.getByRole('button', { name: 'Nurul Aina, Sales Admin. Close profile menu' })).toBeTruthy()

    fireEvent.click(within(panel).getByRole('button', { name: 'Sign Out' }))
    expect(mocks.signOut).toHaveBeenCalledTimes(1)
  })

  it("switches profile from the card and opens the new persona's home", () => {
    renderMenu('/import')
    const menu = openSwitcher(openPanel())

    const active = within(menu).getByRole('menuitemradio', { name: /Nurul Aina/ })
    expect(active.getAttribute('aria-checked')).toBe('true')
    expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(5)

    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /Arvind Raj/ }))
    expect(window.localStorage.getItem('mortar.profile')).toBe('legal-admin')
    expect(window.localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('legal-admin')
    expect(screen.getByTestId('location').textContent).toBe('/legal')
  })

  it('stays on the page when the active profile is picked again', () => {
    renderMenu('/import')
    const menu = openSwitcher(openPanel())

    fireEvent.click(within(menu).getByRole('menuitemradio', { name: /Nurul Aina/ }))
    expect(screen.getByTestId('location').textContent).toBe('/import')
  })

  it("shows the Manager's overdue cases and follow-ups awaiting reply", () => {
    window.localStorage.setItem('mortar.profile', 'manager')
    renderMenu()
    const panel = openPanel('Robert Khoo, Manager. Open profile menu')

    expect(within(panel).getByText('Overdue Cases')).toBeTruthy()
    expect(within(panel).getByText('Awaiting Reply').nextElementSibling?.textContent).toBe('0')
  })
})
