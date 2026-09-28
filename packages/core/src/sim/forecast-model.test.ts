import { describe, expect, it } from 'vitest'
import { buildForecastModel, forecast, generate, REFERENCE_DATE, scopeSnapshot } from '../index'
import type { Dataset, ForecastModel } from '../types'

const data = generate({ seed: 7, referenceDate: REFERENCE_DATE, bookings: 140 })
const model = buildForecastModel(data, REFERENCE_DATE, '2026-09-28T00:00:00Z', '2026-10-05T00:00:00Z')

describe('shared aggregate forecast model', () => {
  it('supports a restricted live-only cohort without exposing any case identity', () => {
    const live = data.bookings.find(
      (booking) => !data.events.some((event) => event.bookingId === booking.id && event.kind === 'spa_signed')
    )!
    const restricted: Dataset = { bookings: [live], applications: [], events: [] }
    const result = forecast(restricted, REFERENCE_DATE, { model })
    expect(result.support).toBe('supported')
    expect(result.perBooking.map((row) => row.bookingId)).toEqual([live.id])
    expect(JSON.stringify(model)).not.toMatch(/BK-|APP-|EV-/)
    expect(
      Object.values(model.groups).every((cell) => typeof cell.signed === 'number' && typeof cell.resolved === 'number')
    ).toBe(true)
  })

  it('keeps the aggregate while removing excluded cases from a scoped snapshot', () => {
    const booking = data.bookings[0]!
    const snapshot = {
      ...data,
      meta: { seed: 1, referenceDate: REFERENCE_DATE, resetAt: null },
      forecastModel: model,
      messages: [],
      playbooks: [],
      tasks: [],
      extractions: [],
      signals: [],
      nextActions: []
    }
    const scoped = scopeSnapshot(snapshot, { id: 'sales-only', name: 'not owner', persona: 'sales-admin' })
    expect(scoped.bookings.some((candidate) => candidate.id === booking.id)).toBe(false)
    expect(scoped.forecastModel).toEqual(model)
    expect(JSON.stringify(scoped.forecastModel)).not.toContain(booking.id)
  })

  it('distinguishes no resolved history from observed zero conversion', () => {
    const empty = buildForecastModel({ bookings: [], applications: [], events: [] }, REFERENCE_DATE, 'a', 'b')
    expect(forecast({ bookings: [], applications: [], events: [] }, REFERENCE_DATE, { model: empty }).support).toBe(
      'insufficient-history'
    )
    const observedZero: ForecastModel = { ...empty, overall: { signed: 0, resolved: 1 } }
    expect(
      forecast({ bookings: [], applications: [], events: [] }, REFERENCE_DATE, { model: observedZero }).support
    ).toBe('supported')
    expect(forecast({ bookings: [], applications: [], events: [] }, REFERENCE_DATE).support).toBe(
      'insufficient-history'
    )
  })

  it('keeps bookings live when using the same weekly model', () => {
    const liveBookings = data.bookings.filter((booking) => booking.bookingDate >= '2026-09-01').slice(0, 3)
    const before = forecast({ bookings: liveBookings, applications: [], events: data.events }, REFERENCE_DATE, {
      model
    })
    const target = liveBookings[0]!
    const booked = data.events.find((event) => event.bookingId === target.id && event.kind === 'booked')!
    const signed = {
      ...booked,
      id: `${booked.id}-SYNTHETIC-SIGNED`,
      kind: 'spa_signed' as const,
      track: 'legal' as const,
      occurredAt: `${target.bookingDate}T12:00:00+08:00`,
      recordedAt: `${REFERENCE_DATE}T12:00:00+08:00`
    }
    const after = forecast(
      { bookings: liveBookings, applications: [], events: [...data.events, signed] },
      REFERENCE_DATE,
      { model }
    )
    expect(before.asOf).toBe(after.asOf)
    expect(after.support).toBe('supported')
    expect(before.liveBookings - after.liveBookings).toBe(1)
    expect(after.perBooking.some((row) => row.bookingId === target.id)).toBe(false)
    expect(model).toEqual(buildForecastModel(data, REFERENCE_DATE, model.refreshedAt, model.nextRefreshAt))
  })
})
