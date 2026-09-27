/** `bun run db:reset`: applies the schema and adds canonical demo data. */
import { SQL } from 'bun'
import { addDemoData, applySchema } from './reset'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('db:reset needs DATABASE_URL')
  process.exit(1)
}

const sql = new SQL(databaseUrl)
await applySchema(sql)
const meta = await addDemoData(sql)
await sql.end()
console.log(`demo data ready — seed ${meta.seed}, reference ${meta.referenceDate}, resetAt ${meta.resetAt}`)
