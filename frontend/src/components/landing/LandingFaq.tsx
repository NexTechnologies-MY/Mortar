/**
 * The landing's questions section — the five most worth answering, taken from
 * the FAQ page. Collapsed by default; each row is a button that expands on
 * click, keyboard operable, with a "View All" route to the full list at /faq.
 * The section runs taller than the rest of the stack, and at desktop widths a
 * quiet motif — the kigumi joint as a construction sketch — sits to the right
 * of the cards. Under 1024px the motif folds away.
 */
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUESTIONS: { q: string; a: string[] }[] = [
  {
    q: 'What Is Mortar?',
    a: [
      'Mortar is an internal operations tool for a property developer’s sales, loan and finance staff. It tracks every unit booking from the booking fee to the Sale & Purchase Agreement — the point where a unit is actually sold.',
      'Bookings stall quietly — a rejected loan, a missing payslip, a buyer gone quiet — while the unit sits off the market. Mortar keeps one shared case record and surfaces every stall for a person to chase. This is a prototype: everything in it runs on simulated data.'
    ]
  },
  {
    q: 'Is The Data Real?',
    a: [
      'No. Every booking, buyer, banker, bank and law firm is invented, and every screen carries a Simulated Data badge with its seed and as-of date. A seeded generator produces the cases, calibrated on public Malaysian figures and an anonymous practitioner survey of five industry respondents.'
    ]
  },
  {
    q: 'When Does A Booking Land On The Chase List?',
    a: [
      'When it goes quiet. A live booking with no confirmed evidence for ten days is treated as stalled: its stage pill reads Unknown, the blocker is named in plain words, and the Chase List holds it for the right desk.',
      'The limits are defaults listed on the forecast page’s assumptions panel — placeholders to calibrate on company data. Jev suggests the next action and owner for each stalled case.'
    ]
  },
  {
    q: 'What Does Jev Do?',
    a: [
      'Jev is Mortar’s AI reader. Paste a buyer’s or banker’s message — English, Malay, Chinese or Manglish — and it proposes what happened, such as Documents Requested for a payslip, with a probability and a confidence. It also suggests next actions on the Chase List and ranks the staff playbooks by fit.',
      'Jev only proposes. A person confirms, disputes or dismisses every suggestion before it moves a case, and anything under 60% confidence is flagged Needs Review. The forecast is statistics, not Jev.'
    ]
  },
  {
    q: 'How Does The Forecast Work?',
    a: [
      'It counts signed SPAs, not bookings. A booking is a promise; only a signed SPA — with 10% of the price due on signing — makes the unit sold. The headline is expected signings within 30 days of booking, with a range around it.',
      'Each live booking is weighted by its stage and financing risk, the stage conversion rates and their sample sizes sit beside the figure, and a backtest against the book’s own history is on the same page.'
    ]
  }
]

/**
 * The kigumi joint as a construction sketch: the mark's paths stroked rather
 * than filled, inside a dashed bounding frame with midpoint ticks, a compass
 * arc and a width dimension under it. The wrapper sets the ink; the drawing
 * is decorative only.
 */
function JointSketch() {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
      <circle className="land-art-guide" cx="100" cy="100" r="72" strokeDasharray="1.5 5" />
      <rect className="land-art-guide" x="28" y="28" width="144" height="144" strokeDasharray="1.5 5" />
      <path className="land-art-guide" d="M100 24v8M100 168v8M24 100h8M168 100h8" />
      <path className="land-art-guide" d="M48 156v28M152 156v28" />
      <path className="land-art-guide" d="M48 180v6M152 180v6M48 183H152" />
      <path d="M48 48H120V84H84V152H48Z" />
      <rect x="98" y="92" width="16" height="16" />
      <path className="land-art-brand" d="M152 152H92V116H128V48H152Z" />
    </svg>
  )
}

/** Renders the landing FAQ: five collapsed rows and a route to /faq. */
export function LandingFaq({ className }: { className?: string }) {
  const baseId = useId()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className={cn('land-sheet land-s1', className)} aria-labelledby="land-faq-h">
      <div className="land-sect-in land-faq-sect">
        <div className="land-faq-main">
          <h2 id="land-faq-h" className="land-h2">
            Questions
          </h2>
          <p className="land-sect-lede">The five worth answering first. The full list lives on the FAQ page.</p>

          <div className="land-faqs">
            {QUESTIONS.map((item, i) => {
              const isOpen = open === i
              const bodyId = `${baseId}-faq-${i}`
              return (
                <div key={item.q} className="land-faq" data-open={isOpen || undefined}>
                  <h3>
                    <button
                      type="button"
                      className="land-faq-q"
                      aria-expanded={isOpen}
                      aria-controls={bodyId}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      {item.q}
                      <ChevronDown aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={bodyId} className="land-faq-body" role="region">
                    <div className="land-faq-body-in">
                      {item.a.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Link to="/faq" className="land-more">
            View All
          </Link>
        </div>

        <div className="land-faq-art" aria-hidden="true">
          <JointSketch />
        </div>
      </div>
    </section>
  )
}
