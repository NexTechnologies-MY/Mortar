/**
 * Top navigation bar for app pages.
 * Shows breadcrumbs, the persona switch, notifications, and the theme toggle.
 */

import { Link, useLocation, useParams } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { PersonaSwitch } from '@/components/layout/PersonaSwitch'
import { SimulationBadge } from '@/components/layout/SimulationBadge'
import { NotificationPopover } from '@/components/ui/NotificationPopover'
import { usePersona } from '@/lib/persona'
import { ChevronRight, Home, Menu } from 'lucide-react'

type Crumb = { label: string; to?: string; icon?: React.ReactNode }

const ROUTE_LABELS: Record<string, string> = {
  '/bookings': 'Bookings',
  '/chase': 'Chase List',
  '/forecast': 'Forecast',
  '/import': 'Import',
  '/settings': 'Settings'
}

function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation()
  const { id } = useParams()
  const { home } = usePersona()

  const crumbs: Crumb[] = [{ label: 'Home', to: home, icon: <Home className="h-3.5 w-3.5" /> }]

  if (id && pathname.startsWith('/bookings/')) {
    crumbs.push({ label: 'Bookings', to: '/bookings' })
    crumbs.push({ label: `Booking ${id}` })
    return crumbs
  }

  const label = ROUTE_LABELS[pathname]
  if (label) crumbs.push({ label })
  return crumbs
}

/**
 * Renders the sticky top nav with route-aware breadcrumbs and workspace controls.
 * @param props - Optional minimal mode plus mobile sidebar menu callback from the app shell.
 */
export function AppNav({ minimal, onMenuClick }: { minimal?: boolean; onMenuClick?: () => void } = {}) {
  const crumbs = useBreadcrumbs()

  // Show only the last (current) crumb on mobile to save horizontal space
  const lastCrumb = crumbs[crumbs.length - 1]

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-sidebar">
      <div className="flex h-14 items-center justify-between gap-2 px-4 sm:px-6 lg:ml-16">
        {/* Left — Hamburger (mobile) + Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-2">
          {!minimal && onMenuClick && (
            <button
              type="button"
              aria-label="Open menu"
              onClick={onMenuClick}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {!minimal && (
            <>
              {/* Full breadcrumbs at sm+ */}
              <div className="hidden min-w-0 items-center gap-1 text-sm sm:flex">
                {crumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
                    {crumb.to ? (
                      <Link
                        to={crumb.to}
                        className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {crumb.icon}
                        <span className="truncate">{crumb.label}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        {crumb.icon}
                        <span className="truncate">{crumb.label}</span>
                      </span>
                    )}
                  </span>
                ))}
              </div>
              {/* Current page only on mobile */}
              <span className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-foreground sm:hidden">
                {lastCrumb?.icon}
                {lastCrumb?.label}
              </span>
            </>
          )}
        </div>

        {/* Right — Simulation Badge + Notifications + Theme + Persona */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <SimulationBadge />
          <NotificationPopover />
          <ThemeToggle />
          <PersonaSwitch />
        </div>
      </div>
    </nav>
  )
}
