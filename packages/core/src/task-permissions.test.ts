import { describe, expect, it } from 'vitest'
import { canManageTaskStatus, profileFor } from './index'
import type { Task } from './types'

const task: Task = {
  id: 'TSK-1',
  bookingId: 'BK-1',
  action: 'call_buyer',
  title: 'Call Buyer',
  ownerRole: 'sales',
  ownerName: 'Nurul Aina',
  dueOn: '2026-09-19',
  status: 'open',
  origin: 'staff',
  createdAt: '2026-09-18T09:00:00+08:00',
  completedAt: null
}

describe('canManageTaskStatus', () => {
  it('requires both the named owner and matching department, with a manager override', () => {
    expect(canManageTaskStatus(task, profileFor('sales-nurul-aina')!)).toBe(true)
    expect(canManageTaskStatus({ ...task, ownerRole: 'sales_admin' }, profileFor('sales-nurul-aina')!)).toBe(true)
    expect(canManageTaskStatus(task, profileFor('sales-farah-izzati')!)).toBe(false)
    expect(canManageTaskStatus({ ...task, ownerRole: 'loan_admin' }, profileFor('sales-nurul-aina')!)).toBe(false)
    expect(
      canManageTaskStatus(
        { ...task, ownerRole: 'loan_admin', ownerName: 'Tan Mei Ling' },
        profileFor('loan-tan-mei-ling')!
      )
    ).toBe(true)
    expect(
      canManageTaskStatus({ ...task, ownerRole: 'legal', ownerName: 'Arvind Raj' }, profileFor('legal-admin')!)
    ).toBe(true)
    expect(canManageTaskStatus({ ...task, ownerName: 'Someone Else' }, profileFor('manager')!)).toBe(true)
  })
})
