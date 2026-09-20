/**
 * Flat page header used above the working list on every page.
 * Spec: no card, gradient, blobs or artwork — just the title (Display/Large:
 * 32px semibold, -0.02em tracking) and one line of supporting copy.
 * The title styles live on the h1 at each call site, not on a descendant
 * selector here: `[&_h1]:*` outranks a class on the child and silently beat
 * every page's own heading classes.
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
  return <div className={cn(className)}>{children}</div>
}
