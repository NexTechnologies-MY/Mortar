/**
 * The hero's exhibit: a fragment of the Bookings ledger, one row visibly
 * stalled. Fixed copy, never fetched — the sr-only figcaption says so, so the
 * figures are never mistaken for a reading of the real book.
 */
import { StatusPill } from '@/components/ui/status-pill'

/** One row of the illustrative ledger. */
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

/** Renders the illustrative ledger card the hero centres on. */
export function LedgerPlate() {
  return (
    <figure className="land-plate">
      <figcaption className="sr-only">An example of the Bookings desk. These figures are illustrative.</figcaption>
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
                <td className="land-mono">{r.id}</td>
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
    </figure>
  )
}
