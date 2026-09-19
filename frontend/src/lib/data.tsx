/**
 * Snapshot plumbing for the app shell. `SnapshotProvider` holds the server
 * state; `useSnapshot()` lazily triggers the first `GET /api/snapshot` so the
 * public pages (`/`, `/sign-in`) never hit the API, and returns the snapshot,
 * loading and error state plus `refresh()` to re-fetch after a mutation.
 * `useCases()` memoizes `summarizeCases` over the snapshot.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { summarizeCases, type CaseSummary, type Snapshot } from '@mortar/core'
import { fetchSnapshot } from './api'

type SnapshotContextValue = {
  snapshot: Snapshot | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  /** Starts the first fetch; idempotent so many `useSnapshot` callers share one request. */
  ensure: () => void
}

const SnapshotContext = createContext<SnapshotContextValue | undefined>(undefined)

export function SnapshotProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ snapshot: Snapshot | null; loading: boolean; error: string | null }>({
    snapshot: null,
    loading: false,
    error: null
  })
  const requested = useRef(false)

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      setState({ snapshot: await fetchSnapshot(), loading: false, error: null })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Failed to load the snapshot' }))
    }
  }, [])

  const ensure = useCallback(() => {
    if (requested.current) return
    requested.current = true
    void refresh()
  }, [refresh])

  const value = useMemo(() => ({ ...state, refresh, ensure }), [state, refresh, ensure])
  return <SnapshotContext.Provider value={value}>{children}</SnapshotContext.Provider>
}

/** Snapshot state for a screen; fetches lazily on the first call. */
export function useSnapshot() {
  const context = useContext(SnapshotContext)
  if (!context) {
    throw new Error('useSnapshot must be used within a SnapshotProvider')
  }
  const { ensure, snapshot, loading, error, refresh } = context
  useEffect(() => {
    ensure()
  }, [ensure])
  return { snapshot, loading, error, refresh }
}

/** Derived case summaries; `[]` until the first snapshot lands. */
export function useCases(): CaseSummary[] {
  const { snapshot } = useSnapshot()
  return useMemo(
    () =>
      snapshot
        ? summarizeCases(
            {
              bookings: snapshot.bookings,
              applications: snapshot.applications,
              events: snapshot.events,
              tasks: snapshot.tasks
            },
            snapshot.meta.referenceDate
          )
        : [],
    [snapshot]
  )
}
