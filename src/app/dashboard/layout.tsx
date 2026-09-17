import type { ReactNode } from 'react'
import { requireUser } from '@/lib/session'

/** Everything under /dashboard requires a signed-in user. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser()
  return <>{children}</>
}
