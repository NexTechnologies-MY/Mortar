'use client'

import { useActionState, useEffect, useRef } from 'react'
import { type ActionState, createNoteAction } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function NoteForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createNoteAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Each successful save returns a fresh { ok: true } object, so this fires once per save.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Buy snacks for the demo…" autoComplete="off" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="body">Details</Label>
        <Textarea id="body" name="body" rows={3} placeholder="Optional…" />
      </div>
      {state && !state.ok ? (
        <p role="status" aria-live="polite" className="type-copy-14 text-red-900">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" aria-busy={pending} disabled={pending} className="self-start">
        {pending ? 'Adding…' : 'Add Note'}
      </Button>
    </form>
  )
}
