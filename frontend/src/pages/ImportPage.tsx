/**
 * Import route.
 * Placeholder shell for bulk-loading bookings from spreadsheets.
 */
import { FileUp } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { EmptyState } from '@/components/ui/EmptyState'

/** Renders the import placeholder. */
export function ImportPage() {
  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">Load Existing Bookings Into Mortar From A Spreadsheet.</p>
      </PageHeaderCard>
      <div className="mt-4">
        <EmptyState icon={FileUp} title="Nothing Imported Yet" description="Upload A Bookings File To Get Started." />
      </div>
    </PageContainer>
  )
}
