export type Mode = 'user' | 'moderator'

/** Team colours used as section accents (see tokens.css). */
export type Accent = 'ruby' | 'weiss' | 'blake' | 'yang' | 'nora'

export type Category = 'game' | 'music' | 'anime' | 'manga' | 'movie'

/** Games with a meta guide under /games. */
export type GameId = 'mlbb' | 'valorant'

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

export type SiteState = {
  announcement: Announcement
  stream: Stream
  schedule: Session[]
  chat: ChatMessage[]
  polls: Record<Category, Poll>
  lfg: LfgPost[]
  music: Music
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
