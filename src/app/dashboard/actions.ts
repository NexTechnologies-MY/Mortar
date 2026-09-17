'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { createNote, deleteNote } from '@/lib/notes'
import { requireUser } from '@/lib/session'

/**
 * Server actions stay thin: check the session, validate input, call the
 * query module, revalidate. Business logic lives in src/lib.
 */

export type ActionState = { ok: true } | { ok: false; error: string } | null

const noteInput = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Keep titles under 120 characters'),
  body: z.string().trim().max(5000, 'Keep notes under 5000 characters')
})

const noteId = z.uuid()

export async function createNoteAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const parsed = noteInput.safeParse({
    title: formData.get('title') ?? '',
    body: formData.get('body') ?? ''
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  await createNote(getDb(), { userId: user.id, ...parsed.data })
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function deleteNoteAction(id: string): Promise<void> {
  const user = await requireUser()
  const parsed = noteId.safeParse(id)
  if (!parsed.success) return

  await deleteNote(getDb(), user.id, parsed.data)
  revalidatePath('/dashboard')
}
