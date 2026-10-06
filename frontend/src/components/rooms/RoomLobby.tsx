import type { GameGuide } from '../../data/games/types'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { ROOM_SIZE } from '../../lib/rooms'
import { ModPanel } from '../Panel'
import { RoomClock } from './RoomClock'
import { RoomPreferences } from './RoomPreferences'
import { RoomRoster } from './RoomRoster'

/** Who's in the room and what they play, and when the squad starts. */
export function RoomLobby({ game, controls }: { game: GameGuide; controls: GameRoomControls }) {
  const { room, reset } = controls
  const clears = `members, the start time and ${game.draft ? 'enemy picks' : 'the chosen map'}`

  const resetRoom = () => {
    if (window.confirm(`Empty the ${game.shortName} room? This clears ${clears}.`)) reset()
  }

  return (
    <div className="side-stack">
      <section className="panel room-lobby" aria-labelledby="room-title">
        <div className="panel-head">
          <h2 className="panel-title" id="room-title">
            {game.shortName} room
          </h2>
          <span className="room-count">
            {room.members.length}/{ROOM_SIZE}
          </span>
        </div>
        <RoomClock controls={controls} />
        <RoomRoster game={game} controls={controls} />
      </section>

      <RoomPreferences game={game} controls={controls} />

      <ModPanel title="Room controls">
        <div className="mod-row">
          <p className="muted">Clears {clears}.</p>
          <button type="button" className="btn btn-danger" onClick={resetRoom}>
            Reset room
          </button>
        </div>
      </ModPanel>
    </div>
  )
}
