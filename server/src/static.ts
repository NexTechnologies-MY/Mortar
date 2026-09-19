/**
 * Serves `frontend/dist`: hashed `/assets/*` files get immutable caching, any
 * other existing file is served without a cache guarantee, and every remaining
 * non-API path falls back to `index.html` (the SPA shell) with `no-cache`.
 */
import path from 'node:path'

const IMMUTABLE = 'public, max-age=31536000, immutable'
const NO_CACHE = 'no-cache'

export function staticHandler(root: string): (req: Request) => Promise<Response> {
  const index = path.join(root, 'index.html')
  return async (req) => {
    const { pathname } = new URL(req.url)
    const rel = path.normalize(pathname).replace(/^([/\\])+/, '')
    const file = path.join(root, rel)
    if (rel && !rel.startsWith('..') && (await Bun.file(file).exists())) {
      const cache = rel.startsWith('assets/') ? IMMUTABLE : NO_CACHE
      return new Response(Bun.file(file), { headers: { 'cache-control': cache } })
    }
    return new Response(Bun.file(index), {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': NO_CACHE }
    })
  }
}
