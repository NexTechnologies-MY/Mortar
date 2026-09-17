'use client'

import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth-client'
import type { SocialProvider } from '@/lib/auth-providers'

const LABELS: Record<SocialProvider, string> = { github: 'GitHub', google: 'Google' }

/** Renders nothing until a provider's client id + secret are set in .env. */
export function SocialButtons({ providers }: { providers: SocialProvider[] }) {
  if (providers.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {providers.map((provider) => (
        <Button
          key={provider}
          variant="outline"
          type="button"
          onClick={() => signIn.social({ provider, callbackURL: '/dashboard' })}
        >
          Continue with {LABELS[provider]}
        </Button>
      ))}
      <div className="my-2 flex items-center gap-3 type-label-13 text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
