/**
 * Forecast page — the shared projection, homed to no one desk. The answer sits
 * on the page: expected SPA signings within 30 days of booking, the range, and
 * how many bookings it counts. The detail behind it is a stack of documents
 * (#54): where bookings leak and what recovery is worth, stage conversion
 * rates, the backtest, the assumptions, and for the Manager the seed spread.
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
import { ForecastDocuments, type ForecastDocument } from '@/components/forecast/ForecastDocuments'
import { usePersona } from '@/lib/persona'
import { addDays, altDataset, datasetFor } from '@/components/forecast/forecast'
import { formatDate } from '@/components/case/format'

export function ForecastPage() {
  const { persona } = usePersona()
  const { snapshot, loading, error } = useSnapshot()
  const forecastModel = snapshot?.forecastModel
  const [altRuns, setAltRuns] = useState<SeedRun[]>([])
  const [running, setRunning] = useState(false)

  const result = useMemo(() => {
    if (!snapshot) return null
    const asOf = snapshot.meta.referenceDate
    const data = datasetFor(snapshot)
    return {
      asOf,
      forecast: forecast(data, asOf, { seed: snapshot.meta.seed, model: snapshot.forecastModel }),
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
          Expected SPA signings within 30 days of booking
          {forecastModel ? `, based on past bookings up to ${formatDate(forecastModel.refreshedAt)}.` : '.'}
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
            {result.forecast.support === 'insufficient-history' ? (
              <p role="status" className="mb-3 text-sm text-muted-foreground">
                A forecast is unavailable because there is not enough resolved booking history yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            )}
          </section>

          <ForecastDocuments
            documents={[
              {
                title: 'Where Bookings Leak',
                summary:
                  'Where bookings stop short of a signed SPA, ranked by the value each stage loses, and what a second bank could win back.',
                motif: '/forecast/leak.webp',
                question:
                  'Where are our bookings leaking before the SPA is signed? Which stage loses the most value, and how much could we recover?',
                content: (
                  <>
                    <LeakageCard leakage={result.leakage} />
                    <RecoveryCard leakage={result.leakage} />
                  </>
                )
              },
              {
                title: 'Stage Conversion Rates',
                summary: forecastModel
                  ? `How often bookings at each stage went on to sign, from past bookings up to ${formatDate(forecastModel.refreshedAt)}.`
                  : 'How often bookings at each stage went on to sign, from past bookings.',
                motif: '/forecast/stages.webp',
                question:
                  'Walk me through the forecast’s stage conversion rates. Which stage converts worst, and what does that mean for signings?',
                content: (
                  <>
                    {result.forecast.support === 'supported' ? (
                      <StageRatesCard stageRates={result.forecast.stageRates} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Stage conversion rates will appear after resolved booking history is available.
                      </p>
                    )}
                    {forecastModel ? (
                      <p className="text-sm text-muted-foreground">
                        Historical rates updated on {formatDate(forecastModel.refreshedAt)}; next refresh on{' '}
                        {formatDate(forecastModel.nextRefreshAt)}. Current bookings stay live.
                      </p>
                    ) : null}
                  </>
                )
              },
              {
                title: 'How Well The Method Backtests',
                summary: 'The same method run on bookings from a month ago, checked against what actually signed.',
                motif: '/forecast/backtest.webp',
                question: 'How accurate is the forecast method when it is backtested against what actually signed?',
                content: <BacktestCard backtest={result.backtest} />
              },
              {
                title: 'Assumptions',
                summary: 'The working assumptions behind every number on this page.',
                motif: '/forecast/assumptions.webp',
                question: 'What assumptions does the forecast rely on, and which one matters most to the answer?',
                content: <AssumptionsCard />
              },
              ...(persona === 'manager'
                ? [
                    {
                      title: 'Seed Spread',
                      summary: 'How the answer moves when the same method runs on another simulation.',
                      motif: '/forecast/spread.webp',
                      question:
                        'How much does the forecast change when the same method runs on another simulation seed?',
                      content: (
                        <SeedSpreadCard
                          canonicalSeed={snapshot?.meta.seed ?? 0}
                          runs={[{ seed: snapshot?.meta.seed ?? 0, forecast: result.forecast }, ...altRuns]}
                          running={running}
                          onTryAnother={tryAnotherSeed}
                        />
                      )
                    } satisfies ForecastDocument
                  ]
                : [])
            ]}
          />
        </>
      ) : null}
    </PageContainer>
  )
}
