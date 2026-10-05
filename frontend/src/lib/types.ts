export type Mode = 'user' | 'moderator'

/** Team colours used as section accents (see tokens.css). */
export type Accent = 'ruby' | 'weiss' | 'blake' | 'yang' | 'nora'

export type Category = 'game' | 'music' | 'anime' | 'movie'

/** Games with a meta guide under /games. */
export type GameId = 'mlbb' | 'valorant'

export type SeasonName = 'winter' | 'spring' | 'summer' | 'fall'

/** An anime broadcast season, e.g. Fall 2026. */
export type AnimeSeason = { year: number; name: SeasonName }

export type PollOption = {
  id: string
  title: string
  note: string
  votes: number
}

export type Poll = {
  title: string
  isOpen: boolean
  /** Bumped whenever votes are reset so stale ballots are ignored. */
  round: number
  options: PollOption[]
  /** The season the options air in. Only the seasonal anime poll has one. */
  season?: AnimeSeason
}

export type Session = {
  id: string
  title: string
  category: Category
  startsAt: string
}

export type ChatMessage = {
  id: string
  author: string
  text: string
  at: string
  fromModerator: boolean
  pinned: boolean
}

export type Stream = {
  title: string
  host: string
  url: string
  isLive: boolean
}

export type Announcement = {
  text: string
  visible: boolean
}

/** "Looking for group" post on the Squad board. */
export type LfgPost = {
  id: string
  game: GameId | 'other'
  mode: string
  rank: string
  /** Role names the squad still needs. */
  roles: string[]
  /** Open spots when posted. */
  slots: number
  joined: number
  note: string
  author: string
  authorId: string
  at: string
}

export type Track = {
  id: string
  title: string
  artist: string
  url: string
  addedBy: string
  likes: number
  at: string
}

export type Music = {
  /** Spotify or YouTube playlist shown on the Music page. */
  playlistUrl: string
  queue: Track[]
}

export type RoomMember = {
  /** The viewer id of the person who joined. */
  id: string
  name: string
  joinedAt: string
}

/** The lobby for one game: who's in, when the squad starts and the enemy draft. */
export type GameRoom = {
  members: RoomMember[]
  /** Planned start time, or null until a member sets one. */
  startsAt: string | null
  /** Enemy heroes entered in the counter-pick helper, in pick order. */
  enemyPicks: string[]
}

export type SiteState = {
  announcement: Announcement
  stream: Stream
  schedule: Session[]
  chat: ChatMessage[]
  polls: Record<Category, Poll>
  lfg: LfgPost[]
  music: Music
  rooms: Record<GameId, GameRoom>
}

/** Per-browser data that never leaves the viewer's device. */
export type Ballot = { round: number; optionId: string }

export type ViewerState = {
  /** Random per-browser id, used to recognise your own posts. */
  id: string
  name: string
  ballots: Partial<Record<Category, Ballot>>
  rsvps: string[]
  likedTracks: string[]
  joinedPosts: string[]
}
