'use client'

import { useState, useTransition } from 'react'
import { deleteNoteAction } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'

/** Destructive actions ask once before they run (no undo exists for a delete). */
export function DeleteNoteButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" aria-label={`Delete ${title}`} onClick={() => setConfirming(true)}>
        Delete
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Confirm deleting ${title}`}>
      <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        size="sm"
        aria-busy={pending}
        disabled={pending}
        onClick={() => startTransition(() => deleteNoteAction(id))}
      >
        {pending ? 'Deleting…' : 'Confirm Delete'}
      </Button>
    </div>
  )
}
