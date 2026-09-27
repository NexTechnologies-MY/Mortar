import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('notificationStore profile scope', () => {
  beforeEach(() => {
    vi.resetModules()
    window.localStorage.clear()
  })

  it('keeps manager follow-ups in the assigned profile and restores each profile list', async () => {
    window.localStorage.setItem('mortar.profile', 'sales-nurul-aina')
    const { notificationStore } = await import('../notificationStore')
    const task = {
      id: 'task-1',
      title: 'Call buyer',
      managerFlaggedBy: 'Manager A',
      bookingId: 'BK-1',
      createdAt: '2026-09-27T09:00:00.000Z'
    }

    notificationStore.managerTask(task)
    notificationStore.managerTask(task)
    expect(notificationStore.get()).toHaveLength(1)
    expect(window.localStorage.getItem('mortar.notifications.sales-nurul-aina')).toContain('task-1')

    notificationStore.setProfile('manager-harish')
    expect(notificationStore.get()).toEqual([])
    notificationStore.push('Manager notice', 'Overview refreshed')
    expect(window.localStorage.getItem('mortar.notifications.manager-harish')).toContain('Manager notice')

    notificationStore.setProfile('sales-nurul-aina')
    expect(notificationStore.get()).toHaveLength(1)
    expect(notificationStore.get()[0].title).toBe('Manager Follow-Up')
  })
})
