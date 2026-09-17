/**
 * Footer chrome for the app shell.
 * Provides route navigation and Mortar branding after routed page content.
 */

import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

const NAV_LINKS: { label: string; to: string }[] = [
  { label: 'Bookings', to: '/bookings' },
  { label: 'Chase list', to: '/chase' },
  { label: 'Forecast', to: '/forecast' },
  { label: 'Import', to: '/import' }
]

/** Renders footer navigation and Mortar branding for the application shell. */
export function AppFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:gap-x-5">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo className="h-6 w-6" />
            <span className="font-heading text-xs font-semibold tracking-tight">Mortar</span>
          </Link>
          <span className="text-xs text-muted-foreground">&middot; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
