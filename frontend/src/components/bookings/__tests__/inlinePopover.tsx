/**
 * An inline stand-in for `@/components/ui/popover` in tests, used with
 * `vi.mock('@/components/ui/popover', () => import('…/inlinePopover'))`.
 *
 * Radix positions popover content with floating-ui, whose measuring stalls
 * jsdom's event loop for many seconds on every open: a bare Radix popover
 * holding one button held a `setTimeout(0)` back 14–24 s (3 s even with
 * collision handling off), which times out any test that opens a date field.
 * The date fields only need the popover to open, close and show its content,
 * so this keeps those and drops the positioning. The Calendar inside is real.
 */

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode
} from 'react'

const PopoverState = createContext<{ open: boolean; setOpen: (open: boolean) => void }>({
  open: false,
  setOpen: () => {}
})

export function Popover({
  open,
  onOpenChange,
  children
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}) {
  const [uncontrolled, setUncontrolled] = useState(false)
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }
  return <PopoverState.Provider value={{ open: open ?? uncontrolled, setOpen }}>{children}</PopoverState.Provider>
}

export function PopoverTrigger({
  asChild,
  children
}: {
  asChild?: boolean
  children?: ReactElement<{ onClick?: (e: MouseEvent) => void; 'aria-expanded'?: boolean }> | ReactNode
}) {
  const { open, setOpen } = useContext(PopoverState)
  const toggle = () => setOpen(!open)
  if (asChild && isValidElement<{ onClick?: (e: MouseEvent) => void; 'aria-expanded'?: boolean }>(children)) {
    return cloneElement(children, { onClick: toggle, 'aria-expanded': open })
  }
  return (
    <button type="button" aria-expanded={open} onClick={toggle}>
      {children}
    </button>
  )
}

export function PopoverContent({ children }: { children?: ReactNode; align?: string; className?: string }) {
  const { open } = useContext(PopoverState)
  return open ? <div role="dialog">{children}</div> : null
}
