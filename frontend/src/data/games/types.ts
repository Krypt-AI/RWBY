import type { Accent, GameId } from '../../lib/types'

/**
 * Shape of a game guide. Each game is a static snapshot of the meta at one
 * patch; update the data file (and `asOf`) when a new patch lands.
 */
export type GameSection = 'meta' | 'lineups' | 'builds' | 'roles'

export type SourceLink = { label: string; url: string }

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export type GameRole = {
  id: string
  name: string
  summary: string
  duties: string[]
  /** Strongest picks for this role on the current patch. */
  picks: string[]
}

export type TierEntry = {
  name: string
  /** Matches a GameRole id (lane for MLBB, agent role for Valorant). */
  roleId: string
  tier: Tier
  /** Hero class, when it differs from the role (e.g. a Tank played on EXP lane). */
  archetype?: string
  /** All rates are percentages. Leave out what the sources don't publish. */
  winRate?: number
  pickRate?: number
  banRate?: number
  /** Pick rate in top-level pro play. */
  proRate?: number
  trend?: 'up' | 'down'
}

export type LineupSlot = { name: string; roleId: string }

export type Lineup = {
  name: string
  /** Where it's played: a map, a mode or a style. */
  context: string
  slots: LineupSlot[]
  plan: string
  /** Optional track record, e.g. "6 maps · 33% won". */
  record?: string
}

export type Loadout = {
  title: string
  subtitle: string
  items: string[]
  /** Extra lines such as emblem, talents and battle spell. */
  extras: { label: string; value: string }[]
  note: string
}

export type EquipmentItem = { name: string; cost?: string; detail: string }

export type EquipmentGroup = { title: string; items: EquipmentItem[] }

export type GameStat = { label: string; value: string; note: string }

export type GameGuide = {
  id: GameId
  name: string
  shortName: string
  genre: string
  accent: Accent
  tagline: string
  patch: string
  /** ISO date the snapshot was taken. */
  asOf: string
  stats: GameStat[]
  metaNotes: string[]
  tierSource: string
  tiers: TierEntry[]
  lineupsIntro: string
  lineups: Lineup[]
  loadoutsTitle: string
  loadouts: Loadout[]
  equipmentTitle: string
  equipment: EquipmentGroup[]
  roles: GameRole[]
  /** Queue types offered when posting on the Squad board. */
  modes: string[]
  /** Placeholder for the rank field on the Squad board. */
  rankExample: string
  sources: SourceLink[]
}
