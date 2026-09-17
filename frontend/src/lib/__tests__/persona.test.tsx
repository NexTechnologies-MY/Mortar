import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { PERSONA_STORAGE_KEY, PersonaProvider, usePersona } from '@/lib/persona'

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
    act(() => result.current.setPersona('finance'))
    expect(result.current.persona).toBe('finance')
    expect(result.current.home).toBe('/forecast')
    expect(window.localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('finance')
  })

  it('restores a previously stored persona', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'loan-admin')
    const { result } = renderHook(() => usePersona(), { wrapper })
    expect(result.current.persona).toBe('loan-admin')
    expect(result.current.home).toBe('/bookings')
  })

  it('falls back to the default when storage holds an unknown value', () => {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, 'not-a-persona')
    const { result } = renderHook(() => usePersona(), { wrapper })
    expect(result.current.persona).toBe('sales-admin')
  })
})
