import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { unitKey } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { importBookings } from '@/lib/api'
import { DirectTableImport } from '@/components/import/DirectTableImport'

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  const snapshot = fixture.buildSnapshot()
  return {
    fetchSnapshot: vi.fn(async () => snapshot),
    importBookings: vi.fn(async ({ bookings }: { bookings: object[] }) => ({
      importId: 'IMP-DIRECT-1',
      bookings: bookings.map((b, i) => ({ ...b, id: `BK-${String(200 + i).padStart(4, '0')}` }))
    }))
  }
})

function renderDirectImport({
  held = new Map([[unitKey('Bukit Damai', 'A-12-03'), 'BK-9001']]),
  onImported = vi.fn()
}: {
  held?: Map<string, string>
  onImported?: (result: { importId: string; bookings: unknown[] }) => void
} = {}) {
  return {
    ...render(
      <MemoryRouter>
        <PersonaProvider initialPersona="sales-admin">
          <SnapshotProvider>
            <DirectTableImport held={held} onImported={onImported} />
          </SnapshotProvider>
        </PersonaProvider>
      </MemoryRouter>
    ),
    onImported
  }
}

describe('DirectTableImport', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.mocked(importBookings).mockClear()
  })

  it('renders direct entry ledger with persona auto-assignment and default law firm', async () => {
    renderDirectImport()
    expect(await screen.findByText(/Direct Case Import Ledger/i)).toBeTruthy()
    expect(screen.getAllByText(/Nurul Aina/i)[0]).toBeTruthy()
    expect(screen.getAllByText(/Teh & Partners/i)[0]).toBeTruthy()
    expect(screen.getAllByPlaceholderText(/A-12-08/i)[0]).toBeTruthy()
    expect(screen.getAllByPlaceholderText(/Nurul Huda Binti Ahmad/i)[0]).toBeTruthy()
  })

  it('validates unit against range and existing held units', async () => {
    renderDirectImport()
    await screen.findByText(/Direct Case Import Ledger/i)

    const unitInput = screen.getAllByPlaceholderText(/A-12-08/i)[0]
    const nameInput = screen.getAllByPlaceholderText(/Nurul Huda Binti Ahmad/i)[0]

    // Unit A-12-03 is held by BK-9001 in fixture
    fireEvent.change(unitInput, { target: { value: 'A-12-03' } })
    fireEvent.change(nameInput, { target: { value: 'John Tan' } })

    expect(await screen.findByText(/Held by BK-9001/i)).toBeTruthy()

    // Unit out of range
    fireEvent.change(unitInput, { target: { value: 'Z-99-99' } })
    expect(await screen.findByText(/Out of Range/i)).toBeTruthy()

    // Valid unit
    fireEvent.change(unitInput, { target: { value: 'A-15-05' } })
    expect(await screen.findByRole('button', { name: /Import 1 Case/i })).toBeTruthy()
  })

  it('submits valid row to importBookings with auto-assigned staff and law firm', async () => {
    const { onImported } = renderDirectImport()
    await screen.findByText(/Direct Case Import Ledger/i)

    const unitInput = screen.getAllByPlaceholderText(/A-12-08/i)[0]
    const nameInput = screen.getAllByPlaceholderText(/Nurul Huda Binti Ahmad/i)[0]

    fireEvent.change(unitInput, { target: { value: 'A-20-08' } })
    fireEvent.change(nameInput, { target: { value: 'Norazlan Bin Hashim' } })

    const importButton = screen.getByRole('button', { name: /Import 1 Case/i })
    expect(importButton).toBeTruthy()
    fireEvent.click(importButton)

    await waitFor(() => expect(importBookings).toHaveBeenCalledTimes(1))
    const payload = vi.mocked(importBookings).mock.calls[0][0]
    expect(payload.source).toBe('Direct Table Entry')
    expect(payload.bookings).toHaveLength(1)
    expect(payload.bookings[0].unit).toBe('A-20-08')
    expect(payload.bookings[0].buyer.name).toBe('Norazlan Bin Hashim')
    expect(payload.bookings[0].legalFirm).toBe('Teh & Partners')
    expect(payload.bookings[0].salesOwner).toBe('Nurul Aina')

    await waitFor(() => expect(onImported).toHaveBeenCalledTimes(1))
    expect(onImported).toHaveBeenCalledWith(
      expect.objectContaining({
        importId: 'IMP-DIRECT-1'
      })
    )
  })
})
