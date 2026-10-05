import { Link } from 'react-router-dom'
import type { GameGuide } from '../../data/games/types'
import { useGameRoom } from '../../hooks/useGameRoom'
import { useNow } from '../../hooks/useNow'
import { ROOM_SIZE, roomPhase } from '../../lib/rooms'
import { Icon } from '../Icon'
import { clockCopy } from './clockCopy'

/** Compact room status that links into the room. */
export function RoomCard({ game }: { game: GameGuide }) {
  const now = useNow()
  const { room, isMember } = useGameRoom(game.id)
  const phase = roomPhase(room.startsAt, now)
  const { summary } = clockCopy(phase, room.startsAt, now)

  return (
    <Link to={`/games/${game.id}/room`} className={`room-card accent-${game.accent} is-${phase}`}>
      <span className="room-card-game">{game.shortName} room</span>
      <b className="room-card-status">{summary}</b>
      <span className="room-card-meta">
        {room.members.length}/{ROOM_SIZE} in the room{isMember ? ' · you’re in' : ''}
      </span>
      <span className="room-card-foot">
        Enter room <Icon name="arrow" size={14} />
      </span>
    </Link>
  )
}
