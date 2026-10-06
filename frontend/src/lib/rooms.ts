import type { GameRoom } from './types'

/** A full 5-stack. */
export const ROOM_SIZE = 5

/** One pick per enemy player. */
export const ENEMY_PICK_LIMIT = 5

/** Heroes or agents each member can name as favourites. */
export const FAVOURITE_LIMIT = 3

/** A solo player's four teammates. */
export const ALLY_PICK_LIMIT = 4

/** The last stretch before the start, when the room asks everyone to get in. */
const STARTING_SOON_MS = 5 * 60_000

/** How long after the start the room still reads as "in game". */
const SESSION_MS = 3 * 3_600_000

export type RoomPhase = 'unscheduled' | 'upcoming' | 'starting' | 'inGame' | 'ended'

export function createRoom(): GameRoom {
  return { members: [], startsAt: null, enemyPicks: [], lineup: null }
}

export function roomPhase(startsAt: string | null, now: number): RoomPhase {
  if (!startsAt) return 'unscheduled'
  const untilStart = new Date(startsAt).getTime() - now
  if (untilStart > STARTING_SOON_MS) return 'upcoming'
  if (untilStart > 0) return 'starting'
  return -untilStart < SESSION_MS ? 'inGame' : 'ended'
}
