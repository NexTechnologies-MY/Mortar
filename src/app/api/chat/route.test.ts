import { beforeEach, describe, expect, it, vi } from 'vitest'

const getSession = vi.fn()
vi.mock('@/lib/session', () => ({ getSession: () => getSession() }))

const { POST } = await import('./route')

function chatRequest(body: unknown = { messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'hi' }] }] }) {
  return new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => getSession.mockReset())

  it('requires a signed-in user', async () => {
    getSession.mockResolvedValue(null)

    const res = await POST(chatRequest())

    expect(res.status).toBe(401)
  })

  it('rejects a body that is not a list of UI messages', async () => {
    getSession.mockResolvedValue({ user: { id: 'u1' } })

    const res = await POST(chatRequest({ messages: 'not a list' }))

    expect(res.status).toBe(400)
  })

  it('explains how to enable chat when no API key is configured', async () => {
    getSession.mockResolvedValue({ user: { id: 'u1' } })

    const res = await POST(chatRequest())

    expect(res.status).toBe(503)
    expect(await res.text()).toMatch(/GOOGLE_GENERATIVE_AI_API_KEY/)
  })
})
