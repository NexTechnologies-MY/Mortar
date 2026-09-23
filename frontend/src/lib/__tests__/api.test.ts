import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, extractMessage, postTask, updateTask } from '@/lib/api'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('api request()', () => {
  it('shows the server text for a 4xx refusal', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(400, { error: 'That Time Has Not Come Yet Today.' }))
    )

    const err: unknown = await updateTask('TSK-1', 'done').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(400)
    expect((err as ApiError).message).toBe('That Time Has Not Come Yet Today.')
  })

  it('never shows a raw status or route for a 5xx, even with a server message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(500, { error: 'internal: constraint violation on jev_answers' }))
    )

    const err: unknown = await postTask({
      bookingId: 'BK-1',
      action: 'request_document',
      title: 'Request Payslip',
      ownerRole: 'sales_admin',
      ownerName: 'Nurul Aina',
      dueOn: '2026-09-20',
      origin: 'staff'
    }).catch((e) => e)

    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(500)
    expect((err as ApiError).message).not.toMatch(/POST|GET|\/api\/|500/)
    expect((err as ApiError).message).toBe('Something Went Wrong. Try Again.')
  })

  it('falls back to a plain sentence when a failed response carries no JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Internal Server Error', { status: 500 }))
    )

    const err: unknown = await updateTask('TSK-1', 'done').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).message).toBe('Something Went Wrong. Try Again.')
    expect((err as ApiError).message).not.toMatch(/PATCH|failed \(/)
  })

  it('gives up a plain write after its default timeout and reports a plain message', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          })
      )
    )

    const pending = updateTask('TSK-1', 'done').catch((e) => e)
    await vi.advanceTimersByTimeAsync(20_000)
    const err = await pending

    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).message).toBe('Took Too Long, Try Again.')
    expect((err as ApiError).status).toBeNull()
  })

  it('gives a Jev-backed call the longer 60s budget before timing out', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
    )
    vi.stubGlobal('fetch', fetchMock)

    const pending = extractMessage('MSG-1').catch((e) => e)

    // Still short of the Jev budget: the request must still be in flight.
    await vi.advanceTimersByTimeAsync(20_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(40_000)
    const err = await pending
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).message).toBe('Took Too Long, Try Again.')
  })
})
