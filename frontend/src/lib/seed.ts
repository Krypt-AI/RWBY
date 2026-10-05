import type { GameRoom, LfgPost, Poll, SiteState, Track } from './types'
import { CURATED_LINEUPS } from '../data/anime/lineups'
import { seasonalPollTitle } from './animeSeasons'
import { createRoom } from './rooms'
import { createId } from '../utils/id'

function poll(title: string, options: [string, string][]): Poll {
  return {
    title,
    isOpen: true,
    round: 1,
    options: options.map(([optionTitle, note]) => ({ id: createId(), title: optionTitle, note, votes: 0 })),
  }
}

/** The seasonal anime poll, drawn from the newest curated lineup. */
function seasonalPoll(): Poll {
  const [latest] = CURATED_LINEUPS
  if (!latest) return poll('Anime of the season', [])
  const options = latest.shows.map((show): [string, string] => [show.title, show.note])
  return { ...poll(seasonalPollTitle(latest.season), options), season: latest.season }
}

function track(title: string, artist: string): Track {
  return { id: createId(), title, artist, url: '', addedBy: 'Team RWBY', likes: 0, at: new Date().toISOString() }
}

function lfg(post: Omit<LfgPost, 'id' | 'joined' | 'authorId' | 'at'>, hoursAgo: number): LfgPost {
  const at = new Date(Date.now() - hoursAgo * 3_600_000).toISOString()
  return { ...post, id: createId(), joined: 0, authorId: 'seed', at }
}

function daysFromNow(days: number, hour: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

/** Two hours out, on the next quarter hour. */
function soon(): string {
  const date = new Date(Date.now() + 2 * 3_600_000)
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0)
  return date.toISOString()
}

function roomWith(names: string[], startsAt: string | null): GameRoom {
  const joinedAt = new Date().toISOString()
  return { ...createRoom(), startsAt, members: names.map(name => ({ id: `seed-${name}`, name, joinedAt })) }
}

/**
 * Initial content for the local demo: used on first visit and when a moderator resets the site.
 * The shared backend seeds the same content from database/supabase/migrations/…_seed_content.sql.
 */
export function createSeedState(): SiteState {
  return {
    announcement: {
      text: 'Welcome to Beacon. MLBB stats are live, the game rooms are open and the Fall 2026 anime vote has started.',
      visible: true,
    },
    stream: {
      title: 'Friday Squad Night',
      host: 'Team RWBY',
      url: '',
      isLive: false,
    },
    schedule: [
      { id: createId(), title: 'MLBB 5-stack customs', category: 'game', startsAt: daysFromNow(1, 21) },
      { id: createId(), title: 'Listening party', category: 'music', startsAt: daysFromNow(2, 20) },
      { id: createId(), title: 'Valorant ranked push', category: 'game', startsAt: daysFromNow(3, 21) },
      { id: createId(), title: 'Movie night', category: 'movie', startsAt: daysFromNow(6, 21) },
    ],
    chat: [],
    polls: {
      game: poll('Next squad game night', [
        ['Mobile Legends: Bang Bang', '5-stack customs · Brawl'],
        ['Valorant', 'Unrated stack + 5v5 customs'],
        ['Lethal Company', 'Co-op horror · 4 players'],
        ['Minecraft', 'Shared survival server'],
      ]),
      music: poll('Song of the week', [
        ['Red Like Roses Pt. II', 'Jeff Williams ft. Casey Lee Williams'],
        ['Enemy', 'Imagine Dragons & JID'],
        ['Legends Never Die', 'Against The Current'],
        ['RISE', 'The Glitch Mob, Mako & The Word Alive'],
      ]),
      anime: seasonalPoll(),
      movie: poll('Movie night pick', [
        ['Spirited Away', 'Studio Ghibli · 2001'],
        ['Your Name', 'CoMix Wave · 2016'],
        ['Akira', 'TMS · 1988'],
        ['Perfect Blue', 'Madhouse · 1997'],
      ]),
    },
    lfg: [
      lfg(
        {
          game: 'mlbb',
          mode: 'Ranked',
          rank: 'Mythic',
          roles: ['Roam', 'Jungle'],
          slots: 2,
          note: 'Pushing to Mythical Glory tonight. Voice on, no tilt.',
          author: 'Weiss',
        },
        1,
      ),
      lfg(
        {
          game: 'valorant',
          mode: 'Unrated',
          rank: 'Any rank',
          roles: ['Controller'],
          slots: 1,
          note: 'Chill games, trying the new Warden. Need someone who smokes.',
          author: 'Yang',
        },
        3,
      ),
    ],
    music: {
      playlistUrl: '',
      queue: [
        track('This Will Be the Day', 'Jeff Williams ft. Casey Lee Williams'),
        track('Paint the Town Blue', 'Ashnikko'),
        track('Phoenix', 'Cailin Russo & Chrissy Costanza'),
      ],
    },
    rooms: {
      mlbb: roomWith(['Weiss', 'Blake'], soon()),
      valorant: createRoom(),
    },
  }
}
