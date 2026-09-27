import { useMemo } from 'react'
import { forecast, managerSuggestions } from '@mortar/core'
import { useSnapshot, useCases } from '@/lib/data'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { ManagerCases } from '@/components/manager/ManagerCases'
import { Disclosure } from '@/components/ui/Disclosure'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function ManagerPage() {
  const { snapshot, error, loading } = useSnapshot()
  const cases = useCases()
  const result = useMemo(
    () => (snapshot ? forecast(snapshot, snapshot.meta.referenceDate, { seed: snapshot.meta.seed }) : null),
    [snapshot]
  )
  const suggested = useMemo(() => (snapshot ? managerSuggestions(snapshot) : []), [snapshot])
  return (
    <PageContainer>
      <PageHeaderCard tourTarget="manager-header">
        <h1 className="text-2xl font-semibold">Overview</h1>
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
          <div className="my-5 flex flex-wrap gap-3">
            <StatCard
              label="Need Your Attention"
              value={String(suggested.length)}
              info="Cases at least 50% past their expected wait."
            />
            <StatCard
              label="Expected Signings"
              value={result ? String(Math.round(result.expectedSignings)) : '0'}
              info="Expected signed sale agreements within 30 days of booking."
            />
            <StatCard
              label="Manager Tasks Open"
              value={String(snapshot?.tasks.filter((t) => t.status === 'open' && t.managerFlaggedBy).length ?? 0)}
              info="Follow-ups flagged by a manager and not yet completed."
            />
          </div>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Disclosure title={`Bookings Needing A Move (${cases.filter((c) => c.stallReasons.length > 0).length})`}>
                <ManagerCases />
              </Disclosure>
              <Disclosure title="Forecast Detail">
                <p className="text-sm">
                  Expected range: {result?.rangeLow ?? 0}–{result?.rangeHigh ?? 0} signings.
                </p>
                <Button asChild variant="secondary" className="mt-3">
                  <Link to="/forecast">Open Forecast</Link>
                </Button>
              </Disclosure>
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
