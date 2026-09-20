/**
 * Forecast page — the shared projection, homed to no one desk. Two halves of
 * the same question. Forward: expected SPA signings within 30 days of booking,
 * with a range, stage conversion rates with sample sizes and Wilson intervals,
 * the backtest, the assumptions panel, and Try Another Seed. Backward: where
 * bookings died ranked by what they cost, and the recoverable share of it.
 *
 * Both halves read the same event log through `@mortar/core`, so the count of
 * what signed and the count of what did not cannot drift apart.
 */
import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { HORIZON_DAYS, backtest, forecast, leakage } from '@mortar/core'
import { useSnapshot } from '@/lib/data'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { StageRatesCard } from '@/components/forecast/StageRatesCard'
import { BacktestCard } from '@/components/forecast/BacktestCard'
import { AssumptionsCard } from '@/components/forecast/AssumptionsCard'
import { LeakageCard } from '@/components/forecast/LeakageCard'
import { RecoveryCard } from '@/components/forecast/RecoveryCard'
import { SeedSpreadCard, type SeedRun } from '@/components/forecast/SeedSpreadCard'
import { addDays, altDataset, datasetFor } from '@/components/forecast/forecast'

export function ForecastPage() {
  const { snapshot, loading, error } = useSnapshot()
  const [altRuns, setAltRuns] = useState<SeedRun[]>([])
  const [running, setRunning] = useState(false)

  const result = useMemo(() => {
    if (!snapshot) return null
    const asOf = snapshot.meta.referenceDate
    const data = datasetFor(snapshot)
    return {
      asOf,
      forecast: forecast(data, asOf, { seed: snapshot.meta.seed }),
      leakage: leakage(data, asOf),
      backtest: backtest(data, addDays(asOf, -HORIZON_DAYS))
    }
  }, [snapshot])

  const tryAnotherSeed = () => {
    if (!snapshot) return
    setRunning(true)
    // generate() + forecast() are synchronous; defer one tick so the button shows its busy state.
    setTimeout(() => {
      const seed = snapshot.meta.seed + altRuns.length + 1
      const run = forecast(altDataset(seed, snapshot.meta.referenceDate), snapshot.meta.referenceDate, { seed })
      setAltRuns((prev) => [...prev, { seed, forecast: run }])
      setRunning(false)
    }, 50)
  }

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Forecast</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The SPAs You Can Bank On, And The Ones You Already Lost: Expected Signings Within 30 Days, Then Where Bookings
          Died And What Was Recoverable.
        </p>
      </PageHeaderCard>

      {error ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={error} />
        </div>
      ) : loading && !result ? (
        <div className="mt-4 grid gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-72" />
        </div>
      ) : result ? (
        <>
          <div className="mt-4 flex flex-wrap gap-3">
            <StatCard
              label={`Expected Signings In ${result.forecast.horizonDays} Days`}
              value={String(Math.round(result.forecast.expectedSignings))}
              info="Sum of live signing probabilities."
              exact={result.forecast.expectedSignings.toFixed(1)}
            />
            <StatCard
              label="Forecast Range"
              value={`${result.forecast.rangeLow} – ${result.forecast.rangeHigh}`}
              info="10th – 90th percentile of simulated signings."
            />
            <StatCard
              label="Live Bookings"
              value={String(result.forecast.liveBookings)}
              info="Unsigned and under 30 days old."
            />
          </div>

          <div className="mt-4 grid items-start gap-4 xl:grid-cols-2 [&>*]:min-w-0">
            <LeakageCard leakage={result.leakage} />
            <RecoveryCard leakage={result.leakage} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2 [&>*]:min-w-0">
            <StageRatesCard stageRates={result.forecast.stageRates} />
            <BacktestCard backtest={result.backtest} />
          </div>

          <div className="mt-4 grid items-start gap-4 xl:grid-cols-2 [&>*]:min-w-0">
            <AssumptionsCard />
            <SeedSpreadCard
              canonicalSeed={snapshot?.meta.seed ?? 0}
              runs={[{ seed: snapshot?.meta.seed ?? 0, forecast: result.forecast }, ...altRuns]}
              running={running}
              onTryAnother={tryAnotherSeed}
            />
          </div>
        </>
      ) : null}
    </PageContainer>
  )
}
