/**
 * Public site shell — the chrome around `/` and `/faq`: a fixed top bar whose
 * glass surface fades in on scroll, over the opaque page column that folds up
 * off the fixed footer. The fold-over is recovered from the pre-palette
 * SiteShell (Perch's chrome/Shell.tsx); the app routes, `/sign-in` and the 404
 * never mount it.
 *
 * Three behaviours live here because the fixed layers need them:
 *
 * - The bar starts transparent — background and hairline at opacity 0. A 1px
 *   sentinel at the document top reports to an IntersectionObserver, and the
 *   `site-bar--solid` class fades both in together; CSS owns the transition so
 *   reduced motion collapses it to an instant swap. Without observer support
 *   the bar is born solid rather than invisible.
 * - The drawer is auto-height: a ResizeObserver measures the footer and writes
 *   `--footer-h` on the shell, and the page column reserves exactly that as
 *   bottom margin. The CSS declares fallback heights so the layout is near-
 *   right before the first measurement and when ResizeObserver is absent.
 * - The fixed footer is always "in view" to the browser, so a keyboard-focused
 *   footer link would paint its ring under the page column; the focusin
 *   listener jumps to the document floor instead (WCAG 2.4.11).
 */

import { useEffect, useRef } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'
import { Button } from '@/components/ui/button'
import { AppFooter } from './AppFooter'
import './SiteShell.css'

/** Renders the public bar, the matched route's page column and the reveal footer. */
export function SiteShell() {
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLElement>(null)
  const foot = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = bar.current
    const sentinel = document.getElementById('site-sentinel')
    if (!el || !sentinel || !('IntersectionObserver' in window)) {
      el?.classList.add('site-bar--solid')
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      el.classList.toggle('site-bar--solid', !entry.isIntersecting)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = foot.current
    const host = root.current
    if (!el || !host || !('ResizeObserver' in window)) return
    const measure = () => host.style.setProperty('--footer-h', `${el.offsetHeight}px`)
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = foot.current
    if (!el) return
    const reveal = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    el.addEventListener('focusin', reveal)
    return () => el.removeEventListener('focusin', reveal)
  }, [])

  return (
    <div className="site" ref={root}>
      <header ref={bar} className="site-bar">
        <div className="site-bar-in">
          <Link to="/" aria-label="Mortar home" className="site-brand">
            <MortarMark size={24} className="text-foreground" />
            <span className="site-wordmark">Mortar</span>
          </Link>
          <nav className="site-nav" aria-label="Site">
            <Button asChild variant="secondary" size="sm">
              <Link to="/sign-in">Open Mortar</Link>
            </Button>
          </nav>
        </div>
      </header>
      <div className="site-page">
        <div id="site-sentinel" aria-hidden="true" className="site-sentinel" />
        <Outlet />
      </div>
      <footer ref={foot} className="site-foot">
        <AppFooter />
      </footer>
    </div>
  )
}
