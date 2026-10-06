import type { GameGuide } from '../../data/games/types'
import { useGameRoom } from '../../hooks/useGameRoom'
import type { LiveStats } from '../../hooks/useLiveStats'
import { DraftPlanner } from './DraftPlanner'
import { MapLineups } from './MapLineups'
import { RoomLobby } from './RoomLobby'

/**
 * The game room: lobby, countdown and everyone's role and favourites, plus a lineup built around
 * them. Games with a draft kit get the counter-aware lineup; the rest get their guide's comps.
 */
export function GameRoomSection({ game, live }: { game: GameGuide; live: LiveStats }) {
  const controls = useGameRoom(game.id)

  return (
    <div className="room-layout">
      <RoomLobby game={game} controls={controls} />
      {game.draft ? (
        <DraftPlanner game={game} kit={game.draft} live={live} controls={controls} />
      ) : (
        <MapLineups game={game} controls={controls} />
      )}
    </div>
  )
}
