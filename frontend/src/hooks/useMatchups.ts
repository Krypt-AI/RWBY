import { useEffect, useState } from 'react'
import type { MatchupStat } from '../data/games/types'
import type { LiveFeed } from '../services/liveStats'

/** 'partial': some enemies' stats loaded, the rest failed. 'error': none loaded. */
export type MatchupStatus = 'idle' | 'loading' | 'live' | 'partial' | 'error'

type MatchupState = { status: MatchupStatus; matchups: Map<number, MatchupStat[]> }

const IDLE: MatchupState = { status: 'idle', matchups: new Map() }

/** Live best and worst picks against each enemy hero, keyed by enemy id. */
export function useMatchups(feed: LiveFeed | undefined, enemyIds: number[], rank: string): MatchupState {
  const [state, setState] = useState<MatchupState>(IDLE)
  const idsKey = enemyIds.join(',')

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',').map(Number) : []
    const fetchMatchups = feed?.matchups
    if (!fetchMatchups || ids.length === 0) {
      setState(IDLE)
      return
    }

    let active = true
    setState(current => ({ ...current, status: 'loading' }))
    Promise.allSettled(ids.map(id => fetchMatchups(id, rank))).then(results => {
      if (!active) return
      const matchups = new Map<number, MatchupStat[]>()
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') matchups.set(ids[index]!, result.value)
      })
      const status = matchups.size === ids.length ? 'live' : matchups.size > 0 ? 'partial' : 'error'
      setState({ status, matchups })
    })

    return () => {
      active = false
    }
  }, [feed, idsKey, rank])

  return state
}
