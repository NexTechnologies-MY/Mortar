import type { Metadata } from 'next'
import { connection } from 'next/server'
import { SignInForm } from '@/components/auth/sign-in-form'
import { enabledSocialProviders } from '@/lib/auth-providers'

export const metadata: Metadata = { title: 'Sign in' }

export default async function SignInPage() {
  // Render per request so the OAuth buttons follow the running deployment's env, not the build's.
  await connection()
  return <SignInForm providers={enabledSocialProviders()} />
}
