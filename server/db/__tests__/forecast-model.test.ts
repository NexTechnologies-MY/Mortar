import { describe, expect, it } from 'bun:test'
import { buildForecastModel, generate, REFERENCE_DATE } from '@mortar/core'
import type { ForecastModel } from '@mortar/core'
import { FORECAST_MODEL_STAGES, FORECAST_MODEL_TTL_MS, forecastModelExpired, isForecastModel } from '../forecast-model'

describe('weekly forecast model freshness', () => {
  const stored: ForecastModel = {
    version: 1,
    asOf: '2026-09-28',
    refreshedAt: '2026-09-28T00:00:00.000Z',
    nextRefreshAt: new Date(Date.parse('2026-09-28T00:00:00.000Z') + FORECAST_MODEL_TTL_MS).toISOString(),
    groups: {},
    stages: FORECAST_MODEL_STAGES.map((stage) => ({ stage, signed: 0, resolved: 0 })),
    overall: { signed: 0, resolved: 0 }
  }

  it('reuses the persisted rate through the instant before seven days, then expires it at seven days', () => {
    const refreshedAt = Date.parse(stored.refreshedAt)
    expect(forecastModelExpired(stored, refreshedAt + FORECAST_MODEL_TTL_MS - 1)).toBe(false)
    expect(forecastModelExpired(stored, refreshedAt + FORECAST_MODEL_TTL_MS)).toBe(true)
  })

  it('refreshes an absent, unsupported-version, or malformed model', () => {
    expect(forecastModelExpired(null, Date.now())).toBe(true)
    expect(forecastModelExpired({ ...stored, version: 2 } as unknown as ForecastModel, Date.now())).toBe(true)
    expect(forecastModelExpired({ ...stored, nextRefreshAt: 'broken' }, Date.now())).toBe(true)
    expect(isForecastModel({ ...stored, overall: { signed: 3, resolved: 1 } })).toBe(false)
    expect(isForecastModel(stored)).toBe(true)
  })

  it('accepts the actual aggregate shape produced from generated history', () => {
    const data = generate({ seed: 9, referenceDate: REFERENCE_DATE, bookings: 140 })
    const aggregate = buildForecastModel(data, REFERENCE_DATE, stored.refreshedAt, stored.nextRefreshAt)
    expect(isForecastModel(aggregate)).toBe(true)
  })
})
