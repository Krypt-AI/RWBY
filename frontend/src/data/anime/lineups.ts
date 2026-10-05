import type { AnimeSeason } from '../../lib/types'

export type SeasonalAnime = {
  title: string
  /** Shown under the title in the poll: season, studio, premiere. */
  note: string
}

export type SeasonLineup = { season: AnimeSeason; shows: SeasonalAnime[] }

/**
 * Hand-picked shows for the seasonal anime poll, newest season first. Add next season's
 * lineup here until MyAnimeList is connected (see services/seasonalAnime.ts).
 * Fall 2026 studios and dates: Crunchyroll's fall lineup announcement.
 */
export const CURATED_LINEUPS: SeasonLineup[] = [
  {
    season: { year: 2026, name: 'fall' },
    shows: [
      { title: 'The Apothecary Diaries', note: 'Season 3 · OLM · from Oct 2' },
      { title: 'Black Clover', note: 'Season 2 · Pierrot · from Oct 3' },
      { title: 'Aoashi', note: 'Season 2 · TMS Entertainment · from Oct 4' },
      { title: 'Magic Knight Rayearth', note: 'New series · E&H Production · from Oct 7' },
      { title: 'The Detective Is Already Dead', note: 'Season 2 · ENGI · from Oct 7' },
      { title: 'Firefly Wedding', note: 'New series · David Production · from Oct 9' },
      { title: 'Overgeared', note: 'New series · J.C.STAFF' },
      { title: 'PSYREN', note: 'New series · Satelight' },
    ],
  },
]
