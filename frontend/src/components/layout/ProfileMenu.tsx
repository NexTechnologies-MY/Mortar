/**
 * Profile menu — the top bar's round avatar and the panel it opens.
 *
 * The trigger is the avatar alone, tinted in the desk colour; its accessible
 * name carries the person and the role, which no longer sit in the top bar. The
 * panel reads "Signed In As", then the persona card: name, role label and the
 * two figures that open that persona's Today. The card opens the switcher, a
 * menu of every demo profile, and picking one opens that persona's home, so the
 * page changes with the sidebar instead of staying on the old desk. Sign Out
 * sits at the bottom.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronsUpDown, LogOut } from 'lucide-react'
import { DEMO_PROFILES, type StaffProfile } from '@mortar/core'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DESK_LABELS, DESK_OF_PERSONA, ProfileAvatar, RoleLabel } from '@/components/people/RoleLabel'
import { useTodayFigures } from '@/components/chase/today'
import { PERSONAS, usePersona } from '@/lib/persona'
import { signOut } from '@/lib/session'

const EYEBROW = 'text-[11px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-muted-foreground'

/** "Nurul Aina, Sales Admin" — the name and role the avatar stands for. */
function who(profile: StaffProfile) {
  return `${profile.name}, ${DESK_LABELS[DESK_OF_PERSONA[profile.persona]]}`
}

export function ProfileMenu() {
  const { profile, setProfile } = usePersona()
  const navigate = useNavigate()
  const figures = useTodayFigures()
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const desk = DESK_OF_PERSONA[profile.persona]

  const switchTo = (next: StaffProfile) => {
    setSwitching(false)
    setOpen(false)
    if (next.id === profile.id) return
    setProfile(next)
    navigate(PERSONAS.find((p) => p.id === next.persona)?.home ?? '/app')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`${who(profile)}. ${open ? 'Close' : 'Open'} profile menu`}
                className="ml-2 inline-flex rounded-full outline-none transition-shadow duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:ring-2 data-[state=open]:ring-foreground data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background"
              >
                <ProfileAvatar desk={desk} size={32} />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {profile.name} · {DESK_LABELS[desk]}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent align="end" sideOffset={8} aria-label="Profile" className="flex w-[336px] flex-col gap-2.5 p-3">
        <span className={`${EYEBROW} px-1 pt-0.5`}>Signed In As</span>

        <DropdownMenu open={switching} onOpenChange={setSwitching}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`${who(profile)}. Switch profile`}
              className="flex w-full flex-col gap-3 rounded-md border border-border bg-card p-3.5 text-left text-foreground outline-none transition-colors duration-[var(--motion-fast)] hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-foreground"
            >
              <span className="flex w-full items-center gap-3">
                <ProfileAvatar desk={desk} size={48} square />
                <span className="flex min-w-0 grow flex-col items-start gap-1">
                  <span className="truncate text-base font-semibold tracking-[-0.01em]">{profile.name}</span>
                  <RoleLabel desk={desk} />
                </span>
                <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              </span>
              <span aria-hidden="true" className="h-px w-full bg-border" />
              <span className="grid w-full grid-cols-2 gap-3">
                {(figures ?? [null, null]).map((figure, i) => (
                  <span key={i} className="flex flex-col gap-0.5">
                    <span className={EYEBROW}>{figure?.label ?? (i === 0 ? 'Today' : 'Due Today')}</span>
                    <span className="text-2xl font-semibold tabular-nums tracking-[-0.02em]">
                      {figure ? figure.value : '–'}
                    </span>
                  </span>
                ))}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="w-[312px]">
            <DropdownMenuPrimitive.Label className={`${EYEBROW} px-2 pb-1.5 pt-2`}>
              Switch Profile
            </DropdownMenuPrimitive.Label>
            <DropdownMenuPrimitive.RadioGroup
              value={profile.id}
              onValueChange={(id) => {
                const next = DEMO_PROFILES.find((p) => p.id === id)
                if (next) switchTo(next)
              }}
            >
              {DEMO_PROFILES.map((p) => {
                const pDesk = DESK_OF_PERSONA[p.persona]
                return (
                  <DropdownMenuPrimitive.RadioItem
                    key={p.id}
                    value={p.id}
                    // Picking the active profile again only closes the menu.
                    onSelect={() => p.id === profile.id && switchTo(p)}
                    className="flex h-10 cursor-default select-none items-center gap-2.5 rounded-sm px-2 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <ProfileAvatar desk={pDesk} size={24} />
                    <span className="grow truncate font-medium">{p.name}</span>
                    <RoleLabel desk={pDesk} icon={false} />
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      <DropdownMenuPrimitive.ItemIndicator>
                        <Check aria-hidden="true" className="size-4 text-link" />
                      </DropdownMenuPrimitive.ItemIndicator>
                    </span>
                  </DropdownMenuPrimitive.RadioItem>
                )
              })}
            </DropdownMenuPrimitive.RadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-start px-3"
          onClick={() => {
            setOpen(false)
            void signOut().finally(() => navigate('/sign-in'))
          }}
        >
          <LogOut aria-hidden="true" className="text-muted-foreground" />
          Sign Out
        </Button>
      </PopoverContent>
    </Popover>
  )
}
