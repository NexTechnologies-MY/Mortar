'use server'

import { redirect } from 'next/navigation'

const DESTINATIONS = ['/dashboard', '/'] as const
type Destination = (typeof DESTINATIONS)[number]

/**
 * Navigate after the session changed (sign-in, sign-up, sign-out).
 *
 * A plain `router.push()` can reuse a redirect the router prefetched while the
 * visitor was still anonymous (`/dashboard` → `/sign-in`), which only shows up
 * in production builds because dev never prefetches. A server-action
 * `redirect()` ships fresh RSC data for the target, so the router renders the
 * page for the new session instead.
 */
export async function continueAfterAuth(to: Destination): Promise<never> {
  redirect(DESTINATIONS.includes(to) ? to : '/')
}
