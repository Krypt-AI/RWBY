import { useMemo, useState } from 'react'
import type { GameGuide, LiveRate } from '../../data/games/types'
import type { LiveStats } from '../../hooks/useLiveStats'
import { rankBy } from '../../lib/liveRates'
import { ChipGroup } from '../ChipGroup'
import { EmptyState, Panel } from '../Panel'
import { HeroPortrait } from './HeroPortrait'

const METRICS: { value: LiveRate; label: string }[] = [
  { value: 'winRate', label: 'Win rate' },
  { value: 'banRate', label: 'Ban rate' },
  { value: 'pickRate', label: 'Pick rate' },
]

const SHOWN = 8

/** This week's top heroes by one live rate, across the whole roster. Renders nothing without a feed. */
export function LiveLeaderboard({ game, live }: { game: GameGuide; live: LiveStats }) {
  const [metric, setMetric] = useState<LiveRate>('winRate')
  const portraits = useMemo(() => new Map(game.draft?.heroes.map(hero => [hero.name, hero.portrait])), [game.draft])

  if (!live.feed) return null
  const leaders = live.rates ? rankBy(live.rates, metric).slice(0, SHOWN) : []

  return (
    <Panel title="Live leaderboard">
      <ChipGroup
        label="Rank heroes by"
        options={METRICS}
        isSelected={value => value === metric}
        onSelect={value => setMetric(value as LiveRate)}
      />
      {live.status === 'loading' ? (
        <ol className="leaderboard is-loading" aria-label="Loading live rates">
          {Array.from({ length: SHOWN }, (_, index) => (
            <li key={index} className="skeleton-row" />
          ))}
        </ol>
      ) : leaders.length === 0 ? (
        <EmptyState>Live rates are unavailable right now. The tier list shows the patch snapshot.</EmptyState>
      ) : (
        <ol className="leaderboard">
          {leaders.map((leader, index) => (
            <li key={leader.name}>
              <span className="leaderboard-rank" aria-hidden="true">
                {index + 1}
              </span>
              <HeroPortrait name={leader.name} src={portraits.get(leader.name)} />
              <b>{leader.name}</b>
              <span className="leaderboard-value">{leader.value.toFixed(1)}%</span>
            </li>
          ))}
        </ol>
      )}
      {live.rates && (
        <p className="fine-print">
          {live.rankLabel}, last 7 days, across all {live.rates.size} heroes.
        </p>
      )}
    </Panel>
  )
}
