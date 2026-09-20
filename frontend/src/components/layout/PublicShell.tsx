/**
 * Layout route for the public pages, `/` and `/faq`.
 *
 * Two pieces of chrome wrap the matched page:
 *
 * - A fixed top bar. It starts transparent with its hairline at opacity 0 and
 *   gains a translucent, blurred surface as the page scrolls, so the brand is
 *   always present but the chrome only materialises once the reader moves.
 *   The fade is driven by a scroll listener writing `--pbar` (0–1); under
 *   `prefers-reduced-motion` the bar snaps between the two states instead.
 *
 * - The fold-over footer, restored from the retired SiteShell. The footer is
 *   fixed to the viewport floor beneath the opaque page column, which reserves
 *   the footer's measured height as bottom margin — scrolling to the end of
 *   the document slides the page up off it. Because the fixed footer is always
 *   "in view" to the browser, a keyboard-focused footer link would paint its
 *   ring under the page; the focusin listener jumps to the document floor
 *   instead (WCAG 2.4.11).
 *
 * The app routes, the 404 and `/sign-in` sit outside this shell and carry
 * neither the bar nor the footer. There is no theme switch on the public
 * pages — the toggle lives in the app shell only.
 */

import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'
import { AppFooter } from './AppFooter'
import './PublicShell.css'

/** Renders the public chrome: fixed bar, folding page column, reveal footer. */
export function PublicShell() {
  const bar = useRef<HTMLElement>(null)
  const column = useRef<HTMLDivElement>(null)
  const foot = useRef<HTMLElement>(null)

  // The bar fades in over the first 64px of scroll; reduced motion snaps it.
  // matchMedia is absent in jsdom, so the media query is optional here.
  useEffect(() => {
    const el = bar.current
    if (!el) return
    const reduced =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const update = () => {
      const y = window.scrollY
      const p = reduced?.matches ? (y > 8 ? 1 : 0) : Math.min(1, Math.max(0, y / 64))
      el.style.setProperty('--pbar', String(p))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    reduced?.addEventListener('change', update)
    return () => {
      window.removeEventListener('scroll', update)
      reduced?.removeEventListener('change', update)
    }
  }, [])

  // The column reserves the footer's measured height as bottom margin.
  // ResizeObserver is absent in jsdom; the one-time measure still runs there.
  useEffect(() => {
    const footer = foot.current
    const col = column.current
    if (!footer || !col) return
    const measure = () => col.style.setProperty('margin-bottom', `${footer.offsetHeight}px`)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  // A focused footer link is under the page column; jump to the document floor.
  useEffect(() => {
    const el = foot.current
    if (!el) return
    const reveal = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    el.addEventListener('focusin', reveal)
    return () => el.removeEventListener('focusin', reveal)
  }, [])

  return (
    <>
      <header ref={bar} className="pbar">
        <MortarMark size={22} className="text-foreground" />
        <span className="pbar-word">Mortar</span>
        <span className="pbar-note">Internal Tool · Simulated Data</span>
      </header>
      <div ref={column} className="pcol">
        <Outlet />
      </div>
      <footer ref={foot} className="pfoot">
        <AppFooter />
      </footer>
    </>
  )
}
