import { useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import {
  DEFAULT_PROJECT_SETTINGS,
  MAX_PROJECT_UNITS,
  PANEL_LAW_FIRMS,
  formatUnitRangeDescription,
  projectInventorySize,
  useProjectSettings
} from '@/lib/projectSettings'
import type { ProjectSettings, UnitModel } from '@/lib/projectSettings'
import { usePersona } from '@/lib/persona'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { notify } from '@/components/ui/toastConfig'

export function ProjectSettingsCard() {
  const { profile } = usePersona()
  const { settings, loading, error, updateSettings } = useProjectSettings()
  const [draftChanges, setDraftChanges] = useState<ProjectSettings | null>(null)
  const draft = draftChanges ?? settings
  const dirty = draftChanges !== null
  const [saving, setSaving] = useState(false)
  const canEdit = profile.persona === 'manager'
  const inventoryTooLarge = projectInventorySize(draft) > MAX_PROJECT_UNITS

  const change = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    setDraftChanges((current) => ({ ...(current ?? settings), [key]: value }))
  }
  const changeModel = (id: string, field: keyof UnitModel, value: string | number) => {
    setDraftChanges((current) => {
      const base = current ?? settings
      return { ...base, models: base.models.map((model) => (model.id === id ? { ...model, [field]: value } : model)) }
    })
  }
  const save = async () => {
    if (inventoryTooLarge) {
      notify.error(`Project Inventory Cannot Exceed ${MAX_PROJECT_UNITS.toLocaleString()} Units.`)
      return
    }
    setSaving(true)
    try {
      const normalized = {
        ...draft,
        blocks: [...new Set((draft.blocks ?? []).map((block) => block.trim()).filter(Boolean))]
      }
      normalized.blockPrefix = normalized.blocks[0] ?? ''
      await updateSettings(normalized)
      setDraftChanges(null)
      notify.success('Project Settings Saved.')
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : 'Project Settings Could Not Be Saved.')
    } finally {
      setSaving(false)
    }
  }
  const reset = () => {
    setDraftChanges({ ...DEFAULT_PROJECT_SETTINGS, projectName: settings.projectName })
  }
  const preview = formatUnitRangeDescription(draft)

  return (
    <Card className="border-border shadow-card">
      <CardContent className="flex flex-col gap-5 p-4 sm:p-5">
        <div>
          <h2 className="flex items-center text-base font-semibold">
            Project Settings
            <InfoTooltip
              label="About Project Settings"
              text="Set The Available Blocks, Unit Range, Layouts, And Default Law Firm."
            />
          </h2>
        </div>
        {!canEdit && (
          <p className="rounded-md border border-border p-3 text-sm text-muted-foreground">
            Only A Manager Can Change These Settings.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-status-danger-fg">
            {error}
          </p>
        )}
        {loading && <p className="text-sm text-muted-foreground">Loading Project Settings…</p>}
        <fieldset disabled={!canEdit || loading || saving} className="flex flex-col gap-5 disabled:opacity-60">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="setting-project">Project Name</Label>
              <Input
                id="setting-project"
                value={draft.projectName}
                onChange={(e) => change('projectName', e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="setting-blocks">Blocks</Label>
              <Input
                id="setting-blocks"
                value={(draft.blocks ?? (draft.blockPrefix ? [draft.blockPrefix] : [])).join(', ')}
                onChange={(e) =>
                  change(
                    'blocks',
                    e.target.value.split(',').map((value) => value.trim())
                  )
                }
                placeholder="A, B, C"
                className="h-9"
              />
              <span className="text-xs text-muted-foreground">Separate Block Names With Commas.</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="setting-min-floor">First Floor</Label>
              <Input
                id="setting-min-floor"
                inputMode="numeric"
                value={draft.minFloor}
                onChange={(e) => change('minFloor', Number(e.target.value.replace(/\D/g, '')) || 0)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="setting-max-floor">Last Floor</Label>
              <Input
                id="setting-max-floor"
                inputMode="numeric"
                value={draft.maxFloor}
                onChange={(e) => change('maxFloor', Number(e.target.value.replace(/\D/g, '')) || 0)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="setting-units">Units Per Floor</Label>
              <Input
                id="setting-units"
                inputMode="numeric"
                value={draft.unitsPerFloor}
                onChange={(e) => change('unitsPerFloor', Number(e.target.value.replace(/\D/g, '')) || 0)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="setting-price">Default SPA Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">RM</span>
                <Input
                  id="setting-price"
                  inputMode="numeric"
                  value={draft.defaultPriceRm || ''}
                  onChange={(e) => change('defaultPriceRm', Number(e.target.value.replace(/\D/g, '')) || 0)}
                  className="h-9 pl-10 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{preview}</p>
          {inventoryTooLarge && (
            <p role="alert" className="text-sm text-status-danger-fg">
              Project Inventory Cannot Exceed {MAX_PROJECT_UNITS.toLocaleString()} Units.
            </p>
          )}
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">Unit Layouts</h3>
            {draft.models.map((model) => (
              <div
                key={model.id}
                className="grid grid-cols-1 items-end gap-2 rounded-md border border-border p-3 sm:grid-cols-3"
              >
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`model-name-${model.id}`}>Name</Label>
                  <Input
                    id={`model-name-${model.id}`}
                    value={model.name}
                    onChange={(e) => changeModel(model.id, 'name', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`model-layout-${model.id}`}>Layout</Label>
                  <Input
                    id={`model-layout-${model.id}`}
                    value={model.layout}
                    onChange={(e) => changeModel(model.id, 'layout', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Label htmlFor={`model-price-${model.id}`}>Price (RM)</Label>
                    <Input
                      id={`model-price-${model.id}`}
                      inputMode="numeric"
                      value={model.priceRm || ''}
                      onChange={(e) => changeModel(model.id, 'priceRm', Number(e.target.value.replace(/\D/g, '')) || 0)}
                      className="h-9 font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Remove ${model.name}`}
                    disabled={draft.models.length <= 1}
                    onClick={() => {
                      change(
                        'models',
                        draft.models.filter((item) => item.id !== model.id)
                      )
                      if (draft.defaultModelId === model.id)
                        change('defaultModelId', draft.models.find((item) => item.id !== model.id)?.id ?? '')
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const code = String.fromCharCode(65 + draft.models.length)
                  change('models', [
                    ...draft.models,
                    {
                      id: `model-${Date.now()}`,
                      name: `Type ${code}`,
                      code,
                      layout: '2 Bed · 2 Bath',
                      priceRm: draft.defaultPriceRm
                    }
                  ])
                }}
              >
                <Plus className="size-4" />
                Add Layout
              </Button>
              <div className="flex flex-col gap-1">
                <Label htmlFor="setting-default-model">Default Layout</Label>
                <Select
                  value={draft.defaultModelId}
                  onValueChange={(id) => {
                    const selected = draft.models.find((model) => model.id === id)
                    change('defaultModelId', id)
                    if (selected) change('defaultPriceRm', selected.priceRm)
                  }}
                >
                  <SelectTrigger id="setting-default-model" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {draft.models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <Label htmlFor="setting-law-firm">Default Panel Law Firm</Label>
            <Select value={draft.defaultLawFirm} onValueChange={(value) => change('defaultLawFirm', value)}>
              <SelectTrigger id="setting-law-firm" className="h-9">
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
            <span className="text-xs text-muted-foreground">Used For New Bookings.</span>
          </div>
        </fieldset>
        {canEdit && (
          <div className="flex justify-between border-t border-border pt-3">
            <Button type="button" variant="ghost" onClick={reset}>
              Reset Defaults
            </Button>
            <Button
              type="button"
              disabled={!dirty || loading || saving || inventoryTooLarge}
              onClick={() => void save()}
            >
              <Check className="size-4" />
              {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
