import type { ForecastModel, Stage } from '@mortar/core'
import { FUNNEL_STAGES } from '@mortar/core'

export const FORECAST_MODEL_KEY = 'forecast_model_v1'
export const FORECAST_MODEL_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const FORECAST_MODEL_STAGES: readonly Stage[] = FUNNEL_STAGES

/** Pure freshness check so callers and tests share the exact wall-clock rule. */
export function forecastModelExpired(model: ForecastModel | null, now: number): boolean {
  const expiry = model ? Date.parse(model.nextRefreshAt) : Number.NaN
  return !model || model.version !== 1 || !Number.isFinite(expiry) || now >= expiry
}

/** Reject corrupt or old JSONB values before they reach forecast calculations. */
export function isForecastModel(value: unknown): value is ForecastModel {
  if (!value || typeof value !== 'object') return false
  const model = value as Partial<ForecastModel>
  const cell = (candidate: unknown): candidate is { signed: number; resolved: number } => {
    if (!candidate || typeof candidate !== 'object') return false
    const item = candidate as { signed?: unknown; resolved?: unknown }
    return (
      Number.isSafeInteger(item.signed) &&
      Number(item.signed) >= 0 &&
      Number.isSafeInteger(item.resolved) &&
      Number(item.resolved) >= 0 &&
      Number(item.signed) <= Number(item.resolved)
    )
  }
  return (
    model.version === 1 &&
    typeof model.asOf === 'string' &&
    typeof model.refreshedAt === 'string' &&
    typeof model.nextRefreshAt === 'string' &&
    Number.isFinite(Date.parse(model.nextRefreshAt)) &&
    !!model.groups &&
    typeof model.groups === 'object' &&
    Object.values(model.groups).every(cell) &&
    cell(model.overall) &&
    Array.isArray(model.stages) &&
    model.stages.length === FORECAST_MODEL_STAGES.length &&
    model.stages.every((item, index) => !!item && item.stage === FORECAST_MODEL_STAGES[index] && cell(item))
  )
}
