/**
 * Back-to-top control, fixed bottom right. The hero is sticky, so it never
 * leaves the viewport — "the hero is out of view" is measured by scroll
 * position instead: the button appears once the stack has covered the hero,
 * and stays out of the tab order while hidden. Under reduced motion it jumps
 * rather than scrolling smoothly.
 */
import { useEffect, useState, type RefObject } from 'react'
import { ArrowUp } from 'lucide-react'

/** Renders the floating back-to-top button once the hero is scrolled past. */
export function BackToTop({ target }: { target: RefObject<HTMLElement | null> }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = target.current
    if (!hero) return
    let raf = 0
    const check = () => {
      raf = 0
      setShow(window.scrollY >= hero.offsetHeight)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    check()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target])

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })
  }

  return (
    <button
      type="button"
      className="land-top"
      onClick={toTop}
      aria-label="Back To Top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      data-show={show || undefined}
    >
      <ArrowUp aria-hidden="true" />
      <span>Top</span>
    </button>
  )
}
