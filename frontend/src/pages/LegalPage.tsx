/**
 * Legal page — the Legal Admin home desk. Everything sitting between loan
 * approval and a signed SPA: how long it has sat, which panel firm has it, and
 * what it is holding up.
 *
 * This desk exists because the stretch it covers was measured nowhere. The
 * loan side is well instrumented — outstanding documents, undecided banks — but
 * a case that reaches `lo_issued` and stops had no clock on it at all, and the
 * longest-sitting ones were hidden behind the forecast's 30-day horizon.
 */
import { useMemo } from 'react'
import { Banknote, CalendarClock, FileSignature, Hourglass, ScrollText, SearchX } from 'lucide-react'
import { useCases, useSnapshot } from '@/lib/data'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRm, formatRmCompact } from '@/components/case'
import { LegalQueueTable } from '@/components/legal/LegalQueueTable'
import { FirmLoadCard } from '@/components/legal/FirmLoadCard'
import { firmLoad, isLegalStall, legalQueue } from '@/components/legal/legal'

export function LegalPage() {
  const { snapshot, loading, error } = useSnapshot()
  const cases = useCases()

  const rows = useMemo(() => legalQueue(snapshot?.bookings ?? [], cases, snapshot?.events ?? []), [snapshot, cases])
  const firms = useMemo(() => firmLoad(rows), [rows])

  const flagged = rows.filter((r) => r.summary.stallReasons.some(isLegalStall)).length
  const longest = rows.reduce((max, r) => Math.max(max, r.summary.daysSinceLoIssued ?? 0), 0)
  const valueHeld = rows.reduce((sum, r) => sum + r.booking.priceRm, 0)
  const unscheduled = rows.filter((r) => r.summary.daysSinceSpaSet === null).length

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Legal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What Is Sitting Between An Approved Loan And A Signed SPA, With Whom, And For How Long.
        </p>
      </PageHeaderCard>

      {error ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={error} />
        </div>
      ) : loading && !snapshot ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-3">
            <StatCard
              label="Awaiting SPA"
              icon={ScrollText}
              value={String(rows.length)}
              info="Bookings with an approved loan and no signed SPA."
            />
            <StatCard
              label="Past The Threshold"
              icon={FileSignature}
              value={String(flagged)}
              info="Awaiting bookings that have tripped a legal stall rule."
              tone={flagged > 0 ? 'alert' : 'default'}
            />
            <StatCard
              label="Longest Wait"
              icon={Hourglass}
              value={longest > 0 ? `${longest} d` : '—'}
              info="Days since the loan was approved on the oldest case here."
            />
            <StatCard
              label="Value Held"
              icon={Banknote}
              value={formatRmCompact(valueHeld)}
              info="Sum of the prices of every booking awaiting its SPA."
              exact={formatRm(valueHeld)}
            />
          </div>

          {rows.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={CalendarClock}
                title="Nothing Waiting On The Lawyers"
                description="No Booking Is Sitting Between Loan Approval And A Signed SPA."
              />
            </div>
          ) : (
            <>
              <section className="mt-6">
                <h2 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Sitting With The Lawyers
                  <InfoTooltip text="Longest Wait First Until You Sort A Column. Rows Open The Case File." />
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {unscheduled > 0
                    ? `${unscheduled} of these have no SPA appointment on the log at all.`
                    : 'Every case here has an appointment on the log.'}
                </p>
                <div className="mt-3">
                  <LegalQueueTable rows={rows} />
                </div>
              </section>

              <section className="mt-8">
                <FirmLoadCard firms={firms} />
              </section>
            </>
          )}
        </>
      )}
    </PageContainer>
  )
}
