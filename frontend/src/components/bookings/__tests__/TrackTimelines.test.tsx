import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CaseEvent } from '@mortar/core'
import { TrackTimelines } from '@/components/bookings/TrackTimelines'

const event = (over: Partial<CaseEvent>): CaseEvent => ({
  id: 'EV-T000',
  bookingId: 'BK-T001',
  applicationId: null,
  track: 'loan',
  kind: 'loan_approved',
  occurredAt: '2026-09-16T12:00:00+08:00',
  recordedAt: '2026-09-18T10:00:00+08:00',
  reportedBy: 'Jev',
  verifiedBy: null,
  status: 'provisional',
  source: 'jev',
  messageId: 'MSG-1',
  document: null,
  note: null,
  ...over
})

describe('TrackTimelines', () => {
  it.each([
    ['100% Probability', 'Jev Is Sure'],
    ['94% Probability', 'Jev Is Sure'],
    ['84% Probability', 'Jev Is Fairly Sure'],
    ['70% Probability', 'Jev Is Fairly Sure'],
    ['62% Probability', 'Jev Is Not Sure']
  ])('reads the stored note %s as the words a person uses for it', (note, certainty) => {
    // The loan track is where a legal or loan admin reads what Jev proposed, so
    // the percentage cannot surface here (DESIGN.md Plain Language).
    render(<TrackTimelines events={[event({ note })]} />)

    expect(screen.getByText(new RegExp(certainty, 'i'))).toBeTruthy()
    expect(screen.queryByText(/Probability/)).toBeNull()
  })

  it('leaves a note that is a sentence alone, however it reads', () => {
    render(<TrackTimelines events={[event({ note: 'Panel Bank Confirmed By Phone' })]} />)
    expect(screen.getByText(/Panel Bank Confirmed By Phone/)).toBeTruthy()
  })

  it('says the track is empty rather than showing nothing', () => {
    render(<TrackTimelines events={[]} />)
    expect(screen.getAllByText('No Events Yet.')).toHaveLength(3)
  })
})
