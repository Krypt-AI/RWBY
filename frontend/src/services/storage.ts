/**
 * Thin wrapper around localStorage. Storage can be unavailable (private mode,
 * blocked cookies), so every call fails soft and the app keeps working in memory.
 *
 * This is the seam to replace with a real backend (e.g. Supabase) later:
 * swap these functions for API calls and keep the hooks untouched.
 */
const PREFIX = 'rwby.'

/** 'local' is shared by every tab; 'session' is private to the current tab. */
type Area = 'local' | 'session'

const area = (name: Area) => (name === 'local' ? window.localStorage : window.sessionStorage)

export function load<T>(key: string, fallback: () => T, from: Area = 'local'): T {
  try {
    const raw = area(from).getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback()
  } catch {
    return fallback()
  }
}

export function save<T>(key: string, value: T, to: Area = 'local'): void {
  try {
    area(to).setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: keep the in-memory state */
  }
}

/** Fires when another tab writes the same key, so open tabs stay in sync. */
export function subscribe<T>(key: string, onChange: (value: T) => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key !== PREFIX + key || !event.newValue) return
    try {
      onChange(JSON.parse(event.newValue) as T)
    } catch {
      /* ignore malformed writes */
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
