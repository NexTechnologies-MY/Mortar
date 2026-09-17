import { migrate } from 'drizzle-orm/pglite/migrator'
import { createPgliteDb, type Db } from '@/lib/db/client'
import { user } from '@/lib/db/schema'

/** Fresh in-memory Postgres with all migrations applied. Roughly 100ms. */
export async function createTestDb(): Promise<Db> {
  const db = createPgliteDb()
  await migrate(db, { migrationsFolder: 'drizzle' })
  return db
}

export async function insertTestUser(db: Db, overrides: Partial<typeof user.$inferInsert> = {}) {
  const id = overrides.id ?? crypto.randomUUID()
  const [row] = await db
    .insert(user)
    .values({ id, name: 'Test User', email: `${id}@example.com`, emailVerified: true, ...overrides })
    .returning()
  return row
}
