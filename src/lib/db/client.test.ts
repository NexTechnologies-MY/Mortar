import { randomUUID } from 'node:crypto'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { createPgliteDb } from '@/lib/db/client'

const dirs: string[] = []

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('createPgliteDb', () => {
  it('creates a missing nested data directory instead of failing with ENOENT', async () => {
    const root = join(tmpdir(), `pglite-${randomUUID()}`)
    dirs.push(root)
    const dataDir = join(root, 'nested', 'pglite')

    const db = createPgliteDb(dataDir)
    const result = await db.execute(sql`select 1 as one`)
    await db.$client.close()

    expect(result.rows).toEqual([{ one: 1 }])
    expect(existsSync(dataDir)).toBe(true)
  })

  it('runs fully in memory when no directory is given', async () => {
    const db = createPgliteDb()
    const result = await db.execute(sql`select 2 as two`)
    await db.$client.close()

    expect(result.rows).toEqual([{ two: 2 }])
  })
})
