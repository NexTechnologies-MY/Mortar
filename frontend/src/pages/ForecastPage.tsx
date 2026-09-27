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
import { ForecastDocuments } from '@/components/forecast/ForecastDocuments'
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
          <section className="mt-5" aria-label="Forecast answer">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Expected within {result.forecast.horizonDays} days
            </p>
            <div className="flex flex-wrap gap-3">
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
            </div>
          </section>

          <ForecastDocuments
            documents={[
              {
                title: 'Expected Signings',
                summary: 'The forecast range and the live bookings counted in this estimate.',
                content: (
                  <div className="flex flex-wrap gap-3">
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
                      label="Bookings In The Forecast"
                      value={String(result.forecast.liveBookings)}
                      info="Unsigned and under 30 days old."
                    />
                  </div>
                )
              },
              {
                title: 'Where Bookings Leak',
                summary: 'Cancellations and lapses, ranked by the value they take out of the pipeline.',
                content: <LeakageCard leakage={result.leakage} />
              },
              {
                title: 'What Recovery Is Worth',
                summary: 'The estimated value of giving rejected loan applications another route.',
                content: <RecoveryCard leakage={result.leakage} />
              },
              {
                title: 'Stage Conversion Rates',
                summary: 'How often resolved bookings at each stage went on to sign.',
                content: <StageRatesCard stageRates={result.forecast.stageRates} />
              },
              {
                title: 'How Well The Method Backtests',
                summary: 'A historical accuracy check of the simulation method.',
                content: <BacktestCard backtest={result.backtest} />
              },
              {
                title: 'Assumptions',
                summary: 'The working assumptions used to make this forecast.',
                content: <AssumptionsCard />
              },
              {
                title: 'Seed Spread',
                summary: 'How the answer moves when the same method runs on another simulation.',
                content: (
                  <SeedSpreadCard
                    canonicalSeed={snapshot?.meta.seed ?? 0}
                    runs={[{ seed: snapshot?.meta.seed ?? 0, forecast: result.forecast }, ...altRuns]}
                    running={running}
                    onTryAnother={tryAnotherSeed}
                  />
                )
              }
            ]}
          />
        </>
      ) : null}
    </PageContainer>
  )
}
