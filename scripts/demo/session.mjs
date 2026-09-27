/** API client for the synthetic demo's setup and read-only seed checks. */
export async function openDemoSession(web, { fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${web}/api/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profileId: 'manager' })
  })
  if (!response.ok) throw new Error(`demo session unavailable: HTTP ${response.status}`)
  const cookie = response.headers.get('set-cookie')?.split(';')[0]
  if (!cookie) throw new Error('demo session did not return a cookie')
  return (url, init = {}) => {
    if (new URL(url).origin !== new URL(web).origin) throw new Error('demo session cannot leave its origin')
    const headers = new Headers(init.headers)
    headers.set('Cookie', cookie)
    headers.set('X-Mortar-Profile', 'manager')
    return fetchImpl(url, { ...init, headers })
  }
}
