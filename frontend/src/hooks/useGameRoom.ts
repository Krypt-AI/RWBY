import type { GameId, RoomMember } from '../lib/types'
import { ROOM_SIZE } from '../lib/rooms'
import { useMode } from './useMode'
import { useSite } from './useSite'
import { useViewer } from './useViewer'

/** One game's room plus what the current viewer may do in it. */
export function useGameRoom(game: GameId) {
  const { state, dispatch, moderate } = useSite()
  const { isModerator } = useMode()
  const viewer = useViewer()
  const room = state.rooms[game]

  const isMember = room.members.some(member => member.id === viewer.id)
  const isFull = room.members.length >= ROOM_SIZE
  /** Members run their room; moderators can step in. */
  const canEdit = isMember || isModerator

  const join = () => {
    if (!isMember && !isFull) dispatch({ type: 'room/join', game, member: { id: viewer.id, name: viewer.name } })
  }

  const leave = () => {
    if (isMember) dispatch({ type: 'room/leave', game, memberId: viewer.id })
  }

  /** The viewer's own role and favourites. Only people in the room have them. */
  const setPreferences = (preferences: Pick<RoomMember, 'role' | 'picks'>) => {
    if (isMember) dispatch({ type: 'room/setPreferences', game, memberId: viewer.id, ...preferences })
  }

  const setStart = (startsAt: string | null) => {
    if (canEdit) dispatch({ type: 'room/setStart', game, startsAt })
  }

  const pickEnemy = (hero: string) => {
    if (canEdit) dispatch({ type: 'room/pickEnemy', game, hero })
  }

  const unpickEnemy = (hero: string) => {
    if (canEdit) dispatch({ type: 'room/unpickEnemy', game, hero })
  }

  const clearPicks = () => {
    if (canEdit) dispatch({ type: 'room/clearPicks', game })
  }

  const setLineup = (lineup: string | null) => {
    if (canEdit) dispatch({ type: 'room/setLineup', game, lineup })
  }

  const reset = () => moderate({ type: 'room/reset', game })

  return {
    room,
    viewerId: viewer.id,
    isMember,
    isFull,
    canEdit,
    join,
    leave,
    setPreferences,
    setStart,
    pickEnemy,
    unpickEnemy,
    clearPicks,
    setLineup,
    reset,
  }
}

export type GameRoomControls = ReturnType<typeof useGameRoom>
