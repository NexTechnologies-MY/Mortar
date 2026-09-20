/**
 * "How It Works" — the landing's sticky scroll. A rail on the left holds the
 * section title and the four moment names; cards on the right carry a real
 * screenshot each and drive the rail's highlight as they cross the viewport's
 * middle band. Under 900px the rail goes static and the cards stack in order.
 */
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Shot } from './Shot'

type Moment = {
  /** Screenshot basename under /public/landing. */
  base: string
  width: number
  height: number
  /** The step's name, shown in the rail and as the card's heading. */
  title: string
  body: string
  alt: string
  caption: string
}

const MOMENTS: Moment[] = [
  {
    base: 'chasecard',
    width: 1216,
    height: 490,
    title: 'The Stall Is Named',
    body: 'Every morning the Chase List holds the stalled bookings — the blocker in plain words, the financing risk, and Jev’s suggested next action with its owner. Nothing waits to be noticed.',
    alt: 'A stalled booking on the Chase List: unit, buyer, blocker and the suggested next action.',
    caption: 'One stalled booking on the Chase List. Simulated data.'
  },
  {
    base: 'message',
    width: 1612,
    height: 508,
    title: 'A Message Becomes A Proposal',
    body: 'A banker’s message — English, Malay, Chinese or Manglish — is read by Jev into a typed proposal: the event, the document, the owner, with a probability and a confidence. Nothing moves the case until a person confirms it.',
    alt: "A banker's message on a booking's evidence log, with Jev's proposed reading beside it.",
    caption: 'A banker’s message, read by Jev, awaiting confirmation. Simulated data.'
  },
  {
    base: 'tasks',
    width: 1824,
    height: 462,
    title: 'The Task Has An Owner',
    body: 'One click turns the suggestion into a task with an owner and a due date. The open tasks group by owner on the same desk, so who chases what is never ambiguous.',
    alt: 'Open tasks on the Chase List grouped by owner, each with its booking and due date.',
    caption: 'Open tasks on the Chase List, grouped by owner. Simulated data.'
  },
  {
    base: 'forecast',
    width: 2200,
    height: 1375,
    title: 'A Number Finance Can Sign Off',
    body: 'The forecast counts expected signings inside 30 days — each live booking weighted by how cases at its stage actually resolved, with the range, the sample sizes and the backtest in the open.',
    alt: 'The Forecast desk: expected SPA signings within 30 days, the range, stage conversion and the backtest.',
    caption: 'Expected signings within 30 days, with the backtest. Simulated data.'
  }
]

/** Renders the sticky-scroll "How It Works" section. */
export function HowItWorks({ className }: { className?: string }) {
  const [active, setActive] = useState(0)
  const cardsRef = useRef<HTMLDivElement>(null)

  // The step in the rail lights when its card crosses the viewport's middle
  // band. IntersectionObserver only — no scroll listener.
  useEffect(() => {
    const cards = cardsRef.current
    if (!cards || !('IntersectionObserver' in window)) return
    const items = Array.from(cards.querySelectorAll<HTMLElement>('.land-moment'))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = items.indexOf(entry.target as HTMLElement)
            if (index >= 0) setActive(index)
          }
        }
      },
      { rootMargin: '-40% 0px -45% 0px' }
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="land-how" className={cn('land-sheet land-s1', className)} aria-labelledby="land-how-h">
      <div className="land-sect-in land-hiw">
        <div className="land-hiw-rail">
          <div className="land-hiw-rail-in">
            <h2 id="land-how-h" className="land-h2">
              How It Works
            </h2>
            <p className="land-sect-lede">
              Four moments decide whether a booking signs. Mortar makes each one visible, on one case record.
            </p>
            <ol className="land-hiw-steps">
              {MOMENTS.map((m, i) => (
                <li key={m.title} className="land-hiw-step" data-active={i === active || undefined}>
                  {m.title}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="land-hiw-cards" ref={cardsRef}>
          {MOMENTS.map((m) => (
            <article key={m.title} className="land-moment">
              <Shot base={m.base} width={m.width} height={m.height} alt={m.alt} caption={m.caption} />
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
