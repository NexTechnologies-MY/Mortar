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

const workbook = () =>
  new File([readFileSync(FIXTURE)], 'bookings.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

describe('readSheetFile', () => {
  beforeAll(() => {
    process.env.TZ = 'Asia/Kuala_Lumpur'
  })

  it('reads an XLSX workbook, date cells landing on the right day in UTC+8', async () => {
    const cells = await readSheetFile(workbook())
    const sheet = readBookingSheet(cells, {
      referenceDate: '2026-09-18',
      defaults: {
        project: 'Residensi Cahaya Muda',
        salesOwner: 'Unassigned',
        loanOwner: 'Tan Mei Ling',
        legalFirm: 'Unassigned'
      }
    })
    expect(sheet.missing).toEqual([])
    expect(sheet.rows.map((r) => r.errors)).toEqual([[], []])
    expect(sheet.rows.map((r) => r.draft?.bookingDate)).toEqual(['2026-09-02', '2026-09-15'])
    expect(sheet.rows.map((r) => r.draft?.priceRm)).toEqual([548000, 612800])
  })

  it('refuses a file that is neither XLSX nor CSV', async () => {
    await expect(readSheetFile(new File(['x'], 'bookings.xls'))).rejects.toBeInstanceOf(SheetReadError)
  })
})
