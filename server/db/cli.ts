/** `bun run db:reset`: applies the schema, re-seeds the canonical dataset and prints the new `SimulationMeta`. */
import { SQL } from 'bun'
import { applySchema, resetDatabase } from './reset'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('db:reset needs DATABASE_URL')
  process.exit(1)
}

const sql = new SQL(databaseUrl)
await applySchema(sql)
const meta = await resetDatabase(sql)
await sql.end()
console.log(`reset complete — seed ${meta.seed}, reference ${meta.referenceDate}, resetAt ${meta.resetAt}`)
