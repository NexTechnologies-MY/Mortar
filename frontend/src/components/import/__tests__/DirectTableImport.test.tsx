import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DEFAULT_PROJECT_SETTINGS, unitKey } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { DirectTableImport } from '@/components/import/DirectTableImport'
import { importBookings, fetchProjectSettings } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  fetchProjectSettings: vi.fn(async () => ({ settings: DEFAULT_PROJECT_SETTINGS })),
  saveProjectSettings: vi.fn(),
  importBookings: vi.fn(async ({ bookings }: { bookings: object[] }) => ({
    importId: 'IMP-DIRECT-1',
    bookings: bookings.map((booking, index) => ({ ...booking, id: `BK-${index + 1}` }))
  }))
}))

function renderImport(held = new Map([[unitKey(DEFAULT_PROJECT_SETTINGS.projectName, 'A-12-03'), 'BK-9001']])) {
  return render(
    <MemoryRouter>
      <PersonaProvider initialPersona="sales-admin">
        <DirectTableImport held={held} />
      </PersonaProvider>
    </MemoryRouter>
  )
}

function renderAsNamedSalesProfile() {
  window.localStorage.setItem('mortar.profile', 'sales-farah-izzati')
  return render(
    <MemoryRouter>
      <PersonaProvider>
        <DirectTableImport held={new Map()} />
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('DirectTableImport', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(fetchProjectSettings).mockResolvedValue({ settings: DEFAULT_PROJECT_SETTINGS })
  })

  it('starts with one clear booking form and loads server settings', async () => {
    renderImport()
    expect(await screen.findByRole('heading', { name: 'Type Bookings In' })).toBeTruthy()
    expect(screen.getByLabelText('Buyer Name')).toBeTruthy()
    expect(screen.getByLabelText('Unit Number')).toBeTruthy()
    expect(screen.getByLabelText('Block For Booking 1')).toBeTruthy()
    expect(screen.getAllByRole('region', { name: /Booking/ })).toHaveLength(1)
    expect(await screen.findByText(/Sales Agent:/)).toBeTruthy()
    expect(fetchProjectSettings).toHaveBeenCalledOnce()
  })

  it('opens the unit list while empty, scopes it to the chosen block, and excludes units on other forms', async () => {
    renderImport()
    const input = await screen.findByLabelText('Unit Number')
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Add Another Booking' }) as HTMLButtonElement).disabled).toBe(false)
    )
    fireEvent.focus(input)
    expect(await screen.findByText(/available/)).toBeTruthy()
    expect(screen.getByText('A-01-01')).toBeTruthy()
    fireEvent.change(input, { target: { value: 'A-15' } })
    expect(await screen.findByText('A-15-01')).toBeTruthy()
    fireEvent.click(screen.getByText('A-15-01'))
    expect(screen.getByDisplayValue('A-15-01')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add Another Booking' }))
    const secondInput = screen.getAllByLabelText('Unit Number')[1]
    fireEvent.mouseDown(secondInput)
    fireEvent.focus(secondInput)
    expect(screen.queryByText('A-15-01')).toBeNull()
  })

  it('requires every form to be valid and rejects duplicate units before submitting', async () => {
    renderImport(new Map())
    const firstUnit = await screen.findByLabelText('Unit Number')
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Add Another Booking' }) as HTMLButtonElement).disabled).toBe(false)
    )
    fireEvent.change(firstUnit, { target: { value: 'A-15-01' } })
    fireEvent.change(screen.getByLabelText('Buyer Name'), { target: { value: 'Sample Buyer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Another Booking' }))
    const unitInputs = screen.getAllByLabelText('Unit Number')
    fireEvent.change(unitInputs[1], { target: { value: 'A-15-01' } })
    fireEvent.change(screen.getAllByLabelText('Buyer Name')[1], { target: { value: 'Second Buyer' } })
    const submit = screen.getByRole('button', { name: 'Add 2 Bookings' })
    expect((submit as HTMLButtonElement).disabled).toBe(true)
    expect(importBookings).not.toHaveBeenCalled()
  })

  it('rejects malformed unit numbers and SPA prices below the booking minimum', async () => {
    renderImport(new Map())
    await waitFor(() => expect(screen.queryByText('Loading Project Settings…')).toBeNull())
    fireEvent.change(screen.getByLabelText('Unit Number'), { target: { value: 'A-foo-12' } })
    fireEvent.change(screen.getByLabelText('Buyer Name'), { target: { value: 'Sample Buyer' } })
    expect(screen.getByText('Enter A Unit Number In The Configured Format')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Add 1 Booking' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Unit Number'), { target: { value: 'A-1-1' } })
    expect(screen.getByText('Choose A Unit In The Configured Format')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Add 1 Booking' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Unit Number'), { target: { value: 'A-20-08' } })
    fireEvent.change(screen.getByLabelText('SPA Price'), { target: { value: '9999' } })
    expect(screen.getByText('Enter SPA Price From RM 10,000')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Add 1 Booking' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('adds the full valid set with unmistakably synthetic buyer details', async () => {
    renderImport(new Map())
    const unit = await screen.findByLabelText('Unit Number')
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Add Another Booking' }) as HTMLButtonElement).disabled).toBe(false)
    )
    fireEvent.change(unit, { target: { value: 'A-20-08' } })
    fireEvent.change(screen.getByLabelText('Buyer Name'), { target: { value: 'Sample Buyer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 Booking' }))
    await waitFor(() => expect(importBookings).toHaveBeenCalledOnce())
    const payload = vi.mocked(importBookings).mock.calls[0][0]
    expect(payload.bookings[0].buyer.ic).toBe('000000-00-0001')
    expect(payload.bookings[0].buyer.phone).toBe('+60 00-000 0000')
    expect(payload.bookings[0].salesOwner).toBe('Nurul Aina')
  })

  it('uses the active named sales profile as booking owner', async () => {
    renderAsNamedSalesProfile()
    await waitFor(() => expect(screen.queryByText('Loading Project Settings…')).toBeNull())
    fireEvent.change(screen.getByLabelText('Unit Number'), { target: { value: 'A-20-08' } })
    fireEvent.change(screen.getByLabelText('Buyer Name'), { target: { value: 'Sample Buyer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add 1 Booking' }))
    await waitFor(() => expect(importBookings).toHaveBeenCalledOnce())
    const payload = vi.mocked(importBookings).mock.calls[0][0]
    expect(payload.reportedBy).toBe('Farah Izzati')
    expect(payload.bookings[0].salesOwner).toBe('Farah Izzati')
  })

  it('pauses entry and offers a retry when project settings fail to load', async () => {
    vi.mocked(fetchProjectSettings).mockRejectedValueOnce(new Error('Could Not Reach The Server. Try Again.'))
    renderImport()
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Add 1 Booking' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeTruthy()
  })
})
