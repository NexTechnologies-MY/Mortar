/**
 * The XLSX path end to end: a real workbook (bookings.xlsx, Excel date cells
 * stored as serials) through `readSheetFile` and `readBookingSheet`, in a
 * UTC+8 clock like the desks'. Issue #8: a reader upgrade that shifted date
 * cells by a day would otherwise ship unnoticed.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { readBookingSheet } from '@mortar/core'
import { SheetReadError, readSheetFile } from '../readSheetFile'

// jsdom's Blob has no `arrayBuffer()`; every browser the desks run does.
if (!('arrayBuffer' in Blob.prototype)) {
  Object.defineProperty(Blob.prototype, 'arrayBuffer', {
    value(this: Blob) {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(this)
      })
    }
  })
}

// Resolved from `frontend/`, where Vitest runs; `import.meta.url` is not a file URL under jsdom.
const FIXTURE = resolve(process.cwd(), 'src/components/import/__tests__/bookings.xlsx')
// The workbook `/import` hands out, written by `scripts/booking-template.mjs`.
const TEMPLATE = resolve(process.cwd(), 'public/booking-sheet-template.xlsx')

const workbook = (path = FIXTURE) =>
  new File([readFileSync(path)], 'bookings.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

const DEFAULTS = {
  project: 'Residensi Cahaya Muda',
  salesOwner: 'Unassigned',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Unassigned'
}

describe('readSheetFile', () => {
  beforeAll(() => {
    process.env.TZ = 'Asia/Kuala_Lumpur'
  })

  it('reads an XLSX workbook, date cells landing on the right day in UTC+8', async () => {
    const cells = await readSheetFile(workbook())
    const sheet = readBookingSheet(cells, { referenceDate: '2026-09-18', defaults: DEFAULTS })
    expect(sheet.missing).toEqual([])
    expect(sheet.rows.map((r) => r.errors)).toEqual([[], []])
    expect(sheet.rows.map((r) => r.draft?.bookingDate)).toEqual(['2026-09-02', '2026-09-15'])
    expect(sheet.rows.map((r) => r.draft?.priceRm)).toEqual([548000, 612800])
  })

  it('reads the template workbook as it is handed out: title rows skipped, every sample row ready', async () => {
    const cells = await readSheetFile(workbook(TEMPLATE))
    const sheet = readBookingSheet(cells, { referenceDate: '2026-09-18', defaults: DEFAULTS })
    expect(sheet.headerLine).toBe(4)
    expect(sheet.missing).toEqual([])
    expect(Object.keys(sheet.columns)).toHaveLength(11)
    expect(sheet.rows.map((r) => r.errors)).toEqual([[], [], []])
    expect(sheet.rows.map((r) => r.draft?.bookingDate)).toEqual(['2026-09-01', '2026-09-08', '2026-09-15'])
    expect(sheet.rows.map((r) => r.draft?.priceRm)).toEqual([548000, 612800, 575500])
    expect(sheet.rows[1].draft).toMatchObject({
      unit: 'D-09-04',
      salesOwner: 'Kelvin Chow',
      legalFirm: 'Kuan & Teh Advocates',
      buyer: { ic: '880726-00-0002', monthlyCommitmentsRm: 1450, propertiesOwned: 1 }
    })
  })

  it('refuses a file that is neither XLSX nor CSV', async () => {
    await expect(readSheetFile(new File(['x'], 'bookings.xls'))).rejects.toBeInstanceOf(SheetReadError)
  })
})
