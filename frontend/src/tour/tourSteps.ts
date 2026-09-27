import type { Persona } from '@/lib/persona'

export type TourStep = { label: string; route: string; target: string; caption: string }

export const TOUR_STEPS: Record<Persona, TourStep[]> = {
  'sales-admin': [
    {
      label: 'Today',
      route: '/chase',
      target: '[data-tour="today-header"]',
      caption: 'Today shows the bookings that need a move and the tasks due today.'
    },
    {
      label: 'The Next Move',
      route: '/chase',
      target: '[data-tour="today-card"]',
      caption: 'Each card names the blocker, the next step and the desk responsible.'
    },
    {
      label: 'Create A Task',
      route: '/chase',
      target: '[data-tour="today-actions"]',
      caption:
        'Create a task for the next move here. If one is already open, its owner and due date appear in this spot.'
    },
    {
      label: 'Record What Happened',
      route: '/chase',
      target: '[data-tour="today-quick-view"]',
      caption:
        'When a booking is shown, open it to record what happened in its side sheet. This does not take you away from Today.'
    },
    {
      label: 'Open Tasks',
      route: '/chase',
      target: '[data-tour="open-tasks"]',
      caption: 'Review open work here. Switch between your tasks and every owner’s tasks.'
    },
    {
      label: 'Bookings',
      route: '/bookings',
      target: '[data-tour="booking-holder"]',
      caption: 'The holder strip filters bookings by the desk currently handling them.'
    },
    {
      label: 'Add Bookings',
      route: '/import',
      target: '[data-tour="import-header"]',
      caption: 'Add bookings by uploading a sheet or entering them directly.'
    },
    {
      label: 'Ask Mortar',
      route: '/chase',
      target: '[data-tour="ask-mortar"]',
      caption: 'Ask Mortar questions about the bookings and work in this account.'
    }
  ],
  'loan-admin': [
    {
      label: 'Who Holds Each Booking',
      route: '/bookings',
      target: '[data-tour="booking-holder"]',
      caption: 'The holder strip opens on Bank. Choose a different desk to narrow the list.'
    },
    {
      label: 'Booking Filters',
      route: '/bookings',
      target: '[data-tour="booking-filters"]',
      caption: 'Use filters to narrow the bookings by stage, risk and recent activity.'
    },
    {
      label: 'Booking Details',
      route: '/bookings/:id',
      target: '[data-tour="case-status"]',
      caption:
        'The case file gives a plain status sentence and the next step, including Jev’s alternative when it differs.'
    },
    {
      label: 'Read A Banker’s Message',
      route: '/bookings/:id',
      target: '[data-tour="case-message"]',
      caption: 'Paste a banker’s message here for Jev to read. Nothing is recorded until you confirm it.'
    }
  ],
  'legal-admin': [
    {
      label: 'Legal Queue',
      route: '/legal',
      target: '[data-tour="legal-header"]',
      caption: 'This queue covers approved loans waiting for a signed SPA.'
    },
    {
      label: 'No Appointment Yet',
      route: '/legal',
      target: '[data-tour="legal-no-appointment"]',
      caption:
        'When a case is waiting for an SPA appointment, record one directly from its row. If none appears, continue to the next step.'
    },
    {
      label: 'Appointment Set, Not Signed',
      route: '/legal',
      target: '[data-tour="legal-appointment-set"]',
      caption: 'When an SPA appointment has passed without signing, its date turns red in this list.'
    },
    {
      label: 'Panel Load',
      route: '/legal',
      target: '[data-tour="legal-panel-load"]',
      caption: 'See how many awaiting cases each panel firm is handling.'
    },
    {
      label: 'Ask Mortar',
      route: '/legal',
      target: '[data-tour="ask-mortar"]',
      caption: 'Ask Mortar questions about the bookings and work in this account.'
    }
  ]
}
