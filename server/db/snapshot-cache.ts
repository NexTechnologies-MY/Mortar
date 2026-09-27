/**
 * The snapshot is the heaviest read the server makes: eight queries and a pass
 * over every case. On a small instance, a burst of page loads that each build
 * their own copy starves the process until it misses its health check and is
 * restarted. So one built snapshot is shared until a write changes what it
 * shows, or until `ttlMs` passes, which bounds how long a write made elsewhere
 * (another server on the same database) can go unseen.
 */
export function cacheSnapshot<T>(load: () => Promise<T>, ttlMs: number, now: () => number = Date.now) {
  let entry: { at: number; value: Promise<T> } | null = null
  return {
    get(): Promise<T> {
      if (entry && now() - entry.at < ttlMs) return entry.value
      const current = { at: now(), value: load() }
      entry = current
      // A failed build is not kept: the next request tries again.
      current.value.catch(() => {
        if (entry === current) entry = null
      })
      return current.value
    },
    forget(): void {
      entry = null
    }
  }
}

/**
 * Wraps every method of `target` except `reads` so that, once a call settles,
 * `forget` runs. Worked or failed, a write may have changed what the cached
 * snapshot shows, and a method added later is treated as a write until it is
 * listed as a read.
 */
export function forgetOnWrite<T extends object>(target: T, reads: ReadonlySet<keyof T>, forget: () => void): T {
  for (const key of Object.keys(target) as (keyof T)[]) {
    const method = target[key]
    if (reads.has(key) || typeof method !== 'function') continue
    target[key] = (async (...args: unknown[]) => {
      try {
        return await method.apply(target, args)
      } finally {
        forget()
      }
    }) as T[keyof T]
  }
  return target
}

/**
 * One rendered body per key for each built snapshot, so a burst of page loads
 * for the same profile scopes and serializes it once. Keyed on the snapshot's
 * promise, so a rebuilt snapshot starts a fresh set.
 */
export function cacheBodies<S>() {
  const bodies = new WeakMap<Promise<S>, Map<string, Promise<string>>>()
  return (snapshot: Promise<S>, key: string, render: (snapshot: S) => string): Promise<string> => {
    let forSnapshot = bodies.get(snapshot)
    if (!forSnapshot) bodies.set(snapshot, (forSnapshot = new Map()))
    let body = forSnapshot.get(key)
    if (!body) forSnapshot.set(key, (body = snapshot.then(render)))
    return body
  }
}
