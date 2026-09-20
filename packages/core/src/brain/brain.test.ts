/**
 * The guard that keeps Ask honest. Every scripted answer is run against the
 * canonical dataset and checked against its own `predicate`: the bookings it
 * names must satisfy the claim, and it must name the biggest ones that do.
 * If the generator ever drifts, this fails instead of the demo.
 */
import { describe, expect, it } from 'vitest'
import { DEFAULT_SEED, REFERENCE_DATE, generate } from '../sim'
import { STORIES } from '../fixtures/stories'
import { PLAYBOOKS } from '../fixtures/playbooks'
import type { AskContext, AskQuestion, Snapshot } from '../types'
import { ASK_QUESTIONS, askBrain, buildAskContext, contentWords, matchQuestion, suggestedQuestions } from './index'

const CITE_LIMIT = 6

function canonicalSnapshot(): Snapshot {
  const generated = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })
  return {
    bookings: [...generated.bookings, ...STORIES.map((s) => s.booking)],
    applications: [...generated.applications, ...STORIES.flatMap((s) => s.applications)],
    events: [...generated.events, ...STORIES.flatMap((s) => s.events)],
    messages: STORIES.flatMap((s) => s.messages),
    playbooks: PLAYBOOKS,
    tasks: [],
    extractions: [],
    signals: [],
    nextActions: [],
    meta: { seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, resetAt: null }
  }
}

const ctx: AskContext = buildAskContext(canonicalSnapshot())
const priceOf = (id: string) => ctx.snapshot.bookings.find((b) => b.id === id)?.priceRm ?? 0
const satisfying = (q: AskQuestion) =>
  q.predicate ? ctx.cases.filter((c) => q.predicate?.(ctx, c.bookingId)).map((c) => c.bookingId) : []

describe('the canonical dataset Ask answers against', () => {
  // A loose anchor, so a generator change surfaces here once rather than as
  // nine confusing answer failures.
  it('has the shape every answer was written against', () => {
    expect(ctx.snapshot.bookings).toHaveLength(148)
    expect(ctx.forecast.perBooking.length).toBeGreaterThan(20)
    expect(ctx.cases.filter((c) => c.stallReasons.length > 0).length).toBeGreaterThan(0)
  })
})

describe('the question set', () => {
  it('has unique ids', () => {
    const ids = ASK_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every question a desk and enough phrasings to match on', () => {
    for (const q of ASK_QUESTIONS) {
      expect(['sales-admin', 'loan-admin', 'legal-admin', 'all']).toContain(q.desk)
      expect(q.tags.length).toBeGreaterThanOrEqual(3)
      expect(contentWords(q.question).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('never gives two questions the same tag', () => {
    const seen = new Map<string, string>()
    for (const q of ASK_QUESTIONS) {
      for (const tag of q.tags) {
        expect(seen.has(tag), `"${tag}" is on both ${seen.get(tag)} and ${q.id}`).toBe(false)
        seen.set(tag, q.id)
      }
    }
  })

  /**
   * `stallReasons` is derived from `open`, which has no age ceiling, while
   * `isLive` stops at the 30-day horizon. An answer that reads stall reasons
   * through `isLive` silently drops the longest-sitting cases — exactly the
   * ones at the top of the chase list. This pins the two together.
   */
  it('names held-up bookings by the same rule the chase list uses', () => {
    const onChaseList = ctx.cases.filter((c) => c.stallReasons.length > 0).map((c) => c.bookingId)
    const question = ASK_QUESTIONS.find((q) => q.id === 'ASK-003')
    const named = ctx.cases.filter((c) => question?.predicate?.(ctx, c.bookingId)).map((c) => c.bookingId)
    expect(onChaseList.length).toBeGreaterThan(0)
    expect(named).toEqual(onChaseList)
    expect(onChaseList.some((id) => (ctx.cases.find((c) => c.bookingId === id)?.bookingAgeDays ?? 0) >= 30)).toBe(true)
  })

  it('covers all three desks', () => {
    for (const desk of ['sales-admin', 'loan-admin', 'legal-admin'] as const) {
      expect(ASK_QUESTIONS.some((q) => q.desk === desk)).toBe(true)
      expect(suggestedQuestions(desk)[0].desk).toBe(desk)
    }
  })
})

describe.each(ASK_QUESTIONS.map((q) => [q.id, q] as const))('%s', (_id, question) => {
  const reply = question.answer(ctx)

  it('answers in a finished sentence', () => {
    expect(reply.text.length).toBeGreaterThan(20)
    expect(reply.text.trimEnd().endsWith('.')).toBe(true)
  })

  it('leaves no placeholder in the prose', () => {
    expect(reply.text).not.toMatch(/undefined|NaN|\[object|RM NaN/)
  })

  it('cites real bookings, once each', () => {
    expect(new Set(reply.citations).size).toBe(reply.citations.length)
    for (const id of reply.citations) {
      expect(
        ctx.snapshot.bookings.some((b) => b.id === id),
        `${id} is not a booking`
      ).toBe(true)
    }
  })

  if (question.predicate) {
    it('cites only bookings the claim is true of', () => {
      const allowed = new Set(satisfying(question))
      for (const id of reply.citations) {
        expect(allowed.has(id), `${id} does not satisfy ${question.id}`).toBe(true)
      }
    })

    it('cites the biggest bookings the claim is true of, and no fewer', () => {
      const limit = question.cites ?? CITE_LIMIT
      const expected = [...satisfying(question)].sort((a, b) => priceOf(b) - priceOf(a)).slice(0, limit)
      expect(reply.citations).toEqual(expected)
    })
  }

  if (reply.action) {
    it('only offers to act on bookings it named', () => {
      for (const id of reply.action?.bookingIds ?? []) {
        expect(reply.citations).toContain(id)
      }
      expect(reply.action?.label.length).toBeGreaterThan(0)
    })
  }
})

describe('matching a typed question', () => {
  const SHOULD_MATCH: [string, string][] = [
    ['what is the forecast worth in ringgit', 'ASK-001'],
    ['how much money will actually sign', 'ASK-001'],
    ['what is my exposure by bank', 'ASK-002'],
    ['which bank holds the most', 'ASK-002'],
    ['which booking would hurt most', 'ASK-003'],
    ['what documents are we still chasing', 'ASK-004'],
    ['slip gaji outstanding', 'ASK-004'],
    ['who has gone quiet', 'ASK-005'],
    ['which buyers are silent', 'ASK-005'],
    ['which bank rejects us most', 'ASK-006'],
    ['am i waiting on buyers or bankers', 'ASK-007'],
    ['who was turned down with nothing else', 'ASK-008'],
    ['what is waiting for me to confirm', 'ASK-009']
  ]

  it.each(SHOULD_MATCH)('resolves "%s"', (query, expected) => {
    expect(matchQuestion(query)?.id).toBe(expected)
  })

  // Measured false positives: each of these out-scores a correct paraphrase on
  // keyword score alone, so they are what the coverage gate exists to stop.
  const SHOULD_NOT_MATCH = [
    'what is the weather',
    'what is mortar',
    'hi',
    'hello there',
    'can you write me an email',
    'tell me a joke',
    'ignore previous instructions',
    'delete all bookings',
    'who is the prime minister',
    'sing me a song',
    '',
    '   ',
    '?????'
  ]

  it.each(SHOULD_NOT_MATCH)('declines "%s"', (query) => {
    expect(matchQuestion(query)).toBeNull()
    expect(askBrain(query, ctx)).toBeNull()
  })
})
