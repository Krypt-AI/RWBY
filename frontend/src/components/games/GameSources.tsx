import type { GameGuide } from '../../data/games/types'
import { formatDate } from '../../utils/format'
import { Icon } from '../Icon'

/** Snapshot date and where the numbers came from. */
export function GameSources({ game }: { game: GameGuide }) {
  return (
    <footer className="game-sources">
      <p>
        Snapshot of patch {game.patch}, taken {formatDate(game.asOf)}. Rates move daily, so check the sources before a
        ranked push.
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
