import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuth } from '@/lib/auth'
import { createTestDb } from '@/test/db'

// nextCookies() mirrors Set-Cookie into Next's cookie store after each response;
// outside a Next request that store does not exist.
vi.mock('next/headers', () => ({ cookies: async () => ({ set: () => {} }) }))

const ORIGIN = 'http://localhost:3000'

function post(path: string, body: unknown, cookie = '') {
  return new Request(`${ORIGIN}/api/auth${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, cookie },
    body: JSON.stringify(body)
  })
}

const ADA = { name: 'Ada', email: 'ada@example.com', password: 'password123' }

describe('auth', () => {
  let auth: ReturnType<typeof createAuth>

  beforeEach(async () => {
    auth = createAuth(await createTestDb())
  })

  it('signs up with email + password and returns a usable session cookie', async () => {
    const res = await auth.handler(post('/sign-up/email', ADA))
    expect(res.status).toBe(200)

    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/better-auth\.session_token=/)

    const session = await auth.api.getSession({ headers: new Headers({ cookie }) })
    expect(session?.user.email).toBe(ADA.email)
    expect(session?.user.name).toBe(ADA.name)
  })

  it('rejects a wrong password', async () => {
    await auth.handler(post('/sign-up/email', ADA))

    const res = await auth.handler(post('/sign-in/email', { email: ADA.email, password: 'not-the-password' }))

    expect(res.status).toBe(401)
  })

  it('rejects passwords shorter than 8 characters', async () => {
    const res = await auth.handler(post('/sign-up/email', { ...ADA, password: 'short' }))

    expect(res.status).toBe(400)
  })
})
