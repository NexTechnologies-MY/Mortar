/**
 * Collapsible app sidebar navigation.
 * Used by the app shell on desktop and as a slide-in menu on mobile.
 *
 * The items come from `PERSONA_PAGES`, the same map `PersonaRoute` guards
 * against, so a role can never be shown a page it cannot open. Two groups read
 * down the rail: Primary, where the persona's own desk leads, and More.
 */

import { useState, useCallback, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { BellRing, ChevronLeft, ClipboardList, FileUp, Scale, Settings, TrendingUp, UsersRound, X } from 'lucide-react'
import { MortarMark } from '@/components/brand/MortarMark'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NAV_GROUP_LABELS, pagesForPersona, usePersona, type NavGroup, type PersonaPage } from '@/lib/persona'

const SIDEBAR_EXPANDED = 200
const SIDEBAR_COLLAPSED = 64

/** Glyph per page, chosen by the work the page is for rather than by its rank. */
const PAGE_ICONS: Record<string, LucideIcon> = {
  '/chase': BellRing,
  '/team': UsersRound,
  '/bookings': ClipboardList,
  '/legal': Scale,
  '/import': FileUp,
  '/forecast': TrendingUp,
  '/settings': Settings
}

/** Crossfade section heading: divider when collapsed, title text when expanded */
function SectionHeading({
  title,
  first,
  alwaysExpanded
}: {
  title: string
  first?: boolean
  alwaysExpanded?: boolean
}) {
  return (
    <div className={`relative mb-1 flex h-5 items-center ${first ? '' : 'mt-4'}`}>
      <div
        className={`absolute inset-x-0 h-px bg-border transition-opacity duration-150 ${
          alwaysExpanded ? 'opacity-0' : 'group-hover/sidebar:opacity-0'
        }`}
      />
      <p
        className={`whitespace-nowrap px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-opacity duration-150 ${
          alwaysExpanded ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'
        }`}
      >
        {title}
      </p>
    </div>
  )
}

/** Sidebar nav link — icon always at fixed w-8 center, label fades in on expand */
function NavLink({
  to,
  icon: Icon,
  label,
  active,
  alwaysExpanded,
  onClick
}: {
  to: string
  icon: LucideIcon
  label: string
  active: boolean
  alwaysExpanded?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative flex h-12 items-center gap-2.5 rounded-md px-2 text-sm transition-colors duration-[var(--motion-fast)] ${
        active
          ? 'bg-selected font-medium text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      <span className="flex w-8 shrink-0 items-center justify-center">
        <Icon
          className={`h-4 w-4 shrink-0 ${
            active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
          }`}
        />
      </span>
      <span
        className={`flex-1 truncate whitespace-nowrap transition-opacity duration-150 ${
          alwaysExpanded ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'
        }`}
      >
        {label}
      </span>
    </Link>
  )
}

/** One group of nav links under its heading, in the order the page map lists. */
function NavGroup({
  group,
  pages,
  pathname,
  alwaysExpanded,
  onNavigate
}: {
  group: NavGroup
  pages: PersonaPage[]
  pathname: string
  alwaysExpanded?: boolean
  onNavigate?: () => void
}) {
  if (pages.length === 0) return null
  return (
    <>
      <SectionHeading title={NAV_GROUP_LABELS[group]} first={group === 'primary'} alwaysExpanded={alwaysExpanded} />
      {pages.map((page) => (
        <NavLink
          key={page.to}
          to={page.to}
          icon={PAGE_ICONS[page.to] ?? ClipboardList}
          label={page.label}
          active={pathname === page.to || pathname.startsWith(`${page.to}/`)}
          alwaysExpanded={alwaysExpanded}
          onClick={onNavigate}
        />
      ))}
    </>
  )
}

type AppSidebarProps = {
  /** Whether the mobile drawer is open (only relevant below lg breakpoint) */
  mobileOpen?: boolean
  /** Callback to close the mobile drawer */
  onMobileClose?: () => void
}

/**
 * Renders the app sidebar with hover expansion on desktop and controlled visibility on mobile.
 * Expects optional mobile open state and close callback from the surrounding app layout.
 */
export function AppSidebar({ mobileOpen = false, onMobileClose }: AppSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(true)
  const { pathname } = useLocation()
  const { persona } = usePersona()

  const handleMouseEnter = useCallback(() => setCollapsed(false), [])
  const handleMouseLeave = useCallback(() => setCollapsed(true), [])

  // Each persona sees only its own pages, its own desk first.
  const pages = pagesForPersona(persona)
  const primary = pages.filter((page) => page.group === 'primary')
  const more = pages.filter((page) => page.group === 'more')

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileOpen])

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) onMobileClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {/* Desktop sidebar (hover-collapse, lg+ only) */}
      <aside
        data-sidebar
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        className="group/sidebar fixed inset-y-0 left-0 z-[60] hidden flex-col overflow-hidden border-r border-border bg-sidebar lg:flex"
      >
        {/* Logo */}
        <div className="sidebar-logo-divider flex h-14 shrink-0 items-center gap-3 px-[18px]">
          <Link to="/" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
            <MortarMark className="text-foreground" />
          </Link>
          <span className="whitespace-nowrap font-heading text-sm font-semibold tracking-tight opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
            Mortar
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1.5 overflow-x-hidden overflow-y-auto px-2 py-3">
          <NavGroup group="primary" pages={primary} pathname={pathname} />
          <NavGroup group="more" pages={more} pathname={pathname} />
        </nav>

        {/* Collapse indicator */}
        <div className="w-16 shrink-0 py-3">
          <div className="flex items-center justify-center text-muted-foreground">
            <ChevronLeft
              className="h-4 w-4 transition-transform duration-150 ease-in-out"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        </div>
      </aside>

      {/* Scrim — dims everything under the expanded desktop sidebar */}
      <div className="sidebar-scrim" data-open={!collapsed} />

      {/* Mobile drawer (slide-in from left, always expanded labels) */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop — same scrim look as the desktop sidebar's, but clickable */}
        <div onClick={onMobileClose} className="sidebar-scrim drawer-scrim" data-open={mobileOpen} />
        {/* Drawer panel */}
        <aside
          className={`relative flex h-full w-64 max-w-[80vw] flex-col overflow-hidden border-r border-border bg-sidebar shadow-[var(--shadow-overlay)] transition-transform duration-200 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo + close */}
          <div className="sidebar-logo-divider flex h-14 shrink-0 items-center justify-between gap-3 px-[18px]">
            <Link
              to="/"
              onClick={onMobileClose}
              className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
            >
              <MortarMark className="text-foreground" />
              <span className="whitespace-nowrap font-heading text-sm font-semibold tracking-tight">Mortar</span>
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={onMobileClose}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Close Menu</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-1.5 overflow-x-hidden overflow-y-auto px-2 py-3">
            <NavGroup group="primary" pages={primary} pathname={pathname} alwaysExpanded onNavigate={onMobileClose} />
            <NavGroup group="more" pages={more} pathname={pathname} alwaysExpanded onNavigate={onMobileClose} />
          </nav>
        </aside>
      </div>
    </>
  )
}
