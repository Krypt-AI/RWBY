import type { SupabaseClient } from '@supabase/supabase-js'
import type { Account } from '../../../lib/types'
import type { AccountService } from '../types'
import { failure } from './client'
import { PROFILE_COLUMNS, toAccount, type ProfileRow } from './rows'

/** Discord sign-in through Supabase Auth, with the member's profile (name, avatar, role). */
export function createAccountService(client: SupabaseClient): AccountService {
  let notify: ((account: Account | null) => void) | null = null
  let userId: string | null = null

  const publish = async (nextUserId: string | null) => {
    userId = nextUserId
    if (!nextUserId) {
      notify?.(null)
      return
    }
    const { data, error } = await client.from('profiles').select(PROFILE_COLUMNS).eq('id', nextUserId).single()
    // Ignore the answer if the user changed while it loaded.
    if (userId === nextUserId) notify?.(error ? null : toAccount(data as ProfileRow))
  }

  return {
    watch(onChange) {
      notify = onChange
      // Fires once with the restored session, then on every sign-in, sign-out and token refresh.
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        // Supabase advises against calling it again inside this callback, so load the profile after.
        window.setTimeout(() => void publish(session?.user.id ?? null), 0)
      })
      return () => {
        notify = null
        data.subscription.unsubscribe()
      }
    },

    refresh: () => publish(userId),

    async signIn() {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'discord',
        // Come back to the page the visitor signed in from.
        options: { redirectTo: window.location.href },
      })
      if (error) throw failure(error)
    },

    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) throw failure(error)
    },
  }
}
