/**
 * The public landing — "the ledger speaks". The page is set like a page from a
 * book: one measured column, hairlines doing the structural work, and the
 * product's own surface as the opening exhibit — a fragment of the Bookings
 * ledger with one row visibly stalled and a footnote that says why.
 *
 * Below the exhibit: what a stall costs, how Mortar names one, and the three
 * desks that share the one case record. The fixed top bar and the fold-over
 * footer are owned by PublicShell.
 *
 * The ledger below is a fixed illustration, not live data. It is labelled as
 * an example for assistive technology so the figures are never mistaken for a
 * reading of the real book.
 */
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import './LandingPage.css'

/** One row of the illustrative ledger. Fixed copy, never fetched. */
type Row = {
  id: string
  unit: string
  buyer: string
  age: string
  /** True when the booking has sat long enough that the age itself is the warning. */
  stalled?: boolean
  stage: { tone: 'info' | 'neutral' | 'signed'; label: string }
  evidence: { tone: 'warning' | 'positive'; label: string }
  risk: { tone: 'danger' | 'warning' | 'positive'; label: string }
}

const ROWS: Row[] = [
  {
    id: 'BK-9007',
    unit: 'B-21-03A',
    buyer: 'Dinesh Kumar a/l Selvam',
    age: '17 d',
    stalled: true,
    stage: { tone: 'info', label: 'With Bank' },
    evidence: { tone: 'warning', label: 'Unknown' },
    risk: { tone: 'positive', label: 'Low Risk' }
  },
  {
    id: 'BK-0043',
    unit: 'C-13-03',
    buyer: 'Ahmad Farid',
    age: '15 d',
    stage: { tone: 'info', label: 'With Bank' },
    evidence: { tone: 'positive', label: 'Fresh' },
    risk: { tone: 'warning', label: 'Medium Risk' }
  },
  {
    id: 'BK-0023',
    unit: 'B-24-01',
    buyer: 'Intan Suraya',
    age: '10 d',
    stage: { tone: 'info', label: 'With Bank' },
    evidence: { tone: 'positive', label: 'Fresh' },
    risk: { tone: 'positive', label: 'Low Risk' }
  },
  {
    id: 'BK-0119',
    unit: 'A-17-02',
    buyer: 'Harjit Singh',
    age: '8 d',
    stage: { tone: 'info', label: 'LO Issued' },
    evidence: { tone: 'positive', label: 'Fresh' },
    risk: { tone: 'positive', label: 'Low Risk' }
  },
  {
    id: 'BK-0112',
    unit: 'A-09-02',
    buyer: 'Lim Wei Lun',
    age: '6 d',
    stage: { tone: 'signed', label: 'SPA Signed' },
    evidence: { tone: 'positive', label: 'Fresh' },
    risk: { tone: 'positive', label: 'Low Risk' }
  }
]

/** The four conditions that put a booking on the Chase List, as the app names them. */
const STALLS: { name: string; rule: string }[] = [
  { name: 'No Evidence', rule: 'Seven days without a confirmed event on the case record.' },
  { name: 'A Document Outstanding', rule: 'A requested document waiting five days or more.' },
  { name: 'An Application Undecided', rule: 'Past the banks’ two-to-nine-working-day decision window.' },
  { name: 'Disputed Evidence', rule: 'A contested event still awaiting a reviewer.' }
]

/** The three desks, with their routes as locators rather than links. */
const DESKS: { name: string; route: string; blurb: string }[] = [
  {
    name: 'Chase List',
    route: '/chase',
    blurb: 'Every stuck booking, the blocker in plain words, and who to chase today.'
  },
  {
    name: 'Bookings',
    route: '/bookings',
    blurb: 'Each unit from booking to SPA, with the days it has sat in every stage.'
  },
  {
    name: 'Forecast',
    route: '/forecast',
    blurb: 'The SPAs you can bank on, not the bookings you hope will convert.'
  }
]

/** Renders the landing page: the exhibit hero, then the three reading sections. */
export function LandingPage() {
  const scrollToStalls = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    document.getElementById('the-cost')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
  }

  return (
    <main className="land">
      <section className="land-hero">
        <div className="land-measure land-hero-in">
          <div className="land-opening">
            <div className="land-claim">
              <h1 className="land-title">
                Booked Is Not Sold.
                <br />
                Signed Is.
              </h1>
              <p className="land-lede">The AI operations layer that names the blocker on every stuck booking.</p>
              <Button asChild className="land-go">
                <Link to="/sign-in">Open Mortar</Link>
              </Button>
            </div>
            <p className="land-meta">
              Aster Heights — The Demonstration Book
              <br />
              As Of 18 Sep 2026 · Simulated Data
            </p>
          </div>

          <figure className="land-plate">
            <figcaption className="sr-only">
              An example of the Bookings desk. These figures are illustrative.
            </figcaption>
            <div className="land-plate-cap">
              <b>Bookings</b>
              <span>148 live · 19 stalled · 5 signed this month</span>
            </div>
            <div className="land-plate-clip">
              <table className="land-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th className="land-c-unit">Unit</th>
                    <th>Buyer</th>
                    <th className="land-c-num">Age</th>
                    <th className="land-c-stage">Stage</th>
                    <th className="land-c-evid">Evidence</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.id}>
                      <td className="land-mono">
                        {r.id}
                        {r.stalled && (
                          <sup className="land-dagger" aria-hidden="true">
                            †
                          </sup>
                        )}
                      </td>
                      <td className="land-mono land-c-unit">{r.unit}</td>
                      <td className="land-buyer">{r.buyer}</td>
                      <td className={r.stalled ? 'land-age land-age-stale' : 'land-age'}>{r.age}</td>
                      <td className="land-c-stage">
                        <StatusPill tone={r.stage.tone}>{r.stage.label}</StatusPill>
                      </td>
                      <td className="land-c-evid">
                        <StatusPill tone={r.evidence.tone}>{r.evidence.label}</StatusPill>
                      </td>
                      <td>
                        <StatusPill tone={r.risk.tone}>{r.risk.label}</StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="land-note">
              <span className="land-note-rule" aria-hidden="true" />
              <p>
                <b>†</b> Stalled — “No Evidence For 12 Days”. The banker has gone quiet; on the Chase List this row
                leads, with the blocker in plain words and the next action assigned.
              </p>
            </div>
          </figure>

          <button type="button" className="land-cue" onClick={scrollToStalls}>
            <span className="land-cue-label">Scroll</span>
            <span className="land-cue-line" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="land-sect" id="the-cost">
        <div className="land-measure">
          <h2 className="land-h2">What A Stall Costs</h2>
          <div className="land-pair">
            <div className="land-cell">
              <p className="land-cell-label">The Leak</p>
              <p className="land-pull">Only zero to two of every ten bookings reach a signed SPA.</p>
              <p className="land-cell-note">
                Three of five practitioners surveyed gave that answer; one said seven to eight, and one could not say.
                No public figure exists — the size of the leak is what nobody can see.
              </p>
            </div>
            <div className="land-cell">
              <p className="land-cell-label">The Clock</p>
              <p className="land-cell-body">
                In PJD Regency v Tribunal Tuntutan Pembeli Rumah (2021), the Federal Court held that late-delivery
                damages run from the booking-fee date, not the SPA. A stalled booking holds its unit off the market for
                six to twelve weeks while the statutory clock keeps counting.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="land-sect">
        <div className="land-measure">
          <h2 className="land-h2">A Stall Has A Name</h2>
          <p className="land-sect-lede">
            Mortar reads the confirmed case record and names the stall in plain words. Four conditions, no judgement
            calls:
          </p>
          <div className="land-rules">
            {STALLS.map((s) => (
              <div key={s.name} className="land-rule">
                <p className="land-rule-name">{s.name}</p>
                <p className="land-rule-text">{s.rule}</p>
              </div>
            ))}
          </div>
          <p className="land-sect-note">
            Each lands on the Chase List with a suggested next action and an owner. Jev proposes; a person confirms.
          </p>
        </div>
      </section>

      <section className="land-sect">
        <div className="land-measure">
          <h2 className="land-h2">Three Desks, One Ledger</h2>
          <div className="land-desks">
            {DESKS.map((d) => (
              <div key={d.name} className="land-desk">
                <h3 className="land-desk-name">{d.name}</h3>
                <p className="land-desk-blurb">{d.blurb}</p>
                <span className="land-desk-route">{d.route}</span>
              </div>
            ))}
          </div>
          <p className="land-sect-note">One case record, read the same way by every desk.</p>
        </div>
      </section>
    </main>
  )
}
