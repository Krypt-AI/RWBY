import type { Accent, GameId } from '../../lib/types'

/**
 * Shape of a game guide. Each game is a static snapshot of the meta at one
 * patch; update the data file (and `asOf`) when a new patch lands.
 */
export type GameSection = 'meta' | 'lineups' | 'builds' | 'roles' | 'room'

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

/** Where a lineup was played: pro matches or ranked games. */
type LineupSource = 'pro' | 'ranked'

/** A full five-player team, as played on the current patch. */
export type Lineup = {
  /** Stable id; a game room stores it as the lineup it settled on. */
  id: string
  name: string
  source: LineupSource
  /** The map it was played on, for games with maps. */
  map?: string
  /** Where the numbers come from, e.g. "VCT Champions 2026". */
  context: string
  slots: LineupSlot[]
  /** How it plays, in a sentence or two. */
  plan: string
  /** Its track record, e.g. "6 maps · 2–4" or "15,996 matches · 51.9% won". */
  record: string
  /** Who played it, or a real game it won. */
  example?: string
}

export type Loadout = {
  title: string
  subtitle: string
  items: string[]
  /** Extra lines such as emblem, talents and battle spell. */
  extras: { label: string; value: string }[]
  note: string
}

type EquipmentItem = { name: string; cost?: string; detail: string }

export type EquipmentGroup = { title: string; items: EquipmentItem[] }

/** A rate the live feed publishes for every hero or agent. */
export type LiveRate = 'winRate' | 'pickRate' | 'banRate'

/** Live percentages for one hero or agent. */
export type LiveRates = Record<LiveRate, number>

/** How picking a hero against an enemy moves win rate, in percentage points. */
export type MatchupStat = { heroId: number; delta: number }

export type GameStat = {
  label: string
  value: string
  note: string
  /** Shows the live leader for this rate instead of `value` while the live feed is up. */
  live?: LiveRate
}

export type HeroClass = 'tank' | 'fighter' | 'assassin' | 'mage' | 'marksman' | 'support'

/** One hero in a draft, with the game's official counter relations. */
export type DraftHero = {
  id: number
  name: string
  portrait: string
  /** GameRole ids the hero is played in. */
  lanes: string[]
  classes: HeroClass[]
  /** Ids of heroes this one is strong against. */
  counters: number[]
  /** Ids of heroes that are strong against this one. */
  counteredBy: number[]
}

/** A hero or agent a room member can name as a favourite. */
export type Character = {
  name: string
  portrait?: string
  /** GameRole ids it's played in. */
  roleIds: string[]
}

/** Something in the enemy draft that a build should answer. */
export type Threat = 'healing' | 'magic' | 'physical' | 'dive' | 'control'

/** What the game-room counter helper needs for one game. */
export type DraftKit = {
  heroes: DraftHero[]
  /** Heroes whose healing or lifesteal calls for anti-heal. */
  healers: string[]
  /** Items that answer each threat. */
  answers: Record<Threat, string[]>
}

export type GameGuide = {
  id: GameId
  name: string
  shortName: string
  genre: string
  /** What the game calls its characters, e.g. hero and heroes. */
  characterTerm: { one: string; many: string }
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
  /** Stat pages that update continuously, for checking numbers between snapshots. */
  liveLinks: SourceLink[]
  /** Hero pool for the counter-pick helper in the game room. Games without one skip the helper. */
  draft?: DraftKit
}
