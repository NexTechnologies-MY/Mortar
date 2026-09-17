import { randomUUID } from 'node:crypto'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PgliteDb } from '@/lib/db/client'

const ORIGINAL_ENV = { ...process.env }
const globalForDb = globalThis as unknown as { __hackathonDb?: PgliteDb }
const dataDir = join(tmpdir(), `pglite-${randomUUID()}`)

beforeEach(() => {
  delete globalForDb.__hackathonDb
  vi.resetModules()
  process.env = { ...ORIGINAL_ENV, PGLITE_DATA_DIR: dataDir, DATABASE_URL: undefined }
})

afterEach(async () => {
  await globalForDb.__hackathonDb?.$client.close()
  delete globalForDb.__hackathonDb
  process.env = { ...ORIGINAL_ENV }
  rmSync(dataDir, { recursive: true, force: true })
})

describe('getDb', () => {
  it('does not open the database until first use, then reuses one instance', async () => {
    const { getDb } = await import('./index')
    expect(existsSync(dataDir)).toBe(false)

    const db = getDb()
    await db.execute(sql`select 1`)

    expect(existsSync(dataDir)).toBe(true)
    expect(getDb()).toBe(db)
  })

  it('warns when production runs on PGlite because DATABASE_URL is unset', async () => {
    process.env = { ...process.env, NODE_ENV: 'production' }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { getDb } = await import('./index')
    getDb()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('DATABASE_URL'))
    warn.mockRestore()
  })
})
