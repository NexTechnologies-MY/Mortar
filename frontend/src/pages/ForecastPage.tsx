/**
 * Forecast route.
 * Placeholder shell for projected signings and collections.
 */
import { TrendingUp } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { EmptyState } from '@/components/ui/EmptyState'

/** Renders the forecast placeholder. */
export function ForecastPage() {
  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Forecast</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Projected SPA signings and collections based on the current booking pipeline.
        </p>
      </PageHeaderCard>
      <div className="mt-4">
        <EmptyState
          icon={TrendingUp}
          title="No forecast yet"
          description="A forecast will appear here once bookings are being tracked."
        />
      </div>
    </PageContainer>
  )
}
