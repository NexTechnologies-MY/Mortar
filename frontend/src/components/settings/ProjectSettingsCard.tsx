/**
 * ProjectSettingsCard — Configure allowed unit ranges, inventory boundaries,
 * and default panel law firm used for automatic case assignment.
 */

import { useState } from 'react'
import { Building2, Check, Scale, Sliders } from 'lucide-react'
import {
  PANEL_LAW_FIRMS,
  formatUnitRangeDescription,
  useProjectSettings,
  type ProjectSettings
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

  const handleSave = () => {
    updateSettings(draft)
    setDirty(false)
    notify.success('Unit range and panel law firm settings saved.')
  }

  const handleResetDefaults = () => {
    setDraft({
      projectName: 'Bukit Damai',
      blockPrefix: 'A',
      minFloor: 1,
      maxFloor: 35,
      unitsPerFloor: 12,
      defaultLawFirm: 'Teh & Partners',
      defaultPriceRm: 550_000
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
                Set the project unit inventory boundaries and default law firm.
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

        {/* Form Inputs */}
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
              Default SPA Price (RM)
            </Label>
            <Input
              id="setting-price"
              type="number"
              step={10000}
              min={50000}
              value={draft.defaultPriceRm}
              onChange={(e) => handleChange('defaultPriceRm', parseInt(e.target.value, 10) || 550000)}
              className="h-8 text-xs"
            />
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
