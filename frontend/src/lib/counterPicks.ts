import type { DraftHero, DraftKit, HeroClass, MatchupStat, Threat, Tier } from '../data/games/types'

/** How a hero's matchups against the enemy draft add up. */
export type Fit = 'strong' | 'good' | 'even' | 'countered'

export type Reason = { tone: 'good' | 'bad'; text: string }

/** The enemy draft and this patch's numbers, which every hero is rated against. */
export type DraftContext = {
  enemies: DraftHero[]
  /** Live best and worst picks against each enemy, keyed by enemy id. */
  matchups?: Map<number, MatchupStat[]>
  /** Overall win rates in percent, keyed by hero name: live when the feed is up, else the patch snapshot. */
  winRates?: Map<string, number>
  /** Curated tier placements, keyed by hero name. */
  tiers?: Map<string, Tier>
}

export type HeroRating = {
  /** Win-rate points gained or lost against the enemy draft. */
  edge: number
  /** Strength on this patch, from the live win rate and the tier list. */
  form: number
  /** Strengths first, then warnings. */
  reasons: Reason[]
}

/**
 * What each signal is worth, in win-rate points. Being on Moonton's official counter list
 * counts like a 2-point matchup edge. Overall form is worth less than a real matchup edge,
 * so it mostly decides between heroes that match up equally.
 */
const WEIGHTS = { listedCounter: 2, listedWeakness: -2, matchupPoint: 1, winRatePoint: 0.25 }
const TIER_BONUS: Partial<Record<Tier, number>> = { S: 1, A: 0.5 }
/** Overall win rates this far from 50% are worth calling out. */
const NOTABLE_WIN_RATE_GAP = 2

const signed = (points: number) => `${points >= 0 ? '+' : '−'}${Math.abs(points).toFixed(1)}%`

/** One official counter is a good answer, two are a strong one; one official weakness is a real risk. */
export function fitFor(edge: number): Fit {
  if (edge >= 4) return 'strong'
  if (edge >= 2) return 'good'
  return edge > -2 ? 'even' : 'countered'
}

/** Rates one hero against the enemy draft and the current patch. */
export function rateHero(hero: DraftHero, { enemies, matchups, winRates, tiers }: DraftContext): HeroRating {
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

  let form = 0
  const winRate = winRates?.get(hero.name)
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
  return { edge, form, reasons }
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
