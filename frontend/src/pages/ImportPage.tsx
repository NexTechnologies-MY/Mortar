/**
 * Import route — bringing existing bookings into Mortar from a spreadsheet.
 * The sheet is read in the browser (`readSheetFile`, then `readBookingSheet`
 * from `@mortar/core`), every row is shown with what is wrong with it, and
 * only the ready rows are sent, as one batch, to `POST /api/bookings/import`.
 * Units an open booking already holds are caught here and again on the server.
 * The confirmation (`ImportedCard`) can undo the batch.
 */

import { useMemo, useRef, useState } from 'react'
import { Download, TriangleAlert } from 'lucide-react'
import {
  PERSONA_STAFF,
  readBookingSheet,
  unitKey,
  type Booking,
  type SheetCell,
  type SheetDefaults
} from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { importBookings } from '@/lib/api'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { DropZone } from '@/components/import/DropZone'
import { ImportedCard } from '@/components/import/ImportedCard'
import { SheetReview } from '@/components/import/SheetReview'
import { SheetReadError, readSheetFile } from '@/components/import/readSheetFile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'
import { notify } from '@/components/ui/toastConfig'

/** The project most bookings belong to: where a sheet without a Project column lands. */
function mainProject(bookings: Booking[]): string {
  const counts = new Map<string, number>()
  for (const b of bookings) counts.set(b.project, (counts.get(b.project) ?? 0) + 1)
  let best = 'Unnamed Project'
  let most = 0
  for (const [project, n] of counts) {
    if (n > most) {
      best = project
      most = n
    }
  }
  return best
}

export function ImportPage() {
  const { snapshot, error: loadError, refresh } = useSnapshot()
  const cases = useCases()
  const { persona } = usePersona()

  const [file, setFile] = useState<File | null>(null)
  const [cells, setCells] = useState<SheetCell[][] | null>(null)
  const [reading, setReading] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<{ importId: string; bookings: Booking[] } | null>(null)
  /** Bumped to remount the drop zone empty once a sheet has been imported. */
  const [zoneKey, setZoneKey] = useState(0)
  /** Ignores a slow read that finishes after a newer file replaced it. */
  const readToken = useRef(0)

  const onFile = async (next: File | null) => {
    const token = (readToken.current += 1)
    setFile(next)
    setCells(null)
    setReadError(null)
    setImported(null)
    if (!next) return
    setReading(true)
    try {
      const read = await readSheetFile(next)
      if (token === readToken.current) setCells(read)
    } catch (e) {
      if (token === readToken.current) {
        setReadError(e instanceof SheetReadError ? e.message : 'This file could not be read. Try saving it again.')
      }
    } finally {
      if (token === readToken.current) setReading(false)
    }
  }

  const defaults = useMemo<SheetDefaults | null>(
    () =>
      snapshot
        ? {
            project: mainProject(snapshot.bookings),
            salesOwner: 'Unassigned',
            loanOwner: PERSONA_STAFF['loan-admin'].name,
            legalFirm: 'Unassigned'
          }
        : null,
    [snapshot]
  )

  // A unit is free again once its booking was cancelled or lapsed.
  const held = useMemo(() => {
    if (!snapshot) return new Map<string, string>()
    const closed = new Set(cases.filter((c) => c.stage === 'cancelled' || c.stage === 'lapsed').map((c) => c.bookingId))
    return new Map(snapshot.bookings.filter((b) => !closed.has(b.id)).map((b) => [unitKey(b.project, b.unit), b.id]))
  }, [snapshot, cases])

  const sheet = useMemo(
    () =>
      cells && snapshot && defaults
        ? readBookingSheet(cells, { referenceDate: snapshot.meta.referenceDate, defaults, held })
        : null,
    [cells, snapshot, defaults, held]
  )

  const ready = useMemo(() => (sheet ? sheet.rows.flatMap((r) => (r.draft ? [r.draft] : [])) : []), [sheet])
  const toFix = sheet ? sheet.rows.length - ready.length : 0

  const runImport = async () => {
    if (ready.length === 0) return
    setImporting(true)
    try {
      const result = await importBookings({
        bookings: ready,
        reportedBy: PERSONA_STAFF[persona].name,
        source: file?.name
      })
      readToken.current += 1
      setImported(result)
      setFile(null)
      setCells(null)
      setZoneKey((k) => k + 1)
      notify.success(
        `${result.bookings.length.toLocaleString()} ${result.bookings.length === 1 ? 'booking' : 'bookings'} imported.`
      )
      await refresh()
    } catch (e) {
      notify.error(
        e instanceof Error
          ? `Could not import the bookings: ${e.message}.`
          : 'Could not import the bookings. Try again.'
      )
    } finally {
      setImporting(false)
    }
  }

  const detail = reading
    ? 'Reading The Sheet…'
    : sheet && sheet.missing.length === 0
      ? `${sheet.rows.length.toLocaleString()} ${sheet.rows.length === 1 ? 'Row' : 'Rows'} Read`
      : undefined
  const badge =
    sheet && sheet.rows.length > 0 ? (
      toFix > 0 ? (
        <StatusPill tone="warning">{toFix.toLocaleString()} To Review</StatusPill>
      ) : (
        <StatusPill tone="positive">All Ready</StatusPill>
      )
    ) : null

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">Load Existing Bookings Into Mortar From A Spreadsheet.</p>
      </PageHeaderCard>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Booking Sheet
            </h2>
            <DropZone key={zoneKey} onFile={(next) => void onFile(next)} detail={detail} badge={badge} />
            {readError ? <p className="text-[13px] text-status-danger-fg">{readError}</p> : null}
            {cells && !snapshot && loadError ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[13px] text-status-danger-fg">
                  Could Not Load The Current Bookings, So The Sheet Cannot Be Checked Yet.
                </p>
                <Button variant="secondary" size="sm" onClick={() => void refresh()}>
                  Try Again
                </Button>
              </div>
            ) : null}
            <p className="text-[13px] text-muted-foreground">
              The Sheet Is Read In Your Browser. Only The Rows You Import Are Sent To Mortar.
            </p>
            <p className="flex items-start gap-1.5 text-[13px] text-status-warning-fg">
              <TriangleAlert aria-hidden="true" className="mt-px size-4 shrink-0" />
              This Demo Is Public And Has No Sign-In. Import Made-Up Buyers Only, Never Real Names, IC Numbers Or
              Incomes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              What The Sheet Needs
            </h2>
            <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
              <li>One Row Per Unit Booking, Under A Row Of Column Names.</li>
              <li>Unit, Buyer Name, IC Number, Phone, Price, Booking Date And Gross Monthly Income.</li>
              <li>Optional: Monthly Commitments, Properties Owned, Project, Sales Agent And Solicitor.</li>
              <li>
                Dates Read Day First, As In 2/9/2026, Unless The Column Shows Month First. The Buyer&apos;s Age Comes
                From The IC.
              </li>
            </ul>
            <div>
              <Button variant="secondary" size="sm" asChild>
                <a href="/booking-sheet-template.csv" download>
                  <Download aria-hidden="true" />
                  Download A Template
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {imported ? (
        <ImportedCard
          importId={imported.importId}
          bookings={imported.bookings}
          onUndone={async () => {
            setImported(null)
            await refresh()
          }}
        />
      ) : null}

      {sheet ? (
        <div className="mt-4">
          <SheetReview sheet={sheet} importing={importing} onImport={() => void runImport()} />
        </div>
      ) : null}
    </PageContainer>
  )
}
