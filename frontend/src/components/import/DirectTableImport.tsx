/**
 * DirectTableImport — Interactive spreadsheet-style table for rapid batch case import.
 *
 * Requirements:
 * - Key in Unit Number (validated against Settings unit range and active held units)
 * - Key in Client / Buyer Name
 * - Multiple layout models supported (Type A, Type B, Type C) with auto price updates
 * - Auto-assigns Sales Agent to current logged-in account (active persona)
 * - Auto-assigns Panel Law Firm from Settings configuration
 * - Default rows is 1
 * - One-click batch import into Mortar via importBookings API
 */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Upload } from 'lucide-react'
import { PERSONA_STAFF, unitKey, type Booking, type BookingDraft, type Persona } from '@mortar/core'
import { importBookings } from '@/lib/api'
import { usePersona } from '@/lib/persona'
import { useProjectSettings, isUnitInRange, getAvailableInventoryUnits, PANEL_LAW_FIRMS } from '@/lib/projectSettings'
import { UnitAutocompleteInput } from '@/components/import/UnitAutocompleteInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusPill } from '@/components/ui/status-pill'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { notify } from '@/components/ui/toastConfig'

export interface CaseEntryRow {
  id: string
  unit: string
  buyerName: string
  modelId: string
  priceRm: number
  lawFirm?: string
}

function createEmptyRow(
  defaultPriceRm: number,
  defaultModelId = 'model-a',
  defaultLawFirm = 'Teh & Partners',
  customId?: string
): CaseEntryRow {
  return {
    id: customId ?? `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    unit: '',
    buyerName: '',
    modelId: defaultModelId,
    priceRm: defaultPriceRm,
    lawFirm: defaultLawFirm
  }
}

/** Generates a pseudo MyKad IC string (e.g. 930814-10-5231) for fast mock buyer import. */
function generateMockIc(seedNum: number): string {
  const y = 85 + (seedNum % 15)
  const m = String(1 + (seedNum % 12)).padStart(2, '0')
  const d = String(1 + (seedNum % 28)).padStart(2, '0')
  const place = '10'
  const serial = String(1000 + ((seedNum * 37) % 8999)).slice(0, 4)
  return `${y}${m}${d}-${place}-${serial}`
}

export function DirectTableImport({
  persona: propPersona,
  referenceDate = '',
  held = new Map(),
  projectName: propProjectName,
  onImported = () => {}
}: {
  persona?: Persona
  referenceDate?: string
  held?: Map<string, string>
  projectName?: string
  onImported?: (result: { importId: string; bookings: Booking[] }) => void
}) {
  const { persona: contextPersona } = usePersona()
  const activePersona = propPersona ?? contextPersona ?? 'sales-admin'
  const { settings } = useProjectSettings(propProjectName)
  const activeProjectName = propProjectName || settings.projectName || 'Bukit Damai'
  const loggedInSalesName = PERSONA_STAFF[activePersona]?.name ?? 'Nurul Aina'

  // Calculate unsold inventory units matching the configured building range
  const availableInventoryUnits = useMemo(() => {
    return getAvailableInventoryUnits({ ...settings, projectName: activeProjectName }, held)
  }, [settings, activeProjectName, held])

  // Default is 1 row initially
  const [rows, setRows] = useState<CaseEntryRow[]>([
    createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm, 'row-1')
  ])
  const [importing, setImporting] = useState(false)

  const handleRowChange = (id: string, field: keyof CaseEntryRow, value: string | number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleModelChange = (id: string, modelId: string) => {
    const selectedModel = settings.models.find((m) => m.id === modelId)
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          modelId,
          priceRm: selectedModel ? selectedModel.priceRm : r.priceRm
        }
      })
    )
  }

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm)
    ])
  }

  const handleAddFiveRows = () => {
    setRows((prev) => [
      ...prev,
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm)
    ])
  }

  const handleRemoveRow = (id: string) => {
    setRows((prev) =>
      prev.length > 1
        ? prev.filter((r) => r.id !== id)
        : [createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm)]
    )
  }

  const handleClearAll = () => {
    setRows([createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm)])
  }

  // Row inspection & validation helper
  const inspectRow = (row: CaseEntryRow) => {
    const trimmedUnit = row.unit.trim().toUpperCase()
    const trimmedName = row.buyerName.trim()

    if (!trimmedUnit && !trimmedName) {
      return { status: 'empty', label: 'Empty', canImport: false }
    }

    if (!trimmedUnit) {
      return { status: 'error', label: 'Enter Unit', canImport: false }
    }

    if (!trimmedName) {
      return { status: 'error', label: 'Enter Client Name', canImport: false }
    }

    // Check if unit is already held in current project
    const key = unitKey(activeProjectName, trimmedUnit)
    const holdingBookingId = held.get(key)
    if (holdingBookingId) {
      return {
        status: 'error',
        label: `Held by ${holdingBookingId}`,
        reason: `Unit ${trimmedUnit} is already booked by ${holdingBookingId}`,
        canImport: false
      }
    }

    // Check unit range from settings
    const rangeCheck = isUnitInRange(trimmedUnit, settings)
    if (!rangeCheck.inRange) {
      return {
        status: 'warning',
        label: 'Out of Range',
        reason: rangeCheck.reason ?? 'Unit outside configured inventory range',
        canImport: true // allow import with advisory warning
      }
    }

    return { status: 'ready', label: 'Ready', canImport: true }
  }

  const inspectedRows = rows.map((r) => ({ row: r, check: inspectRow(r) }))
  const readyRows = inspectedRows.filter((item) => item.check.canImport)

  const handleRunImport = async () => {
    if (readyRows.length === 0) {
      notify.error('No valid rows to import. Enter at least one unit number and client name.')
      return
    }

    setImporting(true)
    try {
      const today = referenceDate || new Date().toISOString().slice(0, 10)

      const drafts: BookingDraft[] = readyRows.map(({ row }, index) => {
        const trimmedUnit = row.unit.trim().toUpperCase()
        const trimmedName = row.buyerName.trim()
        const selectedModel = settings.models.find((m) => m.id === row.modelId)
        const price = row.priceRm > 0 ? row.priceRm : selectedModel?.priceRm || settings.defaultPriceRm
        const lawFirm = row.lawFirm || settings.defaultLawFirm || 'Teh & Partners'

        return {
          project: activeProjectName,
          unit: trimmedUnit,
          priceRm: price,
          bookingDate: today,
          salesOwner: loggedInSalesName,
          loanOwner: PERSONA_STAFF['loan-admin'].name,
          legalFirm: lawFirm,
          buyer: {
            name: trimmedName,
            ic: generateMockIc(index + (Date.now() % 100)),
            phone: `+60 1${2 + (index % 7)}-${300 + ((index * 13) % 600)} ${1000 + ((index * 47) % 8999)}`,
            age: 28 + (index % 30),
            grossMonthlyIncomeRm: 7500 + ((index * 400) % 6000),
            monthlyCommitmentsRm: 1800 + ((index * 200) % 2500),
            propertiesOwned: 0
          }
        }
      })

      const result = await importBookings({
        bookings: drafts,
        reportedBy: loggedInSalesName,
        source: 'Direct Table Entry'
      })

      notify.success(
        `${result.bookings.length} ${result.bookings.length === 1 ? 'case' : 'cases'} successfully imported!`
      )
      onImported(result)
      setRows([createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, settings.defaultLawFirm)])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not import the cases.'
      notify.error(msg)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="border-border shadow-card">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Top Header & Settings Info Bar */}
        <div className="flex flex-col gap-2 border-b border-border pb-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Type Bookings In</h2>
            <p className="text-xs text-muted-foreground">
              Key in unit numbers, client names, and select layout models to batch import cases directly into the
              ledger.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Sales {loggedInSalesName} · Law Firm {settings.defaultLawFirm} · Project {activeProjectName} ·{' '}
            <Link to="/settings" className="underline-offset-4 hover:text-foreground hover:underline">
              Change In Settings
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Demo Buyer Details Such As IC And Income Are Generated For You.</p>

        {/* The Direct Entry Grid */}
        <div className="overflow-x-auto rounded-md border border-border">
          <Table className="min-w-[840px] text-xs">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 px-3 py-2.5 text-center">#</TableHead>
                <TableHead className="w-36 px-3 py-2.5">Unit Number</TableHead>
                <TableHead className="min-w-[170px] px-3 py-2.5">Client / Buyer Name</TableHead>
                <TableHead className="w-48 px-3 py-2.5">Model / Layout</TableHead>
                <TableHead className="w-32 px-3 py-2.5">Sales Owner</TableHead>
                <TableHead className="w-44 px-3 py-2.5">Panel Law Firm</TableHead>
                <TableHead className="w-32 px-3 py-2.5 text-right">Price (RM)</TableHead>
                <TableHead className="w-28 px-3 py-2.5 text-center">Status</TableHead>
                <TableHead className="w-12 px-2 py-2.5 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectedRows.map(({ row, check }, idx) => (
                <TableRow key={row.id} className="hover:bg-accent/40">
                  {/* Row index */}
                  <TableCell className="px-3 py-2 text-center font-mono text-[11px] text-muted-foreground">
                    {idx + 1}
                  </TableCell>

                  {/* Unit number autocomplete dropdown */}
                  <TableCell className="px-3 py-1.5">
                    <UnitAutocompleteInput
                      value={row.unit}
                      onChange={(val) => handleRowChange(row.id, 'unit', val)}
                      availableUnits={availableInventoryUnits}
                      placeholder={settings.blockPrefix ? `${settings.blockPrefix}-12-08` : '12-08'}
                      hasError={check.status === 'error'}
                      isReady={check.status === 'ready'}
                    />
                  </TableCell>

                  {/* Client / Buyer Name input */}
                  <TableCell className="px-3 py-1.5">
                    <Input
                      value={row.buyerName}
                      onChange={(e) => handleRowChange(row.id, 'buyerName', e.target.value)}
                      placeholder="e.g. Nurul Huda Binti Ahmad"
                      className="h-8 text-xs font-medium"
                    />
                  </TableCell>

                  {/* Model / Layout selection */}
                  <TableCell className="px-3 py-1.5">
                    <Select value={row.modelId} onValueChange={(val) => handleModelChange(row.id, val)}>
                      <SelectTrigger aria-label="Model / Layout" className="h-8 w-full text-xs font-medium">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.models.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name} · {m.layout}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Auto-assigned Sales Owner badge */}
                  <TableCell className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <span className="size-1.5 rounded-full bg-status-positive" />
                      <span className="truncate">{loggedInSalesName}</span>
                    </span>
                  </TableCell>

                  {/* Panel Law Firm selector */}
                  <TableCell className="px-3 py-1.5">
                    <Select
                      value={row.lawFirm || settings.defaultLawFirm}
                      onValueChange={(val) => handleRowChange(row.id, 'lawFirm', val)}
                    >
                      <SelectTrigger aria-label="Panel Law Firm" className="h-8 w-full text-xs font-medium">
                        <SelectValue placeholder="Select Law Firm" />
                      </SelectTrigger>
                      <SelectContent>
                        {PANEL_LAW_FIRMS.map((firm) => (
                          <SelectItem key={firm} value={firm} className="text-xs">
                            {firm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Price (RM) editable input */}
                  <TableCell className="px-3 py-1.5">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none">
                        RM
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={row.priceRm ? String(row.priceRm) : ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '')
                          handleRowChange(row.id, 'priceRm', digits ? parseInt(digits, 10) : 0)
                        }}
                        className="h-8 pl-9 text-right font-mono text-xs font-medium"
                      />
                    </div>
                  </TableCell>

                  {/* Validation status pill: pill only for errors */}
                  <TableCell className="px-3 py-2 text-center">
                    {check.status === 'error' ? (
                      check.reason ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0} className="inline-flex">
                                <StatusPill tone="danger">{check.label}</StatusPill>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{check.reason}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <StatusPill tone="danger">{check.label}</StatusPill>
                      )
                    ) : check.status === 'warning' ? (
                      check.reason ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0} className="cursor-default text-[11px] text-muted-foreground">
                                {check.label}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{check.reason}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">{check.label}</span>
                      )
                    ) : check.status === 'ready' ? (
                      <span className="text-[11px] text-muted-foreground">Ready</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Delete row button */}
                  <TableCell className="px-2 py-1.5 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRow(row.id)}
                            aria-label="Remove Row"
                            className="size-7 p-0 text-muted-foreground hover:bg-transparent hover:text-status-danger"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove Row</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Actions & Batch Import Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleAddRow} className="gap-1 text-xs">
              <Plus className="size-3.5" />
              Add Row
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddFiveRows} className="gap-1 text-xs">
              <Plus className="size-3.5" />
              Add 5 Rows
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              <strong>{readyRows.length}</strong> of <strong>{rows.length}</strong> cases ready
            </span>
            <Button
              type="button"
              disabled={readyRows.length === 0 || importing}
              onClick={handleRunImport}
              className="gap-1.5 font-medium"
            >
              <Upload className="size-3.5" />
              {importing
                ? 'Importing Cases…'
                : `Import ${readyRows.length} ${readyRows.length === 1 ? 'Case' : 'Cases'}`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
