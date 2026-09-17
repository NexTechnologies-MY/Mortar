/**
 * Empty-state panel for pages and lists with no data yet.
 * Centres an icon, title, and one-line description inside a Card.
 */

import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
}

/** Renders a centred empty state inside a card. */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <p className="font-heading text-base font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
