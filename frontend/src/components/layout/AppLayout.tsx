/**
 * Main authenticated application shell.
 * Wraps dashboard and project routes with sidebar navigation and top nav.
 * The app pages carry no site footer; that belongs to the public pages only.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { notificationStore } from '@/lib/notificationStore'
import { AppNav } from './AppNav'
import { AppSidebar } from './AppSidebar'
import { TourProvider } from '@/tour/TourProvider'
import { TourButton } from '@/tour/TourButton'

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
  const { snapshot, refresh } = useSnapshot()
  const { profile, persona } = usePersona()
  useEffect(() => {
    for (const task of snapshot?.tasks ?? []) {
      const relevant =
        persona === 'sales-admin'
          ? task.ownerName === profile?.name && (task.ownerRole === 'sales_admin' || task.ownerRole === 'sales')
          : persona === 'loan-admin'
            ? task.ownerRole === 'loan_admin'
            : persona === 'legal-admin'
              ? task.ownerRole === 'legal'
              : false
      if (relevant && task.status === 'open' && task.managerFlaggedBy) notificationStore.managerTask(task)
    }
  }, [snapshot, persona, profile?.name])
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, 30000)
    return () => clearInterval(timer)
  }, [refresh])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-dvh flex-col">
      <AppSidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <AppNav minimal={minimalNav} onMenuClick={() => setMobileSidebarOpen(true)} />
      <TourProvider>
        <main className="flex-1 pt-14 lg:ml-16">{children}</main>
        <TourButton />
      </TourProvider>
    </div>
  )
}
