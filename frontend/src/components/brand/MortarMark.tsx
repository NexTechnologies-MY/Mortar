/**
 * Mortar "Kigumi Joint" brand mark.
 *
 * Inline SVG — no image asset, so it works in both themes and at any size.
 * The first and third shapes inherit `currentColor`; the second keeps the
 * brand orange (`#c2410c`, the palette before the monochrome swap; `#f97316`
 * in dark where the deeper tone would sink into the page). `role="img"` +
 * `aria-label` keep it accessible without a DOM-level `<img>`.
 */

import { cn } from '@/lib/utils'

type MortarMarkProps = {
  /** Rendered width and height in px */
  size?: number
  className?: string
  /** Accessible label */
  title?: string
}

/**
 * Themed Mortar mark. `className` is composed with the base styling so
 * callers can control colour (e.g. `text-foreground`).
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
      <path d="M76 76H46V58H64V24H76Z" className="fill-[#c2410c] dark:fill-[#f97316]" />
      <rect x="49" y="46" width="8" height="8" rx="1" fill="currentColor" />
    </svg>
  )
}
