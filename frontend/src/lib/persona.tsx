/**
 * Persona provider + hook for the staff role the app is being used as.
 *
 * Mortar is shared by Sales Admin, Loan Admin, and Legal Admin staff; the active
 * persona decides which route `/` redirects to, which sidebar item leads, and
 * which pages the role can open at all. The choice persists in localStorage
 * under `mortar.persona` so a workstation reopens in the same role.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { OwnerRole, Persona } from '@mortar/core'

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

/** Which sidebar group a persona page sits in. */
export type NavGroup = 'primary' | 'more'

/**
 * The persona-scoped pages, in sidebar order.
 *
 * One map drives the sidebar and the route guard, so a role can never show a
 * page it cannot open. The persona's home is hoisted to the top of the Primary
 * group at render time; `home` marks which one that is.
 */
export type PersonaPage = {
  to: string
  label: string
  group: NavGroup
  /** The personas that see this page. */
  personas: readonly Persona[]
  /** The persona whose desk this page is. */
  home?: Persona
}

export const PERSONA_PAGES: readonly PersonaPage[] = [
  {
    to: '/chase',
    label: 'Today',
    group: 'primary',
    personas: ['sales-admin', 'loan-admin', 'legal-admin'],
    home: 'sales-admin'
  },
  {
    to: '/bookings',
    label: 'Bookings',
    group: 'primary',
    personas: ['sales-admin', 'loan-admin', 'legal-admin'],
    home: 'loan-admin'
  },
  { to: '/legal', label: 'Legal', group: 'primary', personas: ['legal-admin'], home: 'legal-admin' },
  { to: '/import', label: 'Add Bookings', group: 'primary', personas: ['sales-admin'] },
  { to: '/forecast', label: 'Forecast', group: 'more', personas: ['sales-admin', 'loan-admin', 'legal-admin'] },
  { to: '/settings', label: 'Settings', group: 'more', personas: ['sales-admin', 'loan-admin', 'legal-admin'] }
] as const

/** The page a persona can open, in sidebar order with its home first. */
export function pagesForPersona(persona: Persona): PersonaPage[] {
  return PERSONA_PAGES.filter((page) => page.personas.includes(persona)).sort(
    (a, b) => Number(b.home === persona) - Number(a.home === persona)
  )
}

/** The page at `path`, or `undefined` when the route is not persona-scoped. */
export function pageAt(path: string): PersonaPage | undefined {
  return PERSONA_PAGES.find((page) => path === page.to || path.startsWith(`${page.to}/`))
}

/** Whether the persona can open the page at `path`. */
export function canPersonaOpen(persona: Persona, path: string): boolean {
  const page = pageAt(path)
  return page ? page.personas.includes(persona) : true
}

/** The sidebar group headings, in the order they read down the rail. */
export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  primary: 'Primary',
  more: 'More'
}

/** The label of a persona page, for the guard's toast. */
export function pageLabelFor(path: string): string {
  return pageAt(path)?.label ?? 'That Page'
}

/**
 * The owner role each persona's work sits under, typed as `OwnerRole`.
 *
 * `PERSONA_STAFF` in `@mortar/core` carries the same pairing as a plain string;
 * this reads it rather than restating the names, so the two cannot drift.
 */
export const PERSONA_DESK_ROLE: Record<Persona, OwnerRole> = {
  'sales-admin': 'sales_admin',
  'loan-admin': 'loan_admin',
  'legal-admin': 'legal'
}

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
export function PersonaProvider({ children, initialPersona }: { children: ReactNode; initialPersona?: Persona }) {
  const [persona, setPersonaState] = useState<Persona>(initialPersona ?? readStoredPersona)
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

/** Information boundaries and visibility rules for staff personas. */
export interface PersonaInfoPermissions {
  canViewFullCreditRatios: boolean
  canViewSensitiveCommitments: boolean
  canEditBankApplications: boolean
  canViewLegalDrafts: boolean
  canScheduleSpa: boolean
  canChaseBuyer: boolean
  deskLabel: string
  primaryStage: 'buyer' | 'bank' | 'solicitor' | 'spa'
  lensSummary: string
  whatYouSee: string
  whatIsMasked: string
}

export const PERSONA_PERMISSIONS: Record<Persona, PersonaInfoPermissions> = {
  'sales-admin': {
    canViewFullCreditRatios: false,
    canViewSensitiveCommitments: false,
    canEditBankApplications: false,
    canViewLegalDrafts: false,
    canScheduleSpa: false,
    canChaseBuyer: true,
    deskLabel: 'Sales Admin Desk',
    primaryStage: 'buyer',
    lensSummary: 'Buyer Chasing & Lead Progression',
    whatYouSee: 'Buyer contact signals, reservation age, follow-up queues, and outstanding buyer documents.',
    whatIsMasked: 'Confidential bank DSR ratios, private debt calculations, and panel legal drafts are masked.'
  },
  'loan-admin': {
    canViewFullCreditRatios: true,
    canViewSensitiveCommitments: true,
    canEditBankApplications: true,
    canViewLegalDrafts: false,
    canScheduleSpa: false,
    canChaseBuyer: false,
    deskLabel: 'Loan Admin Desk',
    primaryStage: 'bank',
    lensSummary: 'Full Underwriting & Bank Tracking',
    whatYouSee: 'Full credit ratios, DSR calculations, panel bank decisions, and loan document verification.',
    whatIsMasked: 'Conveyancing legal file drafts and sales commission lead chasing are de-emphasized.'
  },
  'legal-admin': {
    canViewFullCreditRatios: false,
    canViewSensitiveCommitments: false,
    canEditBankApplications: false,
    canViewLegalDrafts: true,
    canScheduleSpa: true,
    canChaseBuyer: false,
    deskLabel: 'Legal Admin Desk',
    primaryStage: 'solicitor',
    lensSummary: 'Conveyancing & SPA Execution',
    whatYouSee: 'Panel law firm assignment, Letter of Offer verification, and SPA signing schedules.',
    whatIsMasked: 'Buyer gross income, debt commitments, and bank rejection logs are masked per PDPA standards.'
  }
}

/** Safe hook that returns active persona context or fallback when outside PersonaProvider. */
export function usePersonaSafe(): PersonaContextValue {
  const context = useContext(PersonaContext)
  if (!context) {
    const defaultMeta = PERSONAS[1] // Loan Admin as default fallback
    return {
      persona: 'loan-admin',
      meta: defaultMeta,
      home: defaultMeta.home,
      setPersona: () => {}
    }
  }
  return context
}
