import { beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '@/lib/db'
import { createNote, deleteNote, listNotes } from '@/lib/notes'
import { createTestDb, insertTestUser } from '@/test/db'

describe('notes', () => {
  let db: Db
  let ownerId: string
  let otherId: string

  beforeEach(async () => {
    db = await createTestDb()
    ownerId = (await insertTestUser(db)).id
    otherId = (await insertTestUser(db)).id
  })

  it('creates and lists only the owner’s notes, newest first', async () => {
    await createNote(db, { userId: ownerId, title: 'first' })
    await createNote(db, { userId: ownerId, title: 'second', body: 'details' })
    await createNote(db, { userId: otherId, title: 'someone else’s' })

    const list = await listNotes(db, ownerId)

    expect(list.map((n) => n.title)).toEqual(['second', 'first'])
    expect(list[0].body).toBe('details')
  })

  it('defaults body to an empty string', async () => {
    const note = await createNote(db, { userId: ownerId, title: 'bare' })

    expect(note.body).toBe('')
  })

  it('deletes only when the caller owns the note', async () => {
    const note = await createNote(db, { userId: ownerId, title: 'mine' })

    expect(await deleteNote(db, otherId, note.id)).toBe(false)
    expect(await listNotes(db, ownerId)).toHaveLength(1)

    expect(await deleteNote(db, ownerId, note.id)).toBe(true)
    expect(await listNotes(db, ownerId)).toHaveLength(0)
  })
})
