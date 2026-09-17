'use client'

import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { continueAfterAuth } from '@/app/(auth)/actions'
import { SocialButtons } from '@/components/auth/social-buttons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth-client'
import type { SocialProvider } from '@/lib/auth-providers'

export function SignInForm({ providers }: { providers: SocialProvider[] }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    await signIn.email(
      { email: String(form.get('email')).trim(), password: String(form.get('password')) },
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
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SocialButtons providers={providers} />
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error ? (
            <p role="status" aria-live="polite" className="type-copy-14 text-red-900">
              {error} Check the email & password and try again.
            </p>
          ) : null}
          <Button type="submit" aria-busy={pending} disabled={pending}>
            {pending ? 'Signing In…' : 'Sign In'}
          </Button>
        </form>
        <p className="type-copy-14 text-muted-foreground">
          No account yet?{' '}
          <Link href="/sign-up" className="text-foreground underline underline-offset-4">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
