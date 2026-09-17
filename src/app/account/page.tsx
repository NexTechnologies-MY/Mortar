import type { Metadata } from 'next'
import { AccountForm } from '@/components/auth/account-form'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Account' }

export default async function AccountPage() {
  const user = await requireUser()
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="type-heading-32">Account</h1>
        <p className="type-copy-16 text-muted-foreground">Update how your name appears across the app.</p>
      </div>
      <AccountForm name={user.name} email={user.email} />
    </div>
  )
}
