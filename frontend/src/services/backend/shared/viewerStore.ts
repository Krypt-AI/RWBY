import type { SupabaseClient } from '@supabase/supabase-js'
import type { Ballot, Category, ViewerState } from '../../../lib/types'
import type { AccountService, ViewerStore, ViewerUpdate } from '../types'
import { failure } from './client'

/** The member's own rows. Row-level security only returns these to their owner. */
const OWN_TABLES = ['ballots', 'rsvps', 'track_likes', 'lfg_joins'] as const

const RELOAD_MS = 150

type BallotRow = { category: Category; option_id: string; polls: { round: number } | null }

const signedOut = (): ViewerState => ({ id: '', name: '', ballots: {}, rsvps: [], likedTracks: [], joinedPosts: [] })

async function loadChoices(client: SupabaseClient, userId: string): Promise<ViewerUpdate> {
  const [ballots, rsvps, likes, joins] = await Promise.all([
    client.from('ballots').select('category, option_id, polls(round)').eq('user_id', userId),
    client.from('rsvps').select('session_id').eq('user_id', userId),
    client.from('track_likes').select('track_id').eq('user_id', userId),
    client.from('lfg_joins').select('post_id').eq('user_id', userId),
  ])
  const error = ballots.error ?? rsvps.error ?? likes.error ?? joins.error
  if (error) throw failure(error)

  // Ballots belong to the poll's current round: resetting a poll deletes them.
  const ballotRows = (ballots.data ?? []) as unknown as BallotRow[]
  const ballotEntries = ballotRows.map(row => [row.category, { round: row.polls?.round ?? 1, optionId: row.option_id }])
  const choices = {
    ballots: Object.fromEntries(ballotEntries) as Partial<Record<Category, Ballot>>,
    rsvps: (rsvps.data ?? []).map(row => row.session_id as string),
    likedTracks: (likes.data ?? []).map(row => row.track_id as string),
    joinedPosts: (joins.data ?? []).map(row => row.post_id as string),
  }
  return viewer => ({ ...viewer, ...choices })
}

/** The signed-in member's identity and choices, loaded from their account and kept current. */
export function createSharedViewerStore(client: SupabaseClient, accounts: AccountService): ViewerStore {
  /** Reloads the connected member's choices; a no-op while signed out. */
  let reloadChoices = () => {}

  const call = async (fn: string, args: Record<string, unknown>) => {
    const { error } = await client.rpc(fn, args)
    if (error) {
      reloadChoices()
      throw failure(error)
    }
  }

  return {
    initialViewer: signedOut,

    connect(account, update) {
      if (!account) {
        update(signedOut)
        return () => {}
      }
      update(viewer => ({ ...viewer, id: account.id, name: account.name }))

      let active = true
      let latest = 0
      let timer: number | undefined
      const reload = () => {
        const request = ++latest
        loadChoices(client, account.id).then(
          apply => {
            if (active && request === latest) update(apply)
          },
          () => {
            /* Kept as is; the next change or tab focus reloads it. */
          },
        )
      }
      const reloadSoon = () => {
        window.clearTimeout(timer)
        timer = window.setTimeout(reload, RELOAD_MS)
      }
      reloadChoices = reloadSoon
      reload()

      const channel = client.channel(`viewer:${account.id}`)
      for (const table of OWN_TABLES) {
        const filter = `user_id=eq.${account.id}`
        channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, reloadSoon)
      }
      channel.subscribe()

      const onVisible = () => {
        if (document.visibilityState === 'visible') reloadSoon()
      }
      document.addEventListener('visibilitychange', onVisible)

      return () => {
        active = false
        reloadChoices = () => {}
        window.clearTimeout(timer)
        document.removeEventListener('visibilitychange', onVisible)
        void client.removeChannel(channel)
      }
    },

    async setName(name) {
      await call('update_display_name', { p_name: name })
      await accounts.refresh()
    },

    setRsvp: (sessionId, going) => call('set_rsvp', { p_session_id: sessionId, p_going: going }),
  }
}
