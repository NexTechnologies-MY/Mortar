/**
 * Owner badge — who owns a case or task: `Loan Admin · Tan Mei Ling`.
 * Name alone is enough context in grouped lists, so it is optional.
 */

import type { OwnerRole } from '@mortar/core'
import { Badge } from '@/components/ui/badge'

export const OWNER_ROLE_LABELS: Record<OwnerRole, string> = {
  sales: 'Sales',
  sales_admin: 'Sales Admin',
  loan_admin: 'Loan Admin',
  legal: 'Legal'
}

export function OwnerBadge({ role, name, className }: { role: OwnerRole; name?: string; className?: string }) {
  return (
    <Badge variant="secondary" className={className}>
      {name ? `${OWNER_ROLE_LABELS[role]} · ${name}` : OWNER_ROLE_LABELS[role]}
    </Badge>
  )
}
