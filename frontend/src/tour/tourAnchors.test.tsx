/**
 * Every tour step, pointed at the real page it walks through.
 *
 * `tourSteps.test.ts` can only tell that a target is shaped like a selector.
 * This mounts the app the way `main.tsx` does — router, persona, snapshot — with
 * a mocked snapshot carrying enough for every step to draw the thing it names,
 * and asks `document.querySelector` for each step's own target. A renamed
 * attribute, a target left on a card that only renders with data, or a step
 * pointed at a page that no longer holds it fails here rather than in front of
 * a person halfway through a walkthrough.
 */
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaseEvent, CaseSummary, IsoDate, Snapshot, Task } from '@mortar/core'
import { PERSONA_STAFF, summarizeCases } from '@mortar/core'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { PERSONAS, type Persona } from '@/lib/persona'
import { TOUR_STEPS } from './tourSteps'

const BASE = buildTourSnapshot()
/** The first case still awaiting an SPA appointment: the step the panel opens on. */
const CASE_ID = BASE.cases[0].bookingId

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  return {
    fetchSnapshot: vi.fn(async () => BASE.snapshot),
    fetchHealth: vi.fn(async () => ({ ok: true })),
    fetchSignals: vi.fn(async () => fixture.SIGNALS_9001),
    fetchPlaybooks: vi.fn(async () => fixture.RANKING_9001),
    reviewEvent: vi.fn(async () => ({})),
    extractMessage: vi.fn(async () => ({})),
    postMessage: vi.fn(async () => ({ message: {}, extraction: fixture.EXTRACTION_9001, event: null })),
    postEvent: vi.fn(async () => ({})),
    postApplication: vi.fn(async () => ({})),
    postTask: vi.fn(async () => ({})),
    updateTask: vi.fn(async () => ({})),
    deleteBooking: vi.fn(async () => ({})),
    importBookings: vi.fn(async () => ({ importId: 'IMP-TOUR', bookings: [] })),
    undoImport: vi.fn(async () => ({ removed: [] }))
  }
})

// The date fields open inline: Radix's popover positioning stalls jsdom (see inlinePopover).
vi.mock('@/components/ui/popover', () => import('@/components/bookings/__tests__/inlinePopover'))
vi.mock('@/components/ui/toastConfig', () => ({ notify: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))

import { SnapshotProvider } from '@/lib/data'
import { PersonaProvider } from '@/lib/persona'
import { ThemeProvider } from '@/hooks/useTheme'
import { App } from '@/App'

/**
 * Where a step lands, and what proves it: a link on every page but the case
 * one, and the case page names its booking in the breadcrumb rather than in a
 * heading. The breadcrumb is read on every page because it is the one piece of
 * the shell that has to agree with the route, so an anchor can never be found
 * on a page the walkthrough did not actually reach.
 */
const BREADCRUMB: Record<string, RegExp> = {
  '/chase': /^Today$/,
  '/bookings': /^Bookings$/,
  '/bookings/:id': new RegExp(`^Booking ${CASE_ID}$`),
  '/import': /^Add Bookings$/,
  '/legal': /^Legal$/
}
const PAGE_OF: Record<string, string> = {
  '/chase': 'Today',
  '/bookings': 'Bookings',
  '/bookings/:id': 'The Case Page',
  '/import': 'Add Bookings',
  '/legal': 'Legal'
}

/** The route a step lands on. `TourProvider` resolves `:id` to the first stalled
 * case, so the anchors are checked against the same case the walkthrough opens. */
function entryFor(route: string) {
  return route === '/bookings/:id' ? `/bookings/${CASE_ID}` : route
}

function renderTour(persona: Persona, entry: string) {
  window.localStorage.setItem('mortar.persona', persona)
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ThemeProvider>
        <PersonaProvider>
          <SnapshotProvider>
            <App />
          </SnapshotProvider>
        </PersonaProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('tour anchors', () => {
  beforeAll(() => {
    // Radix places popovers, tooltips and select menus with floating-ui, which
    // needs observers, pointer capture and scrolling that jsdom lacks.
    for (const observer of ['ResizeObserver', 'IntersectionObserver'] as const) {
      vi.stubGlobal(
        observer,
        class {
          observe() {}
          unobserve() {}
          disconnect() {}
        }
      )
    }
    Element.prototype.scrollIntoView = () => {}
    Element.prototype.hasPointerCapture = () => false
    Element.prototype.releasePointerCapture = () => {}
  })

  beforeEach(() => {
    window.localStorage.clear()
  })

  for (const { id: persona } of PERSONAS) {
    for (const [index, step] of TOUR_STEPS[persona].entries()) {
      const name = `${persona} step ${index + 1}: ${step.label}`

      it(`${name} has its anchor on ${PAGE_OF[step.route]}`, async () => {
        renderTour(persona, entryFor(step.route))
        // Both halves wait: the breadcrumb for the route, the target for the
        // data, since a card or a queue only draws once the snapshot has landed.
        await waitFor(
          () => {
            expect(breadcrumbs().at(-1)).toMatch(BREADCRUMB[step.route])
            expect(document.querySelector(step.target), `${name} has no element for ${step.target}`).toBeTruthy()
          },
          { timeout: 5000 }
        )
      })
    }
  }
})

/** The breadcrumb labels the nav is showing, full ones and the mobile short form alike. */
function breadcrumbs() {
  return [...document.querySelectorAll('nav span span')].map((span) => span.textContent ?? '')
}

/**
 * One mocked snapshot, built to draw every anchor: the shared bookings fixture
 * for the ledger and the case page, then the few records the other pages hold
 * back until there is something to show — two stalled cases with next steps for
 * Today's cards, an open task per persona for Open Tasks, and two approved,
 * unsigned cases with a panel firm each, one appointment set and one not.
 */
function buildTourSnapshot(): { snapshot: Snapshot; cases: CaseSummary[] } {
  const shared = buildSnapshot()
  const asOf = shared.meta.referenceDate
  const today = new Date(`${asOf}T00:00:00+08:00`)
  const on = (offset: number): IsoDate => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return date.toISOString().slice(0, 10)
  }

  // Two cases in the legal waiting room, one panel firm each: one still to be
  // scheduled, one whose appointment date has gone by unsigned.
  const legal: { firm: string; appointment: IsoDate | null }[] = [
    { firm: 'Kuan & Teh Advocates', appointment: null },
    { firm: 'Lim Yap & Associates', appointment: on(-40) }
  ]

  const bookings: Snapshot['bookings'] = legal.map((entry, index) => ({
    id: `BK-8${index}01`,
    project: 'Aster Heights',
    unit: `E-0${index + 1}-02`,
    priceRm: 470000 + index * 140000,
    bookingDate: on(-70 - index),
    buyer: {
      name: index === 0 ? 'Siti Hajar Binti Omar' : 'Arjun Pillai',
      ic: `920311-0${index}-0001`,
      phone: `+60 00-000 0${index}01`,
      age: 34 + index,
      grossMonthlyIncomeRm: 8500 + index * 1500,
      monthlyCommitmentsRm: 1200,
      propertiesOwned: 0
    },
    salesOwner: 'Nurul Aina',
    loanOwner: 'Tan Mei Ling',
    legalFirm: entry.firm
  }))

  const events: CaseEvent[] = legal.flatMap((entry, index) => {
    const booked = confirmed('booked', bookings[index].id, bookings[index].bookingDate)
    const approved = confirmed('loan_approved', bookings[index].id, on(-50 - index))
    if (!entry.appointment) return [booked, approved]
    // A date still to come reads as a plan; one long past reads as a chase.
    return [
      booked,
      approved,
      confirmed('spa_appointment_set', bookings[index].id, on(-35), `Appointment On ${entry.appointment}`)
    ]
  })

  // One open task per persona, so Open Tasks is never empty for the reader.
  const tasks: Task[] = legal.map((_, index) => {
    const persona: Persona = index === 0 ? 'legal-admin' : 'loan-admin'
    return {
      id: `TASK-8${index}01`,
      bookingId: bookings[index].id,
      action: 'schedule_spa',
      title: `Book The SPA Appointment For ${bookings[index].id}`,
      ownerRole: persona === 'legal-admin' ? 'legal' : 'loan_admin',
      ownerName: PERSONA_STAFF[persona].name,
      dueOn: on(-3),
      status: 'open',
      origin: 'staff',
      createdAt: `${on(-6)}T09:00:00+08:00`,
      completedAt: null
    }
  })

  const snapshot: Snapshot = {
    ...shared,
    bookings: [...shared.bookings, ...bookings],
    events: [...shared.events, ...events],
    tasks: [...shared.tasks, ...tasks]
  }
  const cases = summarizeCases(
    {
      bookings: snapshot.bookings,
      applications: snapshot.applications,
      events: snapshot.events,
      tasks: snapshot.tasks
    },
    snapshot.meta.referenceDate
  )
  return { snapshot, cases }
}

function confirmed(kind: CaseEvent['kind'], bookingId: string, day: IsoDate, note: string | null = null): CaseEvent {
  return {
    id: `EV-${bookingId}-${kind}`,
    bookingId,
    applicationId: null,
    track: kind === 'booked' ? 'sales' : 'loan',
    kind,
    occurredAt: `${day}T10:00:00+08:00`,
    recordedAt: `${day}T10:05:00+08:00`,
    reportedBy: 'Nurul Aina',
    verifiedBy: 'Nurul Aina',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note
  }
}
