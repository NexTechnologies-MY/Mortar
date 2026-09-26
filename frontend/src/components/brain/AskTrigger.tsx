/**
 * The Ask Mortar button in the top bar, plus its Cmd/Ctrl-K shortcut.
 *
 * It holds nothing but the open flag on purpose. Every data hook lives in
 * `AskPanel`, which Radix only mounts once the dialog opens, so carrying Ask
 * in the nav costs the closed pages nothing. The one thing it does read is the
 * case the route is on, so a person asking from a case gets an answer about
 * that case.
 */
import { useEffect, useState } from 'react'
import { useMatch } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AskPanel } from './AskPanel'

export function AskTrigger() {
  const [open, setOpen] = useState(false)
  // The case page, when one is open; nothing on the other routes.
  const caseMatch = useMatch('/bookings/:id')
  const bookingId = caseMatch?.params.id

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      setOpen((wasOpen) => !wasOpen)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Ask Mortar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Ask Mortar</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-2xl">
        <AskPanel bookingId={bookingId} onNavigate={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
