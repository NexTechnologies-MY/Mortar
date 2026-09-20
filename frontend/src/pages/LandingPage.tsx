/**
 * The public landing. It leads with the claim, then shows the product rather
 * than describing it: a sample of the Bookings ledger on the one chromatic
 * surface Mortar allows, and the three desks beneath it. The sitewide reveal
 * footer is owned by SiteShell.
 *
 * The ledger below is a fixed illustration, not live data. It is labelled as
 * an example for assistive technology so the figures are never mistaken for a
 * reading of the real book.
 */
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusPill } from '@/components/ui/status-pill'
import { MortarMark } from '@/components/brand/MortarMark'
import { useTheme } from '@/hooks/useTheme'
import './LandingPage.css'

/** One row of the illustrative ledger. Fixed copy, never fetched. */
type Row = {
  id: string
  unit: string
  buyer: string
  age: string
  /** True when the booking has sat long enough that the age itself is the warning. */
  stale?: boolean
  stage: { tone: 'info' | 'signed'; label: string }
  evidence: { tone: 'warning' | 'positive'; label: string }
  risk: { tone: 'danger' | 'warning' | 'positive'; label: string }
  owner: string
}

const ROWS: Row[] = [
  {
    id: 'BK-0043',
    unit: 'C-13-03',
    buyer: 'Ahmad Farid',
    age: '18 d',
    stale: true,
    stage: { tone: 'info', label: 'With Bank' },
    evidence: { tone: 'warning', label: 'Unknown' },
    risk: { tone: 'danger', label: 'High Risk' },
    owner: 'Nurul Aina'
  },
  {
    id: 'BK-9007',
    unit: 'B-21-03A',
    buyer: 'Dinesh Kumar a/l Selvam',
    age: '17 d',
    stale: true,
    stage: { tone: 'info', label: 'With Bank' },
    evidence: { tone: 'warning', label: 'Unknown' },
    risk: { tone: 'positive', label: 'Low Risk' },
    owner: 'Nurul Aina'
  },
  {
    id: 'BK-0070',
    unit: 'A-28-05',
    buyer: 'Wong Zhi Xuan',
    age: '14 d',
    stale: true,
    stage: { tone: 'info', label: 'With Bank' },
    evidence: { tone: 'positive', label: 'Fresh' },
    risk: { tone: 'warning', label: 'Medium Risk' },
    owner: 'Tan Mei Ling'
  },
  {
    id: 'BK-0023',
    unit: 'B-24-01',
    buyer: 'Intan Suraya',
    age: '10 d',
    stage: { tone: 'info', label: 'With Bank' },
    evidence: { tone: 'positive', label: 'Fresh' },
    risk: { tone: 'positive', label: 'Low Risk' },
    owner: 'Tan Mei Ling'
  },
  {
    id: 'BK-0112',
    unit: 'A-09-02',
    buyer: 'Lim Wei Lun',
    age: '6 d',
    stage: { tone: 'signed', label: 'SPA Signed' },
    evidence: { tone: 'positive', label: 'Fresh' },
    risk: { tone: 'positive', label: 'Low Risk' },
    owner: 'Arvind Raj'
  }
]

const DESKS: { name: string; blurb: string }[] = [
  { name: 'Chase List', blurb: 'Every stuck booking, the blocker in plain words, and who to chase today.' },
  { name: 'Bookings', blurb: 'Each unit from booking to SPA, with the days it has sat in every stage.' },
  { name: 'Forecast', blurb: 'The SPAs you can bank on, not the bookings you hope will convert.' }
]

/** Renders the landing page: header row, claim, sample ledger, the three desks. */
export function LandingPage() {
  const { resolved, toggle } = useTheme()
  const next = resolved === 'light' ? 'dark' : 'light'

  return (
    <main className="land">
      <header className="land-head">
        <MortarMark size={26} className="text-foreground" />
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
      </header>

      <section className="land-hero">
        <h1 className="land-title">
          Booked Is Not Sold.
          <br />
          Signed Is.
        </h1>
        <p className="land-lede">The AI operations layer that names the blocker on every stuck booking.</p>
        <Button asChild className="land-go">
          <Link to="/sign-in">Open Mortar</Link>
        </Button>
      </section>

      <div className="land-panel">
        <figure className="land-ledger">
          <figcaption className="sr-only">An example of the Bookings desk. These figures are illustrative.</figcaption>
          <div className="land-ledger-cap">
            <b>Bookings</b>
            <span>148 live · 19 stalled · 5 signed this month</span>
          </div>
          <table className="land-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Unit</th>
                <th>Buyer</th>
                <th>Age</th>
                <th>Stage</th>
                <th>Evidence</th>
                <th>Risk</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-[13px] font-medium">{r.id}</td>
                  <td className="font-mono text-[13px] font-medium">{r.unit}</td>
                  <td>{r.buyer}</td>
                  <td className={r.stale ? 'land-stale' : undefined}>{r.age}</td>
                  <td>
                    <StatusPill tone={r.stage.tone}>{r.stage.label}</StatusPill>
                  </td>
                  <td>
                    <StatusPill tone={r.evidence.tone}>{r.evidence.label}</StatusPill>
                  </td>
                  <td>
                    <StatusPill tone={r.risk.tone}>{r.risk.label}</StatusPill>
                  </td>
                  <td>{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </div>

      <section className="land-desks">
        {DESKS.map((d) => (
          <article key={d.name} className="land-desk">
            <h2>{d.name}</h2>
            <p>{d.blurb}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
