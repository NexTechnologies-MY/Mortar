import { useMemo } from 'react'
import { forecast, managerSuggestions } from '@mortar/core'
import { useSnapshot, useCases } from '@/lib/data'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { ManagerCases } from '@/components/manager/ManagerCases'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ManagerPage() {
  const { snapshot, error, loading } = useSnapshot()
  const cases = useCases()
  const result = useMemo(
    () =>
      snapshot
        ? forecast(snapshot, snapshot.meta.referenceDate, { seed: snapshot.meta.seed, model: snapshot.forecastModel })
        : null,
    [snapshot]
  )
  const suggested = useMemo(() => (snapshot ? managerSuggestions(snapshot) : []), [snapshot])
  return (
    <PageContainer>
      <PageHeaderCard tourTarget="manager-header">
        <h1 className="text-2xl font-semibold">Manager</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The bookings that need your attention, across every department.
        </p>
      </PageHeaderCard>
      {error ? (
        <p role="alert" className="mt-4 text-sm">
          {error}
        </p>
      ) : loading && !snapshot ? (
        <p className="mt-4">Loading Your Overview…</p>
      ) : (
        <>
          <Tabs defaultValue="suggestions" className="mt-5">
            <TabsList>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="my-5 flex flex-wrap gap-3">
                <StatCard
                  label="Overdue Cases"
                  value={String(suggested.length)}
                  info="Cases at least 50% past their expected wait."
                />
                <StatCard
                  label="Expected Signings"
                  value={result?.support === 'supported' ? String(Math.round(result.expectedSignings)) : 'Unavailable'}
                  info="Expected signed sale agreements within 30 days of booking."
                />
                <StatCard
                  label="Manager Tasks Open"
                  value={String(snapshot?.tasks.filter((t) => t.status === 'open' && t.managerFlaggedBy).length ?? 0)}
                  info="Follow-ups flagged by a manager and not yet completed."
                />
              </div>
              {snapshot?.forecastModel && (
                <p className="text-sm text-muted-foreground">
                  Historical rates updated on {snapshot.forecastModel.refreshedAt.slice(0, 10)}; next refresh on{' '}
                  {snapshot.forecastModel.nextRefreshAt.slice(0, 10)}. Current bookings stay live.
                </p>
              )}
              <h2 className="text-base font-semibold">
                Bookings Needing A Move ({cases.filter((c) => c.stallReasons.length > 0).length})
              </h2>
              <ManagerCases />
            </TabsContent>
            <TabsContent value="suggestions">
              <ManagerCases suggestionsOnly />
            </TabsContent>
          </Tabs>
        </>
      )}
    </PageContainer>
  )
}
