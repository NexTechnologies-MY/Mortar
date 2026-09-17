import type { Metadata } from 'next'
import { connection } from 'next/server'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { enabledSocialProviders } from '@/lib/auth-providers'

export const metadata: Metadata = { title: 'Sign up' }

export default async function SignUpPage() {
  // Render per request so the OAuth buttons follow the running deployment's env, not the build's.
  await connection()
  return <SignUpForm providers={enabledSocialProviders()} />
}
