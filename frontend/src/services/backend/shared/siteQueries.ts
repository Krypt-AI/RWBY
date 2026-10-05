import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, GameId, Poll, SiteState } from '../../../lib/types'
import type { SiteUpdate } from '../../../lib/siteReducer'
import { CATEGORIES } from '../../../lib/categories'
import { createRoom } from '../../../lib/rooms'
import { failure } from './client'
import {
  CHAT_COLUMNS,
  LFG_COLUMNS,
  POLL_COLUMNS,
  ROOM_COLUMNS,
  SESSION_COLUMNS,
  SETTINGS_COLUMNS,
  TRACK_COLUMNS,
  toAnnouncement,
  toChatMessage,
  toLfgPost,
  toPoll,
  toRoom,
  toSession,
  toStream,
  toTrack,
  type ChatRow,
  type LfgRow,
  type PollRow,
  type RoomRow,
  type SessionRow,
  type SettingsRow,
  type TrackRow,
} from './rows'

/** Parts of the site that load (and reload) independently. */
export type Slice = 'settings' | 'schedule' | 'chat' | 'polls' | 'lfg' | 'tracks' | 'rooms'

export const SLICES: Slice[] = ['settings', 'schedule', 'chat', 'polls', 'lfg', 'tracks', 'rooms']

/** Which slice to reload when a table changes. */
export const TABLE_SLICES: Record<string, Slice> = {
  site_settings: 'settings',
  sessions: 'schedule',
  chat_messages: 'chat',
  polls: 'polls',
  poll_options: 'polls',
  lfg_posts: 'lfg',
  tracks: 'tracks',
  game_rooms: 'rooms',
  room_members: 'rooms',
  room_enemy_picks: 'rooms',
}

/** The same limits the database keeps (see …_api.sql). */
const CHAT_LIMIT = 200
const LFG_LIMIT = 50
const TRACK_LIMIT = 100

const emptyPoll = (): Poll => ({ title: '', isOpen: false, round: 1, options: [] })

/** What the site shows before the first load finishes. */
export function createEmptyState(): SiteState {
  return {
    announcement: { text: '', visible: false },
    stream: { title: '', host: '', url: '', isLive: false },
    schedule: [],
    chat: [],
    polls: { game: emptyPoll(), music: emptyPoll(), anime: emptyPoll(), movie: emptyPoll() },
    lfg: [],
    music: { playlistUrl: '', queue: [] },
    rooms: { mlbb: createRoom(), valorant: createRoom() },
  }
}

/** Unwraps a Supabase response, or throws a readable error. */
function unwrap<T>({ data, error }: { data: unknown; error: { message: string } | null }): T {
  if (error) throw failure(error)
  return data as T
}

const LOADERS: Record<Slice, (client: SupabaseClient) => Promise<SiteUpdate>> = {
  async settings(client) {
    const row = unwrap<SettingsRow>(await client.from('site_settings').select(SETTINGS_COLUMNS).single())
    return state => ({
      ...state,
      announcement: toAnnouncement(row),
      stream: toStream(row),
      music: { ...state.music, playlistUrl: row.playlist_url },
    })
  },

  async schedule(client) {
    const rows = unwrap<SessionRow[]>(await client.from('sessions').select(SESSION_COLUMNS).order('starts_at'))
    const schedule = rows.map(toSession)
    return state => ({ ...state, schedule })
  },

  async chat(client) {
    const rows = unwrap<ChatRow[]>(
      await client
        .from('chat_messages')
        .select(CHAT_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(CHAT_LIMIT),
    )
    const chat = rows.reverse().map(toChatMessage)
    return state => ({ ...state, chat })
  },

  async polls(client) {
    const rows = unwrap<PollRow[]>(
      await client.from('polls').select(POLL_COLUMNS).order('created_at', { referencedTable: 'poll_options' }),
    )
    const byCategory = new Map(rows.map(row => [row.category, toPoll(row)]))
    const polls = Object.fromEntries(
      CATEGORIES.map(category => [category, byCategory.get(category) ?? emptyPoll()]),
    ) as Record<Category, Poll>
    return state => ({ ...state, polls })
  },

  async lfg(client) {
    const rows = unwrap<LfgRow[]>(
      await client.from('lfg_posts').select(LFG_COLUMNS).order('created_at', { ascending: false }).limit(LFG_LIMIT),
    )
    const lfg = rows.map(toLfgPost)
    return state => ({ ...state, lfg })
  },

  async tracks(client) {
    const rows = unwrap<TrackRow[]>(
      await client.from('tracks').select(TRACK_COLUMNS).order('created_at').limit(TRACK_LIMIT),
    )
    const queue = rows.map(toTrack)
    return state => ({ ...state, music: { ...state.music, queue } })
  },

  async rooms(client) {
    const rows = unwrap<RoomRow[]>(
      await client
        .from('game_rooms')
        .select(ROOM_COLUMNS)
        .order('joined_at', { referencedTable: 'room_members' })
        .order('picked_at', { referencedTable: 'room_enemy_picks' }),
    )
    const byGame = new Map(rows.map(row => [row.game, toRoom(row)]))
    return state => ({
      ...state,
      rooms: Object.fromEntries(
        (Object.keys(state.rooms) as GameId[]).map(game => [game, byGame.get(game) ?? createRoom()]),
      ) as SiteState['rooms'],
    })
  },
}

export const loadSlice = (client: SupabaseClient, slice: Slice) => LOADERS[slice](client)

/** Loads every slice; the update applies them all at once. */
export async function loadSite(client: SupabaseClient): Promise<SiteUpdate> {
  const updates = await Promise.all(SLICES.map(slice => loadSlice(client, slice)))
  return state => updates.reduce((next, update) => update(next), state)
}
