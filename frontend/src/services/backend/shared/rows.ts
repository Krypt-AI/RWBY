import type {
  Account,
  Announcement,
  Category,
  ChatMessage,
  GameId,
  GameRoom,
  LfgPost,
  Poll,
  SeasonName,
  Session,
  Stream,
  Track,
} from '../../../lib/types'

/**
 * Database rows (database/supabase/migrations/…_schema.sql) and how they map to the app's types.
 * Each *_COLUMNS string is the select that produces its row type.
 */

/** Postgres writes '…+00:00'; the app writes '…Z'. Normalising lets the two sort together. */
const iso = (timestamp: string) => new Date(timestamp).toISOString()

export const PROFILE_COLUMNS = 'id, display_name, avatar_url, role'
export type ProfileRow = { id: string; display_name: string; avatar_url: string | null; role: 'member' | 'moderator' }

export const toAccount = (row: ProfileRow): Account => ({
  id: row.id,
  name: row.display_name,
  avatarUrl: row.avatar_url,
  isModerator: row.role === 'moderator',
})

export const SETTINGS_COLUMNS =
  'announcement_text, announcement_visible, stream_title, stream_host, stream_url, stream_is_live, playlist_url'
export type SettingsRow = {
  announcement_text: string
  announcement_visible: boolean
  stream_title: string
  stream_host: string
  stream_url: string
  stream_is_live: boolean
  playlist_url: string
}

export const toAnnouncement = (row: SettingsRow): Announcement => ({
  text: row.announcement_text,
  visible: row.announcement_visible,
})

export const toStream = (row: SettingsRow): Stream => ({
  title: row.stream_title,
  host: row.stream_host,
  url: row.stream_url,
  isLive: row.stream_is_live,
})

export const SESSION_COLUMNS = 'id, title, category, starts_at'
export type SessionRow = { id: string; title: string; category: Category; starts_at: string }

export const toSession = (row: SessionRow): Session => ({
  id: row.id,
  title: row.title,
  category: row.category,
  startsAt: iso(row.starts_at),
})

export const CHAT_COLUMNS = 'id, author_name, text, from_moderator, pinned, created_at'
export type ChatRow = {
  id: string
  author_name: string
  text: string
  from_moderator: boolean
  pinned: boolean
  created_at: string
}

export const toChatMessage = (row: ChatRow): ChatMessage => ({
  id: row.id,
  author: row.author_name,
  text: row.text,
  at: iso(row.created_at),
  fromModerator: row.from_moderator,
  pinned: row.pinned,
})

export const POLL_COLUMNS =
  'category, title, is_open, round, season_year, season_name, poll_options(id, title, note, votes)'
export type PollRow = {
  category: Category
  title: string
  is_open: boolean
  round: number
  season_year: number | null
  season_name: SeasonName | null
  poll_options: { id: string; title: string; note: string; votes: number }[]
}

export const toPoll = (row: PollRow): Poll => ({
  title: row.title,
  isOpen: row.is_open,
  round: row.round,
  options: row.poll_options,
  ...(row.season_year !== null && row.season_name !== null
    ? { season: { year: row.season_year, name: row.season_name } }
    : {}),
})

export const LFG_COLUMNS = 'id, game, mode, rank, roles, slots, joined, note, author_id, author_name, created_at'
export type LfgRow = {
  id: string
  game: LfgPost['game']
  mode: string
  rank: string
  roles: string[]
  slots: number
  joined: number
  note: string
  /** Null for seeded posts. */
  author_id: string | null
  author_name: string
  created_at: string
}

export const toLfgPost = (row: LfgRow): LfgPost => ({
  id: row.id,
  game: row.game,
  mode: row.mode,
  rank: row.rank,
  roles: row.roles,
  slots: row.slots,
  joined: row.joined,
  note: row.note,
  author: row.author_name,
  authorId: row.author_id ?? 'seed',
  at: iso(row.created_at),
})

export const TRACK_COLUMNS = 'id, title, artist, url, added_by, likes, created_at'
export type TrackRow = {
  id: string
  title: string
  artist: string
  url: string
  added_by: string
  likes: number
  created_at: string
}

export const toTrack = (row: TrackRow): Track => ({
  id: row.id,
  title: row.title,
  artist: row.artist,
  url: row.url,
  addedBy: row.added_by,
  likes: row.likes,
  at: iso(row.created_at),
})

export const ROOM_COLUMNS =
  'game, starts_at, room_members(id, user_id, name, joined_at), room_enemy_picks(hero, picked_at)'
export type RoomRow = {
  game: GameId
  starts_at: string | null
  /** user_id is null for seeded members. */
  room_members: { id: string; user_id: string | null; name: string; joined_at: string }[]
  room_enemy_picks: { hero: string; picked_at: string }[]
}

export const toRoom = (row: RoomRow): GameRoom => ({
  startsAt: row.starts_at && iso(row.starts_at),
  members: row.room_members.map(member => ({
    id: member.user_id ?? member.id,
    name: member.name,
    joinedAt: iso(member.joined_at),
  })),
  enemyPicks: row.room_enemy_picks.map(pick => pick.hero),
})
