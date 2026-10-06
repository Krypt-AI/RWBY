import type { DraftHero, DraftKit, HeroClass, LiveRates, MatchupStat, Threat, Tier } from '../data/games/types'

/** 'strong': a clear edge on several fronts. 'situational': a small edge, check your comp first. */
export type Fit = 'strong' | 'good' | 'situational'

type Reason = { tone: 'good' | 'bad'; text: string }

type CounterSuggestion = { hero: DraftHero; score: number; fit: Fit; reasons: Reason[] }

type CounterInput = {
  pool: DraftHero[]
  enemies: DraftHero[]
  /** Live best and worst picks against each enemy, keyed by enemy id. */
  matchups?: Map<number, MatchupStat[]>
  /** Live overall rates, keyed by hero name. */
  rates?: Map<string, LiveRates>
  /** Curated tier placements, keyed by hero name. */
  tiers?: Map<string, Tier>
  /** Only suggest heroes played in this lane. */
  lane?: string
  limit?: number
}

/**
 * What each signal is worth, in win-rate points. Being on Moonton's official counter list
 * counts like a 2-point matchup edge. Overall form only breaks ties: a hero needs a real
 * edge against the enemy draft to be suggested at all.
 */
const WEIGHTS = { listedCounter: 2, listedWeakness: -2, matchupPoint: 1, winRatePoint: 0.25 }
const TIER_BONUS: Partial<Record<Tier, number>> = { S: 1, A: 0.5 }
/** Overall win rates this far from 50% are worth calling out. */
const NOTABLE_WIN_RATE_GAP = 2

const signed = (points: number) => `${points >= 0 ? '+' : '−'}${Math.abs(points).toFixed(1)}%`

function fitFor(edge: number): Fit {
  if (edge >= 4) return 'strong'
  return edge >= 2 ? 'good' : 'situational'
}

function scoreHero(hero: DraftHero, { enemies, matchups, rates, tiers }: CounterInput): CounterSuggestion | null {
  let edge = 0
  const reasons: Reason[] = []

  for (const enemy of enemies) {
    if (enemy.counteredBy.includes(hero.id) || hero.counters.includes(enemy.id)) {
      edge += WEIGHTS.listedCounter
      reasons.push({ tone: 'good', text: `Official counter to ${enemy.name}` })
    }
    if (enemy.counters.includes(hero.id) || hero.counteredBy.includes(enemy.id)) {
      edge += WEIGHTS.listedWeakness
      reasons.push({ tone: 'bad', text: `Officially weak to ${enemy.name}` })
    }
    const delta = matchups?.get(enemy.id)?.find(stat => stat.heroId === hero.id)?.delta
    if (delta !== undefined) {
      edge += delta * WEIGHTS.matchupPoint
      reasons.push({ tone: delta >= 0 ? 'good' : 'bad', text: `${signed(delta)} win rate vs ${enemy.name}` })
    }
  }

  if (edge <= 0) return null

  let form = 0
  const winRate = rates?.get(hero.name)?.winRate
  if (winRate !== undefined) {
    form += (winRate - 50) * WEIGHTS.winRatePoint
    if (Math.abs(winRate - 50) >= NOTABLE_WIN_RATE_GAP) {
      reasons.push({ tone: winRate > 50 ? 'good' : 'bad', text: `${winRate.toFixed(1)}% win rate overall` })
    }
  }
  const tier = tiers?.get(hero.name)
  const tierBonus = tier ? TIER_BONUS[tier] : undefined
  if (tier && tierBonus) {
    form += tierBonus
    reasons.push({ tone: 'good', text: `${tier} tier this patch` })
  }

  // Strengths first, warnings after; the order within each group follows the enemy picks.
  reasons.sort((a, b) => Number(a.tone === 'bad') - Number(b.tone === 'bad'))
  return { hero, score: edge + form, fit: fitFor(edge), reasons }
}

/** The best answers to the enemy picks, strongest first. */
export function suggestCounters(input: CounterInput): CounterSuggestion[] {
  const { pool, enemies, lane, limit = 6 } = input
  if (enemies.length === 0) return []
  const taken = new Set(enemies.map(enemy => enemy.id))

  return pool
    .filter(hero => !taken.has(hero.id) && (!lane || hero.lanes.includes(lane)))
    .map(hero => scoreHero(hero, input))
    .filter((suggestion): suggestion is CounterSuggestion => suggestion !== null)
    .sort((a, b) => b.score - a.score || a.hero.name.localeCompare(b.hero.name))
    .slice(0, limit)
}

type ThreatRead = { threat: Threat; heroes: string[] }

const PHYSICAL_CLASSES: HeroClass[] = ['marksman', 'assassin', 'fighter']

/** How many enemies it takes before each threat is worth building against. */
const THREAT_RULES: { threat: Threat; min: number; matches: (hero: DraftHero, kit: DraftKit) => boolean }[] = [
  { threat: 'healing', min: 1, matches: (hero, kit) => kit.healers.includes(hero.name) },
  { threat: 'dive', min: 2, matches: hero => hero.classes.includes('assassin') },
  { threat: 'magic', min: 3, matches: hero => hero.classes.includes('mage') },
  {
    threat: 'physical',
    min: 3,
    matches: hero => !hero.classes.includes('mage') && PHYSICAL_CLASSES.some(role => hero.classes.includes(role)),
  },
  { threat: 'control', min: 2, matches: hero => hero.classes.includes('tank') },
]

/** Threats in the enemy draft that the build should answer, with the heroes behind each. */
export function readThreats(enemies: DraftHero[], kit: DraftKit): ThreatRead[] {
  return THREAT_RULES.flatMap(({ threat, min, matches }) => {
    const heroes = enemies.filter(hero => matches(hero, kit)).map(hero => hero.name)
    return heroes.length >= min ? [{ threat, heroes }] : []
  })
}
