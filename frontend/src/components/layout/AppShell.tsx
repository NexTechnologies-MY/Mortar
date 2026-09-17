/**
 * Route-level layout for pages inside the app shell.
 * Renders child routes through React Router's Outlet inside AppLayout.
 */

import { Outlet } from 'react-router-dom'
import { AppLayout } from './AppLayout'

/**
 * Renders the shared sidebar + nav frame around the matched route.
 * Used as the parent layout for every app route.
 */
export function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
