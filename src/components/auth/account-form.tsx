'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export function AccountForm({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    const { error } = await authClient.updateUser({ name: String(form.get('name')).trim() })
    setPending(false)
    setMessage(error ? `${error.message ?? 'Could not save the name'}. Try again.` : 'Name saved.')
    if (!error) router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" defaultValue={name} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled readOnly />
        <p className="type-copy-14 text-muted-foreground">
          Email changes need verification, which this template leaves to you.
        </p>
      </div>
      {message ? (
        <p role="status" aria-live="polite" className="type-copy-14 text-muted-foreground">
          {message}
        </p>
      ) : null}
      <Button type="submit" aria-busy={pending} disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Save Name'}
      </Button>
    </form>
  )
}
