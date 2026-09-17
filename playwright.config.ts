import { loadEnvConfig } from '@next/env'
import { defineConfig, devices } from '@playwright/test'

loadEnvConfig(process.cwd())

const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The e2e run gets its own PGlite directory so your dev database is untouched.
    command: isCI
      ? `bun run db:migrate && bun run build && bun run start -- --port ${PORT}`
      : `bun run db:migrate && bun run dev -- --port ${PORT}`,
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 240_000,
    env: {
      PGLITE_DATA_DIR: './.data/e2e',
      DATABASE_URL: '',
      BETTER_AUTH_URL: BASE_URL,
      NEXT_PUBLIC_APP_URL: BASE_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'e2e-only-secret-0123456789abcdef0123456789'
    }
  }
})
