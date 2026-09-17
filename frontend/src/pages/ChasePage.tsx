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
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Chase list</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bookings waiting on a document or signature, ordered by how long they have been stuck.
        </p>
      </PageHeaderCard>
      <div className="mt-4">
        <EmptyState
          icon={BellRing}
          title="Nothing to chase"
          description="Bookings that stall before SPA signing will show up here."
        />
      </div>
    </PageContainer>
  )
}
