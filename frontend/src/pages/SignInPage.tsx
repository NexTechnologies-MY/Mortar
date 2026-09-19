/**
 * Sign-in route.
 * A drawn page, not a gate: the fields are disabled and the only working control
 * signs in as a guest under the chosen persona, then lands on that persona's home.
 */
import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PERSONAS, usePersona, type Persona } from '@/lib/persona'

export function SignInPage() {
  const { persona, setPersona } = usePersona()
  const [chosen, setChosen] = useState<Persona>(persona)
  const navigate = useNavigate()

  const emailId = useId()
  const passwordId = useId()
  const keepSignedInId = useId()
  const personaLabelId = useId()

  const signInAsGuest = () => {
    setPersona(chosen)
    navigate(PERSONAS.find((p) => p.id === chosen)?.home ?? '/')
  }

  return (
    <main className="grid min-h-dvh bg-background min-[900px]:grid-cols-[minmax(420px,1fr)_1fr]">
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
              <Label id={personaLabelId} className="text-muted-foreground">
                Signing In As
              </Label>
              <RadioGroup
                aria-labelledby={personaLabelId}
                value={chosen}
                onValueChange={(value) => setChosen(value as Persona)}
                className="flex gap-0 rounded-md bg-muted p-1"
              >
                {PERSONAS.map((p) => (
                  <RadioGroupItem
                    key={p.id}
                    value={p.id}
                    className="h-8 flex-1 aspect-auto rounded-sm border-transparent px-3 text-[13px] font-medium text-muted-foreground shadow-none transition-colors duration-[120ms] hover:text-foreground data-[state=checked]:border-border data-[state=checked]:bg-card data-[state=checked]:text-foreground [&_[data-slot=radio-group-indicator]]:hidden"
                  >
                    {p.label}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
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
