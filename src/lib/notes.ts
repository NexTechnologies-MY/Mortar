import { and, desc, eq } from 'drizzle-orm'
import type { Db } from '@/lib/db'
import { type Note, notes } from '@/lib/db/schema'

/**
 * Example query module. Pure functions over a Db handle: no Next.js, no auth,
 * so Vitest runs them against an in-memory PGlite. Server actions in
 * src/app/dashboard/actions.ts add auth + validation and call these.
 */

export function listNotes(db: Db, userId: string): Promise<Note[]> {
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt), desc(notes.id))
}

export async function createNote(db: Db, input: { userId: string; title: string; body?: string }): Promise<Note> {
  const [note] = await db
    .insert(notes)
    .values({ userId: input.userId, title: input.title, body: input.body ?? '' })
    .returning()
  return note
}

/** Returns false when the note does not exist or belongs to someone else. */
export async function deleteNote(db: Db, userId: string, id: string): Promise<boolean> {
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({ id: notes.id })
  return deleted.length > 0
}
