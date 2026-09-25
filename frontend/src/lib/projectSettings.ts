/**
 * Project Settings — unit range, inventory bounds, and panel law firm defaults.
 * Configured in SettingsPage and consumed by ImportPage & Bookings.
 */

import { useCallback, useEffect, useState } from 'react'

export interface ProjectSettings {
  projectName: string
  blockPrefix: string
  minFloor: number
  maxFloor: number
  unitsPerFloor: number
  defaultLawFirm: string
  defaultPriceRm: number
}

export const PANEL_LAW_FIRMS = [
  'Teh & Partners',
  'Cheah & Associates',
  'Zaid Ibrahim & Co',
  'Skrine',
  'Rahmat Lim & Partners',
  'Lee Hishammuddin Allen & Gledhill',
  'Unassigned'
] as const

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  projectName: 'Bukit Damai',
  blockPrefix: 'A',
  minFloor: 1,
  maxFloor: 35,
  unitsPerFloor: 12,
  defaultLawFirm: 'Teh & Partners',
  defaultPriceRm: 550_000
}

const STORAGE_KEY = 'mortar.project_settings'

export function readStoredSettings(): ProjectSettings {
  if (typeof window === 'undefined') return DEFAULT_PROJECT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROJECT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<ProjectSettings>
    return {
      projectName: parsed.projectName || DEFAULT_PROJECT_SETTINGS.projectName,
      blockPrefix: parsed.blockPrefix !== undefined ? parsed.blockPrefix : DEFAULT_PROJECT_SETTINGS.blockPrefix,
      minFloor: Number(parsed.minFloor) || DEFAULT_PROJECT_SETTINGS.minFloor,
      maxFloor: Number(parsed.maxFloor) || DEFAULT_PROJECT_SETTINGS.maxFloor,
      unitsPerFloor: Number(parsed.unitsPerFloor) || DEFAULT_PROJECT_SETTINGS.unitsPerFloor,
      defaultLawFirm: parsed.defaultLawFirm || DEFAULT_PROJECT_SETTINGS.defaultLawFirm,
      defaultPriceRm: Number(parsed.defaultPriceRm) || DEFAULT_PROJECT_SETTINGS.defaultPriceRm
    }
  } catch {
    return DEFAULT_PROJECT_SETTINGS
  }
}

export function writeStoredSettings(settings: ProjectSettings): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    window.dispatchEvent(new Event('mortar:settings-changed'))
  } catch {
    // Ignore storage quota errors
  }
}

/** Formats a sample unit range description, e.g. "A-01-01 to A-35-12 (420 units)" */
export function formatUnitRangeDescription(settings: ProjectSettings): string {
  const prefix = settings.blockPrefix ? `${settings.blockPrefix}-` : ''
  const minF = String(settings.minFloor).padStart(2, '0')
  const maxF = String(settings.maxFloor).padStart(2, '0')
  const maxU = String(settings.unitsPerFloor).padStart(2, '0')
  const total = (settings.maxFloor - settings.minFloor + 1) * settings.unitsPerFloor

  return `${prefix}${minF}-01 to ${prefix}${maxF}-${maxU} (${total.toLocaleString()} units)`
}

/** Validates whether a typed unit string falls inside the configured block, floor, and unit range. */
export function isUnitInRange(unit: string, settings: ProjectSettings): { inRange: boolean; reason?: string } {
  const trimmed = unit.trim().toUpperCase()
  if (!trimmed) return { inRange: false, reason: 'Unit is empty' }

  // Regex patterns:
  // e.g. "A-12-08" or "12-08" or "A-12-8"
  const parts = trimmed.split('-')
  let floorStr = ''
  let unitStr = ''

  if (parts.length === 3) {
    const [block, f, u] = parts
    if (settings.blockPrefix && block !== settings.blockPrefix.toUpperCase()) {
      return { inRange: false, reason: `Block prefix must be ${settings.blockPrefix}` }
    }
    floorStr = f
    unitStr = u
  } else if (parts.length === 2) {
    const [f, u] = parts
    floorStr = f
    unitStr = u
  } else {
    // Cannot parse pattern, allow but note format
    return { inRange: true }
  }

  const floor = parseInt(floorStr, 10)
  const unitNum = parseInt(unitStr, 10)

  if (isNaN(floor) || isNaN(unitNum)) {
    return { inRange: true }
  }

  if (floor < settings.minFloor || floor > settings.maxFloor) {
    return {
      inRange: false,
      reason: `Floor ${floor} is outside allowed range (${settings.minFloor}–${settings.maxFloor})`
    }
  }

  if (unitNum < 1 || unitNum > settings.unitsPerFloor) {
    return {
      inRange: false,
      reason: `Unit ${unitNum} exceeds max units per floor (${settings.unitsPerFloor})`
    }
  }

  return { inRange: true }
}

/** React hook for reading and updating project settings. */
export function useProjectSettings() {
  const [settings, setSettingsState] = useState<ProjectSettings>(readStoredSettings)

  useEffect(() => {
    const handler = () => {
      setSettingsState(readStoredSettings())
    }
    window.addEventListener('mortar:settings-changed', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('mortar:settings-changed', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const updateSettings = useCallback((next: ProjectSettings | ((prev: ProjectSettings) => ProjectSettings)) => {
    setSettingsState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      writeStoredSettings(resolved)
      return resolved
    })
  }, [])

  return { settings, updateSettings }
}
