import type { DraftHero, GameRole, Lineup, LineupSlot } from '../data/games/types'
import type { RoomMember } from './types'
import { fitFor, rateHero, type DraftContext, type Fit, type HeroRating, type Reason } from './counterPicks'
import { FAVOURITE_LIMIT } from './rooms'

/**
 * Comfort beats the meta: a lane player's favourites go in before any other hero unless an enemy
 * pick counters them. Among the favourites left, the better matchup wins, and each step down the
 * player's list costs this much, so their order settles near-ties.
 */
const FAVOURITE_STEP = 0.5
/** Breaks ties in favour of heroes played in the lane, e.g. when two players want the same hero. */
const OFF_LANE_PENALTY = 0.25

/** Picks listed under each lane besides the recommended one. */
const ALTERNATIVE_COUNT = 2

/** Picks a solo player sees for their lane. */
const SOLO_PICK_COUNT = 5

const ORDINALS = ['top', '2nd', '3rd']

/** 'chose': the member picked this lane. 'filling': they left their lane open, or someone chose theirs first. */
type SeatKind = 'chose' | 'filling'

type LanePlayer = { member: RoomMember; seat: SeatKind }

/** Whoever plays a lane: their favourites, and whether this is the lane they chose. */
type LaneOwner = {
  picks: string[]
  /** Whose favourites they are, as the reasons say it: "Ruby’s" or "Your". */
  possessive: string
  choseLane: boolean
}

type LanePick = {
  hero: DraftHero
  score: number
  fit: Fit
  reasons: Reason[]
  /** Where it sits in the lane player's favourites (0 is their top pick), if it's one. */
  favouriteRank?: number
  /**
   * A favourite the player can take with confidence: no enemy pick counters it, and it's played in
   * this lane or this is the lane the player chose. These go before every other hero.
   */
  isComfortPick: boolean
}

/** Why a player's top favourite isn't their pick. */
type Benched = { hero: string; why: string }

export type LanePlan = {
  role: GameRole
  player?: LanePlayer
  /** Missing only if every hero for the lane is already taken. */
  pick?: LanePick
  alternatives: LanePick[]
  /** The player's top favourite when it isn't the pick, and why. */
  benched?: Benched
}

/** Two members chose the same lane. The first to join keeps it and the other fills. */
export type LaneClash = { role: GameRole; holder: RoomMember; mover: RoomMember; movedTo?: GameRole }

export type LineupPlan = { lanes: LanePlan[]; clashes: LaneClash[] }

type LineupInput = DraftContext & {
  /** The game's lanes, in display order. */
  roles: GameRole[]
  pool: DraftHero[]
  members: RoomMember[]
}

type Seating = { seats: Map<string, LanePlayer>; clashes: LaneClash[] }

/**
 * Puts each member in one lane. Members who chose a lane get it, first to join first. Everyone
 * else fills the open lane their favourites are played in, or else the first open lane.
 */
function seatMembers(members: RoomMember[], roles: GameRole[], pool: Map<string, DraftHero>): Seating {
  const seats = new Map<string, LanePlayer>()
  const fillers: { member: RoomMember; lost?: { role: GameRole; holder: RoomMember } }[] = []

  for (const member of members) {
    const role = roles.find(candidate => candidate.id === member.role)
    const holder = role && seats.get(role.id)
    if (role && !holder) seats.set(role.id, { member, seat: 'chose' })
    else fillers.push({ member, lost: role && holder ? { role, holder: holder.member } : undefined })
  }

  const clashes: LaneClash[] = []
  for (const { member, lost } of fillers) {
    const open = roles.filter(role => !seats.has(role.id))
    const favouriteLanes = member.picks.flatMap(name => pool.get(name)?.lanes ?? [])
    const lane = favouriteLanes.map(id => open.find(role => role.id === id)).find(Boolean) ?? open[0]
    if (lane) seats.set(lane.id, { member, seat: 'filling' })
    if (lost) clashes.push({ ...lost, mover: member, movedTo: lane })
  }
  return { seats, clashes }
}

const ownerOf = ({ member, seat }: LanePlayer): LaneOwner => ({
  picks: member.picks,
  possessive: `${member.name}’s`,
  choseLane: seat === 'chose',
})

/** Comfort picks first, then the higher score; on a tie, favourites in the player's order, then by name. */
const byStrength = (a: LanePick, b: LanePick) =>
  Number(b.isComfortPick) - Number(a.isComfortPick) ||
  b.score - a.score ||
  (a.favouriteRank ?? FAVOURITE_LIMIT) - (b.favouriteRank ?? FAVOURITE_LIMIT) ||
  a.hero.name.localeCompare(b.hero.name)

/** "Usually a Jungle or EXP lane pick", for a hero outside the lanes it's listed for. */
function offLaneReason(hero: DraftHero, role: GameRole, roles: GameRole[]): Reason | undefined {
  if (hero.lanes.includes(role.id)) return undefined
  const usual = roles.filter(candidate => hero.lanes.includes(candidate.id)).map(candidate => candidate.name)
  return usual.length > 0 ? { tone: 'bad', text: `Usually a ${usual.join(' or ')} pick` } : undefined
}

/** Scores one hero for one lane. With no lane (a solo player filling), every hero is on its lane. */
function lanePick(
  hero: DraftHero,
  rating: HeroRating,
  role: GameRole | undefined,
  roles: GameRole[],
  owner?: LaneOwner,
): LanePick {
  const rank = owner ? owner.picks.indexOf(hero.name) : -1
  const favouriteRank = rank >= 0 ? rank : undefined
  const fit = fitFor(rating.edge)
  const isOnLane = !role || hero.lanes.includes(role.id)
  const isComfortPick = favouriteRank !== undefined && fit !== 'countered' && (isOnLane || owner?.choseLane === true)

  // A comfort pick needs no patch form to earn its place; every other hero is weighed on it.
  let score = rating.edge + (isComfortPick ? -favouriteRank * FAVOURITE_STEP : rating.form)
  if (!isOnLane) score -= OFF_LANE_PENALTY

  const reasons = [...rating.reasons]
  if (owner && favouriteRank !== undefined) {
    reasons.unshift({ tone: 'good', text: `${owner.possessive} ${ORDINALS[favouriteRank]} pick` })
  }
  const offLane = role && offLaneReason(hero, role, roles)
  if (offLane) reasons.push(offLane)
  return { hero, score, fit, reasons, favouriteRank, isComfortPick }
}

type LaneOptionsInput = {
  role: GameRole | undefined
  roles: GameRole[]
  pool: DraftHero[]
  ratings: Map<number, HeroRating>
  /** Heroes nobody can pick: already in either team's draft. */
  taken: Set<string>
  owner?: LaneOwner
}

/** Every candidate for a lane, best first: the heroes played there plus the owner's favourites. */
function laneOptions({ role, roles, pool, ratings, taken, owner }: LaneOptionsInput): LanePick[] {
  const fitsLane = (hero: DraftHero) => !role || hero.lanes.includes(role.id) || owner?.picks.includes(hero.name)
  return pool
    .filter(hero => !taken.has(hero.name) && fitsLane(hero))
    .map(hero => lanePick(hero, ratings.get(hero.id)!, role, roles, owner))
    .sort(byStrength)
}

/** Why a top favourite that's still available lost its lane to `pick`. */
function benchedReason(
  top: string,
  options: LanePick[],
  pick: LanePick | undefined,
  role: GameRole | undefined,
  roles: GameRole[],
): Benched | undefined {
  const option = options.find(candidate => candidate.hero.name === top)
  if (!option) return undefined
  if (option.fit === 'countered') {
    // Enemy matchups are listed before overall form, so the first warning names the counter.
    const warning = option.reasons.find(reason => reason.tone === 'bad')
    return { hero: top, why: warning ? `${warning.text}.` : 'An enemy pick counters it.' }
  }
  const offLane = role && offLaneReason(option.hero, role, roles)
  if (!option.isComfortPick && offLane) return { hero: top, why: `${offLane.text}.` }
  return pick && { hero: top, why: `${pick.hero.name} matches up better with this draft.` }
}

/**
 * A five-hero lineup, one per lane. Each lane's player is seated first. In a player's lane their
 * comfort picks go first (see FAVOURITE_STEP); every other hero is scored on its matchups against
 * the enemy draft plus this patch's form. The strongest pairs are taken first, so no hero is used
 * twice.
 */
export function planLineup({ roles, pool, members, ...context }: LineupInput): LineupPlan {
  const byName = new Map(pool.map(hero => [hero.name, hero]))
  const { seats, clashes } = seatMembers(members, roles, byName)
  const ratings = new Map(pool.map(hero => [hero.id, rateHero(hero, context)]))
  const enemyNames = new Set(context.enemies.map(enemy => enemy.name))

  const options = roles.map(role => {
    const player = seats.get(role.id)
    return laneOptions({ role, roles, pool, ratings, taken: enemyNames, owner: player && ownerOf(player) })
  })

  const picks = new Map<number, LanePick>()
  /** Lane index each hero in the lineup plays. */
  const laneOf = new Map<string, number>()
  const ranked = options
    .flatMap((lanePicks, lane) => lanePicks.map(pick => ({ lane, pick })))
    .sort((a, b) => byStrength(a.pick, b.pick) || a.lane - b.lane)
  for (const { lane, pick } of ranked) {
    if (picks.size === roles.length) break
    if (picks.has(lane) || laneOf.has(pick.hero.name)) continue
    picks.set(lane, pick)
    laneOf.set(pick.hero.name, lane)
  }

  /** Why a player's top favourite sits out, or undefined when it's their pick. */
  const benchedFavourite = (lane: number, player: LanePlayer, pick?: LanePick): Benched | undefined => {
    const top = player.member.picks[0]
    if (!top || top === pick?.hero.name) return undefined
    if (enemyNames.has(top)) return { hero: top, why: 'The enemy has it.' }
    const otherLane = laneOf.get(top)
    if (otherLane !== undefined) {
      const role = roles[otherLane]!
      const holder = seats.get(role.id)?.member
      return { hero: top, why: holder ? `${holder.name} plays it in ${role.name}.` : `It’s the ${role.name} pick.` }
    }
    return benchedReason(top, options[lane]!, pick, roles[lane], roles)
  }

  const lanes = roles.map((role, lane): LanePlan => {
    const player = seats.get(role.id)
    const pick = picks.get(lane)
    return {
      role,
      player,
      pick,
      alternatives: options[lane]!.filter(option => !laneOf.has(option.hero.name)).slice(0, ALTERNATIVE_COUNT),
      benched: player && benchedFavourite(lane, player, pick),
    }
  })
  return { lanes, clashes }
}

type SoloInput = DraftContext & {
  roles: GameRole[]
  pool: DraftHero[]
  /** The lane the player is in, or null while they fill. */
  role: string | null
  favourites: string[]
  /** Heroes the player's teammates have locked in. */
  allies: DraftHero[]
}

export type SoloPlan = {
  role?: GameRole
  /** Best first. */
  picks: LanePick[]
  /** The player's top favourite when it isn't the first pick, and why. */
  benched?: Benched
}

/** A solo player's best picks for their lane, or for any lane while they fill, against the enemy draft. */
export function planSolo({ roles, pool, role: roleId, favourites, allies, ...context }: SoloInput): SoloPlan {
  const role = roles.find(candidate => candidate.id === roleId)
  const ratings = new Map(pool.map(hero => [hero.id, rateHero(hero, context)]))
  const enemyNames = new Set(context.enemies.map(enemy => enemy.name))
  const allyNames = new Set(allies.map(ally => ally.name))
  const owner: LaneOwner = { picks: favourites, possessive: 'Your', choseLane: role !== undefined }
  const options = laneOptions({ role, roles, pool, ratings, taken: new Set([...enemyNames, ...allyNames]), owner })
  const picks = options.slice(0, SOLO_PICK_COUNT)

  const top = favourites[0]
  let benched: Benched | undefined
  if (top && top !== picks[0]?.hero.name) {
    if (enemyNames.has(top)) benched = { hero: top, why: 'The enemy has it.' }
    else if (allyNames.has(top)) benched = { hero: top, why: 'A teammate has it.' }
    else benched = benchedReason(top, options, picks[0], role, roles)
  }
  return { role, picks, benched }
}

/** How a squad member got their slot in a comp. */
type CompMatch = 'favourite' | 'role' | 'filling'

export type CompSeat = { slot: LineupSlot; member?: RoomMember; match?: CompMatch }

export type CompFit = {
  lineup: Lineup
  seats: CompSeat[]
  /** Members on one of their favourites. */
  favourites: number
  /** Members on the role they chose, though not on a favourite. */
  onRole: number
}

/** Seats the squad in a comp: favourites first (most wanted first), then chosen roles, then the rest fill. */
export function seatComp(lineup: Lineup, members: RoomMember[]): CompFit {
  const seats: CompSeat[] = lineup.slots.map(slot => ({ slot }))
  const waiting = new Set(members)

  const place = (match: CompMatch, wants: (member: RoomMember, slot: LineupSlot) => boolean) => {
    for (const member of [...waiting]) {
      const index = seats.findIndex(seat => !seat.member && wants(member, seat.slot))
      if (index < 0) continue
      seats[index] = { ...seats[index]!, member, match }
      waiting.delete(member)
    }
  }
  for (let rank = 0; rank < FAVOURITE_LIMIT; rank++) {
    place('favourite', (member, slot) => slot.name === member.picks[rank])
  }
  place('role', (member, slot) => slot.roleId === member.role)
  place('filling', () => true)

  const count = (match: CompMatch) => seats.filter(seat => seat.match === match).length
  return { lineup, seats, favourites: count('favourite'), onRole: count('role') }
}

/** The comp that suits the squad best, or undefined until someone has a favourite or role it uses. */
export function bestFit(fits: CompFit[]): CompFit | undefined {
  const score = (fit: CompFit) => fit.favourites * 2 + fit.onRole
  const best = fits.reduce<CompFit | undefined>((top, fit) => (!top || score(fit) > score(top) ? fit : top), undefined)
  return best && score(best) > 0 ? best : undefined
}
