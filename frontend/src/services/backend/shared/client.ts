import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** The Supabase client, or null when the project isn't configured (the site then runs locally). */
export function createSupabaseClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    // PKCE: the Discord sign-in redirect returns a one-time code instead of tokens in the URL.
    auth: { flowType: 'pkce' },
  })
}

/** Turns a Supabase error into one people can read. API functions raise readable messages already. */
export function failure(error: { message: string }): Error {
  return new Error(error.message || 'The server did not accept that change. Try again.')
}
