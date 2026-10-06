import type { GameGuide } from '../../data/games/types'
import { roleName } from '../../data/games'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { formatList } from '../../utils/format'
import { PreferencesPanel } from './PreferencesPanel'

/** The viewer's own role and favourites, which the room's lineup is built around. Members only. */
export function RoomPreferences({ game, controls }: { game: GameGuide; controls: GameRoomControls }) {
  const { room, viewerId, setPreferences } = controls
  const me = room.members.find(member => member.id === viewerId)
  if (!me) return null

  const sharing = room.members
    .filter(member => member.id !== me.id && me.role && member.role === me.role)
    .map(member => member.name)
  const note =
    me.role && sharing.length > 0
      ? `${formatList(sharing)} also ${sharing.length === 1 ? 'plays' : 'play'} ${roleName(game, me.role)}.`
      : undefined

  return (
    <PreferencesPanel
      game={game}
      title="Your role and picks"
      roleLabel="Role"
      preferences={me}
      onChange={setPreferences}
      note={note}
    />
  )
}
