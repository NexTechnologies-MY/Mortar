import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Optimistic redirect for anonymous visitors (Next 16 "proxy", formerly
 * middleware). It only checks that a session cookie exists; protected layouts
 * still verify the session with requireUser().
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/chat/:path*']
}
