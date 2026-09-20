/**
 * The public landing: one screen with no scroll of its own — a film ground
 * under the opaque page column, three facts, and one way in. Ported from
 * Perch's Landing (docs/research/perch/landing.md); the sitewide reveal
 * footer is owned by SiteShell.
 */
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MortarMark } from '@/components/brand/MortarMark'
import { HeroFilm } from '@/components/HeroFilm'
import { useTheme } from '@/hooks/useTheme'
import './LandingPage.css'

const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Renders the landing page: film layer, header row, text column, facts. */
export function LandingPage() {
  const { resolved, toggle } = useTheme()
  const next = resolved === 'light' ? 'dark' : 'light'

  return (
    <main className="land">
      <div className="land-film" aria-hidden="true">
        <HeroFilm still={still} />
        <div className="land-veil" />
      </div>

      <header className="land-head">
        <MortarMark size={36} className="text-foreground" />
        <span className="land-mark">Mortar</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="land-theme"
                aria-label={`Switch to the ${next} theme`}
                onClick={toggle}
              >
                {resolved === 'light' ? <Moon size={20} strokeWidth={1.75} /> : <Sun size={20} strokeWidth={1.75} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch Theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button asChild className="land-go">
          <Link to="/sign-in">Open Mortar</Link>
        </Button>
      </header>

      <div className="land-body">
        <div className="land-plate">
          <p className="land-eyebrow">Booking To SPA, For Sales, Loan And Finance</p>
          <h1 className="land-title">Booked Is Not Sold. Signed Is.</h1>
        </div>
      </div>

      <dl className="land-facts land-band">
        <div>
          <dt>Chase List</dt>
          <dd>Every Stuck Booking, The Blocker In Plain Words, And Who To Chase Today</dd>
        </div>
        <div>
          <dt>Bookings</dt>
          <dd>Each Unit From Booking To SPA, With The Days It Has Sat In Every Stage</dd>
        </div>
        <div>
          <dt>Forecast</dt>
          <dd>The SPAs You Can Bank On, Not The Bookings You Hope Will Convert</dd>
        </div>
      </dl>
    </main>
  )
}
