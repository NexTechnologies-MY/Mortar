/**
 * The public landing — product-led, the way Mortar sells itself internally.
 * The hero is exactly one viewport: the claim on one side, a real capture of
 * the Chase List on the other, and a deliberate cue to scroll. Below the fold
 * a short narrative walks the three moments that matter — the stuck booking
 * found, the message turned into a confirmed update, the forecast Finance can
 * sign off — each anchored to a screenshot captured from the running app, not
 * an illustration. It closes on the one measure Mortar is judged by.
 *
 * Every image is a real screenshot of the prototype on its simulated book.
 * Because the theme is a class on <html> rather than a media query, each
 * figure carries a light and a dark copy of the same capture and CSS picks the
 * one to paint; the dark copy is decorative duplication, so it is hidden from
 * assistive technology. The hero adds a phone-width capture for small screens.
 */
import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import './LandingPage.css'

type ShotProps = {
  /** Basename under /public/landing — the files are `<base>-light.webp` and `<base>-dark.webp`. */
  base: string
  /** Phone-width basenames, shown under 720px when the desktop crop would scale to nothing. */
  mobileBase?: string
  /** Natural dimensions of the desktop captures, for aspect ratio before load. */
  width: number
  height: number
  /** Natural dimensions of the mobile captures. */
  mobileWidth?: number
  mobileHeight?: number
  alt: string
  caption: string
  className?: string
}

/** One screenshot figure: the same capture in both themes, captioned as evidence. */
function Shot({ base, mobileBase, width, height, mobileWidth, mobileHeight, alt, caption, className }: ShotProps) {
  return (
    <figure className={`land-shot${mobileBase ? ' has-m' : ''}${className ? ` ${className}` : ''}`}>
      <div className="land-shot-frame">
        <img className="land-img d-light" src={`/landing/${base}-light.webp`} width={width} height={height} alt={alt} />
        <img
          className="land-img d-dark"
          src={`/landing/${base}-dark.webp`}
          width={width}
          height={height}
          alt=""
          aria-hidden="true"
        />
        {mobileBase ? (
          <>
            <img
              className="land-img m-light"
              src={`/landing/${mobileBase}-light.webp`}
              width={mobileWidth}
              height={mobileHeight}
              alt=""
              aria-hidden="true"
            />
            <img
              className="land-img m-dark"
              src={`/landing/${mobileBase}-dark.webp`}
              width={mobileWidth}
              height={mobileHeight}
              alt=""
              aria-hidden="true"
            />
          </>
        ) : null}
      </div>
      <figcaption className="land-cap">{caption}</figcaption>
    </figure>
  )
}

/** Renders the landing: the one-viewport hero, three product moments, the close. */
export function LandingPage() {
  return (
    <main className="land">
      <section className="land-hero">
        <div className="land-hero-in">
          <div className="land-claim">
            <p className="land-eyebrow">Booking-To-SPA Operations</p>
            <h1 className="land-title">
              Booked Is Not Sold.
              <br />
              Signed Is.
            </h1>
            <p className="land-lede">
              Mortar tracks every booked unit from paid deposit to a signed Sale &amp; Purchase Agreement — naming the
              blocker, the owner and the evidence on every stall, before the booking quietly leaks.
            </p>
            <div className="land-actions">
              <Button asChild>
                <Link to="/sign-in">Open Mortar</Link>
              </Button>
              <Link to="/faq" className="land-sub">
                Read The FAQ
              </Link>
            </div>
          </div>
          <Shot
            base="chase"
            mobileBase="chasem"
            width={2200}
            height={1375}
            mobileWidth={780}
            mobileHeight={1688}
            alt="The Chase List in the running Mortar prototype: stalled bookings with their blockers and owners."
            caption="The Chase List, captured from the running prototype. Simulated data."
            className="land-hero-shot"
          />
        </div>
        <a href="#land-story" className="land-cue">
          <span>The Work</span>
          <ArrowDown size={14} strokeWidth={1.75} aria-hidden="true" />
        </a>
      </section>

      <section id="land-story" className="land-story" aria-label="How Mortar works">
        <article className="land-moment">
          <div className="land-moment-copy">
            <p className="land-kicker">01 · The Stall</p>
            <h2>The Stuck Booking, Found</h2>
            <p>
              Sales Admin opens the Chase List each morning: every stalled booking, its blocker in plain words — no
              confirmed evidence for seven days, a document five days outstanding, an application past the bank&rsquo;s
              decision window — and the person to chase today.
            </p>
          </div>
          <Shot
            base="chasecard"
            width={1216}
            height={490}
            alt="A stalled booking on the Chase List: unit, buyer, blocker and the suggested next action."
            caption="One stalled booking on the Chase List. Simulated data."
          />
        </article>

        <article className="land-moment land-moment--flip">
          <div className="land-moment-copy">
            <p className="land-kicker">02 · The Update</p>
            <h2>A Message Becomes A Confirmed Update</h2>
            <p>
              Jev reads the buyer&rsquo;s and banker&rsquo;s messages — English, Malay, Chinese or Manglish — and
              proposes what happened: an event, a document, an owner, with a confidence. A person confirms or disputes
              every proposal before it touches the case.
            </p>
          </div>
          <Shot
            base="message"
            width={1612}
            height={508}
            alt="A banker's message on a booking's evidence log, with Jev's proposed reading beside it."
            caption="A banker&rsquo;s message, read by Jev, awaiting confirmation. Simulated data."
          />
        </article>

        <article className="land-moment">
          <div className="land-moment-copy">
            <p className="land-kicker">03 · The Forecast</p>
            <h2>A Number Finance Can Sign Off</h2>
            <p>
              The headline counts signed SPAs inside 30 days of booking — each live case weighted by how bookings at its
              stage actually converted, summed with a range around it, and backtested against the book&rsquo;s own
              history.
            </p>
          </div>
          <Shot
            base="forecast"
            width={2200}
            height={1375}
            alt="The Forecast desk: expected SPA signings within 30 days, the range, stage conversion and the backtest."
            caption="Expected signings within 30 days, with the backtest. Simulated data."
          />
        </article>
      </section>

      <section className="land-close">
        <p className="land-eyebrow">The Measure</p>
        <h2>Signed SPAs. Nothing Else Counts.</h2>
        <p>
          Every screen in Mortar answers to one number — the signings the book actually produces, not the bookings it
          hopes will convert.
        </p>
        <Button asChild>
          <Link to="/sign-in">Open Mortar</Link>
        </Button>
      </section>
    </main>
  )
}
