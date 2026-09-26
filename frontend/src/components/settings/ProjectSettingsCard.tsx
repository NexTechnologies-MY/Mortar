/**
 * ProjectSettingsCard — Configure allowed unit ranges, inventory boundaries,
 * unit layout models, and default panel law firm used for automatic case assignment.
 */

import { useState } from 'react'
import { Building2, Check, LayoutGrid, Plus, Scale, Sliders, Trash2 } from 'lucide-react'
import {
  PANEL_LAW_FIRMS,
  DEFAULT_UNIT_MODELS,
  formatUnitRangeDescription,
  useProjectSettings,
  type ProjectSettings,
  type UnitModel
} from '@/lib/projectSettings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { notify } from '@/components/ui/toastConfig'

export function ProjectSettingsCard() {
  const { settings, updateSettings } = useProjectSettings()
  const [draft, setDraft] = useState<ProjectSettings>(settings)
  const [dirty, setDirty] = useState(false)

  const handleChange = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const handleModelChange = (modelId: string, field: keyof UnitModel, val: string | number) => {
    setDraft((prev) => {
      const nextModels = prev.models.map((m) => {
        if (m.id !== modelId) return m
        return { ...m, [field]: val }
      })
      return { ...prev, models: nextModels }
    })
    setDirty(true)
  }

  const handleAddModel = () => {
    setDraft((prev) => {
      const nextChar = String.fromCharCode(65 + (prev.models.length % 26))
      const newModel: UnitModel = {
        id: `model-${Date.now()}`,
        name: `Type ${nextChar}`,
        code: nextChar,
        layout: '3 Bed · 2 Bath (900 sqft)',
        priceRm: prev.defaultPriceRm || 520_000
      }
      return {
        ...prev,
        models: [...prev.models, newModel]
      }
    })
    setDirty(true)
  }

  const handleDeleteModel = (modelId: string) => {
    if (draft.models.length <= 1) {
      notify.error('At least one unit model / layout must remain configured.')
      return
    }
    setDraft((prev) => {
      const filtered = prev.models.filter((m) => m.id !== modelId)
      const nextDefault = prev.defaultModelId === modelId ? filtered[0].id : prev.defaultModelId
      return {
        ...prev,
        models: filtered,
        defaultModelId: nextDefault
      }
    })
    setDirty(true)
  }

  const handleSetDefaultModel = (modelId: string) => {
    const target = draft.models.find((m) => m.id === modelId)
    setDraft((prev) => ({
      ...prev,
      defaultModelId: modelId,
      defaultPriceRm: target ? target.priceRm : prev.defaultPriceRm
    }))
    setDirty(true)
  }

  const handleSave = () => {
    updateSettings(draft)
    setDirty(false)
    notify.success('Project unit range, models, and law firm settings saved.')
  }

  const handleResetDefaults = () => {
    setDraft({
      projectName: 'Bukit Damai',
      blockPrefix: 'A',
      minFloor: 1,
      maxFloor: 35,
      unitsPerFloor: 12,
      defaultLawFirm: 'Teh & Partners',
      defaultPriceRm: 480_000,
      models: DEFAULT_UNIT_MODELS,
      defaultModelId: 'model-a'
    })
    setDirty(true)
  }

  const preview = formatUnitRangeDescription(draft)

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md border border-border bg-accent text-foreground">
              <Building2 className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Project & Unit Range Settings</h2>
              <p className="text-xs text-muted-foreground">
                Set project unit inventory boundaries, unit layout models, and default panel law firm.
              </p>
            </div>
          </div>
          {dirty && (
            <span className="rounded-full bg-status-warning-bg px-2 py-0.5 text-[10px] font-semibold text-status-warning-fg border border-status-warning/30 animate-pulse">
              Unsaved Changes
            </span>
          )}
        </div>

        {/* Live Preview Banner */}
        <div className="rounded-md border border-primary/25 bg-primary/5 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Sliders className="size-3.5 text-primary" />
            <span>Active Unit Range Preview:</span>
          </div>
          <p className="mt-1 font-mono text-sm font-semibold text-primary">{preview}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Direct imports and manual entries validate unit numbers against this range.
          </p>
        </div>

        {/* Form Inputs: Project & Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-project" className="text-xs font-medium">
              Project Name
            </Label>
            <Input
              id="setting-project"
              value={draft.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
              placeholder="e.g. Bukit Damai"
              className="h-8 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-block" className="text-xs font-medium">
              Block / Tower Prefix
            </Label>
            <Input
              id="setting-block"
              value={draft.blockPrefix}
              onChange={(e) => handleChange('blockPrefix', e.target.value)}
              placeholder="e.g. A or Tower 1"
              className="h-8 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-min-floor" className="text-xs font-medium">
              Min Floor
            </Label>
            <Input
              id="setting-min-floor"
              type="number"
              min={1}
              max={100}
              value={draft.minFloor}
              onChange={(e) => handleChange('minFloor', parseInt(e.target.value, 10) || 1)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-max-floor" className="text-xs font-medium">
              Max Floor
            </Label>
            <Input
              id="setting-max-floor"
              type="number"
              min={1}
              max={100}
              value={draft.maxFloor}
              onChange={(e) => handleChange('maxFloor', parseInt(e.target.value, 10) || 35)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-units-per-floor" className="text-xs font-medium">
              Units Per Floor
            </Label>
            <Input
              id="setting-units-per-floor"
              type="number"
              min={1}
              max={50}
              value={draft.unitsPerFloor}
              onChange={(e) => handleChange('unitsPerFloor', parseInt(e.target.value, 10) || 12)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-price" className="text-xs font-medium">
              Base SPA Price (RM)
            </Label>
            <Input
              id="setting-price"
              type="number"
              step={10000}
              min={50000}
              value={draft.defaultPriceRm}
              onChange={(e) => handleChange('defaultPriceRm', parseInt(e.target.value, 10) || 480000)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Unit Models & Layouts Section */}
        <div className="flex flex-col gap-2.5 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="size-3.5 text-primary" />
              <Label className="text-xs font-medium">Unit Models & Layouts ({draft.models.length})</Label>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddModel}
              className="h-7 gap-1 text-[11px]"
            >
              <Plus className="size-3" />
              Add Model / Layout
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Configure different floor plan models (e.g. Type A, Type B). Selecting a model on the Import page
            automatically fills the unit layout & pricing.
          </p>

          <div className="space-y-2">
            {draft.models.map((model) => {
              const isDefault = draft.defaultModelId === model.id
              return (
                <div
                  key={model.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between rounded-md border border-border bg-muted/30 p-2.5 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Model Name</Label>
                      <Input
                        value={model.name}
                        onChange={(e) => handleModelChange(model.id, 'name', e.target.value)}
                        placeholder="e.g. Type A"
                        className="h-7 text-xs font-medium mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Layout Description</Label>
                      <Input
                        value={model.layout}
                        onChange={(e) => handleModelChange(model.id, 'layout', e.target.value)}
                        placeholder="e.g. 2 Bed · 2 Bath (750 sqft)"
                        className="h-7 text-xs mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Base Price (RM)</Label>
                      <Input
                        type="number"
                        step={10000}
                        value={model.priceRm}
                        onChange={(e) => handleModelChange(model.id, 'priceRm', parseInt(e.target.value, 10) || 0)}
                        className="h-7 text-xs font-mono mt-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center sm:pl-2">
                    <button
                      type="button"
                      onClick={() => handleSetDefaultModel(model.id)}
                      title={isDefault ? 'Default Model' : 'Set as Default Model'}
                      className={`rounded px-2 py-1 text-[10px] font-semibold transition-colors ${
                        isDefault
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {isDefault ? 'Default' : 'Make Default'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModel(model.id)}
                      disabled={draft.models.length <= 1}
                      title="Delete Model"
                      className="rounded p-1 text-muted-foreground hover:text-status-danger hover:bg-status-danger/10 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Law Firm Selection */}
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <Scale className="size-3.5 text-primary" />
            Default Panel Law Firm (Auto-assigned)
          </Label>
          <Select value={draft.defaultLawFirm} onValueChange={(val) => handleChange('defaultLawFirm', val)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select default law firm" />
            </SelectTrigger>
            <SelectContent>
              {PANEL_LAW_FIRMS.map((firm) => (
                <SelectItem key={firm} value={firm} className="text-xs">
                  {firm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Newly keyed cases on the Import page will automatically be assigned to this law firm.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Defaults
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!dirty}
            onClick={handleSave}
            className="gap-1.5 text-xs font-medium"
          >
            <Check className="size-3.5" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
