/**
 * Site-wide shell — the opaque page column that folds over the fixed footer.
 * Ported from Perch's chrome/Shell.tsx. Every route except `/sign-in` mounts
 * it, so the footer is sitewide. The fixed footer is always "in view" to the
 * browser, so a keyboard-focused footer link would paint its ring under the
 * page; the focusin listener below jumps to the document floor instead
 * (WCAG 2.4.11).
 */

import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { AppFooter } from './AppFooter'
import './SiteShell.css'

/** Renders the matched route inside the page column, with the reveal footer beneath it. */
export function SiteShell() {
  const foot = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = foot.current
    if (!el) return
    const reveal = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    el.addEventListener('focusin', reveal)
    return () => el.removeEventListener('focusin', reveal)
  }, [])

  return (
    <>
      <div className="relative z-[1] min-h-dvh bg-background mb-[var(--footer-h)]">
        <Outlet />
      </div>
      <footer ref={foot} className="fixed inset-x-0 bottom-0 z-0 h-[var(--footer-h)] bg-[var(--footer)]">
        <AppFooter />
      </footer>
    </>
  )
}
