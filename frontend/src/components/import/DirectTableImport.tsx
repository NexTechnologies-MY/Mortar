import { useState } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { DEMO_PROFILES, PERSONA_STAFF, unitKey, type Booking, type BookingDraft, type Persona } from '@mortar/core'
import { importBookings } from '@/lib/api'
import { usePersona } from '@/lib/persona'
import { useProjectSettings, isUnitInRange, getAvailableInventoryUnits, PANEL_LAW_FIRMS } from '@/lib/projectSettings'
import { UnitAutocompleteInput } from '@/components/import/UnitAutocompleteInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusPill } from '@/components/ui/status-pill'
import { notify } from '@/components/ui/toastConfig'

type Entry = {
  id: string
  unit: string
  buyerName: string
  modelId: string
  priceRm: number
  lawFirm: string
  salesOwner: string
}
const rowId = () => `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const salesProfiles = DEMO_PROFILES.filter((profile) => profile.persona === 'sales-admin')
const newEntry = (
  settings: ReturnType<typeof useProjectSettings>['settings'],
  salesOwner: string,
  id = rowId()
): Entry => ({
  id,
  unit: '',
  buyerName: '',
  modelId: settings.defaultModelId,
  priceRm: settings.defaultPriceRm,
  lawFirm: settings.defaultLawFirm,
  salesOwner
})

function fakeBuyer(index: number) {
  return {
    name: '',
    ic: `000000-00-${String(index + 1).padStart(4, '0')}`,
    phone: '+60 00-000 0000',
    age: 30,
    grossMonthlyIncomeRm: 8000,
    monthlyCommitmentsRm: 2000,
    propertiesOwned: 0
  }
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
  const { persona: contextPersona, profile } = usePersona()
  const activePersona = propPersona ?? contextPersona ?? 'sales-admin'
  const { settings, loading: settingsLoading, error: settingsError, refreshSettings } = useProjectSettings()
  const defaultSalesOwner =
    activePersona === 'manager'
      ? (salesProfiles[0]?.name ?? PERSONA_STAFF['sales-admin'].name)
      : profile.persona === activePersona
        ? profile.name
        : PERSONA_STAFF[activePersona].name
  const managerCanChooseSales = activePersona === 'manager'
  const blocks = settings.blocks?.length ? settings.blocks : settings.blockPrefix ? [settings.blockPrefix] : ['']
  const [initialEntryId] = useState(rowId)
  const initialEntry = newEntry(settings, defaultSalesOwner, initialEntryId)
  const [entryDraft, setEntryDraft] = useState<Entry[] | null>(null)
  const entries = entryDraft ?? [initialEntry]
  const updateEntries = (changeEntries: (current: Entry[]) => Entry[]) =>
    setEntryDraft((current) => changeEntries(current ?? [initialEntry]))
  const [entryBlocks, setEntryBlocks] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)

  const change = (id: string, field: keyof Entry, value: string | number) =>
    updateEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  const selectedUnits = entries.map((entry) => entry.unit).filter(Boolean)
  const available = getAvailableInventoryUnits(settings, held)
  const inspect = (entry: Entry) => {
    const unit = entry.unit.trim().toUpperCase()
    const name = entry.buyerName.trim()
    if (!unit && !name) return { ok: false, label: 'Add Unit And Buyer' }
    if (!unit) return { ok: false, label: 'Choose A Unit' }
    if (!Number.isInteger(entry.priceRm) || entry.priceRm < 10_000 || entry.priceRm > 2_000_000_000) {
      return { ok: false, label: 'Enter SPA Price From RM 10,000' }
    }
    const range = isUnitInRange(unit, settings)
    if (!range.inRange) return { ok: false, label: range.reason ?? 'Choose A Unit In Range' }
    if (!name) return { ok: false, label: 'Enter Buyer Name' }
    const heldKey = unitKey(settings.projectName, unit)
    if (held.has(heldKey)) return { ok: false, label: 'Already Booked' }
    if (entries.some((other) => other.id !== entry.id && other.unit.trim().toUpperCase() === unit)) {
      return { ok: false, label: 'Unit Already Added' }
    }
    return { ok: true, label: 'Ready' }
  }
  const checks = entries.map(inspect)
  const readyCount = checks.filter((check) => check.ok).length
  const allValid = readyCount === entries.length

  const handleImport = async () => {
    if (!allValid || settingsLoading || settingsError) return
    setImporting(true)
    try {
      const bookings: BookingDraft[] = entries.map((entry, index) => ({
        project: settings.projectName,
        unit: entry.unit.trim().toUpperCase(),
        priceRm: entry.priceRm,
        bookingDate: referenceDate || new Date().toISOString().slice(0, 10),
        salesOwner: entry.salesOwner,
        loanOwner: PERSONA_STAFF['loan-admin'].name,
        legalFirm: entry.lawFirm,
        buyer: { ...fakeBuyer(index), name: entry.buyerName.trim() }
      }))
      const result = await importBookings({ bookings, reportedBy: profile.name, source: 'Direct Entry' })
      notify.success(`${result.bookings.length} ${result.bookings.length === 1 ? 'Booking' : 'Bookings'} Added.`)
      onImported(result)
      setEntryDraft([newEntry(settings, defaultSalesOwner)])
      setEntryBlocks({})
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : 'Could Not Add These Bookings.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="border-border shadow-card">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Type Bookings In</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter Buyer Names And Choose Available Units. Demo Buyer Details Are Filled In For You.
          </p>
          {settingsError && (
            <div
              role="alert"
              className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-sm text-status-danger-fg"
            >
              <span>Project Settings Could Not Be Loaded. Bookings Are Paused Until Settings Are Available.</span>
              <Button type="button" size="sm" variant="secondary" onClick={() => void refreshSettings()}>
                Try Again
              </Button>
            </div>
          )}
        </div>
        <fieldset
          disabled={settingsLoading || Boolean(settingsError)}
          className="flex min-w-0 flex-col gap-3 border-0 p-0 disabled:opacity-60"
        >
          {entries.map((entry, index) => {
            const block = entryBlocks[entry.id] ?? blocks[0] ?? ''
            const prefix = block ? `${block}-` : ''
            const blocked = new Set(selectedUnits.filter((unit) => unit.toUpperCase() !== entry.unit.toUpperCase()))
            const choices = available.filter(
              (unit) => unit.toUpperCase().startsWith(prefix.toUpperCase()) && !blocked.has(unit.toUpperCase())
            )
            return (
              <section
                key={entry.id}
                aria-label={`Booking ${index + 1}`}
                className="rounded-md border border-border p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Booking {index + 1}</h3>
                  {entries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove Booking ${index + 1}`}
                      onClick={() => updateEntries((current) => current.filter((item) => item.id !== entry.id))}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" htmlFor={`block-${entry.id}`}>
                      Block
                    </label>
                    <Select
                      value={block || '__no_block__'}
                      onValueChange={(selected) => {
                        const value = selected === '__no_block__' ? '' : selected
                        setEntryBlocks((current) => ({ ...current, [entry.id]: value }))
                        if (entry.unit && !entry.unit.toUpperCase().startsWith(`${value}-`.toUpperCase()))
                          change(entry.id, 'unit', '')
                      }}
                    >
                      <SelectTrigger
                        id={`block-${entry.id}`}
                        aria-label={`Block For Booking ${index + 1}`}
                        className="h-9"
                      >
                        <SelectValue placeholder="Choose Block" />
                      </SelectTrigger>
                      <SelectContent>
                        {blocks.map((value) => (
                          <SelectItem key={value || 'no-block'} value={value || '__no_block__'}>
                            {value || 'No Block'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" htmlFor={`unit-${entry.id}`}>
                      Unit Number
                    </label>
                    <UnitAutocompleteInput
                      id={`unit-${entry.id}`}
                      value={entry.unit}
                      onChange={(value) => {
                        const parts = value.trim().split('-')
                        const unit =
                          prefix &&
                          parts.length === 2 &&
                          /^\d+$/.test(parts[0]) &&
                          /^\d+$/.test(parts[1]) &&
                          parts[0].toUpperCase() !== block.toUpperCase()
                            ? `${prefix}${value.trim()}`
                            : value
                        change(entry.id, 'unit', unit)
                      }}
                      availableUnits={choices}
                      placeholder={prefix ? `${prefix}12-08` : '12-08'}
                      hasError={
                        entry.unit.length > 0 && !checks[index].ok && checks[index].label !== 'Enter Buyer Name'
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" htmlFor={`buyer-${entry.id}`}>
                      Buyer Name
                    </label>
                    <Input
                      id={`buyer-${entry.id}`}
                      value={entry.buyerName}
                      onChange={(event) => change(entry.id, 'buyerName', event.target.value)}
                      placeholder="Enter Buyer Name"
                      className="h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" htmlFor={`model-${entry.id}`}>
                      Unit Layout
                    </label>
                    <Select
                      value={entry.modelId}
                      onValueChange={(value) => {
                        const model = settings.models.find((item) => item.id === value)
                        updateEntries((current) =>
                          current.map((item) =>
                            item.id === entry.id
                              ? { ...item, modelId: value, priceRm: model?.priceRm ?? item.priceRm }
                              : item
                          )
                        )
                      }}
                    >
                      <SelectTrigger
                        id={`model-${entry.id}`}
                        aria-label={`Unit Layout For Booking ${index + 1}`}
                        className="h-9"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} · {model.layout}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" htmlFor={`firm-${entry.id}`}>
                      Panel Law Firm
                    </label>
                    <Select value={entry.lawFirm} onValueChange={(value) => change(entry.id, 'lawFirm', value)}>
                      <SelectTrigger
                        id={`firm-${entry.id}`}
                        aria-label={`Panel Law Firm For Booking ${index + 1}`}
                        className="h-9"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PANEL_LAW_FIRMS.map((firm) => (
                          <SelectItem key={firm} value={firm}>
                            {firm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" htmlFor={`price-${entry.id}`}>
                      SPA Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">RM</span>
                      <Input
                        id={`price-${entry.id}`}
                        inputMode="numeric"
                        value={entry.priceRm || ''}
                        onChange={(event) => change(entry.id, 'priceRm', Number(event.target.value.replace(/\D/g, '')))}
                        className="h-9 pl-10 text-right font-mono tabular-nums"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  {managerCanChooseSales ? (
                    <div className="flex items-center gap-2">
                      <label htmlFor={`sales-owner-${entry.id}`} className="text-muted-foreground">
                        Sales Agent
                      </label>
                      <Select value={entry.salesOwner} onValueChange={(value) => change(entry.id, 'salesOwner', value)}>
                        <SelectTrigger
                          id={`sales-owner-${entry.id}`}
                          aria-label={`Sales Agent For Booking ${index + 1}`}
                          className="h-8 w-auto min-w-40"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {salesProfiles.map((salesProfile) => (
                            <SelectItem key={salesProfile.id} value={salesProfile.name}>
                              {salesProfile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Sales Agent: <strong className="font-medium text-foreground">{entry.salesOwner}</strong>
                    </span>
                  )}
                  {checks[index].ok ? (
                    <StatusPill tone="positive">Ready</StatusPill>
                  ) : (
                    <span className="text-muted-foreground">{checks[index].label}</span>
                  )}
                </div>
              </section>
            )
          })}
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => updateEntries((current) => [...current, newEntry(settings, defaultSalesOwner)])}
            disabled={settingsLoading || Boolean(settingsError)}
          >
            <Plus className="size-4" />
            Add Another Booking
          </Button>
          <Button
            type="button"
            onClick={() => void handleImport()}
            disabled={!allValid || importing || settingsLoading || Boolean(settingsError)}
          >
            <Upload className="size-4" />
            {importing ? 'Adding Bookings…' : `Add ${entries.length} ${entries.length === 1 ? 'Booking' : 'Bookings'}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
