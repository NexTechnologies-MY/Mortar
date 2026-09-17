'use client'

import { Button } from '@/components/ui/button'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <h1 className="type-heading-24">Something went wrong</h1>
      <p className="max-w-prose type-copy-16 text-muted-foreground">
        {error.message || 'The page hit an unexpected error.'} Try again, and if it keeps happening check the server
        logs.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
