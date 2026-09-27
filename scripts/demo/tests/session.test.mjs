import assert from 'node:assert/strict'
import test from 'node:test'
import { openDemoSession } from '../session.mjs'

test('demo setup uses a manager session and forwards its cookie only to the same origin', async () => {
  const requests = []
  const sessionFetch = await openDemoSession('http://localhost:18788', {
    fetchImpl: async (url, init) => {
      requests.push({ url, init })
      return new Response('{}', { headers: { 'set-cookie': 'mortar_session=signed; HttpOnly; SameSite=Lax' } })
    }
  })
  assert.deepEqual(JSON.parse(requests[0].init.body), { profileId: 'manager' })
  await sessionFetch('http://localhost:18788/api/snapshot')
  assert.equal(requests[1].init.headers.get('cookie'), 'mortar_session=signed')
  assert.equal(requests[1].init.headers.get('x-mortar-profile'), 'manager')
  assert.throws(() => sessionFetch('https://another.example/api/snapshot'), /cannot leave its origin/)
  assert.equal(requests.length, 2)
})

test('demo setup stops when a profile session is refused', async () => {
  await assert.rejects(
    openDemoSession('http://localhost', { fetchImpl: async () => new Response('{}', { status: 401 }) }),
    /HTTP 401/
  )
})
