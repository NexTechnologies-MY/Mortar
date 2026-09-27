/** Shared project settings and inventory helpers used by Add Bookings and Settings. */
import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_UNIT_MODELS,
  PANEL_LAW_FIRMS,
  normalizeProjectSettings,
  unitKey
} from '@mortar/core'
import type { ProjectSettings } from '@mortar/core'
import { fetchProjectSettings, saveProjectSettings } from '@/lib/api'

export const MAX_PROJECT_UNITS = 10_000

export function projectInventorySize(settings: ProjectSettings): number {
  const blockCount = settings.blocks?.length || 1
  return blockCount * (settings.maxFloor - settings.minFloor + 1) * settings.unitsPerFloor
}

export { DEFAULT_PROJECT_SETTINGS, DEFAULT_UNIT_MODELS, PANEL_LAW_FIRMS, normalizeProjectSettings }
export type { ProjectSettings, UnitModel } from '@mortar/core'

export function generateProjectInventoryUnits(settings: ProjectSettings): string[] {
  const units: string[] = []
  const blocks = settings.blocks?.length ? settings.blocks : settings.blockPrefix ? [settings.blockPrefix] : ['']
  if (projectInventorySize(settings) > MAX_PROJECT_UNITS) return units
  for (const block of blocks) {
    const prefix = block ? `${block}-` : ''
    for (let floor = settings.minFloor; floor <= settings.maxFloor; floor++) {
      for (let number = 1; number <= settings.unitsPerFloor; number++) {
        units.push(`${prefix}${String(floor).padStart(2, '0')}-${String(number).padStart(2, '0')}`)
      }
    }
  }
  return units
}

export function getAvailableInventoryUnits(
  settings: ProjectSettings,
  held: Map<string, string>,
  excludeUnits: string[] = []
) {
  const excluded = new Set(excludeUnits.map((unit) => unit.trim().toUpperCase()))
  return generateProjectInventoryUnits(settings).filter(
    (unit) => !excluded.has(unit.toUpperCase()) && !held.has(unitKey(settings.projectName, unit))
  )
}

export function formatUnitRangeDescription(settings: ProjectSettings): string {
  const blocks = settings.blocks?.length ? settings.blocks : settings.blockPrefix ? [settings.blockPrefix] : ['']
  const first = blocks[0] ? `${blocks[0]}-` : ''
  const lastBlock = blocks[blocks.length - 1]
  const last = lastBlock ? `${lastBlock}-` : ''
  const min = String(settings.minFloor).padStart(2, '0')
  const max = String(settings.maxFloor).padStart(2, '0')
  const maxUnit = String(settings.unitsPerFloor).padStart(2, '0')
  const count = blocks.length * (settings.maxFloor - settings.minFloor + 1) * settings.unitsPerFloor
  return `${first}${min}-01 to ${last}${max}-${maxUnit} (${count.toLocaleString()} units)`
}

export function isUnitInRange(unit: string, settings: ProjectSettings): { inRange: boolean; reason?: string } {
  const normalized = unit.trim().toUpperCase()
  if (!normalized) return { inRange: false, reason: 'Choose A Unit' }
  const blocks = settings.blocks?.length ? settings.blocks : settings.blockPrefix ? [settings.blockPrefix] : ['']
  let unitPart = normalized
  if (blocks[0]) {
    const matchedBlock = blocks.find((block) => normalized.startsWith(`${block.toUpperCase()}-`))
    if (!matchedBlock) {
      return { inRange: false, reason: `Choose A Unit In ${blocks.join(', ')}` }
    }
    unitPart = normalized.slice(matchedBlock.length + 1)
  }
  const parts = unitPart.split('-')
  if (parts.length !== 2 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {
    return { inRange: false, reason: 'Enter A Unit Number In The Configured Format' }
  }
  const [floorText, unitText] = parts
  const floor = Number.parseInt(floorText, 10)
  const number = Number.parseInt(unitText, 10)
  if (unitPart !== `${String(floor).padStart(2, '0')}-${String(number).padStart(2, '0')}`) {
    return { inRange: false, reason: 'Choose A Unit In The Configured Format' }
  }
  if (floor < settings.minFloor || floor > settings.maxFloor)
    return { inRange: false, reason: `Floor ${floor} Is Outside The Configured Range` }
  if (number < 1 || number > settings.unitsPerFloor)
    return { inRange: false, reason: `Unit ${number} Is Outside The Configured Range` }
  return { inRange: true }
}

export function useProjectSettings() {
  const [settings, setSettingsState] = useState<ProjectSettings>(DEFAULT_PROJECT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const readSettings = useCallback(async () => {
    const result = await fetchProjectSettings()
    const normalized = normalizeProjectSettings(result.settings)
    if (!normalized) throw new Error('Project Settings Could Not Be Read.')
    if (projectInventorySize(normalized) > MAX_PROJECT_UNITS) {
      throw new Error(`Project Inventory Cannot Exceed ${MAX_PROJECT_UNITS.toLocaleString()} Units.`)
    }
    return normalized
  }, [])

  const refreshSettings = useCallback(async () => {
    setLoading(true)
    try {
      setSettingsState(await readSettings())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Project Settings Could Not Be Loaded.')
    } finally {
      setLoading(false)
    }
  }, [readSettings])

  useEffect(() => {
    let active = true
    void readSettings()
      .then((next) => {
        if (active) {
          setSettingsState(next)
          setError(null)
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Project Settings Could Not Be Loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [readSettings])

  const updateSettings = useCallback(async (next: ProjectSettings) => {
    setError(null)
    try {
      if (projectInventorySize(next) > MAX_PROJECT_UNITS) {
        throw new Error(`Project Inventory Cannot Exceed ${MAX_PROJECT_UNITS.toLocaleString()} Units.`)
      }
      const result = await saveProjectSettings(next)
      const normalized = normalizeProjectSettings(result.settings)
      if (!normalized) throw new Error('Project Settings Could Not Be Saved.')
      setSettingsState(normalized)
      return normalized
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Project Settings Could Not Be Saved.'
      setError(message)
      throw cause
    }
  }, [])

  return { settings, loading, error, refreshSettings, updateSettings }
}
