import type { GameGuide } from '../../data/games/types'
import { LIVE_FEEDS } from '../../services/liveStats'
import { formatDate } from '../../utils/format'
import { Icon } from '../Icon'

/** Snapshot date and where the numbers came from. */
export function GameSources({ game }: { game: GameGuide }) {
  const hasLiveFeed = Boolean(LIVE_FEEDS[game.id])

  return (
    <footer className="game-sources">
      <p>
        Tier placements, lineups and builds are a snapshot of patch {game.patch}, taken {formatDate(game.asOf)}.{' '}
        {hasLiveFeed
          ? 'Win, pick and ban rates refresh from the live feed while this page is open.'
          : 'Rates move daily, so check the live pages above before a ranked push.'}
      </p>
      <ul>
        {game.sources.map(source => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer" className="link-arrow">
              {source.label} <Icon name="external" size={13} />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}
