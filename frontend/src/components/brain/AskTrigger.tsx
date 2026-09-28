/**
 * The Ask MortarAI button in the top bar, plus its Cmd/Ctrl-K shortcut.
 *
 * It holds nothing but the open flag on purpose. Every data hook lives in
 * `AskPanel`, which Radix only mounts once the dialog opens, so carrying Ask
 * in the nav costs the closed pages nothing. The one thing it does read is the
 * case the route is on, so a person asking from a case gets an answer about
 * that case. A page can also open it with a question already sent
 * (`askMortarAI`), which starts a fresh conversation on that question.
 */
import { useEffect, useState } from 'react'
import { useMatch } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePersonaSafe } from '@/lib/persona'
import { AskPanel } from './AskPanel'
import { ASK_EVENT, type AskRequest } from './askBus'

export function AskTrigger() {
  const { profile } = usePersonaSafe()
  const [open, setOpen] = useState(false)
  // A question a page sent, and a counter so the same question twice still
  // starts a new conversation.
  const [pending, setPending] = useState<{ question: string; nonce: number } | null>(null)
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

  useEffect(() => {
    const onAsk = (event: Event) => {
      const question = (event as CustomEvent<AskRequest>).detail?.question?.trim()
      if (!question) return
      setPending((previous) => ({ question, nonce: (previous?.nonce ?? 0) + 1 }))
      setOpen(true)
    }
    window.addEventListener(ASK_EVENT, onAsk)
    return () => window.removeEventListener(ASK_EVENT, onAsk)
  }, [])

  const changeOpen = (next: boolean) => {
    setOpen(next)
    // Opened again from the top bar, the panel starts empty.
    if (!next) setPending(null)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                data-tour="ask-mortar"
                type="button"
                aria-label="Ask MortarAI"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Ask MortarAI</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="flex h-[80vh] w-[80vw] max-w-none flex-col overflow-hidden max-sm:h-[92vh] max-sm:w-[calc(100vw-1rem)]">
        <AskPanel
          key={`${profile.id}:${pending?.nonce ?? 0}`}
          bookingId={bookingId}
          initialQuestion={pending?.question}
          onNavigate={() => changeOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
