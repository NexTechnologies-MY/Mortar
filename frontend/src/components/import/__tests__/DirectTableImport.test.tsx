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
  const result = render(
    <MemoryRouter>
      <PersonaProvider initialPersona="sales-admin">
        <SnapshotProvider>
          <DirectTableImport held={held} onImported={onImported} />
        </SnapshotProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
  return { ...result, onImported }
}

describe('DirectTableImport', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.mocked(importBookings).mockClear()
  })

  it('renders direct entry ledger with default 1 row, persona auto-assignment, and unsold count', async () => {
    renderDirectImport()
    expect(await screen.findByText(/Direct Case Import Ledger/i)).toBeTruthy()
    expect(screen.getAllByText(/Nurul Aina/i)[0]).toBeTruthy()
    expect(screen.getAllByText(/Teh & Partners/i)[0]).toBeTruthy()
    expect(screen.getByText(/3 Layouts/i)).toBeTruthy()
    expect(screen.getByText(/Unsold:/i)).toBeTruthy()

    // Exactly 1 row by default
    const unitInputs = screen.getAllByPlaceholderText(/A-12-08/i)
    expect(unitInputs).toHaveLength(1)
  })

  it('drops down unsold units when focusing the unit input and filters on typing', async () => {
    renderDirectImport()
    await screen.findByText(/Direct Case Import Ledger/i)

    const unitInput = screen.getByPlaceholderText(/A-12-08/i)
    fireEvent.focus(unitInput)

    // Dropdown header
    expect(await screen.findByText(/Unsold Units/i)).toBeTruthy()

    // Type "A-15" to filter units
    fireEvent.change(unitInput, { target: { value: 'A-15' } })
    expect(await screen.findByText('A-15-01')).toBeTruthy()

    // Click unit from dropdown
    const option = screen.getByText('A-15-01')
    fireEvent.mouseDown(option)

    // Unit is populated
    expect(screen.getByDisplayValue('A-15-01')).toBeTruthy()
  })

  it('automatically updates the SPA price when a different layout model is selected', async () => {
    renderDirectImport()
    await screen.findByText(/Direct Case Import Ledger/i)

    const modelSelect = screen.getByRole('combobox', { name: /Model \/ Layout/i })
    expect(modelSelect).toBeTruthy()
    expect(screen.getByDisplayValue('480000')).toBeTruthy()

    // Change to Type B (RM 560,000)
    fireEvent.change(modelSelect, { target: { value: 'model-b' } })
    expect(screen.getByDisplayValue('560000')).toBeTruthy()

    // Change to Type C (RM 720,000)
    fireEvent.change(modelSelect, { target: { value: 'model-c' } })
    expect(screen.getByDisplayValue('720000')).toBeTruthy()
  })

  it('allows changing panel law firm per case row', async () => {
    renderDirectImport()
    await screen.findByText(/Direct Case Import Ledger/i)

    const lawFirmSelect = screen.getByRole('combobox', { name: /Panel Law Firm/i })
    expect(lawFirmSelect).toBeTruthy()
    expect((lawFirmSelect as HTMLSelectElement).value).toBe('Teh & Partners')

    // Change to Cheah & Associates
    fireEvent.change(lawFirmSelect, { target: { value: 'Cheah & Associates' } })
    expect((lawFirmSelect as HTMLSelectElement).value).toBe('Cheah & Associates')

    const unitInput = screen.getByPlaceholderText(/A-12-08/i)
    const nameInput = screen.getByPlaceholderText(/Nurul Huda Binti Ahmad/i)

    fireEvent.change(unitInput, { target: { value: 'A-20-08' } })
    fireEvent.change(nameInput, { target: { value: 'Norazlan Bin Hashim' } })

    const importButton = screen.getByRole('button', { name: /Import 1 Case/i })
    fireEvent.click(importButton)

    await waitFor(() => expect(importBookings).toHaveBeenCalledTimes(1))
    const payload = vi.mocked(importBookings).mock.calls[0][0]
    expect(payload.bookings[0].legalFirm).toBe('Cheah & Associates')
  })

  it('validates unit against range and existing held units', async () => {
    renderDirectImport()
    await screen.findByText(/Direct Case Import Ledger/i)

    const unitInput = screen.getByPlaceholderText(/A-12-08/i)
    const nameInput = screen.getByPlaceholderText(/Nurul Huda Binti Ahmad/i)

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

    const unitInput = screen.getByPlaceholderText(/A-12-08/i)
    const nameInput = screen.getByPlaceholderText(/Nurul Huda Binti Ahmad/i)

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
