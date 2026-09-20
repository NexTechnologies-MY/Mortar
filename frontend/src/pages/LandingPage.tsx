/**
 * The public landing. The hero is exactly one viewport: the claim, the ledger
 * plate and a scroll cue, over a fine grid whose bloom trails the pointer. The
 * sections after it are sheets that slide up over one another like drawers —
 * each pins while the next covers it — alternating surfaces, on the model of
 * a ledger being leafed through.
 *
 * Two page-level behaviours live here:
 *
 * - The pointer bloom. Fine-pointer, no-preference users only, written once
 *   per animation frame straight into CSS custom properties on the hero; the
 *   coordinates ease toward the pointer so the bloom trails rather than snaps.
 *   No React state moves per pointer event, and the writes stop once the stack
 *   has scrolled over the hero.
 * - The stack measure. Pinned sheets stick bottom-flush when they are taller
 *   than the viewport, so the covering sheet rises over their tail rather than
 *   their head. A ResizeObserver keeps each pin's `--land-stack-top` honest.
 */
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BackToTop } from '@/components/landing/BackToTop'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LedgerPlate } from '@/components/landing/LedgerPlate'
import { Pricing } from '@/components/landing/Pricing'
import { WhyMortar } from '@/components/landing/WhyMortar'
import './LandingPage.css'

/** Renders the landing: the hero exhibit, then the drawer stack of sections. */
export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || typeof window.matchMedia !== 'function') return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    let raf = 0
    let primed = false
    let targetX = 0
    let targetY = 0
    let spotX = 0
    let spotY = 0

    const write = () => {
      raf = 0
      spotX += (targetX - spotX) * 0.22
      spotY += (targetY - spotY) * 0.22
      // The hero stays pinned behind the stack; once the page has scrolled
      // past it the bloom is invisible, so the writes stop.
      if (window.scrollY < hero.offsetHeight) {
        hero.style.setProperty('--land-spot-x', `${spotX.toFixed(1)}px`)
        hero.style.setProperty('--land-spot-y', `${spotY.toFixed(1)}px`)
      }
      if (Math.abs(targetX - spotX) > 0.5 || Math.abs(targetY - spotY) > 0.5) {
        raf = requestAnimationFrame(write)
      }
    }

    const onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect()
      targetX = event.clientX - rect.left
      targetY = event.clientY - rect.top
      if (!primed) {
        spotX = targetX
        spotY = targetY
        primed = true
      }
      hero.dataset.spot = 'on'
      if (!raf) raf = requestAnimationFrame(write)
    }
    const onLeave = () => {
      delete hero.dataset.spot
    }

    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    return () => {
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const pins = Array.from(document.querySelectorAll<HTMLElement>('.land-pin'))
    if (!pins.length || !('ResizeObserver' in window)) return
    const measure = (el: HTMLElement) => {
      el.style.setProperty('--land-stack-top', `${Math.min(0, window.innerHeight - el.offsetHeight)}px`)
    }
    const measureAll = () => pins.forEach(measure)
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) measure(entry.target as HTMLElement)
    })
    pins.forEach((pin) => observer.observe(pin))
    window.addEventListener('resize', measureAll)
    measureAll()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measureAll)
    }
  }, [])

  return (
    <main className="land">
      <section className="land-hero" ref={heroRef} aria-labelledby="land-title">
        <div className="land-hero-in">
          <div className="land-claim">
            <h1 id="land-title" className="land-title">
              Booked Is Not Sold.
              <br />
              Signed Is.
            </h1>
            <p className="land-lede">The AI operations layer that names the blocker on every stuck booking.</p>
            <Button asChild className="land-go">
              <Link to="/sign-in">Open Mortar</Link>
            </Button>
          </div>
          <LedgerPlate />
        </div>
        <a href="#land-how" className="land-cue">
          <span className="land-cue-label">Scroll</span>
          <span className="land-cue-line" aria-hidden="true" />
        </a>
      </section>

      <div className="land-body">
        <div className="land-stack">
          <HowItWorks className="land-pin" />
          <div className="land-rest">
            <div className="land-stack">
              <WhyMortar className="land-pin" />
              <div className="land-rest">
                <div className="land-stack">
                  <Pricing className="land-pin" />
                  <LandingFaq />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BackToTop target={heroRef} />
    </main>
  )
}
