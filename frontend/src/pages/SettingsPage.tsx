/**
 * Settings page — available to every persona. Holds the demo-data card (seed,
 * reference date, last reset, record counts), the Reset Demo Data flow, and
 * the server's health report.
 */
import { useState } from 'react'
import { SearchX } from 'lucide-react'
import { useSnapshot } from '@/lib/data'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataCard } from '@/components/settings/DemoDataCard'
import { HealthCard } from '@/components/settings/HealthCard'

export function SettingsPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const [nonce, setNonce] = useState(0)

  const onReset = async () => {
    await refresh()
    setNonce((n) => n + 1)
  }

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The Simulated Dataset Behind Every Screen, And The Services Serving It.
        </p>
      </PageHeaderCard>

      {error ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load The Snapshot" description={error} />
        </div>
      ) : loading && !snapshot ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : snapshot ? (
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
          <DemoDataCard snapshot={snapshot} onReset={onReset} />
          <HealthCard nonce={nonce} />
        </div>
      ) : null}
    </PageContainer>
  )
}
