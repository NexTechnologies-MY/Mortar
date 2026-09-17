import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

/**
 * Typed, validated environment. Import `env` instead of touching process.env.
 * A missing or malformed variable fails at boot with the offending keys listed.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Leave unset to use PGlite (a file-backed Postgres) under PGLITE_DATA_DIR.
    DATABASE_URL: z.url().optional(),
    PGLITE_DATA_DIR: z.string().min(1).default('./.data/pglite'),
    BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters (run `bun run setup`)'),
    BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    // Free keys: https://aistudio.google.com/
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default('gemini-3.5-flash-lite')
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000')
  },
  // Next.js inlines NEXT_PUBLIC_* at build time only when accessed literally.
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true
})
