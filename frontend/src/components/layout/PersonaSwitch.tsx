/**
 * Persona switcher for the app header.
 * Lets staff flip the workspace between the Sales Admin, Loan Admin, and Legal Admin roles.
 */

import { Check, LogOut, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PERSONAS, usePersona, type PersonaMeta } from '@/lib/persona'

/**
 * Renders a dropdown of the three personas and updates the global persona context.
 * Switching to another persona also opens that persona's home desk, so the page
 * changes with the sidebar instead of staying on the old desk.
 * Highlights the active persona while keeping the trigger compact for nav placement.
 */
export function PersonaSwitch() {
  const { persona, meta, setPersona } = usePersona()
  const navigate = useNavigate()

  const switchTo = (next: PersonaMeta) => {
    if (next.id === persona) return
    setPersona(next.id)
    navigate(next.home)
  }

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2 sm:px-3" aria-label="Switch persona">
                <UserCog className="h-4 w-4" />
                <span className="hidden text-sm sm:inline">{meta.label}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Switch Persona</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-44">
        {PERSONAS.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onSelect={() => switchTo(p)}
            className={persona === p.id ? 'font-semibold text-foreground' : 'text-muted-foreground'}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <span>{p.label}</span>
              {persona === p.id && <Check className="h-4 w-4 text-link" />}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/sign-in')} className="text-muted-foreground">
          <LogOut />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
