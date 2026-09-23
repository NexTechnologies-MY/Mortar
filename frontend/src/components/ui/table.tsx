'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * A table wider than its container cuts column headers mid-word on a phone
 * with no hint that there is more to scroll to (issue L10). This tracks
 * whether the container can still scroll right and, only then, paints a
 * subtle fade over the cut-off edge; it clears itself once nothing overflows
 * (desktop widths) or the reader has scrolled all the way to the end.
 */
function useRightScrollCue() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    // A hairline of slack absorbs sub-pixel rounding so the cue does not
    // flicker right at the fully-scrolled edge.
    const update = () => setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1)
    update()
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    resizeObserver?.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      resizeObserver?.disconnect()
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return [ref, canScrollRight] as const
}

// DESIGN.md bans painted gradients anywhere in the app shell, so the cue is a
// mask, not a gradient fill: it adds no colour of its own, it only fades the
// real, already-rendered edge toward transparent, which reads correctly over
// whatever surface the table happens to sit on (a card, a dialog, the page).
const RIGHT_FADE_MASK = 'linear-gradient(to right, black calc(100% - 32px), transparent)'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  const [containerRef, canScrollRight] = useRightScrollCue()
  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      data-scroll-fade={canScrollRight ? 'right' : undefined}
      className="relative w-full overflow-x-auto"
      style={canScrollRight ? { maskImage: RIGHT_FADE_MASK, WebkitMaskImage: RIGHT_FADE_MASK } : undefined}
    >
      <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-muted [&_tr]:border-b [&_tr]:border-border', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t border-border bg-muted font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'h-11 border-b border-border transition-colors duration-[var(--motion-fast)] hover:bg-accent data-[state=selected]:bg-selected data-[state=selected]:shadow-[inset_2px_0_0_0_var(--primary)]',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-9 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption data-slot="table-caption" className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
