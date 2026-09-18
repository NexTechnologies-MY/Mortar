/**
 * Bookings list route.
 * Placeholder shell for tracking every unit booking from reservation to SPA signing.
 */
import { ClipboardList } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { EmptyState } from '@/components/ui/EmptyState'

/** Renders the bookings list placeholder. */
export function BookingsPage() {
  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every Unit Booking, From Reservation Through To SPA Signing.
        </p>
      </PageHeaderCard>
      <div className="mt-4">
        <EmptyState
          icon={ClipboardList}
          title="No Bookings Yet"
          description="Bookings Will Appear Here Once Units Are Reserved Or Imported."
        />
      </div>
    </PageContainer>
  )
}
