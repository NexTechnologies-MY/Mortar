/**
 * Forecast-page helpers: turn the snapshot into the dataset `forecast` and
 * `backtest` consume, build an alternate-seed dataset for "Try Another Seed",
 * and map assumption source tags to status tones.
 */
import { STORIES, generate } from '@mortar/core'
import type { Dataset, IsoDate, Snapshot, SourceTag } from '@mortar/core'
import type { StatusPillTone } from '@/components/ui/status-pill'

export function datasetFor(snapshot: Snapshot): Dataset {
  return { bookings: snapshot.bookings, applications: snapshot.applications, events: snapshot.events }
}

/** `YYYY-MM-DD` `days` after `isoDate` (negative allowed). */
export function addDays(isoDate: string, days: number): IsoDate {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * A parallel dataset for "Try Another Seed": the same generator and story
 * fixtures under a different seed. The database is never touched.
 */
export function altDataset(seed: number, referenceDate: IsoDate, bookings = 140): Dataset {
  const alt = generate({ seed, referenceDate, bookings })
  return {
    bookings: [...alt.bookings, ...STORIES.map((s) => s.booking)],
    applications: [...alt.applications, ...STORIES.flatMap((s) => s.applications)],
    events: [...alt.events, ...STORIES.flatMap((s) => s.events)]
  }
}

export const SOURCE_TAG_TONES: Record<SourceTag, StatusPillTone> = {
  official: 'positive',
  industry: 'info',
  survey: 'neutral',
  anecdotal: 'warning',
  assumption: 'neutral'
}

export const SOURCE_TAG_LABELS: Record<SourceTag, string> = {
  official: 'Official',
  industry: 'Industry',
  survey: 'Survey',
  anecdotal: 'Anecdotal',
  assumption: 'Assumption'
}
