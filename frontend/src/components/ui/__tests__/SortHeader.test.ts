import { describe, it, expect } from 'vitest'
import { nextSort, type SortState } from '../SortHeader'

describe('nextSort', () => {
  it('cycles through desc -> asc -> null -> desc when third argument is omitted (defaulting to desc)', () => {
    let state: SortState<'x'> = null

    state = nextSort(state, 'x')
    expect(state).toEqual({ key: 'x', dir: 'desc' })

    state = nextSort(state, 'x')
    expect(state).toEqual({ key: 'x', dir: 'asc' })

    state = nextSort(state, 'x')
    expect(state).toBeNull()

    state = nextSort(state, 'x')
    expect(state).toEqual({ key: 'x', dir: 'desc' })
  })

  it('cycles through desc -> asc -> null when first is explicitly passed as desc', () => {
    let state: SortState<'x'> = null

    state = nextSort(state, 'x', 'desc')
    expect(state).toEqual({ key: 'x', dir: 'desc' })

    state = nextSort(state, 'x', 'desc')
    expect(state).toEqual({ key: 'x', dir: 'asc' })

    state = nextSort(state, 'x', 'desc')
    expect(state).toBeNull()

    state = nextSort(state, 'x', 'desc')
    expect(state).toEqual({ key: 'x', dir: 'desc' })
  })

  it('cycles through asc -> desc -> null when first is explicitly passed as asc', () => {
    let state: SortState<'y'> = null

    state = nextSort(state, 'y', 'asc')
    expect(state).toEqual({ key: 'y', dir: 'asc' })

    state = nextSort(state, 'y', 'asc')
    expect(state).toEqual({ key: 'y', dir: 'desc' })

    state = nextSort(state, 'y', 'asc')
    expect(state).toBeNull()
  })

  it('starts the cycle at first when switching to a different key', () => {
    const currentAsc: SortState<'x' | 'y'> = { key: 'x', dir: 'asc' }
    expect(nextSort(currentAsc, 'y', 'desc')).toEqual({ key: 'y', dir: 'desc' })

    const currentDesc: SortState<'x' | 'y'> = { key: 'x', dir: 'desc' }
    expect(nextSort(currentDesc, 'y', 'asc')).toEqual({ key: 'y', dir: 'asc' })
  })
})
