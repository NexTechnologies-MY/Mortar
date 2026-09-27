import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { importBookings, undoImport } from '@/lib/api'
import { ImportPage } from '@/pages/ImportPage'

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  const snapshot = fixture.buildSnapshot()
  const core = await import('@mortar/core')
  const held = [{ project: core.DEFAULT_PROJECT_SETTINGS.projectName, unit: 'D-05-01' }]
  return {
    fetchSnapshot: vi.fn(async () => snapshot),
    fetchProjectSettings: vi.fn(async () => ({ settings: core.DEFAULT_PROJECT_SETTINGS })),
    fetchInventory: vi.fn(async () => ({ held })),
    importBookings: vi.fn(async ({ bookings }: { bookings: object[] }) => ({
      importId: 'IMP-1',
      bookings: bookings.map((b, i) => ({ ...b, id: `BK-${String(141 + i).padStart(4, '0')}` }))
    })),
    undoImport: vi.fn(async () => ({ removed: ['BK-0141'] }))
  }
})

// jsdom's Blob has no `text()`; every browser the desks run does.
if (!('text' in Blob.prototype)) {
  Object.defineProperty(Blob.prototype, 'text', {
    value(this: Blob) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsText(this)
      })
    }
  })
}

const SHEET = [
  'Unit No,Purchaser Name,IC Number,Phone,SPA Price (RM),Booking Date,Gross Monthly Income (RM),Project',
  'D-05-01,Siti Hajar Binti Omar,920311-00-0001,+60 00-000 0101,"548,000",1/9/2026,"7,200",',
  'A-12-03,Lee Wen Jie,880726-00-0002,+60 00-000 0102,"612,800",8/9/2026,"9,800",Aster Heights',
  'D-14-02,Arjun Pillai,950102-00-0003,+60 00-000 0103,"575,500",15/9/2026,,'
].join('\n')

function renderImport() {
  return render(
    <MemoryRouter initialEntries={['/import']}>
      <PersonaProvider>
        <SnapshotProvider>
          <ImportPage />
        </SnapshotProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
}

function drop(content: string, name = 'september.csv') {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [new File([content], name, { type: 'text/csv' })] } })
}

function openUploadTab() {
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Upload A Sheet' }), { button: 0 })
  fireEvent.click(screen.getByRole('tab', { name: 'Upload A Sheet' }))
}

describe('ImportPage', () => {
  // Reading a dropped sheet is async; under a full parallel run it can outlast
  // the default 1 s wait, which made this file flaky.
  beforeAll(() => {
    configure({ asyncUtilTimeout: 5000 })
  })

  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem('mortar.profile', 'manager')
    vi.mocked(importBookings).mockClear()
    vi.mocked(undoImport).mockClear()
  })

  it('reviews every row: ready, held by an open booking, or missing a value', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Add Bookings' })
    openUploadTab()
    expect(document.querySelector('[data-tour="import-header"]')).toBeTruthy()
    expect(screen.queryByText('Upload A Spreadsheet, Or Type Bookings In One By One.')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Add Bookings' }).parentElement?.querySelector('button')).toBeTruthy()
    drop(SHEET)

    expect(await screen.findByText('3 Rows Read')).toBeTruthy()
    expect(screen.getByText('2 To Review')).toBeTruthy()
    expect(screen.getByText('1 Ready')).toBeTruthy()
    expect(screen.getByText('Unit Already Held By another booking')).toBeTruthy()
    expect(screen.queryByText(/BK-9001/)).toBeNull()
    expect(screen.getByText('Gross Monthly Income Missing')).toBeTruthy()
    expect(screen.getByText('D-05-01')).toBeTruthy()
    expect(screen.getByText('A-12-03')).toBeTruthy()
  })

  it('imports only the ready rows and confirms what landed', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Add Bookings' })
    openUploadTab()
    drop(SHEET)

    fireEvent.click(await screen.findByRole('button', { name: 'Import 1 Booking' }))

    await waitFor(() => expect(importBookings).toHaveBeenCalledTimes(1))
    const input = vi.mocked(importBookings).mock.calls[0][0]
    expect(input.source).toBe('september.csv')
    expect(input.bookings).toHaveLength(1)
    expect(input.bookings[0]).toMatchObject({ unit: 'A-12-03', priceRm: 612800, bookingDate: '2026-09-08' })
    expect(await screen.findByText('1 Booking Imported')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'BK-0141' }).getAttribute('href')).toBe('/bookings/BK-0141')
  })

  it('undoes the import from its confirmation, after asking', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Add Bookings' })
    openUploadTab()
    drop(SHEET)
    fireEvent.click(await screen.findByRole('button', { name: 'Import 1 Booking' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Undo This Import' }))

    expect(screen.getByText('Undo This Import?')).toBeTruthy()
    expect(undoImport).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Remove 1 Booking' }))

    await waitFor(() => expect(undoImport).toHaveBeenCalledWith('IMP-1', expect.any(String)))
    await waitFor(() => expect(screen.queryByText('1 Booking Imported')).toBeNull())
  })

  it('shows concise sheet requirements without the public demo warning', async () => {
    renderImport()
    openUploadTab()
    expect(await screen.findByRole('heading', { name: 'What The Sheet Needs' })).toBeTruthy()
    expect(screen.getByText('One Row Per Unit Booking, Under A Row Of Column Names.')).toBeTruthy()
    expect(screen.queryByText(/This Demo Is Public/)).toBeNull()
    expect(screen.queryByText(/Import Made-Up Buyers Only/)).toBeNull()
  })

  it('shows the type form and booking settings after the inventory loads', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Add Bookings' })
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Type Them In' }), { button: 0 })
    fireEvent.click(screen.getByRole('tab', { name: 'Type Them In' }))
    expect(await screen.findByText(/Enter Buyer Names And Choose Available Units/)).toBeTruthy()
  }, 10_000)

  it('names the required columns a sheet is missing', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Add Bookings' })
    openUploadTab()
    drop('Unit,Buyer,Price\nD-1,X,600000')

    expect(await screen.findByText('Columns Not Found')).toBeTruthy()
    expect(screen.getByText(/The Sheet Needs IC Number, Phone, Booking Date, Gross Monthly Income/)).toBeTruthy()
  })

  it('refuses a file that is not XLSX or CSV', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Add Bookings' })
    openUploadTab()
    drop('x', 'bookings.pdf')

    expect(await screen.findByText(/Only XLSX Or CSV Files Can Be Read/)).toBeTruthy()
  })
})
