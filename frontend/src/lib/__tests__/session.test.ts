import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_PROFILES } from '@mortar/core'

const notifications = vi.hoisted(() => ({ setProfile: vi.fn() }))
vi.mock('../notificationStore', () => ({ notificationStore: notifications }))

describe('profile sessions', () => {
  beforeEach(() => {
    vi.resetModules()
    window.localStorage.clear()
    notifications.setProfile.mockClear()
  })

  afterEach(() => vi.unstubAllGlobals())

  it('serializes a profile switch and rejects the response for the old profile', async () => {
    let finishSales!: (response: Response) => void
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finishSales = resolve
          })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const session = await import('../session')
    const sales = DEMO_PROFILES.find((profile) => profile.id === 'sales-nurul-aina')!
    const loan = DEMO_PROFILES.find((profile) => profile.id === 'loan-tan-mei-ling')!
    session.selectProfile(sales)
    const salesRequest = session.ensureSession()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    session.selectProfile(loan)
    finishSales(new Response(null, { status: 204 }))
    await expect(salesRequest).rejects.toThrow('Profile changed')
    await session.ensureSession()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({ profileId: sales.id })
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({ profileId: loan.id })
    expect(session.activeProfileId()).toBe(loan.id)
    expect(notifications.setProfile).toHaveBeenLastCalledWith(loan.id)
  })

  it('reuses an established session and reopens it after invalidation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const session = await import('../session')

    await session.ensureSession()
    await session.ensureSession()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    session.invalidateSession()
    await session.ensureSession()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
