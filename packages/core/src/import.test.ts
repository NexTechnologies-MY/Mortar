import { describe, expect, it } from 'vitest'
import {
  checkBookingDraft,
  detectDateOrder,
  parseAmount,
  parseCsv,
  parseSheetDate,
  readBookingSheet,
  readIc,
  unitKey,
  type SheetCell
} from './import'

const DEFAULTS = {
  project: 'Residensi Cahaya Muda',
  salesOwner: 'Unassigned',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Unassigned'
}
const OPTIONS = { referenceDate: '2026-09-18', defaults: DEFAULTS }

const HEADER = ['Unit No', 'Purchaser Name', 'NRIC', 'HP No', 'SPA Price (RM)', 'Booking Date', 'Monthly Income']

describe('parseCsv', () => {
  it('handles quotes, doubled quotes, CRLF and a byte-order mark', () => {
    expect(parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"']
    ])
  })

  it('picks the semicolon delimiter when the header uses it', () => {
    expect(parseCsv('Unit;Price\nA-1;"650,000"')).toEqual([
      ['Unit', 'Price'],
      ['A-1', '650,000']
    ])
  })
})

describe('cell readers', () => {
  it('reads amounts with an RM prefix and separators', () => {
    expect(parseAmount('RM 650,000.00')).toBe(650000)
    expect(parseAmount(612800)).toBe(612800)
    expect(parseAmount('about 600k')).toBeNull()
  })

  it('reads dates day-first, ISO, by month name, and as Excel serials', () => {
    expect(parseSheetDate('2/9/2026')).toBe('2026-09-02')
    expect(parseSheetDate('02-09-26')).toBe('2026-09-02')
    expect(parseSheetDate('2026-09-02')).toBe('2026-09-02')
    expect(parseSheetDate('2 Sep 2026')).toBe('2026-09-02')
    expect(parseSheetDate('02-Sept-2026')).toBe('2026-09-02')
    expect(parseSheetDate(46267)).toBe('2026-09-02')
    expect(parseSheetDate(new Date(Date.UTC(2026, 8, 2)))).toBe('2026-09-02')
    expect(parseSheetDate('31/2/2026')).toBeNull()
    expect(parseSheetDate('next week')).toBeNull()
  })

  it('formats a MyKad number and reads the birth date it encodes', () => {
    expect(readIc('900514 07 5123', '2026-09-18')).toEqual({ ic: '900514-07-5123', birthDate: '1990-05-14' })
    expect(readIc('050101-10-0001', '2026-09-18').birthDate).toBe('2005-01-01')
    expect(readIc('a1234567', '2026-09-18')).toEqual({ ic: 'A1234567', birthDate: null })
  })

  // Issue #M13: Excel stores a MyKad column as a number, which drops the
  // leading zero a birth year in the 2000s carries.
  it('pads an 11-digit numeric IC cell back to a MyKad, but leaves 11-digit text alone', () => {
    expect(readIc(50101145678, '2026-09-18')).toEqual({ ic: '050101-14-5678', birthDate: '2005-01-01' })
    // A text cell that happens to carry 11 digits was written that way on
    // purpose (e.g. a foreign passport), so it is kept as written, not guessed at.
    expect(readIc('50101145678', '2026-09-18')).toEqual({ ic: '50101145678', birthDate: null })
  })
})

describe('readBookingSheet', () => {
  it('finds the header under a title row and reads a clean row into a draft', () => {
    const cells: SheetCell[][] = [
      ['Residensi Cahaya Muda — Bookings September'],
      [],
      HEADER,
      ['a-12-03', 'Nur Aisyah Binti Kamal', '900514-00-0001', '+60 00-000 0001', 'RM 612,800', '2/9/2026', '8,500']
    ]
    const reading = readBookingSheet(cells, OPTIONS)
    expect(reading.headerLine).toBe(3)
    expect(reading.missing).toEqual([])
    expect(reading.columns.priceRm).toBe('SPA Price (RM)')
    // Commitments, properties and project columns absent, plus one lone date
    // (2/9/2026) that cannot prove its own order.
    expect(reading.notes).toHaveLength(4)
    expect(reading.rows).toHaveLength(1)
    expect(reading.rows[0]).toMatchObject({ line: 4, unit: 'A-12-03', buyerName: 'Nur Aisyah Binti Kamal', errors: [] })
    expect(reading.rows[0].draft).toEqual({
      project: 'Residensi Cahaya Muda',
      unit: 'A-12-03',
      priceRm: 612800,
      bookingDate: '2026-09-02',
      buyer: {
        name: 'Nur Aisyah Binti Kamal',
        ic: '900514-00-0001',
        phone: '+60 00-000 0001',
        age: 36,
        grossMonthlyIncomeRm: 8500,
        monthlyCommitmentsRm: 0,
        propertiesOwned: 0
      },
      salesOwner: 'Unassigned',
      loanOwner: 'Tan Mei Ling',
      legalFirm: 'Unassigned'
    })
  })

  it('reports the required columns a sheet is missing and reads no rows', () => {
    const reading = readBookingSheet(
      [
        ['Unit', 'Buyer', 'Price'],
        ['A-1', 'X', '600000']
      ],
      OPTIONS
    )
    expect(reading.missing).toEqual(['ic', 'phone', 'bookingDate', 'grossMonthlyIncomeRm'])
    expect(reading.rows).toEqual([])
  })

  it('returns no header when nothing looks like one', () => {
    expect(readBookingSheet([['hello', 'world']], OPTIONS).headerLine).toBeNull()
  })

  it('keeps the solicitor column intact rather than trimming its trailing rm', () => {
    const reading = readBookingSheet([[...HEADER, 'Law Firm']], OPTIONS)
    expect(reading.columns.legalFirm).toBe('Law Firm')
  })

  it('flags each problem on a row without guessing a value', () => {
    const reading = readBookingSheet(
      [
        HEADER,
        ['A-1', '', '900514-00-0001', '012', 'six hundred', '2/9/2026', '5000'],
        ['A-2', 'Lee', '900514-00-0002', '012', '600000', '20/9/2026', ''],
        ['A-3', 'Tan', 'P1234567', '012', '600000', '1/9/2026', '5000'],
        ['', '', '', '', '', '', '']
      ],
      OPTIONS
    )
    expect(reading.rows.map((r) => r.errors)).toEqual([
      ['Buyer Name Missing', 'Price Is Not An Amount'],
      ['Booking Date Is After 18 Sep 2026, Today On The Desks', 'Gross Monthly Income Missing'],
      ['Age Not Readable From The IC']
    ])
    expect(reading.rows.every((r) => r.draft === null)).toBe(true)
  })

  it('catches a unit twice in the sheet and a unit an open booking already holds', () => {
    const row = (unit: string) => [unit, 'Lee', '900514-00-0002', '012', '600000', '1/9/2026', '5000']
    const held = new Map([[unitKey('Residensi Cahaya Muda', 'B-7-01'), 'BK-0042']])
    const reading = readBookingSheet([HEADER, row('A-1'), row('a-1'), row('B-7-01')], { ...OPTIONS, held })
    expect(reading.rows.map((r) => r.errors)).toEqual([[], ['Unit Also On Row 2'], ['Unit Already Held By BK-0042']])
  })

  it('takes optional columns when present and warns on the blanks it assumed', () => {
    const header = [...HEADER, 'Commitments', 'Properties Owned', 'Project', 'Sales Agent', 'Solicitor']
    const reading = readBookingSheet(
      [
        header,
        [
          'A-1',
          'Lee',
          '900514-00-0002',
          '012',
          '600000',
          '15/9/2026',
          '5000',
          '',
          '2',
          'Aster Heights',
          'Nurul',
          'Khor & Co'
        ]
      ],
      OPTIONS
    )
    expect(reading.notes).toEqual([])
    expect(reading.rows[0].warnings).toEqual(['Commitments Blank, Counted As RM 0'])
    expect(reading.rows[0].draft).toMatchObject({
      project: 'Aster Heights',
      salesOwner: 'Nurul',
      legalFirm: 'Khor & Co',
      buyer: { propertiesOwned: 2, monthlyCommitmentsRm: 0 }
    })
  })

  // Issue #M13: the XLSX reader hands a number-formatted IC column back as a
  // JS number, which has already dropped the leading zero by the time it
  // reaches the sheet — the row must still read as the right MyKad.
  it('reads a numeric IC cell missing its leading zero as the MyKad it is', () => {
    const reading = readBookingSheet(
      [HEADER, ['A-1', 'Lee', 50101145678, '012', '600000', '1/9/2026', '5000']],
      OPTIONS
    )
    expect(reading.rows[0].errors).toEqual([])
    expect(reading.rows[0].draft?.buyer).toMatchObject({ ic: '050101-14-5678', age: 21 })
  })

  it('produces drafts the server check accepts', () => {
    const reading = readBookingSheet(
      [HEADER, ['A-1', 'Lee', '900514-00-0002', '012', '600000', '1/9/2026', '5000']],
      OPTIONS
    )
    expect(checkBookingDraft(reading.rows[0].draft, OPTIONS.referenceDate)).toEqual([])
  })

  // Issue #4: number cells can carry values the server refuses; the preview must say so.
  it('marks values the server would refuse as To Fix, never Ready', () => {
    const header = [...HEADER, 'Commitments', 'Properties Owned']
    const base = ['900514-00-0002', '012', 600000, '1/9/2026', 5000]
    const reading = readBookingSheet(
      [
        header,
        ['A-1', 'Lee', ...base, -500, 0],
        ['A-2', 'Tan', ...base, 0, -1],
        ['A-3', 'Ong', ...base, 0, 150],
        ['A-4', 'Lim', '900514-00-0002', '012', 3_000_000_000, '1/9/2026', 5000, 0, 0],
        ['A-5', 'Goh', '900514-00-0002', '012', 600000, '1/9/2026', 0.4, 0, 0]
      ],
      OPTIONS
    )
    expect(reading.rows.map((r) => r.errors)).toEqual([
      ['Commitments Cannot Be Negative'],
      ['Properties Owned Must Be 0 To 99'],
      ['Properties Owned Must Be 0 To 99'],
      ['Price Above RM 2,000,000,000, Check The Figure'],
      ['Gross Monthly Income Must Be Above RM 0']
    ])
    expect(reading.rows.every((r) => r.draft === null)).toBe(true)
  })

  // Issue #7: the column, not a single cell, decides the date order.
  it('reads a month-first date column month first, and says so', () => {
    const row = (unit: string, date: string) => [unit, 'Lee', '900514-00-0002', '012', '600000', date, '5000']
    const reading = readBookingSheet([HEADER, row('A-1', '9/2/2026'), row('A-2', '9/15/2026')], OPTIONS)
    expect(reading.rows.map((r) => r.draft?.bookingDate)).toEqual(['2026-09-02', '2026-09-15'])
    expect(reading.notes).toContain(
      'Booking Dates Are Written Month First (As In 9/15/2026), So They Were Read That Way'
    )
  })

  it('keeps day first when the column proves it, and flags a mixed column', () => {
    const row = (unit: string, date: string) => [unit, 'Lee', '900514-00-0002', '012', '600000', date, '5000']
    const dayFirst = readBookingSheet([HEADER, row('A-1', '9/2/2026'), row('A-2', '15/9/2026')], OPTIONS)
    expect(dayFirst.rows.map((r) => r.draft?.bookingDate)).toEqual(['2026-02-09', '2026-09-15'])
    expect(dayFirst.notes.some((n) => n.startsWith('Booking Dates'))).toBe(false)

    const mixed = readBookingSheet([HEADER, row('A-1', '15/9/2026'), row('A-2', '9/15/2026')], OPTIONS)
    expect(mixed.rows.map((r) => r.errors)).toEqual([[], ['Booking Date Not Recognised']])
    expect(mixed.notes.some((n) => n.startsWith('Booking Dates Mix'))).toBe(true)
  })
})

describe('detectDateOrder', () => {
  it('ignores XLSX date cells, serials and ISO text, which carry their own order', () => {
    expect(detectDateOrder([new Date(), 46267, '2026-09-02', null])).toEqual({
      order: 'day-first',
      evidence: 'no-numeric-dates'
    })
  })
})

describe('checkBookingDraft', () => {
  it('rejects a malformed draft with a reason per field', () => {
    const problems = checkBookingDraft(
      { project: 'P', unit: '', priceRm: 5, bookingDate: '2026-12-01', buyer: { name: 'X', age: 12 } },
      '2026-09-18'
    )
    expect(problems).toContain('unit is required')
    expect(problems).toContain('priceRm must be a whole number from 10000 to 2000000000')
    expect(problems).toContain('bookingDate is after 2026-09-18')
    expect(problems).toContain('buyer.age must be a whole number from 18 to 100')
    expect(checkBookingDraft(null, '2026-09-18')).toEqual(['Not A Booking'])
  })
})
