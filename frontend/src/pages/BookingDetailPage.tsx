/**
 * Booking detail route — the case page for one unit booking.
 * Header with stage, risk and owners; loan and legal timelines plus sales
 * events; applications with derived status; the message log with Jev
 * proposals and review actions; the Add Message form; playbooks ranked by
 * Jev fit; buyer signals; tasks; and the full evidence log.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { PERSONA_STAFF, type BuyerSignals } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { fetchSignals } from '@/lib/api'
import { PageContainer } from '@/components/layout/PageContainer'
import { AddMessageForm } from '@/components/bookings/AddMessageForm'
import { ApplicationsCard } from '@/components/bookings/ApplicationsCard'
import { CaseHeader } from '@/components/bookings/CaseHeader'
import { EvidenceLog } from '@/components/bookings/EvidenceLog'
import { MessagesPanel } from '@/components/bookings/MessagesPanel'
import { PlaybooksPanel } from '@/components/bookings/PlaybooksPanel'
import { SignalsPanel } from '@/components/bookings/SignalsPanel'
import { TasksPanel } from '@/components/bookings/TasksPanel'
import { TrackTimelines } from '@/components/bookings/TrackTimelines'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'

export function BookingDetailPage() {
  const { id } = useParams()
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { persona } = usePersona()
  const reviewer = PERSONA_STAFF[persona].name

  const [refreshKey, setRefreshKey] = useState(0)
  const [fetchedSignals, setFetchedSignals] = useState<BuyerSignals | null>(null)

  /** Mutations toast then re-fetch the snapshot; the bump re-runs cache-first reads. */
  const onChanged = useCallback(async () => {
    await refresh()
    setRefreshKey((k) => k + 1)
  }, [refresh])

  useEffect(() => {
    if (!id || !snapshot || !snapshot.bookings.some((b) => b.id === id)) return
    // No buyer messages means there is nothing for Jev to read; the route
    // guards the same way, so the panel shows the empty-history note instead.
    if (!snapshot.messages.some((m) => m.bookingId === id && m.senderRole === 'buyer')) return
    let live = true
    fetchSignals(id)
      .then((signals) => {
        if (live) setFetchedSignals(signals)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [id, refreshKey, snapshot])

  const data = useMemo(() => {
    if (!snapshot || !id) return null
    const booking = snapshot.bookings.find((b) => b.id === id)
    const summary = cases.find((c) => c.bookingId === id)
    if (!booking || !summary) return null
    return {
      booking,
      summary,
      applications: snapshot.applications.filter((a) => a.bookingId === id),
      events: snapshot.events.filter((e) => e.bookingId === id),
      messages: snapshot.messages.filter((m) => m.bookingId === id),
      tasks: snapshot.tasks.filter((t) => t.bookingId === id),
      extractions: new Map(snapshot.extractions.map((e) => [e.messageId, e])),
      signals: snapshot.signals.find((s) => s.bookingId === id) ?? fetchedSignals,
      playbooks: snapshot.playbooks
    }
  }, [snapshot, cases, id, fetchedSignals])

  return (
    <PageContainer>
      {loading && !snapshot ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-md" />
          <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Skeleton className="h-96 rounded-md" />
            <Skeleton className="h-96 rounded-md" />
          </div>
        </div>
      ) : error && !snapshot ? (
        <div className="mt-4">
          <EmptyState icon={FileText} title="Booking Could Not Load" description={error} />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={() => void refresh()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : !data ? (
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="Booking Not Found"
            description={`No Booking Matches ${id ?? '—'} In The Current Snapshot.`}
          />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" asChild>
              <Link to="/bookings">Back To Bookings</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <CaseHeader booking={data.booking} summary={data.summary} />
          <div className="mt-4">
            <TrackTimelines events={data.events} />
          </div>
          <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              <MessagesPanel
                messages={data.messages}
                extractions={data.extractions}
                events={data.events}
                reviewer={reviewer}
                onChanged={onChanged}
                footer={
                  <AddMessageForm
                    booking={data.booking}
                    banker={data.applications[data.applications.length - 1]?.banker}
                    onAdded={onChanged}
                  />
                }
              />
              <ApplicationsCard applications={data.applications} summary={data.summary} />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <PlaybooksPanel
                bookingId={data.booking.id}
                summary={data.summary}
                playbooks={data.playbooks}
                refreshKey={refreshKey}
              />
              <SignalsPanel
                signals={data.signals}
                hasBuyerMessages={data.messages.some((m) => m.senderRole === 'buyer')}
              />
              <TasksPanel tasks={data.tasks} onChanged={onChanged} />
            </div>
          </div>
          <div className="mt-4">
            <EvidenceLog events={data.events} />
          </div>
        </>
      )}
    </PageContainer>
  )
}
