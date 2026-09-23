/**
 * Booking sheet intake: turns the rows of a team's spreadsheet (CSV text, or
 * the cells an XLSX reader hands back) into bookings Mortar can hold. Pure and
 * framework-free, so the browser previews exactly what the server re-checks.
 * Nothing here reads a file or talks to the network: parsing stays in the
 * browser, and only the rows a person chose to import reach the server.
 */
import type { Booking, Buyer, IsoDate } from './types'
import { diffDays } from './sim/dates'

/** One cell as a reader hands it over: text from CSV; text, numbers or dates from XLSX. */
export type SheetCell = string | number | boolean | Date | null | undefined

/** A booking before the server numbers it. */
export type BookingDraft = Omit<Booking, 'id'>

export type SheetField =
  | 'unit'
  | 'buyerName'
  | 'ic'
  | 'phone'
  | 'priceRm'
  | 'bookingDate'
  | 'grossMonthlyIncomeRm'
  | 'monthlyCommitmentsRm'
  | 'propertiesOwned'
  | 'age'
  | 'project'
  | 'salesOwner'
  | 'legalFirm'

/** Columns a sheet must carry: what the booking form captures, plus the income the risk check needs. */
export const REQUIRED_FIELDS: readonly SheetField[] = [
  'unit',
  'buyerName',
  'ic',
  'phone',
  'priceRm',
  'bookingDate',
  'grossMonthlyIncomeRm'
]

export const SHEET_FIELD_LABELS: Record<SheetField, string> = {
  unit: 'Unit',
  buyerName: 'Buyer Name',
  ic: 'IC Number',
  phone: 'Phone',
  priceRm: 'Price',
  bookingDate: 'Booking Date',
  grossMonthlyIncomeRm: 'Gross Monthly Income',
  monthlyCommitmentsRm: 'Monthly Commitments',
  propertiesOwned: 'Properties Owned',
  age: 'Age',
  project: 'Project',
  salesOwner: 'Sales Agent',
  legalFirm: 'Solicitor'
}

/**
 * Header spellings per field, compared after lower-casing and dropping
 * everything but letters and digits, with or without a leading or trailing
 * `rm` (so `Price (RM)` reads as `price` and `Law Firm` stays `lawfirm`).
 */
const HEADER_NAMES: Record<SheetField, string[]> = {
  unit: ['unit', 'unitno', 'unitnumber', 'unitcode', 'lot', 'lotno', 'parcel', 'parcelno'],
  buyerName: ['buyer', 'buyername', 'purchaser', 'purchasername', 'name', 'customer', 'customername'],
  ic: ['ic', 'icno', 'icnumber', 'nric', 'nricno', 'mykad', 'mykadno', 'identitycard', 'icpassport', 'icpassportno'],
  phone: ['phone', 'phoneno', 'phonenumber', 'contact', 'contactno', 'mobile', 'mobileno', 'hp', 'hpno', 'tel'],
  priceRm: ['price', 'spaprice', 'nettprice', 'netprice', 'sellingprice', 'purchaseprice', 'unitprice'],
  bookingDate: ['bookingdate', 'datebooked', 'bookedon', 'date', 'bookdate'],
  grossMonthlyIncomeRm: ['grossmonthlyincome', 'monthlyincome', 'grossincome', 'income', 'salary'],
  monthlyCommitmentsRm: ['monthlycommitments', 'monthlycommitment', 'commitments', 'existingcommitments'],
  propertiesOwned: ['propertiesowned', 'propertyowned', 'existingproperties', 'noofproperties'],
  age: ['age', 'buyerage'],
  project: ['project', 'projectname', 'development'],
  salesOwner: ['salesagent', 'agent', 'salesperson', 'negotiator', 'salesowner', 'salesexecutive'],
  legalFirm: ['solicitor', 'lawfirm', 'legalfirm', 'lawyer', 'panelsolicitor']
}

/** What a booking takes from the desk when the sheet leaves it out. */
export interface SheetDefaults {
  project: string
  salesOwner: string
  loanOwner: string
  legalFirm: string
}

export interface SheetRow {
  /** The sheet's own row number, as the spreadsheet shows it. */
  line: number
  /** The unit and buyer as read, so a row with errors can still be found in the sheet. */
  unit: string
  buyerName: string
  /** `null` when the row has errors. */
  draft: BookingDraft | null
  errors: string[]
  /** Accepted, but something was assumed. */
  warnings: string[]
}

export interface SheetReading {
  /** Row the headers were found on; `null` when no row looks like a header. */
  headerLine: number | null
  /** Matched fields and the header text as the sheet wrote it. */
  columns: Partial<Record<SheetField, string>>
  /** Required columns the sheet does not carry; rows are not read while any is missing. */
  missing: SheetField[]
  /** Sheet-wide assumptions, e.g. a column that is absent so a default applies. */
  notes: string[]
  rows: SheetRow[]
}

export interface ReadSheetOptions {
  /** The desks' today; a booking dated after it cannot exist yet. */
  referenceDate: IsoDate
  defaults: SheetDefaults
  /** Units already held by an open booking, keyed by `unitKey`, mapped to that booking's id. */
  held?: ReadonlyMap<string, string>
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const DAY_MS = 86_400_000
/** Excel's day zero; serial 1 is 1 Jan 1900 (the 1900 leap-year bug is past by 1 Mar 1900). */
const EXCEL_EPOCH = Date.UTC(1899, 11, 30)
const MIN_PRICE_RM = 10_000

/** The key two bookings share when they hold the same unit of the same project. */
export function unitKey(project: string, unit: string): string {
  return `${project.trim().toLowerCase()}|${unit.trim().toUpperCase()}`
}

/** `18 Sep 2026`, the house date format, for messages built here. */
function houseDate(date: IsoDate): string {
  const month = MONTHS[Number(date.slice(5, 7)) - 1]
  return `${Number(date.slice(8, 10))} ${month[0].toUpperCase()}${month.slice(1)} ${date.slice(0, 4)}`
}

/** The spellings a header cell could mean: as written, and with an `rm` prefix or suffix trimmed. */
function headerCandidates(value: string): string[] {
  const flat = value.toLowerCase().replace(/[^a-z0-9]/g, '')
  return flat ? [flat, flat.replace(/^rm/, ''), flat.replace(/rm$/, '')] : []
}

function text(cell: SheetCell): string {
  if (cell == null) return ''
  if (cell instanceof Date) return Number.isNaN(cell.getTime()) ? '' : cell.toISOString().slice(0, 10)
  return String(cell).trim()
}

/** `RM 650,000.00`, `650000` or a numeric cell; `null` when it is not a plain amount. */
export function parseAmount(cell: SheetCell): number | null {
  if (typeof cell === 'number') return Number.isFinite(cell) ? cell : null
  const flat = text(cell)
    .replace(/^rm\s*/i, '')
    .replace(/[,\s]/g, '')
  return /^\d+(\.\d+)?$/.test(flat) ? Number(flat) : null
}

function isoFromParts(year: number, month: number, day: number): IsoDate | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const d = new Date(Date.UTC(year, month - 1, day))
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null
  return d.toISOString().slice(0, 10)
}

/**
 * A booking date as sheets write it: an XLSX date cell, an Excel serial
 * number, `2026-09-02`, day-first `2/9/2026` or `02-09-26` (the Malaysian
 * order), or `2 Sep 2026`. `null` when it cannot be read with certainty.
 */
export function parseSheetDate(cell: SheetCell): IsoDate | null {
  if (cell instanceof Date) return Number.isNaN(cell.getTime()) ? null : cell.toISOString().slice(0, 10)
  if (typeof cell === 'number') {
    if (!Number.isFinite(cell) || cell < 32_874 || cell > 73_051) return null // 1990 to 2099
    return new Date(EXCEL_EPOCH + Math.floor(cell) * DAY_MS).toISOString().slice(0, 10)
  }
  const value = text(cell).toLowerCase()
  const fullYear = (y: string) => (y.length === 2 ? 2000 + Number(y) : Number(y))
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[t\s].*)?$/.exec(value)
  if (m) return isoFromParts(Number(m[1]), Number(m[2]), Number(m[3]))
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})$/.exec(value)
  if (m) return isoFromParts(fullYear(m[3]), Number(m[2]), Number(m[1]))
  m = /^(\d{1,2})[\s/-]*([a-z]{3,9})[\s/,-]*(\d{4}|\d{2})$/.exec(value)
  if (m) {
    const month = MONTHS.indexOf(m[2].slice(0, 3)) + 1
    return month > 0 ? isoFromParts(fullYear(m[3]), month, Number(m[1])) : null
  }
  return null
}

/**
 * A MyKad number in the house `YYMMDD-PB-NNNN` form, with the birth date it
 * encodes; any other identity number (a passport) is kept as written, with no
 * birth date.
 */
export function readIc(raw: string, referenceDate: IsoDate): { ic: string; birthDate: IsoDate | null } {
  const digits = raw.replace(/[\s-]/g, '')
  if (!/^\d{12}$/.test(digits)) return { ic: raw.trim().toUpperCase(), birthDate: null }
  const ic = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
  const yy = Number(digits.slice(0, 2))
  const century = 2000 + yy > Number(referenceDate.slice(0, 4)) ? 1900 : 2000
  return { ic, birthDate: isoFromParts(century + yy, Number(digits.slice(2, 4)), Number(digits.slice(4, 6))) }
}

/** Whole years from `birthDate` to `on`. */
function ageOn(birthDate: IsoDate, on: IsoDate): number {
  let years = Number(on.slice(0, 4)) - Number(birthDate.slice(0, 4))
  if (on.slice(5) < birthDate.slice(5)) years -= 1
  return years
}

/** Finds the header row among the first ten, so a title or a blank line above it is fine. */
function findHeader(cells: SheetCell[][]): { line: number; columns: Map<SheetField, number> } | null {
  for (let r = 0; r < Math.min(10, cells.length); r++) {
    const columns = new Map<SheetField, number>()
    ;(cells[r] ?? []).forEach((cell, c) => {
      const candidates = headerCandidates(text(cell))
      for (const [field, names] of Object.entries(HEADER_NAMES) as [SheetField, string[]][]) {
        if (!columns.has(field) && candidates.some((name) => names.includes(name))) {
          columns.set(field, c)
          return
        }
      }
    })
    if (columns.size >= 3) return { line: r + 1, columns }
  }
  return null
}

/** Reads a booking sheet into rows ready to import, each with its errors and warnings. */
export function readBookingSheet(cells: SheetCell[][], options: ReadSheetOptions): SheetReading {
  const { referenceDate, defaults } = options
  const header = findHeader(cells)
  if (!header) {
    return { headerLine: null, columns: {}, missing: [...REQUIRED_FIELDS], notes: [], rows: [] }
  }
  const headerCells = cells[header.line - 1]
  const columns: Partial<Record<SheetField, string>> = {}
  for (const [field, c] of header.columns) columns[field] = text(headerCells[c])
  const missing = REQUIRED_FIELDS.filter((f) => !header.columns.has(f))
  if (missing.length > 0) return { headerLine: header.line, columns, missing, notes: [], rows: [] }

  const has = (field: SheetField) => header.columns.has(field)
  const notes: string[] = []
  if (!has('monthlyCommitmentsRm')) notes.push('No Monthly Commitments Column, So Commitments Count As RM 0')
  if (!has('propertiesOwned')) notes.push('No Properties Owned Column, So Every Buyer Counts As A First-Time Buyer')
  if (!has('project')) notes.push(`No Project Column, So Every Unit Joins ${defaults.project}`)

  const rows: SheetRow[] = []
  const seen = new Map<string, number>()
  for (let r = header.line; r < cells.length; r++) {
    const row = cells[r] ?? []
    const cell = (field: SheetField): SheetCell => {
      const c = header.columns.get(field)
      return c === undefined ? null : row[c]
    }
    if ([...header.columns.values()].every((c) => text(row[c]) === '')) continue

    const line = r + 1
    const errors: string[] = []
    const warnings: string[] = []

    const unit = text(cell('unit')).toUpperCase()
    if (!unit) errors.push('Unit Missing')
    const name = text(cell('buyerName'))
    if (!name) errors.push('Buyer Name Missing')
    const phone = text(cell('phone'))
    if (!phone) errors.push('Phone Missing')

    const icRaw = text(cell('ic'))
    const { ic, birthDate } = readIc(icRaw, referenceDate)
    if (!icRaw) errors.push('IC Number Missing')

    const price = parseAmount(cell('priceRm'))
    if (price === null) errors.push(text(cell('priceRm')) ? 'Price Is Not An Amount' : 'Price Missing')
    else if (price < MIN_PRICE_RM) errors.push('Price Below RM 10,000, Check The Figure')

    const bookingDate = parseSheetDate(cell('bookingDate'))
    if (bookingDate === null) {
      errors.push(text(cell('bookingDate')) ? 'Booking Date Not Recognised' : 'Booking Date Missing')
    } else if (bookingDate > referenceDate) {
      errors.push(`Booking Date Is After ${houseDate(referenceDate)}, Today On The Desks`)
    }

    const income = parseAmount(cell('grossMonthlyIncomeRm'))
    if (income === null || income <= 0) {
      errors.push(text(cell('grossMonthlyIncomeRm')) ? 'Income Is Not An Amount' : 'Gross Monthly Income Missing')
    }

    let commitments = 0
    if (has('monthlyCommitmentsRm')) {
      const value = parseAmount(cell('monthlyCommitmentsRm'))
      if (value !== null) commitments = value
      else if (text(cell('monthlyCommitmentsRm'))) errors.push('Commitments Are Not An Amount')
      else warnings.push('Commitments Blank, Counted As RM 0')
    }

    let propertiesOwned = 0
    if (has('propertiesOwned')) {
      const value = parseAmount(cell('propertiesOwned'))
      if (value !== null && Number.isInteger(value)) propertiesOwned = value
      else if (text(cell('propertiesOwned'))) errors.push('Properties Owned Is Not A Whole Number')
      else warnings.push('Properties Owned Blank, Counted As None')
    }

    // The IC is the better source; the age column covers passports.
    let age: number | null = birthDate ? ageOn(birthDate, referenceDate) : null
    if (age === null && has('age')) {
      const value = parseAmount(cell('age'))
      if (value !== null && Number.isInteger(value)) age = value
    }
    if (icRaw && age === null) {
      errors.push(has('age') ? 'Age Missing, And The IC Is Not A MyKad Number' : 'Age Not Readable From The IC')
    } else if (age !== null && (age < 18 || age > 100)) errors.push(`Buyer Age ${age} Is Outside 18 To 100`)

    const project = text(cell('project')) || defaults.project
    if (unit) {
      const key = unitKey(project, unit)
      const earlier = seen.get(key)
      if (earlier !== undefined) errors.push(`Unit Also On Row ${earlier}`)
      else seen.set(key, line)
      const holder = options.held?.get(key)
      if (holder) errors.push(`Unit Already Held By ${holder}`)
    }

    if (errors.length > 0 || price === null || bookingDate === null || income === null || age === null) {
      rows.push({ line, unit, buyerName: name, draft: null, errors, warnings })
      continue
    }
    const buyer: Buyer = {
      name,
      ic,
      phone,
      age,
      grossMonthlyIncomeRm: Math.round(income),
      monthlyCommitmentsRm: Math.round(commitments),
      propertiesOwned
    }
    rows.push({
      line,
      unit,
      buyerName: name,
      draft: {
        project,
        unit,
        priceRm: Math.round(price),
        bookingDate,
        buyer,
        salesOwner: text(cell('salesOwner')) || defaults.salesOwner,
        loanOwner: defaults.loanOwner,
        legalFirm: text(cell('legalFirm')) || defaults.legalFirm
      },
      errors,
      warnings
    })
  }
  return { headerLine: header.line, columns, missing, notes, rows }
}

/**
 * Splits CSV text into rows of cells: quoted fields, doubled quotes, CRLF, a
 * leading byte-order mark, and a semicolon or tab delimiter where the header
 * line uses one (as Excel does in some locales).
 */
export function parseCsv(input: string): string[][] {
  const source = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  const firstLine = source.slice(0, source.search(/\r?\n|$/))
  const counts = [',', ';', '\t'].map((d) => [d, firstLine.split(d).length - 1] as const)
  const delimiter = counts.reduce((best, next) => (next[1] > best[1] ? next : best))[0]

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"' && field === '') quoted = true
    else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const isCount = (v: unknown, min: number, max = Number.MAX_SAFE_INTEGER): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max

/**
 * The server's check on a draft that arrived over the wire: the same limits
 * `readBookingSheet` applies, on the finished shape. Returns the problems;
 * empty means the draft is safe to store.
 */
export function checkBookingDraft(value: unknown, referenceDate: IsoDate): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return ['Not A Booking']
  const d = value as Record<string, unknown>
  const b = (d.buyer ?? {}) as Record<string, unknown>
  const problems: string[] = []
  for (const key of ['project', 'unit', 'salesOwner', 'loanOwner', 'legalFirm'] as const) {
    if (!isText(d[key])) problems.push(`${key} is required`)
  }
  for (const key of ['name', 'ic', 'phone'] as const) {
    if (!isText(b[key])) problems.push(`buyer.${key} is required`)
  }
  if (!isCount(d.priceRm, MIN_PRICE_RM, 2_000_000_000)) {
    problems.push(`priceRm must be a whole number of at least ${MIN_PRICE_RM}`)
  }
  if (typeof d.bookingDate !== 'string' || parseSheetDate(d.bookingDate) !== d.bookingDate) {
    problems.push('bookingDate must be a YYYY-MM-DD date')
  } else if (diffDays(d.bookingDate, referenceDate) < 0) problems.push(`bookingDate is after ${referenceDate}`)
  if (!isCount(b.age, 18, 100)) problems.push('buyer.age must be a whole number from 18 to 100')
  if (!isCount(b.grossMonthlyIncomeRm, 1)) problems.push('buyer.grossMonthlyIncomeRm must be a positive whole number')
  if (!isCount(b.monthlyCommitmentsRm, 0)) problems.push('buyer.monthlyCommitmentsRm must be a whole number')
  if (!isCount(b.propertiesOwned, 0, 99)) problems.push('buyer.propertiesOwned must be a whole number')
  return problems
}
