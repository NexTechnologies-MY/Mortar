/**
 * The public landing: one screen with no scroll of its own — a film ground
 * under the opaque page column, three facts, and one way in. Ported from
 * Perch's Landing (docs/research/perch/landing.md); the sitewide reveal
 * footer is owned by SiteShell.
 */
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MortarMark } from '@/components/brand/MortarMark'
import { HeroFilm } from '@/components/HeroFilm'
import { useTheme } from '@/hooks/useTheme'
import './LandingPage.css'

const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Renders the landing page: film layer, header row, text column, facts, stage strip. */
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
        <Button asChild className="land-go">
          <Link to="/sign-in">Open Mortar</Link>
        </Button>
      </header>

      <div className="land-body">
        <div className="land-plate">
          <p className="land-eyebrow">Booking To SPA, For Sales, Loan And Finance</p>
          <h1 className="land-title">Booked is not sold. Signed is.</h1>
        </div>
      </div>

      <dl className="land-facts land-band">
        <div>
          <dt>Chase List</dt>
          <dd>Every stuck booking, the blocker in plain words, and who to chase today</dd>
        </div>
        <div>
          <dt>Bookings</dt>
          <dd>Each unit from booking to SPA, with the days it has sat in every stage</dd>
        </div>
        <div>
          <dt>Forecast</dt>
          <dd>The SPAs you can bank on, not the bookings you hope will convert</dd>
        </div>
      </dl>

      <div className="land-strip" aria-hidden="true">
        <span data-stage="1" />
        <span data-stage="2" />
        <span data-stage="3" />
        <span data-stage="4" />
        <span data-stage="5" />
      </div>
    </main>
  )
}
