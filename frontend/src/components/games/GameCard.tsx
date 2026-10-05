import { Link } from 'react-router-dom'
import type { GameGuide } from '../../data/games/types'
import { formatDate } from '../../utils/format'
import { Icon } from '../Icon'

const TOP_PICKS = 5

/** Teaser for one game guide: patch, tagline and the current S-tier picks. */
export function GameCard({ game }: { game: GameGuide }) {
  const topPicks = game.tiers.filter(entry => entry.tier === 'S').slice(0, TOP_PICKS)

  return (
    <Link to={`/games/${game.id}`} className={`game-card accent-${game.accent}`}>
      <span className="game-card-label">{game.genre}</span>
      <b className="game-card-title">{game.name}</b>
      <span className="game-card-patch">
        Patch {game.patch} · updated {formatDate(game.asOf)}
      </span>
      <p className="game-card-tagline">{game.tagline}</p>
      <span className="game-card-picks">
        <small>S tier</small>
        {topPicks.map(entry => (
          <span key={entry.name} className="tag">
            {entry.name}
          </span>
        ))}
      </span>
      <span className="game-card-foot">
        Open guide <Icon name="arrow" size={14} />
      </span>
    </Link>
  )
}
