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

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  LayoutGrid,
  Plus,
  Scale,
  Settings,
  Trash2,
  Upload,
  UserCheck
} from 'lucide-react'
import { PERSONA_STAFF, unitKey, type Booking, type BookingDraft, type Persona } from '@mortar/core'
import { importBookings } from '@/lib/api'
import { usePersona } from '@/lib/persona'
import { useProjectSettings, isUnitInRange } from '@/lib/projectSettings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { notify } from '@/components/ui/toastConfig'
import { cn } from '@/lib/utils'

export interface CaseEntryRow {
  id: string
  unit: string
  buyerName: string
  modelId: string
  priceRm: number
  lawFirm?: string
}

function createEmptyRow(defaultPriceRm: number, defaultModelId = 'model-a', customId?: string): CaseEntryRow {
  return {
    id: customId ?? `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    unit: '',
    buyerName: '',
    modelId: defaultModelId,
    priceRm: defaultPriceRm
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
  onImported = () => {}
}: {
  persona?: Persona
  referenceDate?: string
  held?: Map<string, string>
  onImported?: (result: { importId: string; bookings: Booking[] }) => void
}) {
  const { persona: contextPersona } = usePersona()
  const activePersona = propPersona ?? contextPersona ?? 'sales-admin'
  const { settings } = useProjectSettings()
  const loggedInSalesName = PERSONA_STAFF[activePersona]?.name ?? 'Nurul Aina'

  // Default is 1 row initially
  const [rows, setRows] = useState<CaseEntryRow[]>([
    createEmptyRow(settings.defaultPriceRm, settings.defaultModelId, 'row-1')
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
    setRows((prev) => [...prev, createEmptyRow(settings.defaultPriceRm, settings.defaultModelId)])
  }

  const handleAddFiveRows = () => {
    setRows((prev) => [
      ...prev,
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId),
      createEmptyRow(settings.defaultPriceRm, settings.defaultModelId)
    ])
  }

  const handleRemoveRow = (id: string) => {
    setRows((prev) =>
      prev.length > 1
        ? prev.filter((r) => r.id !== id)
        : [createEmptyRow(settings.defaultPriceRm, settings.defaultModelId)]
    )
  }

  const handleClearAll = () => {
    setRows([createEmptyRow(settings.defaultPriceRm, settings.defaultModelId)])
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
    const key = unitKey(settings.projectName, trimmedUnit)
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
          project: settings.projectName || 'Bukit Damai',
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
      setRows([createEmptyRow(settings.defaultPriceRm, settings.defaultModelId)])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not import the cases.'
      notify.error(msg)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="border-border shadow-xs">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Top Header & Settings Info Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-3.5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Direct Case Import Ledger</h2>
            <p className="text-xs text-muted-foreground">
              Key in unit numbers, client names, and select layout models to batch import cases directly into the
              ledger.
            </p>
          </div>

          {/* Quick Context Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 font-medium text-foreground border border-border">
              <UserCheck className="size-3.5 text-primary" />
              <span>
                Sales: <strong>{loggedInSalesName}</strong>
              </span>
              <span className="text-[10px] text-primary">(Logged in)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 font-medium text-foreground border border-border">
              <LayoutGrid className="size-3.5 text-primary" />
              <span>
                Models: <strong>{settings.models.length} Layouts</strong>
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 font-medium text-foreground border border-border">
              <Scale className="size-3.5 text-primary" />
              <span>
                Law Firm: <strong>{settings.defaultLawFirm}</strong>
              </span>
            </span>

            <Link
              to="/settings"
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent border border-border transition-colors"
            >
              <Building2 className="size-3" />
              <span>
                Range: {settings.blockPrefix ? `${settings.blockPrefix}-` : ''}Fl {settings.minFloor}–
                {settings.maxFloor}
              </span>
              <Settings className="size-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* The Direct Entry Grid */}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-xs border-collapse min-w-[840px]">
            <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-36">Unit Number</th>
                <th className="py-2.5 px-3 min-w-[170px]">Client / Buyer Name</th>
                <th className="py-2.5 px-3 w-48">Model / Layout</th>
                <th className="py-2.5 px-3 w-32">Sales Owner</th>
                <th className="py-2.5 px-3 w-36">Panel Law Firm</th>
                <th className="py-2.5 px-3 w-28 text-right">Price (RM)</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
                <th className="py-2.5 px-2 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {inspectedRows.map(({ row, check }, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors hover:bg-accent/40',
                    check.status === 'ready' && 'bg-status-positive/5',
                    check.status === 'error' && 'bg-status-danger/5'
                  )}
                >
                  {/* Row index */}
                  <td className="py-2 px-3 text-center text-muted-foreground font-mono text-[11px]">{idx + 1}</td>

                  {/* Unit number input */}
                  <td className="py-1.5 px-3">
                    <Input
                      value={row.unit}
                      onChange={(e) => handleRowChange(row.id, 'unit', e.target.value)}
                      placeholder={settings.blockPrefix ? `${settings.blockPrefix}-12-08` : '12-08'}
                      className={cn(
                        'h-8 text-xs font-mono font-medium',
                        check.status === 'error' && 'border-status-danger text-status-danger-fg',
                        check.status === 'ready' && 'border-status-positive'
                      )}
                    />
                  </td>

                  {/* Client / Buyer Name input */}
                  <td className="py-1.5 px-3">
                    <Input
                      value={row.buyerName}
                      onChange={(e) => handleRowChange(row.id, 'buyerName', e.target.value)}
                      placeholder="e.g. Nurul Huda Binti Ahmad"
                      className="h-8 text-xs font-medium"
                    />
                  </td>

                  {/* Model / Layout selection */}
                  <td className="py-1.5 px-3">
                    <select
                      value={row.modelId}
                      onChange={(e) => handleModelChange(row.id, e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {settings.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} · {m.layout}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Auto-assigned Sales Owner badge */}
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
                      <span className="size-1.5 rounded-full bg-status-positive" />
                      <span className="truncate">{loggedInSalesName}</span>
                    </span>
                  </td>

                  {/* Auto-assigned Panel Law Firm */}
                  <td className="py-2 px-3">
                    <span className="text-xs text-muted-foreground truncate block max-w-[140px]">
                      {row.lawFirm || settings.defaultLawFirm}
                    </span>
                  </td>

                  {/* Price (RM) editable input */}
                  <td className="py-1.5 px-3">
                    <Input
                      type="number"
                      step={5000}
                      value={row.priceRm}
                      onChange={(e) => handleRowChange(row.id, 'priceRm', parseInt(e.target.value, 10) || 0)}
                      className="h-8 text-xs font-mono text-right font-medium"
                    />
                  </td>

                  {/* Validation status pill */}
                  <td className="py-2 px-3 text-center">
                    {check.status === 'ready' ? (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-status-positive-bg px-2 py-0.5 text-[10px] font-semibold text-status-positive-fg border border-status-positive/25">
                        <CheckCircle2 className="size-2.5" />
                        Ready
                      </span>
                    ) : check.status === 'warning' ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-sm bg-status-warning-bg px-2 py-0.5 text-[10px] font-semibold text-status-warning-fg border border-status-warning/25"
                        title={check.reason}
                      >
                        <AlertTriangle className="size-2.5" />
                        {check.label}
                      </span>
                    ) : check.status === 'error' ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-sm bg-status-danger-bg px-2 py-0.5 text-[10px] font-semibold text-status-danger-fg border border-status-danger/25"
                        title={check.reason}
                      >
                        <AlertTriangle className="size-2.5" />
                        {check.label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Delete row button */}
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      title="Remove Row"
                      className="rounded p-1 text-muted-foreground hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
