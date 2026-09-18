/**
 * Main authenticated application shell.
 * Wraps dashboard and project routes with sidebar navigation and top nav.
 * The fixed site footer is rendered by SiteShell above this layout, not here.
 */

import { useState, type ReactNode } from 'react'
import { AppNav } from './AppNav'
import { AppSidebar } from './AppSidebar'

type AppLayoutProps = {
  children: ReactNode
  /** Pass minimal to AppNav for full-screen pages */
  minimalNav?: boolean
}

/**
 * Renders the shared app frame around route content.
 * Expects children for the active page and an optional minimal nav mode for focused screens.
 */
export function AppLayout({ children, minimalNav }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppSidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <AppNav minimal={minimalNav} onMenuClick={() => setMobileSidebarOpen(true)} />
      <main className="flex-1 pt-14 lg:ml-16">{children}</main>
    </div>
  )
}
