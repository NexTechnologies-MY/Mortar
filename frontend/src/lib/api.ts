/**
 * Typed fetchers for the `/api` routes on the Bun server. In dev, Vite proxies
 * `/api` to `localhost:8787`; in production the same origin serves both. Every
 * fetcher throws an `Error` carrying the server's `error` field on failure.
 */
import type {
  BuyerSignals,
  CaseEvent,
  Extraction,
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
}

export const fetchHealth = () => request<Health>('/api/health')

export const fetchSnapshot = () => request<Snapshot>('/api/snapshot')

export const postMessage = (input: { bookingId: string; senderRole: SenderRole; senderName: string; body: string }) =>
  post<{ message: Message; extraction: Extraction; event: CaseEvent | null }>('/api/messages', input)

export const extractMessage = (messageId: string) =>
  post<{ extraction: Extraction; event: CaseEvent | null }>(`/api/messages/${messageId}/extract`)

export const postEvent = (input: {
  bookingId: string
  track: CaseEvent['track']
  kind: CaseEvent['kind']
  document?: CaseEvent['document']
  note?: string
  reportedBy: string
}) => post<CaseEvent>('/api/events', input)

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

export const resetDemo = () => post<SimulationMeta>('/api/admin/reset')
