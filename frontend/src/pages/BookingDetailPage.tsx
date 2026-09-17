/**
 * Booking detail route.
 * Placeholder shell for a single booking's progress toward SPA signing.
 */
import { useParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { EmptyState } from '@/components/ui/EmptyState'

/** Renders the booking detail placeholder for the `:id` route param. */
export function BookingDetailPage() {
  const { id } = useParams()

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Booking detail</h1>
        <p className="mt-1 text-sm text-muted-foreground">Booking {id} — document status and signing progress.</p>
      </PageHeaderCard>
      <div className="mt-4">
        <EmptyState
          icon={FileText}
          title="Nothing to show yet"
          description="Booking details will appear here once booking data is available."
        />
      </div>
    </PageContainer>
  )
}
