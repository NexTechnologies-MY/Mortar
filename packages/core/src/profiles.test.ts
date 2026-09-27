import { describe, expect, test } from 'vitest'
import {
  canAccessBooking,
  createAssignmentAccessContext,
  DEFAULT_PROJECT_SETTINGS,
  DEMO_PROFILES,
  normalizeProjectSettings,
  PERSONA_STAFF,
  profileFor,
  PROJECT_NAME,
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
        'Arvind Raj',
        'Project Manager'
      ])
    )
    expect(profileFor('manager')?.persona).toBe('manager')
    // The legal desk is a person in the UI, so the profile must carry the same
    // name the sim gives its legal staff member.
    expect(profileFor('legal-admin')?.name).toBe(PERSONA_STAFF['legal-admin'].name)
  })

  test('restricts sales to assigned ownership while manager sees all bookings', () => {
    const sales = profileFor('sales-nurul-aina')!
    const manager = profileFor('manager')!
    expect(canAccessBooking(booking, sales)).toBe(true)
    expect(canAccessBooking(other, sales)).toBe(false)
    expect(scopeSnapshot(snapshot, sales).bookings.map((row) => row.id)).toEqual([booking.id])
    expect(scopeSnapshot(snapshot, manager).bookings).toHaveLength(2)
    expect(scopeSnapshot(snapshot, profileFor('legal-admin')!).bookings).toHaveLength(0)
  })

  test('uses current confirmed responsibility, exact internal ownership and open task assignment', () => {
    const story = STORIES[0]!
    const legalStory = STORIES.find((candidate) => candidate.booking.id === 'BK-9006')!
    const data = {
      bookings: [story.booking, legalStory.booking],
      applications: [...story.applications, ...legalStory.applications],
      events: [...story.events, ...legalStory.events],
      tasks: [] as NonNullable<Snapshot['tasks']>
    }
    const context = createAssignmentAccessContext(data, '2026-09-18')
    const loan = profileFor('loan-tan-mei-ling')!
    const legal = profileFor('legal-admin')!
    expect(canAccessBooking(story.booking, loan, context)).toBe(true)
    expect(canAccessBooking(story.booking, { ...loan, id: 'loan-other', name: 'Other Loan Admin' }, context)).toBe(
      false
    )
    expect(canAccessBooking(story.booking, legal, context)).toBe(false)
    expect(canAccessBooking(legalStory.booking, legal, context)).toBe(true)
    expect(
      canAccessBooking(legalStory.booking, { ...legal, id: 'legal-other', name: 'Other Legal Admin' }, context)
    ).toBe(false)

    const handedOff = createAssignmentAccessContext(
      {
        ...data,
        events: [
          ...story.events,
          {
            ...story.events.find((event) => event.kind === 'loan_submitted')!,
            id: 'EV-HANDOFF',
            kind: 'loan_approved',
            track: 'loan',
            occurredAt: '2026-09-17T12:00:00+08:00',
            recordedAt: '2026-09-17T12:00:00+08:00'
          },
          ...legalStory.events
        ],
        tasks: []
      },
      '2026-09-18'
    )
    expect(canAccessBooking(story.booking, loan, handedOff)).toBe(false)
    expect(canAccessBooking(story.booking, legal, handedOff)).toBe(true)

    const provisional = createAssignmentAccessContext(
      {
        ...data,
        events: [
          ...story.events,
          { ...story.events[0]!, id: 'EV-PENDING', kind: 'loan_approved', status: 'provisional' }
        ]
      },
      '2026-09-18'
    )
    expect(canAccessBooking(story.booking, loan, provisional)).toBe(true)
    expect(canAccessBooking(story.booking, legal, provisional)).toBe(false)

    const taskContext = {
      ...context,
      tasks: [
        {
          id: 'TSK-1',
          bookingId: legalStory.booking.id,
          ownerRole: 'legal' as const,
          ownerName: legal.name,
          status: 'open' as const
        },
        {
          id: 'TSK-2',
          bookingId: legalStory.booking.id,
          ownerRole: 'legal' as const,
          ownerName: legal.name,
          status: 'done' as const
        }
      ] as Snapshot['tasks']
    }
    expect(canAccessBooking(legalStory.booking, legal, taskContext)).toBe(true)
    expect(
      canAccessBooking(legalStory.booking, { ...legal, name: 'Different Name' }, { ...taskContext, summaries: [] })
    ).toBe(false)
    expect(canAccessBooking(legalStory.booking, legal, { ...taskContext, summaries: [] })).toBe(true)
    expect(canAccessBooking(legalStory.booking, legal)).toBe(false)
  })

  test('grants the legal profile a task owned by the legal desk’s staff member', () => {
    const legalStory = STORIES.find((candidate) => candidate.booking.id === 'BK-9006')!
    const legal = profileFor('legal-admin')!
    const context = {
      summaries: [],
      tasks: [
        {
          id: 'TSK-NAMED',
          bookingId: legalStory.booking.id,
          ownerRole: 'legal' as const,
          ownerName: PERSONA_STAFF['legal-admin'].name,
          status: 'open' as const
        }
      ] as Snapshot['tasks']
    }
    expect(canAccessBooking(legalStory.booking, legal, context)).toBe(true)
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
      projectName: PROJECT_NAME
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
