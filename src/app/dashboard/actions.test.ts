import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Db } from '@/lib/db'
import { createNote, listNotes } from '@/lib/notes'
import { createTestDb, insertTestUser } from '@/test/db'

// Server actions depend on Next.js request context. Swap the three seams for
// test doubles and run the real validation + query code against PGlite.
const ctx = vi.hoisted(() => ({ db: null as Db | null, userId: '' }))
vi.mock('@/lib/db', () => ({ getDb: () => ctx.db }))
vi.mock('@/lib/session', () => ({ requireUser: async () => ({ id: ctx.userId }) }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const { createNoteAction, deleteNoteAction } = await import('./actions')

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

describe('dashboard actions', () => {
  let db: Db

  beforeEach(async () => {
    db = await createTestDb()
    ctx.db = db
    ctx.userId = (await insertTestUser(db)).id
  })

  it('rejects an empty title with a readable message', async () => {
    const result = await createNoteAction(null, form({ title: '   ', body: '' }))

    expect(result).toEqual({ ok: false, error: 'Title is required' })
    expect(await listNotes(db, ctx.userId)).toHaveLength(0)
  })

  it('creates a note for the signed-in user', async () => {
    const result = await createNoteAction(null, form({ title: 'Ship it', body: 'before 9am' }))

    expect(result).toEqual({ ok: true })
    const [note] = await listNotes(db, ctx.userId)
    expect(note).toMatchObject({ title: 'Ship it', body: 'before 9am', userId: ctx.userId })
  })

  it('ignores a malformed id instead of throwing', async () => {
    await createNote(db, { userId: ctx.userId, title: 'keep me' })

    await expect(deleteNoteAction('not-a-uuid')).resolves.toBeUndefined()

    expect(await listNotes(db, ctx.userId)).toHaveLength(1)
  })

  it('deletes the signed-in user’s note', async () => {
    const note = await createNote(db, { userId: ctx.userId, title: 'delete me' })

    await deleteNoteAction(note.id)

    expect(await listNotes(db, ctx.userId)).toHaveLength(0)
  })
})
