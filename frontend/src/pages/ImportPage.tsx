/**
 * Import route — bringing existing bookings into Mortar from a spreadsheet.
 * The sheet is read in the browser (`readSheetFile`, then `readBookingSheet`
 * from `@mortar/core`), every row is shown with what is wrong with it, and
 * only the ready rows are sent, as one batch, to `POST /api/bookings/import`.
 * Units an open booking already holds are caught here and again on the server.
 * The confirmation (`ImportedCard`) can undo the batch.
 */

import { useMemo, useRef, useState } from 'react'
import { Download } from 'lucide-react'
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
import { ApiError, importBookings } from '@/lib/api'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { DirectTableImport } from '@/components/import/DirectTableImport'
import { DropZone } from '@/components/import/DropZone'
import { ImportedCard } from '@/components/import/ImportedCard'
import { SheetReview } from '@/components/import/SheetReview'
import { SheetReadError, readSheetFile } from '@/components/import/readSheetFile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { notify } from '@/components/ui/toastConfig'

/** The project most bookings belong to: where a sheet without a Project column lands. */
export function mainProject(bookings: Booking[]): string {
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
      // The server's own words for a refusal it wants read (4xx); a plain sentence
      // for anything else, never a raw status or technical wording (DESIGN.md).
      notify.error(
        e instanceof ApiError
          ? `Could not import the bookings: ${e.message}`
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
      <PageHeaderCard tourTarget="import-header">
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Add Bookings</h1>
        <InfoTooltip text="Upload A Spreadsheet, Or Enter Bookings One At A Time." />
      </PageHeaderCard>

      <Tabs defaultValue="upload" className="mt-4">
        <TabsList>
          <TabsTrigger value="upload">Upload A Sheet</TabsTrigger>
          <TabsTrigger value="type">Type Them In</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
            <Card>
              <CardContent className="flex flex-col gap-3 p-4">
                <h2 className="flex items-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Booking Sheet{' '}
                  <InfoTooltip text="The Sheet Is Read In Your Browser. Only The Rows You Import Are Sent To Mortar." />
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
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 p-4">
                <h2 className="flex items-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  What The Sheet Needs{' '}
                  <InfoTooltip text="Dates Read Day First, Unless The Column Shows Month First. The Buyer’s Age Comes From The IC." />
                </h2>
                <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
                  <li>One Row Per Unit Booking, Under A Row Of Column Names.</li>
                  <li>Unit, Buyer Name, IC Number, Phone, Price, Booking Date And Gross Monthly Income.</li>
                  <li>Optional: Monthly Commitments, Properties Owned, Project, Sales Agent And Solicitor.</li>
                </ul>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Button variant="secondary" size="sm" asChild>
                    <a href="/booking-sheet-template.xlsx" download>
                      <Download aria-hidden="true" />
                      Download The Excel Template
                    </a>
                  </Button>
                  <a
                    href="/booking-sheet-template.csv"
                    download
                    className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Or The CSV Version
                  </a>
                </div>
                <InfoTooltip text="The Excel Template Opens In Excel And Google Sheets. Its Second Sheet Explains Every Column." />
              </CardContent>
            </Card>
          </div>

          {sheet ? (
            <div className="mt-4">
              <SheetReview sheet={sheet} importing={importing} onImport={() => void runImport()} />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="type" className="mt-4">
          <DirectTableImport
            persona={persona}
            referenceDate={snapshot?.meta.referenceDate ?? ''}
            held={held}
            projectName={snapshot ? mainProject(snapshot.bookings) : undefined}
            onImported={(res) => {
              setImported(res)
              void refresh()
            }}
          />
        </TabsContent>
      </Tabs>

      {imported ? (
        <div className="mt-4">
          <ImportedCard
            importId={imported.importId}
            bookings={imported.bookings}
            onUndone={async () => {
              setImported(null)
              await refresh()
            }}
          />
        </div>
      ) : null}
    </PageContainer>
  )
}
