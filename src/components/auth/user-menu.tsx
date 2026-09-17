'use client'

import Link from 'next/link'
import { useState } from 'react'
import { continueAfterAuth } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from '@/lib/auth-client'

export function UserMenu() {
  const { data: session, isPending } = useSession()
  const [signingOut, setSigningOut] = useState(false)

  if (isPending) return <div className="h-8 w-40" aria-hidden />

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/account">{session.user.name || session.user.email}</Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        aria-busy={signingOut}
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true)
          void signOut({
            fetchOptions: {
              onSuccess: () => {
                void continueAfterAuth('/')
              },
              onError: () => setSigningOut(false)
            }
          })
        }}
      >
        {signingOut ? 'Signing Out…' : 'Sign Out'}
      </Button>
    </div>
  )
}
