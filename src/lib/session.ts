import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { getAuth } from '@/lib/auth'

/** Current session or null. Cached for the duration of one request. */
export const getSession = cache(async () => getAuth().api.getSession({ headers: await headers() }))

/** Use in protected layouts, pages, and server actions. Redirects anonymous visitors. */
export async function requireUser() {
  const session = await getSession()
  if (!session) redirect('/sign-in')
  return session.user
}
