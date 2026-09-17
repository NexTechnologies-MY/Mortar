import { mkdirSync } from 'node:fs'
import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

// Load .env the same way Next.js does so `bun run db:*` sees DATABASE_URL.
loadEnvConfig(process.cwd())

const databaseUrl = process.env.DATABASE_URL
const pgliteDir = process.env.PGLITE_DATA_DIR || './.data/pglite'

// PGlite does not create parent directories itself.
if (!databaseUrl) mkdirSync(pgliteDir, { recursive: true })

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  ...(databaseUrl ? { dbCredentials: { url: databaseUrl } } : { driver: 'pglite', dbCredentials: { url: pgliteDir } })
})
