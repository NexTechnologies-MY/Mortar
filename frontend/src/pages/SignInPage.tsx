/**
 * Sign-in route.
 * A drawn page, not a gate: the fields are disabled and the only working control
 * signs in as a guest under the chosen persona, then lands on that persona's home.
 */
import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
            <Button type="button" disabled className="w-full">
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
            <Button type="button" variant="secondary" className="w-full" onClick={signInAsGuest}>
              Sign In As Guest
            </Button>
          </div>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden min-[900px]:block" aria-hidden="true">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 640 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <rect width="640" height="900" fill="var(--muted)" />
          <circle cx="440" cy="250" r="82" fill="var(--card)" />

          <g fill="var(--border)" opacity="0.26">
            <rect x="0" y="560" width="96" height="340" />
            <rect x="116" y="470" width="72" height="430" />
            <rect x="140" y="444" width="24" height="26" />
            <rect x="208" y="540" width="104" height="360" />
            <rect x="332" y="430" width="64" height="470" />
            <rect x="348" y="404" width="32" height="26" />
            <rect x="416" y="505" width="88" height="395" />
            <rect x="524" y="460" width="66" height="440" />
            <rect x="596" y="540" width="44" height="360" />
          </g>

          <g fill="var(--input)" opacity="0.42">
            <rect x="32" y="630" width="88" height="270" />
            <rect x="56" y="604" width="40" height="26" />
            <rect x="144" y="560" width="96" height="340" />
            <rect x="176" y="534" width="32" height="26" />
            <rect x="268" y="650" width="72" height="250" />
            <rect x="372" y="600" width="96" height="300" />
            <rect x="400" y="574" width="40" height="26" />
            <rect x="492" y="670" width="76" height="230" />
            <rect x="584" y="620" width="56" height="280" />
          </g>

          <g fill="var(--muted-foreground)">
            <rect x="0" y="710" width="112" height="190" />
            <rect x="24" y="684" width="40" height="26" />
            <rect x="140" y="680" width="92" height="220" />
            <rect x="164" y="654" width="44" height="26" />
            <rect x="268" y="740" width="116" height="160" />
            <rect x="420" y="700" width="84" height="200" />
            <rect x="444" y="674" width="36" height="26" />
            <rect x="540" y="760" width="100" height="140" />
            <rect x="336" y="470" width="5" height="430" />
            <rect x="330" y="458" width="17" height="12" />
            <rect x="341" y="474" width="176" height="5" />
            <rect x="294" y="474" width="42" height="5" />
            <rect x="294" y="479" width="12" height="20" />
            <path d="M347 458 L517 473 L517 477 L345 466 Z" />
            <path d="M339 458 L296 473 L296 477 L338 466 Z" />
            <rect x="480" y="479" width="2" height="70" />
            <rect x="472" y="549" width="18" height="12" />
          </g>
        </svg>
      </aside>
    </main>
  )
}
