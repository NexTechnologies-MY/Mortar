/**
 * Writes `public/booking-sheet-template.xlsx`, the workbook `/import` offers
 * as its template: `bun run template:bookings` from `frontend/`.
 *
 * Sheet one is the one the importer reads. A title and one line of
 * instructions sit above the header row; the importer looks for the header
 * among the first ten rows, so they never reach it. Headers use names the
 * importer already matches (`packages/core/src/import.ts` HEADER_NAMES): a
 * trailing `*` or `(RM)` is ignored when matching. Required headers carry the
 * `*` and a shaded fill, so the mark never rests on colour alone.
 *
 * Sheet two, How To Fill, explains every column with an example. The sample
 * buyers are made up, with IC and phone numbers that cannot be real.
 */
import { fileURLToPath } from 'node:url'
import writeXlsxFile from 'write-excel-file/node'

const OUT = fileURLToPath(new URL('../public/booking-sheet-template.xlsx', import.meta.url))

const INK = '#0A0A0A'
const MUTED = '#6B6B6B'
const REQUIRED_FILL = '#FFF1C2'
const OPTIONAL_FILL = '#EDEDED'
const RULE = '#BDBDBD'

const COLUMNS = [
  {
    header: 'Unit No',
    required: true,
    width: 12,
    what: "The unit's number, as your project writes it.",
    example: 'D-05-01'
  },
  {
    header: 'Buyer Name',
    required: true,
    width: 28,
    what: "The buyer's full name, as on their IC.",
    example: 'Siti Hajar Binti Omar'
  },
  {
    header: 'IC No',
    required: true,
    width: 18,
    what: "The buyer's MyKad number: 12 digits, with or without dashes.",
    example: '920311-00-0001'
  },
  {
    header: 'Phone No',
    required: true,
    width: 18,
    what: 'A number the desk can reach the buyer on.',
    example: '+60 00-000 0101'
  },
  {
    header: 'SPA Price (RM)',
    required: true,
    width: 17,
    what: "The unit's price in ringgit. Numbers only.",
    example: '548,000'
  },
  {
    header: 'Booking Date',
    required: true,
    width: 16,
    what: 'The day the booking was made, day first (DD/MM/YYYY).',
    example: '01/09/2026'
  },
  {
    header: 'Gross Monthly Income (RM)',
    required: true,
    width: 28,
    what: "The buyer's monthly income before deductions.",
    example: '7,200'
  },
  {
    header: 'Monthly Commitments (RM)',
    required: false,
    width: 27,
    what: 'Existing monthly repayments: car, housing, PTPTN, cards. Blank counts as RM 0.',
    example: '650'
  },
  {
    header: 'Properties Owned',
    required: false,
    width: 18,
    what: 'How many properties the buyer already owns. Blank counts as 0 (a first-time buyer).',
    example: '0'
  },
  {
    header: 'Sales Agent',
    required: false,
    width: 20,
    what: 'The salesperson who took the booking. Blank shows as Unassigned.',
    example: 'Farah Izzati'
  },
  {
    header: 'Solicitor',
    required: false,
    width: 26,
    what: 'The law firm handling the SPA. Blank shows as Unassigned.',
    example: 'Wong Rahman Chambers'
  }
]

const date = (y, m, d) => ({ value: new Date(Date.UTC(y, m - 1, d)), type: Date, format: 'dd/mm/yyyy' })
const rm = (value) => ({ value, type: Number, format: '#,##0' })
const count = (value) => ({ value, type: Number, format: '0' })

const SAMPLES = [
  [
    'D-05-01',
    'Siti Hajar Binti Omar',
    '920311-00-0001',
    '+60 00-000 0101',
    rm(548000),
    date(2026, 9, 1),
    rm(7200),
    rm(650),
    count(0),
    'Farah Izzati',
    'Wong Rahman Chambers'
  ],
  [
    'D-09-04',
    'Lim Jia Hui',
    '880726-00-0002',
    '+60 00-000 0102',
    rm(612800),
    date(2026, 9, 8),
    rm(9800),
    rm(1450),
    count(1),
    'Kelvin Chow',
    'Kuan & Teh Advocates'
  ],
  [
    'D-14-02',
    'Arjun Pillai',
    '950102-00-0003',
    '+60 00-000 0103',
    rm(575500),
    date(2026, 9, 15),
    rm(6400),
    rm(300),
    count(0),
    'Dinesh Rao',
    'Devan & Partners'
  ]
]

/** A cell merged across `span` columns; the library wants the covered cells present as nulls. */
const merged = (cell, span) => [{ ...cell, columnSpan: span }, ...Array(span - 1).fill(null)]

const bookings = [
  merged({ value: 'Mortar Booking Sheet', fontWeight: 'bold', fontSize: 16, textColor: INK }, COLUMNS.length),
  merged(
    {
      value:
        'One row per booking. Columns marked * (shaded yellow) are required. Replace the three sample rows with your bookings, keep this header row, then drop the file on the Import page.',
      textColor: MUTED
    },
    COLUMNS.length
  ),
  [],
  COLUMNS.map((c) => ({
    value: c.required ? `${c.header} *` : c.header,
    fontWeight: 'bold',
    textColor: INK,
    backgroundColor: c.required ? REQUIRED_FILL : OPTIONAL_FILL,
    bottomBorderStyle: 'medium',
    bottomBorderColor: INK,
    wrap: true,
    alignVertical: 'center',
    height: 30
  })),
  ...SAMPLES.map((row) =>
    row.map((cell) => ({
      ...(typeof cell === 'object' ? cell : { value: cell, type: String }),
      bottomBorderStyle: 'thin',
      bottomBorderColor: RULE
    }))
  )
]

const header = (value) => ({
  value,
  fontWeight: 'bold',
  textColor: INK,
  backgroundColor: OPTIONAL_FILL,
  bottomBorderStyle: 'medium',
  bottomBorderColor: INK
})
const howTo = [
  merged({ value: 'How To Fill The Booking Sheet', fontWeight: 'bold', fontSize: 16, textColor: INK }, 4),
  merged(
    {
      value:
        'Mortar finds each column by its header, so the columns can be in any order and extra columns are ignored. Only the first sheet is read.',
      textColor: MUTED
    },
    4
  ),
  [],
  [header('Column'), header('Required'), header('What To Enter'), header('Example')],
  ...COLUMNS.map((c) => [
    { value: c.header, fontWeight: 'bold' },
    { value: c.required ? 'Required' : 'Optional', backgroundColor: c.required ? REQUIRED_FILL : undefined },
    { value: c.what, wrap: true },
    { value: c.example }
  ]),
  [],
  merged(
    {
      value: 'The public demo has no sign-in: use made-up buyers only, never real names, IC numbers or incomes.',
      fontWeight: 'bold',
      textColor: INK
    },
    4
  )
]

await writeXlsxFile(
  [
    {
      sheet: 'Bookings',
      data: bookings,
      columns: COLUMNS.map((c) => ({ width: c.width })),
      stickyRowsCount: 4
    },
    {
      sheet: 'How To Fill',
      data: howTo,
      columns: [{ width: 28 }, { width: 12 }, { width: 70 }, { width: 24 }],
      stickyRowsCount: 4
    }
  ],
  { fontFamily: 'Calibri', fontSize: 11 }
).toFile(OUT)
console.log(`wrote ${OUT}`)
