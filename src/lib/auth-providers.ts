import { env } from '@/lib/env'

export type SocialProvider = 'github' | 'google'

type Credentials = { clientId: string; clientSecret: string }

/** Client id + secret for every provider that is fully configured in .env. */
export function socialProviderCredentials(): Partial<Record<SocialProvider, Credentials>> {
  const configured: Partial<Record<SocialProvider, Credentials>> = {}
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    configured.github = { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET }
  }
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    configured.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
  }
  return configured
}

/** Providers that get a "Continue with" button. */
export function enabledSocialProviders(): SocialProvider[] {
  return Object.keys(socialProviderCredentials()) as SocialProvider[]
}
