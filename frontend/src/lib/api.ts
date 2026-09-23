/**
 * Typed fetchers for the `/api` routes on the Bun server. In dev, Vite proxies
 * `/api` to `localhost:8787`; in production the same origin serves both. Every
 * fetcher throws an `Error` carrying the server's `error` field on failure.
 */
import type {
  Booking,
  BookingDraft,
  BuyerSignals,
  CaseEvent,
  Extraction,
  LoanApplication,
  Message,
  NextActionSuggestion,
  OwnerRole,
  PlaybookRanking,
  SenderRole,
  SimulationMeta,
  Snapshot,
  Task
} from '@mortar/core'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init
  })
  const payload: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      payload !== null && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `${init?.method ?? 'GET'} ${path} failed (${res.status})`
    throw new Error(message)
  }
  return payload as T
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

export interface Health {
  ok: boolean
  db: boolean
  jev: boolean
  /** Stored `jev_answers` rows; `null` when the database is unreachable. */
  jevAnswers: number | null
}

export const fetchHealth = () => request<Health>('/api/health')

export const fetchSnapshot = () => request<Snapshot>('/api/snapshot')

/**
 * Logs a pasted message and has Jev read it. `sentAt` is when it was sent (`2026-09-17T21:05:00+08:00`), never
 * later than now nor before the booking date; left out, the server stamps it now.
 */
export const postMessage = (input: {
  bookingId: string
  senderRole: SenderRole
  senderName: string
  body: string
  sentAt?: string
}) => post<{ message: Message; extraction: Extraction; event: CaseEvent | null }>('/api/messages', input)

export const extractMessage = (messageId: string) =>
  post<{ extraction: Extraction; event: CaseEvent | null }>(`/api/messages/${messageId}/extract`)

/**
 * Records a confirmed staff update. `applicationId` must be one of the booking's bank applications; `occurredOn`
 * (`YYYY-MM-DD`, between the booking date and today) dates it, else it is dated now. A submission to a bank goes
 * through `postApplication` instead.
 */
export const postEvent = (input: {
  bookingId: string
  track: CaseEvent['track']
  kind: Exclude<CaseEvent['kind'], 'loan_submitted'>
  applicationId?: string
  document?: CaseEvent['document']
  occurredOn?: string
  note?: string
  reportedBy: string
}) => post<CaseEvent>('/api/events', input)

/** Records a submission to a bank: the new application and its confirmed `loan_submitted` update, together. */
export const postApplication = (input: {
  bookingId: string
  bank: string
  banker: string
  occurredOn?: string
  note?: string
  reportedBy: string
}) => post<{ application: LoanApplication; event: CaseEvent }>('/api/applications', input)

export const reviewEvent = (
  eventId: string,
  input: { decision: 'confirm' | 'dispute' | 'dismiss'; reviewer: string }
) => post<CaseEvent>(`/api/events/${eventId}/review`, input)

export const fetchNextAction = (bookingId: string) =>
  post<NextActionSuggestion>(`/api/bookings/${bookingId}/next-action`)

export const fetchPlaybooks = (bookingId: string, query?: string) =>
  request<PlaybookRanking>(`/api/bookings/${bookingId}/playbooks${query ? `?q=${encodeURIComponent(query)}` : ''}`)

export const fetchSignals = (bookingId: string) => request<BuyerSignals>(`/api/bookings/${bookingId}/signals`)

export const postTask = (input: {
  bookingId: string
  action: Task['action']
  title: string
  ownerRole: OwnerRole
  ownerName: string
  dueOn: string
  origin: Task['origin']
}) => post<Task>('/api/tasks', input)

export const updateTask = (taskId: string, status: Task['status']) =>
  request<Task>(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status }) })

/**
 * Stores the rows a person chose from a booking sheet; `source` is the file
 * name, kept on each booked update. `importId` undoes the batch.
 */
export const importBookings = (input: { bookings: BookingDraft[]; reportedBy: string; source?: string }) =>
  post<{ importId: string; bookings: Booking[] }>('/api/bookings/import', input)

/**
 * Removes an import's bookings; refused (409) once any of them has had an update, message or task. The import
 * itself stays on record, stamped with `reportedBy` and the time.
 */
export const undoImport = (importId: string, reportedBy: string) =>
  post<{ removed: string[] }>(`/api/imports/${importId}/undo`, { reportedBy })

export const resetDemo = () => post<SimulationMeta>('/api/admin/reset')
