/**
 * Remembers recent results per key, so every component that asks within `ttlMs` shares
 * one request. Failed requests are forgotten straight away so the next call retries.
 */
export function createCache<T>(ttlMs: number) {
  const entries = new Map<string, { at: number; value: Promise<T> }>()

  return function cached(key: string, load: () => Promise<T>, fresh = false): Promise<T> {
    const hit = entries.get(key)
    if (hit && !fresh && Date.now() - hit.at < ttlMs) return hit.value

    const value = load()
    entries.set(key, { at: Date.now(), value })
    value.catch(() => {
      if (entries.get(key)?.value === value) entries.delete(key)
    })
    return value
  }
}
