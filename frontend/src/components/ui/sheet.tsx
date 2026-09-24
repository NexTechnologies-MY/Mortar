/**
 * Sheet — a Dialog anchored to one edge of the screen, for looking into a row
 * without leaving the list. Same surface, overlay and focus trap as Dialog:
 * solid popover ground, ink-950 at 40% behind it, no blur (DESIGN.md Dialog).
 */

import * as React from 'react'
import { X } from 'lucide-react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        // z-[70] sits above AppSidebar (z-[60]) and AppNav (z-50), as Dialog does.
        'fixed inset-0 z-[70] bg-ink-950/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

const SIDE_STYLES = {
  right:
    'inset-y-0 right-0 h-full w-[calc(100vw-2rem)] max-w-md border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  left: 'inset-y-0 left-0 h-full w-[calc(100vw-2rem)] max-w-md border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  bottom:
    'inset-x-0 bottom-0 max-h-[85vh] rounded-t-md border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
} as const

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SIDE_STYLES }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          'fixed z-[71] flex flex-col gap-4 overflow-y-auto border-border bg-popover p-6 shadow-[var(--shadow-overlay)] duration-[var(--motion-slow)] data-[state=open]:animate-in data-[state=closed]:animate-out',
          SIDE_STYLES[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-[var(--motion-fast)] hover:bg-accent hover:text-foreground disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-auto flex flex-wrap gap-2', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn('text-base font-semibold text-foreground', className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
