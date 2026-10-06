import { useEffect, useState } from 'react'
import type { GameGuide } from '../../data/games/types'
import { useGameRoom } from '../../hooks/useGameRoom'
import type { LiveStats } from '../../hooks/useLiveStats'
import type { GameId } from '../../lib/types'
import { load, save } from '../../services/storage'
import { ChipGroup } from '../ChipGroup'
import { DraftPlanner } from './DraftPlanner'
import { MapLineups } from './MapLineups'
import { RoomLobby } from './RoomLobby'
import { SoloDraft } from './SoloDraft'

type RoomMode = 'squad' | 'solo'

const MODES: { value: RoomMode; label: string; note: string }[] = [
  { value: 'squad', label: 'Squad room', note: 'The shared room for your 5-stack: everyone in it sees the same draft.' },
  { value: 'solo', label: 'Solo queue', note: 'Your own draft board for solo games, saved in this browser.' },
]

/** Squad or solo, remembered per game in this browser. */
function useRoomMode(game: GameId) {
  const key = `room-mode.${game}`
  const [mode, setMode] = useState<RoomMode>(() => (load<string>(key, () => 'squad') === 'solo' ? 'solo' : 'squad'))
  useEffect(() => save(key, mode), [key, mode])
  return [mode, setMode] as const
}

/**
 * The game room: lobby, countdown and everyone's role and favourites, plus a lineup built around
 * them. Games with a draft kit get the counter-aware lineup and a solo queue board; the rest get
 * their guide's comps by map.
 */
export function GameRoomSection({ game, live }: { game: GameGuide; live: LiveStats }) {
  const controls = useGameRoom(game.id)
  const [mode, setMode] = useRoomMode(game.id)

  if (!game.draft) {
    return (
      <div className="room-layout">
        <RoomLobby game={game} controls={controls} />
        <MapLineups game={game} controls={controls} />
      </div>
    )
  }

  return (
    <div className="room-modes">
      <div className="room-mode-switch">
        <ChipGroup
          label="How you’re playing"
          options={MODES}
          isSelected={value => value === mode}
          onSelect={value => setMode(value === 'solo' ? 'solo' : 'squad')}
        />
        <p className="muted">{MODES.find(option => option.value === mode)?.note}</p>
      </div>
      {mode === 'solo' ? (
        <SoloDraft game={game} kit={game.draft} live={live} />
      ) : (
        <div className="room-layout">
          <RoomLobby game={game} controls={controls} />
          <DraftPlanner game={game} kit={game.draft} live={live} controls={controls} />
        </div>
      )}
    </div>
  )
}
