/**
 * Reads a dropped booking sheet into rows of cells, entirely in the browser:
 * CSV through `parseCsv`, XLSX through `read-excel-file` (loaded on demand so
 * it stays out of every other page's bundle). The first worksheet is the one
 * read, which is where a booking export puts its rows.
 */
import { parseCsv, type SheetCell } from '@mortar/core'

export class SheetReadError extends Error {}

export function sheetKind(fileName: string): 'csv' | 'xlsx' | null {
  const name = fileName.toLowerCase()
  if (name.endsWith('.csv')) return 'csv'
  if (name.endsWith('.xlsx')) return 'xlsx'
  return null
}

export async function readSheetFile(file: File): Promise<SheetCell[][]> {
  const kind = sheetKind(file.name)
  if (kind === 'csv') return parseCsv(await file.text())
  if (kind === 'xlsx') {
    const { readSheet } = await import('read-excel-file/browser')
    try {
      // The package types a date cell as `typeof Date` (the constructor); at
      // runtime it is a `Date` instance, which `SheetCell` already covers.
      return (await readSheet(file)) as unknown as SheetCell[][]
    } catch {
      throw new SheetReadError('This XLSX file could not be opened. Save it again from Excel and retry.')
    }
  }
  throw new SheetReadError('Only XLSX and CSV files can be read. Save the sheet in one of those formats.')
}
