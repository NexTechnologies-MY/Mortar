/**
 * Flat page header used above the working list on every page.
 * Spec: no card, gradient, blobs or artwork — just the title (Display/Page:
 * 24px semibold, -0.02em tracking) and one line of supporting copy.
 */

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageHeaderCardProps = {
  children: ReactNode
  className?: string
  /** @deprecated Flat spec — artwork is ignored. Kept so existing callers compile. */
  artSrc?: string
  /** @deprecated Flat spec — artwork is ignored. Kept so existing callers compile. */
  artAlt?: string
}

/**
 * Renders a flat page header. `artSrc`/`artAlt` are accepted for backwards
 * compatibility but never rendered.
 */
export function PageHeaderCard({ children, className }: PageHeaderCardProps) {
  return (
    <div className={cn('[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-[-0.02em]', className)}>{children}</div>
  )
}
