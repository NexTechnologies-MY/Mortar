/**
 * Chase list route.
 * Placeholder shell for bookings that need a follow-up nudge toward SPA signing.
 */
import { BellRing } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { EmptyState } from '@/components/ui/EmptyState'

/** Renders the chase list placeholder. */
export function ChasePage() {
  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Chase List</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bookings Waiting On A Document Or Signature, Ordered By How Long They Have Been Stuck.
        </p>
      </PageHeaderCard>
      <div className="mt-4">
        <EmptyState
          icon={BellRing}
          title="Nothing To Chase"
          description="Bookings That Stall Before SPA Signing Will Show Up Here."
        />
      </div>
    </PageContainer>
  )
}
