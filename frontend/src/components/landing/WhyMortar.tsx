/**
 * "Why Use Mortar" — the concrete gains, grounded in the product overview and
 * the practitioner survey (n = 5). Every number reads as "n of 5"; nothing is
 * invented.
 */
import { cn } from '@/lib/utils'

const STATS: { figure: string; label: string }[] = [
  {
    figure: '5 of 5',
    label: 'Practitioners name loan rejection the biggest cause of leakage — survey, n = 5.'
  },
  {
    figure: '0–2 of 10',
    label: 'Bookings reaching a signed SPA, per 3 of 5 practitioners. The leak is real; its size is what nobody sees.'
  },
  {
    figure: '6–12 weeks',
    label: 'A stalled unit sits off the market while the statutory delivery clock keeps counting.'
  }
]

/** Renders the "Why Use Mortar" section: the grounded stat band and the pair. */
export function WhyMortar({ className }: { className?: string }) {
  return (
    <section className={cn('land-sheet land-s1', className)} aria-labelledby="land-why-h">
      <div className="land-sect-in">
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
              Practitioners asked for AI on document checks (3 of 5) and next actions (2 of 5); only 1 of 5 would let it
              score conversion. So Jev reads and proposes, a person confirms — and the forecast stays statistics, not
              vibes.
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
      </div>
    </section>
  )
}
