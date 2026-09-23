import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { importBookings } from '@/lib/api'
import { ImportPage } from '@/pages/ImportPage'

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  const snapshot = fixture.buildSnapshot()
  return {
    fetchSnapshot: vi.fn(async () => snapshot),
    importBookings: vi.fn(async ({ bookings }: { bookings: object[] }) => ({
      bookings: bookings.map((b, i) => ({ ...b, id: `BK-${String(141 + i).padStart(4, '0')}` }))
    }))
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

describe('ImportPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.mocked(importBookings).mockClear()
  })

  it('reviews every row: ready, held by an open booking, or missing a value', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Import' })
    drop(SHEET)

    expect(await screen.findByText('3 Rows Read')).toBeTruthy()
    expect(screen.getByText('2 To Review')).toBeTruthy()
    expect(screen.getByText('1 Ready')).toBeTruthy()
    expect(screen.getByText('Unit Already Held By BK-9001')).toBeTruthy()
    expect(screen.getByText('Gross Monthly Income Missing')).toBeTruthy()
    expect(screen.getByText('RM 548,000')).toBeTruthy()
  })

  it('imports only the ready rows and confirms what landed', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Import' })
    drop(SHEET)

    fireEvent.click(await screen.findByRole('button', { name: 'Import 1 Booking' }))

    await waitFor(() => expect(importBookings).toHaveBeenCalledTimes(1))
    const input = vi.mocked(importBookings).mock.calls[0][0]
    expect(input.source).toBe('september.csv')
    expect(input.bookings).toHaveLength(1)
    expect(input.bookings[0]).toMatchObject({ unit: 'D-05-01', priceRm: 548000, bookingDate: '2026-09-01' })
    expect(await screen.findByText('1 Booking Imported')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'BK-0141' }).getAttribute('href')).toBe('/bookings/BK-0141')
  })

  it('names the required columns a sheet is missing', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Import' })
    drop('Unit,Buyer,Price\nD-1,X,600000')

    expect(await screen.findByText('Columns Not Found')).toBeTruthy()
    expect(screen.getByText(/The Sheet Needs IC Number, Phone, Booking Date, Gross Monthly Income/)).toBeTruthy()
  })

  it('refuses a file that is not XLSX or CSV', async () => {
    renderImport()
    await screen.findByRole('heading', { name: 'Import' })
    drop('x', 'bookings.pdf')

    expect(await screen.findByText(/Only XLSX Or CSV Files Can Be Read/)).toBeTruthy()
  })
})
