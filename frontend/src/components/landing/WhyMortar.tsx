/**
 * "Why Use Mortar" — the concrete gains, grounded in the product overview and
 * the practitioner survey (n = 8). Every number reads as "n of 8"; nothing is
 * invented. A block, not a sheet: LandingPage folds it into the single drawer
 * it shares with Pricing.
 */
import { cn } from '@/lib/utils'

const STATS: { figure: string; label: string }[] = [
  {
    figure: '8 of 8',
    label:
      'Practitioners rank financing eligibility the best signal that a booking will reach a signed SPA — survey, n = 8.'
  },
  {
    figure: '7 of 8',
    label: 'Practitioners name loan rejection or insufficient financing the biggest cause of leakage.'
  },
  {
    figure: '0–2 of 10',
    label: 'Bookings reach a signed SPA, say half the practitioners. The leak is real; its size is what nobody sees.'
  }
]

/** Renders the "Why Use Mortar" block: the grounded stat band and the pair. */
export function WhyMortar({ className }: { className?: string }) {
  return (
    <section className={cn('land-block', className)} aria-labelledby="land-why-h">
      <h2 id="land-why-h" className="land-h2">
        Why Use Mortar
      </h2>
      <p className="land-sect-lede">
        Bookings leak quietly between the deposit and the SPA. Mortar makes every stall visible, named and owned.
      </p>

      <div className="land-stats">
        {STATS.map((s) => (
          <div key={s.figure} className="land-stat">
            <p className="land-stat-figure">{s.figure}</p>
            <p className="land-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="land-pair">
        <div className="land-cell">
          <h3 className="land-cell-title">Jev Proposes. People Decide.</h3>
          <p className="land-cell-body">
            Practitioners asked for AI on next actions (4 of 8), document checks (3 of 8), and summarising WhatsApp and
            banker updates (3 of 8); only one respondent would let AI score conversion. So Jev reads and proposes, a
            person confirms — and the forecast stays statistics, not vibes.
          </p>
        </div>
        <div className="land-cell">
          <h3 className="land-cell-title">One Record, Three Desks</h3>
          <p className="land-cell-body">
            Tracking today is split across CRMs, spreadsheets and email. Mortar keeps one confirmed case record that
            Sales, Loan Admin and Finance read the same way.
          </p>
        </div>
      </div>
    </section>
  )
}
