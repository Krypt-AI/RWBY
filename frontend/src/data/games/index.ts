import type { GameId, LfgPost } from '../../lib/types'
import type { GameGuide, GameSection } from './types'
import { MLBB } from './mlbb'
import { VALORANT } from './valorant'

export const GAMES: GameGuide[] = [MLBB, VALORANT]

export const GAME_BY_ID: Record<GameId, GameGuide> = { mlbb: MLBB, valorant: VALORANT }

export const GAME_SECTIONS: { id: GameSection; label: string }[] = [
  { id: 'meta', label: 'Meta' },
  { id: 'lineups', label: 'Lineups' },
  { id: 'builds', label: 'Builds & gear' },
  { id: 'roles', label: 'Roles' },
]

export function isGameId(value: string | undefined): value is GameId {
  return GAMES.some(game => game.id === value)
}

export function isGameSection(value: string | undefined): value is GameSection {
  return GAME_SECTIONS.some(section => section.id === value)
}

/** Human label for a role id, falling back to the id itself. */
export function roleName(game: GameGuide, roleId: string): string {
  return game.roles.find(role => role.id === roleId)?.name ?? roleId
}

/** Short name for a Squad board game, including the catch-all "other". */
export function gameLabel(game: LfgPost['game']): string {
  return game === 'other' ? 'Other game' : GAME_BY_ID[game].shortName
}
