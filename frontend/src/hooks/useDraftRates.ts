import { useMemo } from 'react'
import type { GameGuide } from '../data/games/types'
import { snapshotWinRates } from '../data/games'
import type { LiveStats } from './useLiveStats'

/** The tier list and win rates a draft is scored on: live win rates while the feed is up, else the snapshot's. */
export function useDraftRates(game: GameGuide, live: LiveStats) {
  const tiers = useMemo(() => new Map(game.tiers.map(entry => [entry.name, entry.tier])), [game.tiers])
  const snapshot = useMemo(() => snapshotWinRates(game), [game])
  const winRates = useMemo(
    () => (live.rates ? new Map([...live.rates].map(([name, rates]) => [name, rates.winRate])) : snapshot),
    [live.rates, snapshot],
  )
  return { tiers, winRates }
}
