import { describe, expect, test } from 'vitest'
import {
  canAccessBooking,
  DEFAULT_PROJECT_SETTINGS,
  DEMO_PROFILES,
  normalizeProjectSettings,
  profileFor,
  scopeSnapshot,
  STORIES
} from './index'
import type { Snapshot } from './types'

const booking = STORIES[0]!.booking
const other = { ...booking, id: 'BK-9910', unit: 'A-99-10', salesOwner: 'Farah Izzati' }

const snapshot: Snapshot = {
  meta: { seed: 1, referenceDate: '2026-09-18', resetAt: null },
  bookings: [booking, other],
  applications: [],
  events: [],
  messages: [],
  playbooks: [],
  tasks: [],
  extractions: [],
  signals: [],
  nextActions: []
}

describe('staff profiles and snapshot scope', () => {
  test('provides a selectable profile for every fixture sales owner and each shared desk', () => {
    expect(DEMO_PROFILES.map((profile) => profile.name)).toEqual(
      expect.arrayContaining([
        'Nurul Aina',
        'Farah Izzati',
        'Kelvin Chow',
        'Dinesh Rao',
        'Mei Xuan',
        'Hafiz Rahman',
        'Jocelyn Ng',
        'Tan Mei Ling',
        'Legal Admin',
        'Project Manager'
      ])
    )
    expect(profileFor('manager')?.persona).toBe('manager')
  })

  test('restricts sales to assigned ownership while manager and department profiles see their work', () => {
    const sales = profileFor('sales-nurul-aina')!
    const manager = profileFor('manager')!
    expect(canAccessBooking(booking, sales)).toBe(true)
    expect(canAccessBooking(other, sales)).toBe(false)
    expect(scopeSnapshot(snapshot, sales).bookings.map((row) => row.id)).toEqual([booking.id])
    expect(scopeSnapshot(snapshot, manager).bookings).toHaveLength(2)
    expect(scopeSnapshot(snapshot, profileFor('legal-admin')!).bookings).toHaveLength(2)
  })

  test('filters every booking-linked collection through the same allowed booking set', () => {
    const message = (id: string, bookingId: string) => ({
      id,
      bookingId,
      senderRole: 'buyer' as const,
      senderName: 'Buyer',
      language: 'en' as const,
      sentAt: '2026-09-18T10:00:00+08:00',
      body: 'Update',
      origin: 'fixture' as const
    })
    const linked: Snapshot = {
      ...snapshot,
      applications: [
        { id: 'LA-1', bookingId: booking.id, bank: 'Apex', banker: 'Banker' },
        { id: 'LA-2', bookingId: other.id, bank: 'Apex', banker: 'Banker' }
      ],
      events: [
        { id: 'EV-1', bookingId: booking.id },
        { id: 'EV-2', bookingId: other.id }
      ] as Snapshot['events'],
      messages: [message('MSG-1', booking.id), message('MSG-2', other.id)],
      tasks: [
        { id: 'TSK-1', bookingId: booking.id },
        { id: 'TSK-2', bookingId: other.id }
      ] as Snapshot['tasks'],
      extractions: [{ messageId: 'MSG-1' }, { messageId: 'MSG-2' }] as Snapshot['extractions'],
      signals: [{ bookingId: booking.id }, { bookingId: other.id }] as Snapshot['signals'],
      nextActions: [{ bookingId: booking.id }, { bookingId: other.id }] as Snapshot['nextActions']
    }
    const scoped = scopeSnapshot(linked, profileFor('sales-nurul-aina')!)
    expect(scoped.applications.map((row) => row.id)).toEqual(['LA-1'])
    expect(scoped.events.map((row) => row.id)).toEqual(['EV-1'])
    expect(scoped.messages.map((row) => row.id)).toEqual(['MSG-1'])
    expect(scoped.tasks.map((row) => row.id)).toEqual(['TSK-1'])
    expect(scoped.extractions.map((row) => row.messageId)).toEqual(['MSG-1'])
    expect(scoped.signals).toHaveLength(1)
    expect(scoped.nextActions).toHaveLength(1)
  })
})

describe('shared project settings validation', () => {
  test('normalizes legacy blockPrefix while accepting multiple blocks and stripping unknown fields', () => {
    expect(
      normalizeProjectSettings({ ...DEFAULT_PROJECT_SETTINGS, blocks: ['A', 'B'], injected: 'ignored' })
    ).toMatchObject({
      blockPrefix: 'A',
      blocks: ['A', 'B'],
      projectName: 'Bukit Damai'
    })
    expect(
      normalizeProjectSettings({ ...DEFAULT_PROJECT_SETTINGS, blocks: undefined, blockPrefix: 'C' })?.blocks
    ).toEqual(['C'])
  })

  test('rejects a configured inventory above the shared 10,000 unit cap', () => {
    expect(
      normalizeProjectSettings({
        ...DEFAULT_PROJECT_SETTINGS,
        blocks: ['A', 'B'],
        minFloor: 1,
        maxFloor: 100,
        unitsPerFloor: 60
      })
    ).toBeNull()
  })
})
