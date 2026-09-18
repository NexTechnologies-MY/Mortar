/**
 * Scrolls the window back to the top on every route change.
 * Mounted once inside the router in main.tsx; renders nothing.
 */

import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Take over the browser's scroll memory so back/forward land at the top too
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

/**
 * Runs a scroll reset keyed on the current pathname.
 * Expects to be mounted inside a router; returns null.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    // 'instant' beats the smooth scroll-behavior globals.css sets on html
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
