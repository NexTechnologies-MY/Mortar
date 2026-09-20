/**
 * "Pricing" — honest for a prototype. The free card lists what the demo
 * actually does today; the Pro card is an expression of interest, not a price,
 * and the form says out loud that this build stores nothing. A block, not a
 * sheet: LandingPage folds it into the drawer it shares with Why Use Mortar.
 */
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const FREE_FEATURES = [
  'The three desks — Chase, Bookings, Forecast',
  'Jev proposals, each confirmed by a person',
  'The backtested 30-day SPA forecast',
  'Simulated data, resettable in one click'
]

const PRO_FEATURES = [
  'Real accounts and single sign-on',
  'Live spreadsheet intake and ERP integration',
  'Assumptions calibrated on company data',
  'WhatsApp and document-scan intake'
]

/** Renders the pricing section: a free tier and a Pro waitlist. */
export function Pricing({ className }: { className?: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const register = (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) return
    setSent(true)
  }

  return (
    <section className={cn('land-block', className)} aria-labelledby="land-pricing-h">
      <h2 id="land-pricing-h" className="land-h2">
        Pricing
      </h2>
      <p className="land-sect-lede">Mortar is a prototype running on a simulated book. This is what that means.</p>

      <div className="land-plans">
        <div className="land-plan">
          <div className="land-plan-head">
            <h3>Prototype</h3>
            <p className="land-plan-price">Free</p>
            <p className="land-plan-sub">Everything in the demo, today.</p>
          </div>
          <ul className="land-plan-list">
            {FREE_FEATURES.map((f) => (
              <li key={f}>
                <Check aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild variant="secondary" className="land-plan-cta">
            <Link to="/sign-in">Open Mortar</Link>
          </Button>
        </div>

        <div className="land-plan">
          <div className="land-plan-head">
            <h3>Pro</h3>
            <p className="land-plan-price">Not On Sale</p>
            <p className="land-plan-sub">What a production Mortar would add.</p>
          </div>
          <ul className="land-plan-list">
            {PRO_FEATURES.map((f) => (
              <li key={f}>
                <Check aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          {sent ? (
            <p className="land-plan-note" role="status">
              Noted — this build stores nothing, so keep the address; the pilot decides what Pro becomes.
            </p>
          ) : (
            <form className="land-plan-form" onSubmit={register}>
              <label className="sr-only" htmlFor="land-plan-email">
                Work Email
              </label>
              <Input
                id="land-plan-email"
                type="email"
                required
                autoComplete="email"
                placeholder="work@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="secondary">
                Register Interest
              </Button>
            </form>
          )}
          <p className="land-plan-note">An expression of interest, not a checkout. No prices exist to quote yet.</p>
        </div>
      </div>
    </section>
  )
}
