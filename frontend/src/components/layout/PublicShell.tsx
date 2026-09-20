/**
 * Layout route for the public pages, `/` and `/faq`: the matched page, then
 * the site footer beneath it.
 *
 * The app routes, the 404 and `/sign-in` sit outside this shell and carry no
 * footer. The footer used to be sitewide and fixed to the viewport floor, with
 * the page column folding over it; it is an ordinary block in the flow now, so
 * nothing reserves height for it. The column is full viewport height with the
 * page flexed to fill, which keeps the footer at the bottom of the fold rather
 * than floating mid-screen on a page shorter than the viewport.
 *
 * The footer stays a direct child of a plain element so it keeps its implicit
 * `contentinfo` role, which is what the tests assert on.
 */

import { Outlet } from 'react-router-dom'
import { AppFooter } from './AppFooter'

/** Renders the matched public route with the site footer beneath it. */
export function PublicShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex-1">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  )
}
