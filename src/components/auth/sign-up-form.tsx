'use client'

import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { continueAfterAuth } from '@/app/(auth)/actions'
import { SocialButtons } from '@/components/auth/social-buttons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth-client'
import type { SocialProvider } from '@/lib/auth-providers'

export function SignUpForm({ providers }: { providers: SocialProvider[] }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    await signUp.email(
      {
        name: String(form.get('name')).trim(),
        email: String(form.get('email')).trim(),
        password: String(form.get('password'))
      },
      {
        onSuccess: () => {
          // Fire and forget: returning the redirecting action's promise would block Better Auth's own session refresh.
          void continueAfterAuth('/dashboard')
        },
        onError: (ctx) => {
          setError(ctx.error.message)
          setPending(false)
        }
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>Use your email & a password of at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SocialButtons providers={providers} />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Ada Lovelace…" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="ada@example.com…"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          {error ? (
            <p role="status" aria-live="polite" className="type-copy-14 text-red-900">
              {error} Check the details and try again.
            </p>
          ) : null}
          <Button type="submit" aria-busy={pending} disabled={pending}>
            {pending ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>
        <p className="type-copy-14 text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
