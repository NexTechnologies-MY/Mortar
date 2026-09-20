import type { IsoDate } from '../types'

/** The canonical demo seed. */
export const DEFAULT_SEED = 20260918
/** "Today" on every screen, so screenshots match the pitch video. */
export const REFERENCE_DATE: IsoDate = '2026-09-18'
/** Conversion means an SPA signed within this many days of booking. */
export const HORIZON_DAYS = 30

/** Staff names per persona, used for reviews and tasks. */
export const PERSONA_STAFF: Record<'sales-admin' | 'loan-admin' | 'legal-admin', { name: string; role: string }> = {
  'sales-admin': { name: 'Nurul Aina', role: 'sales_admin' },
  'loan-admin': { name: 'Tan Mei Ling', role: 'loan_admin' },
  'legal-admin': { name: 'Arvind Raj', role: 'legal' }
}
