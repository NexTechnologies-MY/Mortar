/**
 * `bun run jev:precompute`: call Jev live for the canonical dataset and write
 * `server/fixtures/jev-cache.json` (`JevCacheEntry[]`), which the reset route
 * loads as `precomputed` answers. Covers every fixture message (extract), each
 * story booking (signals, next action, default-query playbooks) and up to 25
 * stalled generated bookings (next action).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TypeSafeClient } from '@typesafe-ai/sdk'
import type { Questions, SystemOneRequest } from '@typesafe-ai/sdk'
import {
  DEFAULT_SEED,
  PLAYBOOKS,
  REFERENCE_DATE,
  STORIES,
  generate,
  searchPlaybooks,
  summarizeCases
} from '@mortar/core'
import type { CaseSummary, JevCache, JevCacheEntry, JevKind, Task } from '@mortar/core'
import { createJevService, defaultPlaybookQuery } from '../src/index'

const MAX_CALLS = 120
const STALLED_NEXT_ACTION_LIMIT = 25

const scriptDir = dirname(fileURLToPath(import.meta.url))
if (!process.env.TYPESAFE_API_KEY) {
  try {
    for (const line of (await readFile(join(scriptDir, '..', '..', '..', '.env'), 'utf8')).split('\n')) {
      const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
      if (match && !(match[1] in process.env)) process.env[match[1]] = match[2]
    }
  } catch {
    // Fall through to the key check below.
  }
}
const apiKey = process.env.TYPESAFE_API_KEY
if (!apiKey) {
  console.error('jev:precompute needs TYPESAFE_API_KEY in the environment or .env')
  process.exit(1)
}

const stats = { calls: 0, failures: 0, inputTokens: 0, outputTokens: 0 }
const client = new TypeSafeClient({ apiKey, retry: { maxRetries: 0 } })
const metered: Pick<TypeSafeClient, 'systemOne'> = {
  systemOne: <Q extends Questions>(request: SystemOneRequest<Q>) => {
    const promise = client.systemOne(request)
    void promise.then(
      (result) => {
        stats.calls += 1
        stats.inputTokens += result.usage.input_tokens
        stats.outputTokens += result.usage.output_tokens
      },
      () => {
        stats.failures += 1
      }
    )
    return promise
  }
}

class CollectingCache implements JevCache {
  readonly entries: JevCacheEntry[] = []
  get<T>(): Promise<{ answer: T; stale: boolean } | null> {
    return Promise.resolve(null)
  }
  put<T>(kind: JevKind, subjectId: string, inputHash: string, answer: T, latencyMs: number): Promise<void> {
    this.entries.push({ kind, subjectId, inputHash, answer, latencyMs })
    return Promise.resolve()
  }
}

const generated = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })
const caseData = {
  bookings: [...generated.bookings, ...STORIES.map((story) => story.booking)],
  applications: [...generated.applications, ...STORIES.flatMap((story) => story.applications)],
  events: [...generated.events, ...STORIES.flatMap((story) => story.events)],
  tasks: [] as Task[]
}
const summaries = new Map(summarizeCases(caseData, REFERENCE_DATE).map((summary) => [summary.bookingId, summary]))

function summaryOf(bookingId: string): CaseSummary {
  const summary = summaries.get(bookingId)
  if (!summary) throw new Error(`no case summary for ${bookingId}`)
  return summary
}

const cache = new CollectingCache()
const jev = createJevService({ client: metered, cache })

async function logged(label: string, run: () => Promise<unknown>) {
  const before = cache.entries.length
  const startedAt = Date.now()
  const result = await run()
  const entry = cache.entries[before]
  const ms = entry ? entry.latencyMs : Date.now() - startedAt
  const meta = (result as { meta?: { source?: string } }).meta
  console.log(`${label} → ${meta?.source ?? 'done'} ${ms ?? '?'}ms`)
}

for (const story of STORIES) {
  const summary = summaryOf(story.booking.id)
  for (const message of story.messages) {
    await logged(`extract ${message.id} (${story.booking.id})`, () => jev.extract({ message, summary }))
  }
}

for (const story of STORIES) {
  const summary = summaryOf(story.booking.id)
  const query = defaultPlaybookQuery(summary)
  await logged(`signals ${story.booking.id}`, () =>
    jev.signals({ bookingId: story.booking.id, messages: story.messages })
  )
  await logged(`next_action ${story.booking.id}`, () =>
    jev.nextAction({ summary, recentMessages: story.messages.slice(-3) })
  )
  await logged(`playbooks ${story.booking.id} "${query}"`, () =>
    jev.rankPlaybooks({ summary, query, candidates: searchPlaybooks(PLAYBOOKS, query) })
  )
}

const stalledGenerated = [...summaries.values()]
  .filter((summary) => summary.bookingId < 'BK-9000' && summary.stallReasons.length > 0)
  .slice(0, STALLED_NEXT_ACTION_LIMIT)
for (const summary of stalledGenerated) {
  await logged(`next_action ${summary.bookingId}`, () => jev.nextAction({ summary, recentMessages: [] }))
}

const outPath = join(scriptDir, '..', '..', '..', 'server', 'fixtures', 'jev-cache.json')
await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, `${JSON.stringify(cache.entries, null, 2)}\n`)

console.log(
  `wrote ${cache.entries.length} entries to ${relative(process.cwd(), outPath)}; ` +
    `${stats.calls} calls, ${stats.inputTokens} input + ${stats.outputTokens} output tokens` +
    (stats.failures > 0 ? `; ${stats.failures} calls failed` : '')
)
if (stats.calls > MAX_CALLS) {
  console.warn(`call budget exceeded: ${stats.calls} > ${MAX_CALLS}`)
  process.exit(1)
}
