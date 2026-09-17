import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { notes, user } from '@/lib/db/schema'
import { createTestDb, insertTestUser } from '@/test/db'

describe('database schema', () => {
  it('migrates and round-trips a note with defaults', async () => {
    const db = await createTestDb()
    const owner = await insertTestUser(db)

    const [created] = await db.insert(notes).values({ userId: owner.id, title: 'hello' }).returning()

    expect(created.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(created.body).toBe('')
    expect(created.createdAt).toBeInstanceOf(Date)

    const rows = await db.select().from(notes).where(eq(notes.userId, owner.id))
    expect(rows).toHaveLength(1)
  })

  it('cascades note deletion when the owner is deleted', async () => {
    const db = await createTestDb()
    const owner = await insertTestUser(db)
    await db.insert(notes).values({ userId: owner.id, title: 'orphan?' })

    await db.delete(user).where(eq(user.id, owner.id))

    expect(await db.select().from(notes)).toHaveLength(0)
  })
})
