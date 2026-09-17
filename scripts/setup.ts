import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * One-time local setup (`bun run setup`):
 *   1. create .env from .env.example with a fresh BETTER_AUTH_SECRET
 *   2. apply database migrations (PGlite by default, no server needed)
 */
if (existsSync('.env')) {
  console.log('.env already exists; leaving it alone.')
} else {
  const secret = randomBytes(32).toString('base64url')
  const example = readFileSync('.env.example', 'utf8')
  writeFileSync('.env', example.replace(/^BETTER_AUTH_SECRET=.*$/m, `BETTER_AUTH_SECRET=${secret}`))
  console.log('Created .env with a generated BETTER_AUTH_SECRET.')
}

const migrate = spawnSync('bun', ['run', 'db:migrate'], { stdio: 'inherit' })
if (migrate.status !== 0) process.exit(migrate.status ?? 1)

console.log('\nReady. Start the app with: bun run dev')
