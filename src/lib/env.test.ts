import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

async function loadEnv(overrides: Record<string, string | undefined>) {
  vi.resetModules()
  process.env = { ...ORIGINAL_ENV, ...overrides }
  const mod = await import('./env')
  return mod.env
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('env', () => {
  it('applies defaults when optional values are missing', async () => {
    const env = await loadEnv({ DATABASE_URL: undefined, AI_MODEL: undefined, PGLITE_DATA_DIR: undefined })
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.PGLITE_DATA_DIR).toBe('./.data/pglite')
    expect(env.AI_MODEL).toBe('gemini-3.5-flash-lite')
  })

  it('treats empty strings as undefined so blank .env lines are harmless', async () => {
    const env = await loadEnv({ DATABASE_URL: '', GOOGLE_GENERATIVE_AI_API_KEY: '' })
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.GOOGLE_GENERATIVE_AI_API_KEY).toBeUndefined()
  })

  it('rejects a short BETTER_AUTH_SECRET', async () => {
    await expect(loadEnv({ BETTER_AUTH_SECRET: 'short' })).rejects.toThrow(/environment variables/i)
  })
})
