import { useEffect, useState } from 'react'
import { ALLY_PICK_LIMIT, ENEMY_PICK_LIMIT, FAVOURITE_LIMIT } from '../lib/rooms'
import type { GameId, RoomMember } from '../lib/types'
import { load, save } from '../services/storage'

type Preferences = Pick<RoomMember, 'role' | 'picks'>

/** A solo player's own draft board. */
export type SoloDraft = Preferences & {
  enemyPicks: string[]
  /** Heroes the player's teammates have locked in. */
  allyPicks: string[]
}

type Side = 'enemyPicks' | 'allyPicks'

const LIMITS: Record<Side, number> = { enemyPicks: ENEMY_PICK_LIMIT, allyPicks: ALLY_PICK_LIMIT }

const storageKey = (game: GameId) => `solo.${game}.v1`

const names = (value: unknown, limit: number): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, limit) : []

/** The saved board, or an empty one. Saved data is checked, since it may come from an older version. */
function readDraft(game: GameId): SoloDraft {
  const saved = load<Partial<Record<keyof SoloDraft, unknown>>>(storageKey(game), () => ({}))
  return {
    role: typeof saved.role === 'string' ? saved.role : null,
    picks: names(saved.picks, FAVOURITE_LIMIT),
    enemyPicks: names(saved.enemyPicks, ENEMY_PICK_LIMIT),
    allyPicks: names(saved.allyPicks, ALLY_PICK_LIMIT),
  }
}

/**
 * A draft board for one player in solo queue: their lane, favourites and both teams' picks. It
 * stays in this browser, so it works without signing in or joining a room.
 */
export function useSoloDraft(game: GameId) {
  const [draft, setDraft] = useState(() => readDraft(game))
  useEffect(() => save(storageKey(game), draft), [game, draft])

  /** A hero can be in only one team's draft. */
  const pick = (side: Side) => (hero: string) =>
    setDraft(current => {
      const isTaken = current.enemyPicks.includes(hero) || current.allyPicks.includes(hero)
      if (isTaken || current[side].length >= LIMITS[side]) return current
      return { ...current, [side]: [...current[side], hero] }
    })
  const unpick = (side: Side) => (hero: string) =>
    setDraft(current => ({ ...current, [side]: current[side].filter(name => name !== hero) }))
  const clear = (side: Side) => () => setDraft(current => ({ ...current, [side]: [] }))

  return {
    draft,
    /** Heroes in either draft. */
    taken: new Set([...draft.enemyPicks, ...draft.allyPicks]),
    setPreferences: ({ role, picks }: Preferences) =>
      setDraft(current => ({ ...current, role, picks: [...new Set(picks)].slice(0, FAVOURITE_LIMIT) })),
    pickEnemy: pick('enemyPicks'),
    unpickEnemy: unpick('enemyPicks'),
    clearEnemies: clear('enemyPicks'),
    pickAlly: pick('allyPicks'),
    unpickAlly: unpick('allyPicks'),
    clearAllies: clear('allyPicks'),
  }
}
