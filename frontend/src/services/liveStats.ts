import type { GameId } from '../lib/types'
import type { LiveRates, MatchupStat } from '../data/games/types'
import { createCache } from '../utils/cache'
import { fetchHeroRates, fetchMatchups, type MlbbRank } from './mlbbApi'

export type LiveSnapshot = {
  /** Live rates keyed by hero or agent name. */
  rates: Map<string, LiveRates>
  fetchedAt: number
}

/** A source of live numbers for one game. */
export type LiveFeed = {
  /** Attribution shown next to the numbers. */
  source: string
  sourceUrl: string
  /** Rank brackets the feed can filter by. The first one is the default. */
  ranks: { value: string; label: string }[]
  snapshot: (rank: string, fresh?: boolean) => Promise<LiveSnapshot>
  /** Best and worst picks against one hero, for the game-room counter helper. */
  matchups?: (heroId: number, rank: string) => Promise<MatchupStat[]>
}

const CACHE_MS = 10 * 60_000
const snapshotCache = createCache<LiveSnapshot>(CACHE_MS)
const matchupCache = createCache<MatchupStat[]>(CACHE_MS)

const MLBB_RANKS: { value: MlbbRank; label: string }[] = [
  { value: 'all', label: 'All ranks' },
  { value: 'epic', label: 'Epic' },
  { value: 'legend', label: 'Legend' },
  { value: 'mythic', label: 'Mythic' },
  { value: 'honor', label: 'Mythical Honor' },
  { value: 'glory', label: 'Mythical Glory' },
]

const toMlbbRank = (value: string): MlbbRank => MLBB_RANKS.find(rank => rank.value === value)?.value ?? 'all'

const mlbbFeed: LiveFeed = {
  source: 'Moonton academy stats via Rone Arena',
  sourceUrl: 'https://arena.rone.dev',
  ranks: MLBB_RANKS,
  snapshot: (rank, fresh) =>
    snapshotCache(
      `mlbb:${rank}`,
      async () => {
        const heroes = await fetchHeroRates(toMlbbRank(rank))
        return { rates: new Map(heroes.map(({ name, ...rates }) => [name, rates])), fetchedAt: Date.now() }
      },
      fresh,
    ),
  matchups: (heroId, rank) => matchupCache(`mlbb:${heroId}:${rank}`, () => fetchMatchups(heroId, toMlbbRank(rank))),
}

/**
 * Games with a live feed. Valorant has no public stats API that a browser can call,
 * so its guide shows the patch snapshot plus links to live stat pages instead.
 */
export const LIVE_FEEDS: Partial<Record<GameId, LiveFeed>> = { mlbb: mlbbFeed }
