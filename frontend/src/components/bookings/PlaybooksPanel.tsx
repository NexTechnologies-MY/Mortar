/**
 * Playbooks panel — ranked staff guidance for the case's current blocker.
 * The default query mirrors the route's blocker rule (an outstanding document
 * first, then stall reasons, then the stage); Jev scores each candidate's fit
 * and the list re-ranks by it. A search box re-queries on submit.
 *
 * The Jev read is cache-first: when the only cached ranking was computed for
 * a different case state the API returns it with `stale: true` and never
 * re-ranks. Rather than show playbooks for a blocker the case no longer has,
 * the panel falls back to the same keyword search locally and labels the
 * ranking as stale.
 */

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import type { CaseSummary, Playbook, PlaybookRanking, ScoreAnswer } from '@mortar/core'
import { searchPlaybooks } from '@mortar/core'
import { JevTag } from '@/components/case/JevTag'
import { ProbabilityBar } from '@/components/case/ProbabilityBar'
import { fetchPlaybooks } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'

const FIT_PRESENTATION: Record<number, { tone: 'positive' | 'warning' | 'neutral'; label: string }> = {
  2: { tone: 'positive', label: 'Direct Fit' },
  1: { tone: 'warning', label: 'Partial Fit' },
  0: { tone: 'neutral', label: 'No Fit' }
}

const STATUS_BADGES: Record<Playbook['status'], string | null> = {
  approved: null,
  draft: 'Draft',
  superseded: 'Superseded',
  retired: 'Retired'
}

/** The default playbooks query for a case: its blocker, as the GET route derives it. */
function blockerQuery(summary: CaseSummary): string {
  const document = summary.outstandingDocuments[0]
  if (document) return `missing ${document.replace(/_/g, ' ')}`
  if (summary.stallReasons.length > 0) return summary.stallReasons.join(' ')
  return `${summary.stage.replace(/_/g, ' ')} follow-up`
}

type Ranked = { playbook: Playbook; keywordScore: number; fit: ScoreAnswer | null }

export function PlaybooksPanel({
  bookingId,
  summary,
  playbooks,
  /** Bumped by the page after every refresh so rankings follow case state. */
  refreshKey
}: {
  bookingId: string
  summary: CaseSummary
  playbooks: Playbook[]
  refreshKey: number
}) {
  const defaultQuery = blockerQuery(summary)
  const [result, setResult] = useState<{ ranking: PlaybookRanking | null; requested: string } | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const byId = useMemo(() => new Map(playbooks.map((p) => [p.id, p])), [playbooks])

  useEffect(() => {
    let live = true
    fetchPlaybooks(bookingId, defaultQuery)
      .then((r) => live && setResult({ ranking: r, requested: defaultQuery }))
      .catch(() => live && setResult({ ranking: null, requested: defaultQuery }))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [bookingId, refreshKey, defaultQuery])

  const search = async () => {
    const requested = query.trim() || defaultQuery
    setLoading(true)
    try {
      setResult({ ranking: await fetchPlaybooks(bookingId, requested), requested })
    } catch {
      setResult({ ranking: null, requested })
    } finally {
      setLoading(false)
    }
  }

  const stale = Boolean(result?.ranking?.meta.stale)
  const shown = useMemo<{ items: Ranked[]; query: string }>(() => {
    const ranking = result?.ranking ?? null
    if (!ranking || !result) return { items: [], query: result?.requested ?? defaultQuery }
    if (ranking.meta.stale) {
      // The cached answer was ranked for a different blocker; keyword-match the
      // current query locally instead of presenting a stale Jev ranking.
      return {
        items: searchPlaybooks(playbooks, result.requested).map((c) => ({ ...c, fit: null })),
        query: result.requested
      }
    }
    const items = ranking.results
      .flatMap((r) => {
        const playbook = byId.get(r.playbookId)
        return playbook ? [{ playbook, keywordScore: r.keywordScore, fit: r.fit }] : []
      })
      .sort((a, b) => (b.fit?.score ?? -1) - (a.fit?.score ?? -1) || b.keywordScore - a.keywordScore)
    return { items, query: ranking.query }
  }, [result, playbooks, byId, defaultQuery])

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Playbooks</h2>
          {result?.ranking && <JevTag meta={result.ranking.meta} />}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void search()
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={shown.query || 'Search Playbooks'}
              className="pl-9"
              aria-label="Search Playbooks"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" disabled={loading}>
            Search
          </Button>
        </form>
        {stale ? (
          <p className="text-[13px] text-muted-foreground">Jev Ranking Stale — Keyword Matches For “{shown.query}”</p>
        ) : (
          shown.query && <p className="text-[13px] text-muted-foreground">Ranked For “{shown.query}”</p>
        )}
        {shown.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{loading ? 'Ranking Playbooks…' : 'No Playbooks Found.'}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.items.map(({ playbook, keywordScore, fit }) => {
              const fitView = fit
                ? FIT_PRESENTATION[Math.round(fit.score)]
                : { tone: 'neutral' as const, label: 'Unscored' }
              const expanded = expandedId === playbook.id
              const statusBadge = STATUS_BADGES[playbook.status]
              return (
                <li key={playbook.id} className="rounded-md border border-border p-3">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-2 text-left"
                    onClick={() => setExpandedId(expanded ? null : playbook.id)}
                    aria-expanded={expanded}
                  >
                    <span className="text-sm font-medium">{playbook.title}</span>
                    <ChevronDown
                      className={cn(
                        'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform',
                        expanded && 'rotate-180'
                      )}
                    />
                  </button>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StatusPill tone={fitView.tone}>{fitView.label}</StatusPill>
                    {statusBadge && <Badge variant="secondary">{statusBadge}</Badge>}
                    <ProbabilityBar probability={keywordScore} />
                  </div>
                  {expanded && (
                    <div className="mt-2 flex flex-col gap-2 text-[13px] text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">Situation: </span>
                        {playbook.situation}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Action: </span>
                        {playbook.action}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Limits: </span>
                        {playbook.limits}
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
