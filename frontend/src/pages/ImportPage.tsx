/**
 * Import route — bringing existing bookings into Mortar from a spreadsheet.
 * The drop zone is built; reading the rows, mapping the columns and writing
 * them into the book are separate work, so the page says so plainly rather
 * than implying more than it does.
 */

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { DropZone } from '@/components/import/DropZone'
import { Card, CardContent } from '@/components/ui/card'

export function ImportPage() {
  const [, setFile] = useState<File | null>(null)

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">Load Existing Bookings Into Mortar From A Spreadsheet.</p>
      </PageHeaderCard>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Booking Sheet
            </h2>
            <DropZone onFile={setFile} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              What The Sheet Needs
            </h2>
            <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
              <li>One Row Per Unit Booking.</li>
              <li>A Unit Code Column, Written The Way Your Team Writes It.</li>
              <li>Buyer Name, Booking Date And Price.</li>
              <li>The Panel Bank, Where One Has Been Chosen.</li>
            </ul>
            <p className="text-[13px] text-muted-foreground">
              Anything Missing Can Be Filled In On The Booking Afterwards.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
