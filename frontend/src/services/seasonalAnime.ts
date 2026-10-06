import type { AnimeSeason } from '../lib/types'
import { CURATED_LINEUPS, type SeasonalAnime } from '../data/anime/lineups'
import { sameSeason } from '../lib/animeSeasons'

/**
 * Where the seasonal anime poll gets its shows. Today it's a curated list that ships
 * with the site.
 *
 * Connecting MyAnimeList means adding a second source with the same shape, backed by
 * GET https://api.myanimelist.net/v2/anime/season/{year}/{season}. MAL needs a client id
 * and doesn't answer browser requests (no CORS), so that call has to go through a small
 * proxy such as a Vercel function.
 */
type LineupSource = {
  id: 'curated' | 'myanimelist'
  name: string
  /** Shows airing in the season, or an empty list when the source has none yet. */
  lineup: (season: AnimeSeason) => Promise<SeasonalAnime[]>
}

const curatedSource: LineupSource = {
  id: 'curated',
  name: 'Curated by moderators',
  lineup: async season => CURATED_LINEUPS.find(entry => sameSeason(entry.season, season))?.shows ?? [],
}

/** The source in use. Point it at a MyAnimeList source once one exists. */
export const lineupSource: LineupSource = curatedSource
