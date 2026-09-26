import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  PERSONA_PAGES,
  PERSONA_STORAGE_KEY,
  PersonaProvider,
  canPersonaOpen,
  pageAt,
  pagesForPersona,
  usePersona
} from '@/lib/persona'

const wrapper = ({ children }: { children: ReactNode }) => <PersonaProvider>{children}</PersonaProvider>

describe('persona context', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to Sales Admin with the chase list as home', () => {
    const { result } = renderHook(() => usePersona(), { wrapper })
    expect(result.current.persona).toBe('sales-admin')
    expect(result.current.home).toBe('/chase')
  })

  it('persists a persona switch to localStorage', () => {
    const { result } = renderHook(() => usePersona(), { wrapper })
    act(() => result.current.setPersona('legal-admin'))
    expect(result.current.persona).toBe('legal-admin')
    expect(result.current.home).toBe('/legal')
    expect(window.localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('legal-admin')
  })

  it('restores a previously stored persona', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
    const { result } = renderHook(() => usePersona(), { wrapper })
    expect(result.current.persona).toBe('loan-admin')
    expect(result.current.home).toBe('/bookings')
  })

  it('migrates the retired finance id to legal-admin', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'finance')
    const { result } = renderHook(() => usePersona(), { wrapper })
    expect(result.current.persona).toBe('legal-admin')
    expect(result.current.home).toBe('/legal')
  })

  it('falls back to the default when storage holds an unknown value', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'not-a-persona')
    const { result } = renderHook(() => usePersona(), { wrapper })
    expect(result.current.persona).toBe('sales-admin')
  })
})

describe('persona pages', () => {
  it('gives each persona only the pages that role can open', () => {
    expect(pagesForPersona('sales-admin').map((p) => p.to)).toEqual([
      '/chase',
      '/bookings',
      '/import',
      '/forecast',
      '/settings'
    ])
    expect(pagesForPersona('loan-admin').map((p) => p.to)).toEqual(['/bookings', '/chase', '/forecast', '/settings'])
    expect(pagesForPersona('legal-admin').map((p) => p.to)).toEqual([
      '/legal',
      '/chase',
      '/bookings',
      '/forecast',
      '/settings'
    ])
  })

  it('keeps each persona’s own desk first', () => {
    expect(pagesForPersona('legal-admin')[0].to).toBe('/legal')
    expect(pagesForPersona('loan-admin')[0].to).toBe('/bookings')
  })

  it('splits the pages into Primary and More, with the shared pages in More', () => {
    expect(PERSONA_PAGES.filter((p) => p.group === 'more').map((p) => p.to)).toEqual(['/forecast', '/settings'])
    expect(PERSONA_PAGES.filter((p) => p.group === 'primary').map((p) => p.to)).toContain('/legal')
  })

  it('answers the guard from the same map the sidebar reads', () => {
    expect(canPersonaOpen('sales-admin', '/chase')).toBe(true)
    expect(canPersonaOpen('sales-admin', '/legal')).toBe(false)
    expect(canPersonaOpen('loan-admin', '/import')).toBe(false)
    // Anything not on the map — the case page, `/app`, a public route — is open.
    expect(canPersonaOpen('sales-admin', '/bookings/BK-9001')).toBe(true)
    expect(canPersonaOpen('sales-admin', '/app')).toBe(true)
  })

  it('matches a case path back to the page it hangs off, for the breadcrumb', () => {
    expect(pageAt('/bookings/BK-9001')?.to).toBe('/bookings')
    expect(pageAt('/bookings')).toBeDefined()
    expect(pageAt('/nope')).toBeUndefined()
  })
})
