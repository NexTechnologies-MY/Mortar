/**
 * Ask: matching a typed question to one of the scripted answers.
 *
 * Keyword score alone does not work here. Measured over this question set,
 * "what is the weather" scores roughly twice a correct paraphrase, because
 * MiniSearch sums per-term scores with no length normalisation and a long
 * off-topic query beats a short on-topic one. So the gate is how much of the
 * question actually matched — the score is only a secondary filter — and a
 * miss returns null rather than the best weak guess.
 */
import MiniSearch from 'minisearch'
import type { AskContext, AskQuestion, AskReply, Persona, Snapshot } from '../types'
import { summarizeCases } from '../sim'
import { forecast } from '../sim'
import { ASK_QUESTIONS } from './questions'

export { ASK_QUESTIONS } from './questions'
export { isLive } from './helpers'

/** Words that carry no topic, dropped before coverage is measured. */
const STOPWORDS = new Set([
  'a',
  'about',
  'all',
  'am',
  'an',
  'and',
  'any',
  'anything',
  'are',
  'as',
  'at',
  'be',
  'been',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'for',
  'from',
  'get',
  'give',
  'got',
  'has',
  'have',
  'how',
  'i',
  'in',
  'is',
  'it',
  'its',
  'many',
  'me',
  'much',
  'my',
  'now',
  'of',
  'on',
  'or',
  'our',
  'out',
  'please',
  'show',
  'so',
  'some',
  'tell',
  'that',
  'the',
  'their',
  'them',
  'there',
  'these',
  'they',
  'this',
  'to',
  'us',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'would',
  'you',
  'your'
])

/** At least half the question's content words must match a scripted one. */
const MIN_COVERAGE = 0.5

/** A secondary floor, below which even a covered match is too thin to trust. */
const MIN_SCORE = 5

/** Content words: lowercase, three characters or more, and not a stopword. */
export function contentWords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word))
}

/**
 * Built once: the question set is a module constant, unlike the playbooks
 * `searchPlaybooks` indexes fresh on every call because they come from the
 * database.
 */
let index: MiniSearch | null = null

function questionIndex(): MiniSearch {
  if (index) return index
  const built = new MiniSearch({
    fields: ['question', 'tags'],
    searchOptions: {
      boost: { tags: 3 },
      // Short tokens must match outright; letting them prefix- or fuzzy-match
      // is what turns "hi" into "highest".
      prefix: (term) => term.length >= 4,
      fuzzy: (term) => (term.length >= 5 ? 0.2 : false)
    }
  })
  built.addAll(ASK_QUESTIONS.map((q) => ({ id: q.id, question: q.question, tags: q.tags.join(' ') })))
  index = built
  return built
}

/** The share of the query's content words that reached the matched question. */
function coverage(words: string[], matched: string[]): number {
  if (words.length === 0) return 0
  const hits = words.filter((word) => matched.some((term) => term.startsWith(word) || word.startsWith(term)))
  return hits.length / words.length
}

/** Everything a scripted answer reads. Build once per snapshot and memoize it. */
export function buildAskContext(snapshot: Snapshot): AskContext {
  const cases = summarizeCases(
    {
      bookings: snapshot.bookings,
      applications: snapshot.applications,
      events: snapshot.events,
      tasks: snapshot.tasks
    },
    snapshot.meta.referenceDate
  )
  return { snapshot, cases, forecast: forecast(snapshot, snapshot.meta.referenceDate) }
}

/** The question a query resolves to, or `null` when nothing is a confident fit. */
export function matchQuestion(query: string): AskQuestion | null {
  const words = contentWords(query)
  if (words.length === 0) return null
  const ranked = questionIndex()
    .search(query)
    .filter((hit) => hit.score >= MIN_SCORE)
    .map((hit) => ({ id: hit.id as string, score: hit.score, covered: coverage(words, hit.terms) }))
    .filter((hit) => hit.covered >= MIN_COVERAGE)
    // Coverage outranks score: a question the whole query reached beats one a
    // single boosted tag happened to score highly on.
    .sort((a, b) => b.covered - a.covered || b.score - a.score)
  const best = ranked[0]
  return best ? (ASK_QUESTIONS.find((q) => q.id === best.id) ?? null) : null
}

/** Answer a typed question, or `null` when Ask cannot answer it. */
export function askBrain(query: string, context: AskContext): AskReply | null {
  const question = matchQuestion(query)
  return question ? question.answer(context) : null
}

/** The chips a desk sees: its own questions first, then everyone else's. */
export function suggestedQuestions(desk: Persona): AskQuestion[] {
  const rank = (q: AskQuestion) => (q.desk === desk ? 0 : q.desk === 'all' ? 1 : 2)
  return [...ASK_QUESTIONS].sort((a, b) => rank(a) - rank(b))
}
