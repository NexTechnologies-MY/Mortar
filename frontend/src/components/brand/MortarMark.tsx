/**
 * Mortar "Kigumi Joint" brand mark.
 *
 * Inline SVG — no image asset, so it works in both themes and at any size.
 * The two interlocking uprights and the joint inherit `currentColor`; wrap in
 * `text-foreground` to follow light/dark mode. The crosspiece carries the fixed
 * brand colour, Mortar's original orange, in both themes. `role="img"` +
 * `aria-label` keep it accessible without a DOM-level `<img>`.
 */

import { cn } from '@/lib/utils'

/** The mark's fixed accent. Not a token: the brand colour does not theme. */
const BRAND = '#c2410c'

type MortarMarkProps = {
  /** Rendered width and height in px */
  size?: number
  className?: string
  /** Accessible label */
  title?: string
}

/**
 * Themed Mortar mark. `className` is composed with the base styling so
 * callers can control the ink parts (e.g. `text-foreground`); the crosspiece
 * stays brand orange.
 */
export function MortarMark({ size = 28, className, title = 'Mortar' }: MortarMarkProps) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
    >
      <path d="M24 24H60V42H42V76H24Z" fill="currentColor" />
      <path d="M76 76H46V58H64V24H76Z" fill={BRAND} />
      <rect x="49" y="46" width="8" height="8" rx="1" fill="currentColor" />
    </svg>
  )
}
