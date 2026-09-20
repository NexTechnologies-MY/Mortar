/**
 * The Ask button in the top bar, plus its Cmd/Ctrl-K shortcut.
 *
 * It holds nothing but the open flag on purpose. Every data hook lives in
 * `AskPanel`, which Radix only mounts once the dialog opens, so carrying Ask
 * in the nav costs the closed pages nothing.
 */
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AskPanel } from './AskPanel'

export function AskTrigger() {
  const [open, setOpen] = useState(false)

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
                aria-label="Ask Jev"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Ask Jev</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-2xl">
        <AskPanel onNavigate={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
