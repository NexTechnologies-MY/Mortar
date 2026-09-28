/**
 * Owner badge — who owns a case or task: `Loan Admin · Tan Mei Ling`.
 * Name alone is enough context in grouped lists, so it is optional. It wears
 * the owner's desk colour, the same label the profile menu and Team use.
 */

import type { OwnerRole } from '@mortar/core'
import { DESK_OF_ROLE, RoleLabel } from '@/components/people/RoleLabel'

export const OWNER_ROLE_LABELS: Record<OwnerRole, string> = {
  sales: 'Sales',
  sales_admin: 'Sales Admin',
  loan_admin: 'Loan Admin',
  legal: 'Legal'
}

export function OwnerBadge({ role, name, className }: { role: OwnerRole; name?: string; className?: string }) {
  return (
    <RoleLabel desk={DESK_OF_ROLE[role]} className={className}>
      {name ? `${OWNER_ROLE_LABELS[role]} · ${name}` : OWNER_ROLE_LABELS[role]}
    </RoleLabel>
  )
}
