import type { GameGuide } from '../../data/games/types'
import { roleName } from '../../data/games'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { ROOM_SIZE } from '../../lib/rooms'
import { initials } from '../../utils/format'
import { ActingAs } from '../ActingAs'
import { Icon } from '../Icon'

/** Five seats: who's in, what they play, who's missing, and the viewer's join or leave button. */
export function RoomRoster({ game, controls }: { game: GameGuide; controls: GameRoomControls }) {
  const { room, viewerId, isMember, isFull, join, leave } = controls
  const seats = Array.from({ length: ROOM_SIZE }, (_, index) => room.members[index])

  return (
    <div className="room-roster">
      <ol className="room-seats" aria-label={`${room.members.length} of ${ROOM_SIZE} seats taken`}>
        {seats.map((member, index) =>
          member ? (
            <li key={member.id} className={`room-seat is-taken ${member.id === viewerId ? 'is-you' : ''}`}>
              <span className="avatar" aria-hidden="true">
                {initials(member.name)}
              </span>
              <span className="room-seat-body">
                <span className="room-seat-name">{member.name}</span>
                {member.picks.length > 0 && <span className="room-seat-picks">{member.picks.join(' · ')}</span>}
              </span>
              <span className={`room-seat-role ${member.role ? '' : 'is-fill'}`}>
                {member.role ? roleName(game, member.role) : 'Fill'}
              </span>
              {member.id === viewerId && <span className="room-you">You</span>}
            </li>
          ) : (
            <li key={`open-${index}`} className="room-seat is-open">
              <span className="avatar" aria-hidden="true">
                <Icon name="plus" size={14} />
              </span>
              <span className="room-seat-name">Open seat</span>
            </li>
          ),
        )}
      </ol>

      <div className="room-roster-foot">
        {isMember ? (
          <button type="button" className="btn btn-ghost btn-small" onClick={leave}>
            Leave room
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-small" onClick={join} disabled={isFull}>
            {isFull ? 'Room full' : 'Join room'}
          </button>
        )}
        {!isMember && !isFull && (
          <p className="muted">
            <ActingAs verb="Joining" />
          </p>
        )}
      </div>
    </div>
  )
}
