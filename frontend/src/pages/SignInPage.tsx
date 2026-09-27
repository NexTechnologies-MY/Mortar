/**
 * Sign-in route.
 * A drawn page, not a gate: the fields are disabled and the only working control
 * signs in under the chosen demo profile, then lands on that profile's home.
 */
import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEMO_PROFILES, profileFor } from '@mortar/core'
import { PERSONAS, usePersona } from '@/lib/persona'

export function SignInPage() {
  const { profile, setProfile } = usePersona()
  const [chosen, setChosen] = useState(profile.id)
  const navigate = useNavigate()

  const emailId = useId()
  const passwordId = useId()
  const keepSignedInId = useId()
  const profileId = useId()
  const scopeId = useId()
  const selected = profileFor(chosen) ?? profile

  const signInAsGuest = () => {
    setProfile(selected)
    navigate(PERSONAS.find((p) => p.id === selected.persona)?.home ?? '/')
  }

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-background min-[900px]:grid-cols-[minmax(420px,1fr)_1fr]">
      <section className="flex flex-col justify-center px-6 pt-12 pb-16 min-[900px]:px-16">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6">
          <Link
            to="/"
            className="w-fit text-[11px] leading-[14px] font-semibold tracking-[0.08em] uppercase text-muted-foreground transition-colors duration-[120ms] hover:text-foreground"
          >
            &larr; Mortar
          </Link>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">Sign In</h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={emailId} className="text-muted-foreground">
                Email
              </Label>
              <Input id={emailId} type="email" placeholder="you@example.com" autoComplete="off" disabled />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={passwordId} className="text-muted-foreground">
                Password
              </Label>
              <Input id={passwordId} type="password" placeholder="Your password" autoComplete="off" disabled />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id={keepSignedInId} />
              <Label htmlFor={keepSignedInId} className="font-normal">
                Keep Me Signed In
              </Label>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled
              className="w-full disabled:cursor-not-allowed disabled:border-input disabled:bg-transparent"
            >
              Sign In
            </Button>
            <div className="flex flex-col gap-2">
              <Label htmlFor={profileId}>Sign In As</Label>
              <Select value={chosen} onValueChange={setChosen}>
                <SelectTrigger id={profileId} aria-describedby={scopeId} className="w-full min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DEMO_PROFILES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} · {PERSONAS.find((role) => role.id === p.persona)?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id={scopeId} className="text-xs text-muted-foreground">
                {selected.persona === 'manager' ? 'Access to all cases.' : 'Access to your assigned cases only.'} Demo
                profiles use sample data.
              </p>
            </div>
            <Button type="button" className="w-full" onClick={signInAsGuest}>
              Sign In As Guest
            </Button>
          </div>
        </div>
      </section>
      <aside
        className="relative hidden items-center justify-center overflow-hidden bg-selected min-[900px]:flex"
        aria-hidden="true"
      >
        <MortarMark size={220} className="text-foreground" />
      </aside>
    </main>
  )
}
