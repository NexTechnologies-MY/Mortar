import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { NotificationPopover } from '@/components/ui/NotificationPopover'
import { notificationStore } from '@/lib/notificationStore'

describe('NotificationPopover', () => {
  beforeEach(() => {
    window.localStorage.clear()
    notificationStore.clearAll()
  })

  it('names the icon-only buttons', async () => {
    notificationStore.push('Success', 'Proposal confirmed.')
    render(<NotificationPopover />)

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))

    expect(await screen.findByRole('button', { name: 'Dismiss Success' })).toBeTruthy()
  })

  it('shows simulated time in the house date format', async () => {
    notificationStore.push('Success', 'Proposal confirmed.')
    render(<NotificationPopover />)

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))

    // `simNow` pins the reference date; never the wall-clock US locale date.
    expect(await screen.findByText('18 Sep 2026')).toBeTruthy()
    expect(screen.queryByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeNull()
  })
})
