/**
 * Desk identity: the role label and the round profile avatar.
 *
 * Each desk carries one muted colour pair (`--desk-*-fg` / `--desk-*-bg`) and a
 * Lucide icon. The colour says whose work something is, never how it is doing,
 * so it only ever appears here and always beside the role's word — status keeps
 * the six status tones (DESIGN.md: Desk Colours).
 */

import { BriefcaseBusiness, Handshake, Landmark, Scale, UserRound, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { OwnerRole, Persona } from '@mortar/core'
import { cn } from '@/lib/utils'

export type Desk = 'sales' | 'loan' | 'legal' | 'manager'

export const DESK_OF_PERSONA: Record<Persona, Desk> = {
  'sales-admin': 'sales',
  'loan-admin': 'loan',
  'legal-admin': 'legal',
  manager: 'manager'
}

export const DESK_OF_ROLE: Record<OwnerRole, Desk> = {
  sales: 'sales',
  sales_admin: 'sales',
  loan_admin: 'loan',
  legal: 'legal'
}

export const DESK_LABELS: Record<Desk, string> = {
  sales: 'Sales Admin',
  loan: 'Loan Admin',
  legal: 'Legal Admin',
  manager: 'Manager'
}

const DESK_ICONS: Record<Desk, LucideIcon> = {
  sales: Handshake,
  loan: Landmark,
  legal: Scale,
  manager: BriefcaseBusiness
}

/** Text and ground classes for a desk, shared by the label and the avatar. */
export const DESK_TONE: Record<Desk, string> = {
  sales: 'bg-desk-sales-bg text-desk-sales-fg',
  loan: 'bg-desk-loan-bg text-desk-loan-fg',
  legal: 'bg-desk-legal-bg text-desk-legal-fg',
  manager: 'bg-desk-manager-bg text-desk-manager-fg'
}

/** A desk's label: its icon and word on its colour, e.g. [bank] Loan Admin. */
export function RoleLabel({
  desk,
  children,
  icon = true,
  className
}: {
  desk: Desk
  /** Replaces the desk's own word, e.g. "Loan Admin · Tan Mei Ling". */
  children?: ReactNode
  icon?: boolean
  className?: string
}) {
  const Icon = DESK_ICONS[desk]
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm px-1.5 text-xs font-medium leading-4',
        DESK_TONE[desk],
        className
      )}
    >
      {icon && <Icon aria-hidden="true" className="h-3 w-3" strokeWidth={2} />}
      {children ?? DESK_LABELS[desk]}
    </span>
  )
}

/** A round silhouette in the desk's colour. `square` is the persona card's larger tile. */
export function ProfileAvatar({
  desk,
  size = 28,
  square = false,
  className
}: {
  desk: Desk
  size?: number
  square?: boolean
  className?: string
}) {
  const icon = Math.round(size * (square ? 0.5 : 0.56))
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        square ? 'rounded-md' : 'rounded-full',
        DESK_TONE[desk],
        className
      )}
    >
      <UserRound style={{ width: icon, height: icon }} strokeWidth={2} />
    </span>
  )
}
