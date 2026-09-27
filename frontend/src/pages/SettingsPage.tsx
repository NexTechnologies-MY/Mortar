/** Settings page — demo data actions, project defaults and server status. */
import { useCallback, useEffect, useState } from 'react'
import { SearchX } from 'lucide-react'
import { useSnapshot } from '@/lib/data'
import { fetchHealth, type Health } from '@/lib/api'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { mainProject } from '@/pages/ImportPage'
import { DemoDataCard } from '@/components/settings/DemoDataCard'
import { ProjectSettingsCard } from '@/components/settings/ProjectSettingsCard'
import { HealthCard } from '@/components/settings/HealthCard'

export function SettingsPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const [health, setHealth] = useState<Health | null>(null)
  const [healthFailed, setHealthFailed] = useState(false)

  const checkHealth = useCallback(async () => {
    try {
      setHealth(await fetchHealth())
      setHealthFailed(false)
    } catch {
      setHealthFailed(true)
    }
  }, [])

  useEffect(() => {
    let live = true
    fetchHealth()
      .then((h) => {
        if (!live) return
        setHealth(h)
        setHealthFailed(false)
      })
      .catch(() => {
        if (live) setHealthFailed(true)
      })
    return () => {
      live = false
    }
  }, [])

  const onDemoDataChange = async () => {
    await refresh()
    await checkHealth()
  }

  return (
    <PageContainer flex>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Settings</h1>
      </PageHeaderCard>

      {error ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={error} />
        </div>
      ) : loading && !snapshot ? (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : snapshot ? (
        <div className="grid items-stretch gap-4 py-4 lg:grid-cols-2">
          <DemoDataCard snapshot={snapshot} jevAnswers={health?.jevAnswers ?? null} onChange={onDemoDataChange} />
          <ProjectSettingsCard defaultProjectName={mainProject(snapshot.bookings)} />
          <div className="lg:col-span-2">
            <HealthCard health={health} failed={healthFailed} />
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}
