/**
 * Persona provider + hook for the staff role the app is being used as.
 *
 * Mortar is shared by Sales Admin, Loan Admin, and Legal Admin staff; the active
 * persona decides which route `/` redirects to and which sidebar item leads.
 * The choice persists in localStorage under `mortar.persona` so a workstation
 * reopens in the same role.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Persona } from '@mortar/core'

export type { Persona }

/** Static metadata for each persona: dropdown label and home route. */
export type PersonaMeta = {
  id: Persona
  label: string
  home: string
}

/** Every persona the app supports, in dropdown display order. */
export const PERSONAS: PersonaMeta[] = [
  { id: 'sales-admin', label: 'Sales Admin', home: '/chase' },
  { id: 'loan-admin', label: 'Loan Admin', home: '/bookings' },
  { id: 'legal-admin', label: 'Legal Admin', home: '/legal' }
]

/** Persona used before the user expresses a preference. */
export const DEFAULT_PERSONA: Persona = 'sales-admin'

/** localStorage key holding the persisted persona choice. */
export const PERSONA_STORAGE_KEY = 'mortar.persona'

function isPersona(value: string | null): value is Persona {
  return PERSONAS.some((p) => p.id === value)
}

/**
 * Personas renamed since a workstation last stored its choice. Without this a
 * stored `finance` would fail validation and silently reset the seat to Sales
 * Admin on the next visit.
 */
const RENAMED_PERSONAS: Record<string, Persona> = { finance: 'legal-admin' }

/** Reads the persisted persona, falling back to the default on any failure. */
function readStoredPersona(): Persona {
  try {
    const stored = window.localStorage.getItem(PERSONA_STORAGE_KEY)
    if (isPersona(stored)) return stored
    if (stored !== null && stored in RENAMED_PERSONAS) return RENAMED_PERSONAS[stored]
  } catch {
    // localStorage unavailable (private mode etc) — fall through to default
  }
  return DEFAULT_PERSONA
}

/**
 * Value exposed by `usePersona`. `persona` is the active id, `meta` its label
 * and home route, and `home` is the route `/` should redirect to.
 */
type PersonaContextValue = {
  persona: Persona
  meta: PersonaMeta
  home: string
  setPersona: (persona: Persona) => void
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined)

/**
 * Wraps the React tree with persona context. Mount once near the root,
 * inside `BrowserRouter` so consumers can navigate on change.
 */
export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(readStoredPersona)
  const meta = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0]

  const setPersona = useCallback((next: Persona) => {
    setPersonaState(next)
    try {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, next)
    } catch {
      // localStorage unavailable — the in-memory switch still applies
    }
  }, [])

  return (
    <PersonaContext.Provider value={{ persona, meta, home: meta.home, setPersona }}>{children}</PersonaContext.Provider>
  )
}

/**
 * Hook that returns the active persona context. Must be called inside
 * `PersonaProvider`; throws otherwise.
 */
export function usePersona() {
  const context = useContext(PersonaContext)
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider')
  }
  return context
}
