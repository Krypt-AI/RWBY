import type { LfgPost, Poll, SiteState, Track } from './types'
import { createId } from '../utils/id'

function poll(title: string, options: [string, string][]): Poll {
  return {
    title,
    isOpen: true,
    round: 1,
    options: options.map(([optionTitle, note]) => ({ id: createId(), title: optionTitle, note, votes: 0 })),
  }
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

/** Initial content used on first visit and when a moderator resets the site. */
export function createSeedState(): SiteState {
  return {
    announcement: {
      text: 'Welcome to Beacon. MLBB Season 42 and Valorant 13.06 guides are up, and game-night voting is open.',
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
      { id: createId(), title: 'Anime night', category: 'anime', startsAt: daysFromNow(4, 20) },
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
      anime: poll('Next anime watch-along', [
        ['Frieren: Beyond Journey’s End', 'Fantasy · 28 episodes'],
        ['Mob Psycho 100', 'Action · 37 episodes'],
        ['Dandadan', 'Supernatural · 24 episodes'],
        ['Spy x Family', 'Comedy · 37 episodes'],
      ]),
      manga: poll('Next book-club read', [
        ['Vagabond', 'Seinen · Takehiko Inoue'],
        ['Chainsaw Man', 'Shōnen · Tatsuki Fujimoto'],
        ['Witch Hat Atelier', 'Fantasy · Kamome Shirahama'],
      ]),
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
  }
}
