export interface UnitModel {
  id: string
  name: string
  code: string
  layout: string
  priceRm: number
  builtUpSqft?: number
  bedrooms?: number
  bathrooms?: number
}

export interface ProjectSettings {
  projectName: string
  /** Legacy single-block setting, retained for existing imports. */
  blockPrefix: string
  /** When present, this is the configured multi-block inventory. */
  blocks?: string[]
  minFloor: number
  maxFloor: number
  unitsPerFloor: number
  defaultLawFirm: string
  defaultPriceRm: number
  models: UnitModel[]
  defaultModelId: string
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

export const DEFAULT_UNIT_MODELS: UnitModel[] = [
  {
    id: 'model-a',
    name: 'Type A',
    code: 'A',
    layout: '2 Bed · 2 Bath (750 sqft)',
    priceRm: 480_000,
    builtUpSqft: 750,
    bedrooms: 2,
    bathrooms: 2
  },
  {
    id: 'model-b',
    name: 'Type B',
    code: 'B',
    layout: '3 Bed · 2 Bath (950 sqft)',
    priceRm: 560_000,
    builtUpSqft: 950,
    bedrooms: 3,
    bathrooms: 2
  },
  {
    id: 'model-c',
    name: 'Type C (Dual Key)',
    code: 'C',
    layout: '4 Bed · 3 Bath (1,200 sqft)',
    priceRm: 720_000,
    builtUpSqft: 1200,
    bedrooms: 4,
    bathrooms: 3
  }
]

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  projectName: 'Bukit Damai',
  blockPrefix: 'A',
  blocks: ['A'],
  minFloor: 1,
  maxFloor: 35,
  unitsPerFloor: 12,
  defaultLawFirm: 'Teh & Partners',
  defaultPriceRm: 480_000,
  models: DEFAULT_UNIT_MODELS,
  defaultModelId: 'model-a'
}

/** Accepts old single-block records and normalizes them to the shared shape. */
export function normalizeProjectSettings(value: unknown): ProjectSettings | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Partial<ProjectSettings>
  const projectName = typeof v.projectName === 'string' ? v.projectName.trim() : ''
  const models = Array.isArray(v.models) ? v.models : []
  const blocks = Array.isArray(v.blocks)
    ? [
        ...new Set(
          v.blocks
            .filter((block): block is string => typeof block === 'string')
            .map((block) => block.trim())
            .filter(Boolean)
        )
      ]
    : [typeof v.blockPrefix === 'string' ? v.blockPrefix.trim() : ''].filter(Boolean)
  if (
    !projectName ||
    projectName.length > 120 ||
    !Number.isInteger(v.minFloor) ||
    !Number.isInteger(v.maxFloor) ||
    !Number.isInteger(v.unitsPerFloor)
  )
    return null
  if (
    (v.minFloor ?? 0) < 0 ||
    (v.maxFloor ?? 0) > 200 ||
    (v.maxFloor ?? 0) < (v.minFloor ?? 0) ||
    (v.unitsPerFloor ?? 0) < 1 ||
    (v.unitsPerFloor ?? 0) > 100
  )
    return null
  if (blocks.length > 50 || blocks.some((block) => block.length > 12)) return null
  if (Math.max(1, blocks.length) * ((v.maxFloor ?? 0) - (v.minFloor ?? 0) + 1) * (v.unitsPerFloor ?? 0) > 10_000)
    return null
  if (
    models.length === 0 ||
    models.length > 50 ||
    models.some(
      (m) =>
        !m ||
        typeof m.id !== 'string' ||
        !m.id.trim() ||
        m.id.length > 40 ||
        typeof m.name !== 'string' ||
        !m.name.trim() ||
        m.name.length > 80 ||
        typeof m.code !== 'string' ||
        m.code.length > 16 ||
        typeof m.layout !== 'string' ||
        m.layout.length > 120 ||
        !Number.isFinite(m.priceRm) ||
        m.priceRm <= 0 ||
        m.priceRm > 2_000_000_000
    )
  )
    return null
  if (new Set(models.map((model) => model.id.trim())).size !== models.length) return null
  if (typeof v.defaultLawFirm !== 'string' || v.defaultLawFirm.length > 120) return null
  if (!Number.isFinite(v.defaultPriceRm) || (v.defaultPriceRm ?? 0) <= 0 || (v.defaultPriceRm ?? 0) > 2_000_000_000)
    return null
  const blockPrefix = typeof v.blockPrefix === 'string' ? v.blockPrefix.trim() : (blocks[0] ?? '')
  const cleanModels = models.map((model) => ({
    id: model.id.trim(),
    name: model.name.trim(),
    code: model.code.trim(),
    layout: model.layout.trim(),
    priceRm: model.priceRm,
    ...(Number.isFinite(model.builtUpSqft) && model.builtUpSqft! > 0 && model.builtUpSqft! <= 100_000
      ? { builtUpSqft: model.builtUpSqft }
      : {}),
    ...(Number.isInteger(model.bedrooms) && model.bedrooms! >= 0 && model.bedrooms! <= 20
      ? { bedrooms: model.bedrooms }
      : {}),
    ...(Number.isInteger(model.bathrooms) && model.bathrooms! >= 0 && model.bathrooms! <= 20
      ? { bathrooms: model.bathrooms }
      : {})
  }))
  return {
    projectName,
    blockPrefix,
    blocks,
    minFloor: v.minFloor!,
    maxFloor: v.maxFloor!,
    unitsPerFloor: v.unitsPerFloor!,
    defaultLawFirm: v.defaultLawFirm.trim(),
    defaultPriceRm: v.defaultPriceRm!,
    models: cleanModels,
    defaultModelId: models.some((m) => m.id === v.defaultModelId) ? v.defaultModelId! : models[0]!.id
  }
}
