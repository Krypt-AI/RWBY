import { Link } from 'react-router-dom'
import type { GameGuide } from '../../data/games/types'
import { useGameRoom } from '../../hooks/useGameRoom'
import type { LiveStats } from '../../hooks/useLiveStats'
import { Icon } from '../Icon'
import { Panel } from '../Panel'
import { CounterPicker } from './CounterPicker'
import { RoomLobby } from './RoomLobby'

/** The game room: lobby and countdown, plus the counter-pick helper for games with a draft kit. */
export function GameRoomSection({ game, live }: { game: GameGuide; live: LiveStats }) {
  const controls = useGameRoom(game.id)

  return (
    <div className="room-layout">
      <RoomLobby game={game} controls={controls} />
      {game.draft ? (
        <CounterPicker game={game} kit={game.draft} live={live} controls={controls} />
      ) : (
        <QueuePrep game={game} />
      )}
    </div>
  )
}

/** For games without a draft helper: the guide sections worth a look while the squad gathers. */
function QueuePrep({ game }: { game: GameGuide }) {
  const links = [
    { to: `/games/${game.id}/lineups`, label: 'Lineups' },
    { to: `/games/${game.id}/builds`, label: game.loadoutsTitle },
    { to: `/games/${game.id}/roles`, label: 'Who plays what' },
  ]

  return (
    <Panel title="Before you queue">
      <p className="card-note">Settle the comp and the buys while the squad gathers.</p>
      <ul className="prep-links">
        {links.map(link => (
          <li key={link.to}>
            <Link to={link.to} className="link-arrow">
              {link.label} <Icon name="arrow" size={14} />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
