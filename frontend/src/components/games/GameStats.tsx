import type { GameGuide } from '../../data/games/types'
import type { LiveStats } from '../../hooks/useLiveStats'
import { rankBy } from '../../lib/liveRates'

/** Headline numbers. Tiles tied to a live rate show this week's leader while the feed is up. */
export function GameStats({ game, live }: { game: GameGuide; live: LiveStats }) {
  return (
    <dl className="game-stats">
      {game.stats.map(stat => {
        const leader = stat.live && live.rates ? rankBy(live.rates, stat.live)[0] : undefined
        return (
          <div key={stat.label} className={leader ? 'is-live' : undefined}>
            <dt>{stat.label}</dt>
            <dd>{leader ? `${leader.name} ${leader.value.toFixed(1)}%` : stat.value}</dd>
            <dd className="game-stat-note">{leader ? `Live · ${live.rankLabel} · last 7 days` : stat.note}</dd>
          </div>
        )
      })}
    </dl>
  )
}
