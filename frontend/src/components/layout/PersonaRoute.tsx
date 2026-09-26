/**
 * Route guard for the persona-scoped pages.
 *
 * Each role sees its own pages only: the sidebar is built from
 * `PERSONA_PAGES`, and this guard makes the URL agree with it. Opening a page
 * the active persona cannot see sends them to their own home and says why in
 * one toast, so the redirect reads as a boundary rather than a broken link.
 *
 * Mounted around the persona-scoped routes only. The case page `/bookings/:id`
 * is open to every role, because any of them can be handed a case to look at,
 * and `/app` and the public pages are never guarded.
 */

import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { notify } from '@/components/ui/toastConfig'
import { canPersonaOpen, pageLabelFor, usePersona } from '@/lib/persona'

export function PersonaRoute({ children }: { children: ReactNode }) {
  const { persona, meta, home } = usePersona()
  const { pathname } = useLocation()
  const allowed = canPersonaOpen(persona, pathname)

  useEffect(() => {
    if (allowed) return
    notify.warning(`${pageLabelFor(pathname)} Is On The ${meta.label} Desk`)
  }, [allowed, meta.label, pathname])

  if (!allowed) return <Navigate to={home} replace />
  return <>{children}</>
}
