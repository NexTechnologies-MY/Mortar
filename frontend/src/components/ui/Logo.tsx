/**
 * Mortar brand mark.
 *
 * Renders a brick glyph on a primary tile — no image asset, so it works in
 * both themes and at any size. `role="img"` + `aria-label` keep it accessible
 * without a DOM-level `<img>`.
 */

import { BrickWall } from 'lucide-react'
import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
}

/**
 * Themed Mortar logo. `className` is composed with the base styling so
 * callers can size the logo (e.g. `h-7 w-7`).
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      role="img"
      aria-label="Mortar"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground',
        className
      )}
    >
      <BrickWall className="h-3/5 w-3/5" />
    </span>
  )
}
