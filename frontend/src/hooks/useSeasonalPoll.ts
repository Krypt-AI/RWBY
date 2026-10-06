import { useState } from 'react'
import type { AnimeSeason } from '../lib/types'
import { SEASONAL_CATEGORY } from '../lib/categories'
import { sameSeason, seasonalPollTitle, seasonOf } from '../lib/animeSeasons'
import { lineupSource } from '../services/seasonalAnime'
import { useSite } from './useSite'

/** 'empty': the source has no lineup for that season yet. */
type LineupStatus = 'idle' | 'loading' | 'empty' | 'error'

/** The seasonal anime poll, the season airing now and a way for moderators to move to it. */
export function useSeasonalPoll() {
  const { state, moderate } = useSite()
  const poll = state.polls[SEASONAL_CATEGORY]
  const current = seasonOf(new Date())
  const isCurrent = poll.season !== undefined && sameSeason(poll.season, current)
  const [lineupStatus, setLineupStatus] = useState<LineupStatus>('idle')

  /** Replaces the options with the season's lineup and starts a fresh round of votes. */
  const startSeason = async (season: AnimeSeason = current) => {
    setLineupStatus('loading')
    try {
      const shows = await lineupSource.lineup(season)
      if (shows.length === 0) {
        setLineupStatus('empty')
        return
      }
      moderate({ type: 'anime/startSeason', season, title: seasonalPollTitle(season), shows })
      setLineupStatus('idle')
    } catch {
      setLineupStatus('error')
    }
  }

  return { poll, current, isCurrent, source: lineupSource, lineupStatus, startSeason }
}
