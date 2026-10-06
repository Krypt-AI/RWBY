import type { DraftHero, DraftKit, GameGuide, MatchupStat } from '../../data/games/types'
import { useDraftRates } from '../../hooks/useDraftRates'
import type { LiveStats } from '../../hooks/useLiveStats'
import type { MatchupStatus } from '../../hooks/useMatchups'
import { planLineup, type LaneClash, type LanePlan } from '../../lib/lineupPlanner'
import type { RoomMember } from '../../lib/types'
import { Icon } from '../Icon'
import { HeroPortrait } from '../games/HeroPortrait'
import { DraftThreats } from './DraftThreats'
import { draftSourceLine, draftStage, FIT_LABEL } from './draftCopy'
import { PickReasons } from './PickReasons'

type RecommendedLineupProps = {
  game: GameGuide
  kit: DraftKit
  members: RoomMember[]
  enemies: DraftHero[]
  matchups: Map<number, MatchupStat[]>
  matchupStatus: MatchupStatus
  live: LiveStats
}

/**
 * One hero per lane for the squad: the meta pick in open lanes, each player's favourites in theirs,
 * re-ranked against the enemy draft as it locks in.
 */
export function RecommendedLineup(props: RecommendedLineupProps) {
  const { game, kit, members, enemies, matchups, matchupStatus, live } = props
  const { tiers, winRates } = useDraftRates(game, live)
  const plan = planLineup({ roles: game.roles, pool: kit.heroes, members, enemies, matchups, winRates, tiers })
  const hasEnemies = enemies.length > 0

  return (
    <section className="panel recommended-lineup" aria-labelledby="lineup-title">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{draftStage(enemies)}</p>
          <h2 className="panel-title" id="lineup-title">
            Recommended lineup
          </h2>
        </div>
      </div>
      <p className="card-note">{introFor(members, hasEnemies)}</p>

      {plan.clashes.length > 0 && (
        <ul className="lineup-notes">
          {plan.clashes.map(clash => (
            <li key={clash.mover.id}>
              <Icon name="alert" size={14} />
              {clashText(clash)}
            </li>
          ))}
        </ul>
      )}

      <ol className="lane-plan" aria-busy={matchupStatus === 'loading'}>
        {plan.lanes.map(lane => (
          <LaneRow key={lane.role.id} lane={lane} showFit={hasEnemies} />
        ))}
      </ol>

      <DraftThreats kit={kit} enemies={enemies} />
      <p className="fine-print">{draftSourceLine(game, hasEnemies, matchupStatus, live)}</p>
    </section>
  )
}

function LaneRow({ lane, showFit }: { lane: LanePlan; showFit: boolean }) {
  const { role, player, pick, alternatives, benched } = lane

  return (
    <li className={`lane-row ${pick ? `fit-${pick.fit}` : ''}`}>
      <p className="lane-seat">
        <span className="slot-role">{role.name}</span>
        <span className={`lane-player ${player ? '' : 'is-open'}`}>
          {player ? player.member.name : 'Open'}
          {player?.seat === 'filling' && <small> · filling</small>}
        </span>
      </p>

      {pick ? (
        <>
          <HeroPortrait name={pick.hero.name} src={pick.hero.portrait} />
          <div className="lane-body">
            <b className="lane-hero">{pick.hero.name}</b>
            <PickReasons reasons={pick.reasons} />
            {benched && (
              <p className="lane-aside">
                <b>{benched.hero}</b> sits out. {benched.why}
              </p>
            )}
            {alternatives.length > 0 && (
              <p className="lane-aside">Or {alternatives.map(option => option.hero.name).join(' · ')}</p>
            )}
          </div>
          {showFit && <span className="fit-badge">{FIT_LABEL[pick.fit]}</span>}
        </>
      ) : (
        <p className="lane-body muted">Every {role.name} hero is already taken.</p>
      )}
    </li>
  )
}

function introFor(members: RoomMember[], hasEnemies: boolean): string {
  if (hasEnemies) return 'Re-ranked after every enemy pick. Favourites stay in unless an enemy pick counters them.'
  if (members.some(member => member.role || member.picks.length > 0)) {
    return (
      'Built around your roles and favourites, with the strongest meta pick in every other lane. ' +
      'Add enemy picks as they lock in to counter their draft.'
    )
  }
  return (
    'The strongest meta pick in each lane. Once you’re in the room, choose your role and favourites ' +
    'and the lineup is built around them.'
  )
}

function clashText({ role, holder, mover, movedTo }: LaneClash): string {
  const move = movedTo ? ` ${mover.name} fills ${movedTo.name} for now.` : ''
  return `${holder.name} and ${mover.name} both chose ${role.name}.${move}`
}
