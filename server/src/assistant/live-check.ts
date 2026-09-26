/**
 * One live question through the real handler, for the report. Not a test: it
 * calls Gemini with the key in the environment and prints the answer.
 *
 *   cd server && bun --env-file=../.env run src/assistant/live-check.ts
 *
 * The key is read from the environment and never printed.
 */
import { PLAYBOOKS, REFERENCE_DATE, STORIES, generate, type Snapshot } from '@mortar/core'
import { createApp } from '../app'
import type { CaseData, SimulationMeta } from '@mortar/core'
import type { JevAnswerRow, StoredMeta } from '../../db/mappers'
import type { Database } from '../../db'

const generated = generate({ seed: 20260918, referenceDate: REFERENCE_DATE, bookings: 140 })
const SNAPSHOT: Snapshot = {
  bookings: [...generated.bookings, ...STORIES.map((s) => s.booking)],
  applications: [...generated.applications, ...STORIES.flatMap((s) => s.applications)],
  events: [...generated.events, ...STORIES.flatMap((s) => s.events)],
  messages: STORIES.flatMap((s) => s.messages),
  playbooks: PLAYBOOKS,
  tasks: [],
  extractions: [],
  signals: [],
  nextActions: [],
  meta: { seed: 20260918, referenceDate: REFERENCE_DATE, resetAt: null }
}

const noWrites = (name: string) => async () => {
  throw new Error(`live check: the assistant tried to ${name}`)
}

const db = {
  ping: async () => {},
  hasBookings: async () => true,
  meta: async (): Promise<StoredMeta> => ({ ...SNAPSHOT.meta, resetAtWall: null }),
  caseData: async (): Promise<CaseData> => ({
    bookings: SNAPSHOT.bookings,
    applications: SNAPSHOT.applications,
    events: SNAPSHOT.events,
    tasks: SNAPSHOT.tasks
  }),
  snapshot: async () => SNAPSHOT,
  getBooking: async () => null,
  getApplication: async () => null,
  getMessage: async () => null,
  getEvent: async () => null,
  messagesForBooking: async (id: string) => SNAPSHOT.messages.filter((m) => m.bookingId === id),
  eventsForMessage: async () => [],
  eventsForBooking: async (id: string) => SNAPSHOT.events.filter((e) => e.bookingId === id),
  listPlaybooks: async () => SNAPSHOT.playbooks,
  latestJevAnswers: async (): Promise<JevAnswerRow[]> => [],
  jevAnswerCount: async () => 0,
  insertMessage: noWrites('log a message'),
  insertEvent: noWrites('record an update'),
  insertApplication: noWrites('submit to a bank'),
  reviewEvent: noWrites('review an update'),
  replaceProposal: noWrites('replace a proposal'),
  insertTask: noWrites('raise a task'),
  importBookings: noWrites('import a booking'),
  undoImport: noWrites('undo an import'),
  updateTaskStatus: noWrites('close a task'),
  jevGet: async () => null,
  jevPut: async () => {}
} as unknown as Database

const jev = {
  extract: async () => {
    throw new Error('live check: Jev is not involved')
  },
  nextAction: async () => {
    throw new Error('live check: Jev is not involved')
  },
  rankPlaybooks: async () => {
    throw new Error('live check: Jev is not involved')
  },
  signals: async () => {
    throw new Error('live check: Jev is not involved')
  }
} as unknown as Parameters<typeof createApp>[0]['jev']

const question = process.argv[2] ?? 'Which of my bookings are stuck with the bank?'
const persona = (process.argv[3] ?? 'loan-admin') as 'sales-admin' | 'loan-admin' | 'legal-admin'

const app = createApp({
  db,
  jev,
  reset: async (): Promise<SimulationMeta> => SNAPSHOT.meta,
  assistant: { apiKey: process.env.GEMINI_API_KEY || null, model: process.env.GEMINI_MODEL || undefined }
})

const res = await app.fetch(
  new Request('http://localhost/api/assistant', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify({ question, persona })
  })
)
if (!res) throw new Error('live check: the route did not answer')
const payload = (await res.json()) as { answer?: string; citations?: string[]; error?: string }
console.log(`status: ${res.status}`)
if (res.status !== 200) {
  console.log(`error:  ${payload.error ?? JSON.stringify(payload)}`)
} else {
  console.log(`asked:  "${question}" as ${persona}`)
  console.log(`answer: ${payload.answer}`)
  console.log(`cited:  ${(payload.citations ?? []).join(', ')}`)
}
