import type { DraftHero, GameGuide } from '../../data/games/types'
import type { LiveStats } from '../../hooks/useLiveStats'
import type { MatchupStatus } from '../../hooks/useMatchups'
import type { Fit } from '../../lib/counterPicks'

/** Reasons shown per pick; the strongest come first. */
export const MAX_REASONS = 4

export const FIT_LABEL: Record<Fit, string> = {
  strong: 'Strong counter',
  good: 'Good counter',
  even: 'Even',
  countered: 'Countered',
}

/** "Against 3 enemy picks", or "Before the draft" while there are none. */
export function draftStage(enemies: DraftHero[]): string {
  if (enemies.length === 0) return 'Before the draft'
  return `Against ${enemies.length} enemy ${enemies.length === 1 ? 'pick' : 'picks'}`
}

/** Where the meta picks and the counters come from, under a draft's suggestions. */
export function draftSourceLine(game: GameGuide, hasEnemies: boolean, status: MatchupStatus, live: LiveStats): string {
  const form = live.rates ? `this week’s win rates (${live.rankLabel})` : `the patch ${game.patch} snapshot`
  const meta = `Meta picks use ${form} and the tier list.`
  return hasEnemies ? `${meta} ${counterSource(status, live)}` : meta
}

function counterSource(status: MatchupStatus, live: LiveStats): string {
  if (!live.feed?.matchups) return 'Counters use Moonton’s official counter list.'
  switch (status) {
    case 'idle':
    case 'loading':
      return 'Loading this week’s matchup stats…'
    case 'live':
      return `Counters use this week’s matchup stats (${live.rankLabel}) and Moonton’s official counter list.`
    case 'partial':
      return 'Some matchup stats didn’t load, so a few counters lean on Moonton’s official counter list.'
    case 'error':
      return 'Matchup stats are unreachable right now, so counters come from Moonton’s official counter list.'
  }
}
