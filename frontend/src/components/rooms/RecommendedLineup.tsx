import { useMemo } from 'react'
import type { DraftHero, DraftKit, GameGuide, MatchupStat, Threat } from '../../data/games/types'
import { snapshotWinRates } from '../../data/games'
import type { LiveStats } from '../../hooks/useLiveStats'
import type { MatchupStatus } from '../../hooks/useMatchups'
import { readThreats, type Fit } from '../../lib/counterPicks'
import { planLineup, type LaneClash, type LanePlan } from '../../lib/lineupPlanner'
import type { RoomMember } from '../../lib/types'
import { formatList } from '../../utils/format'
import { Icon } from '../Icon'
import { HeroPortrait } from '../games/HeroPortrait'

/** Reasons shown per lane; the strongest come first. */
const MAX_REASONS = 4

const FIT_LABEL: Record<Fit, string> = {
  strong: 'Strong counter',
  good: 'Good counter',
  even: 'Even',
  countered: 'Countered',
}

const THREAT_COPY: Record<Threat, { title: string; detail: (heroes: string) => string }> = {
  healing: { title: 'Healing', detail: heroes => `${heroes} heal through fights.` },
  dive: { title: 'Dive', detail: heroes => `${heroes} will hunt your backline.` },
  magic: { title: 'Magic damage', detail: heroes => `${heroes} deal magic damage.` },
  physical: { title: 'Physical damage', detail: heroes => `${heroes} deal physical damage.` },
  control: { title: 'Crowd control', detail: heroes => `${heroes} chain crowd control.` },
}

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
  const tiers = useMemo(() => new Map(game.tiers.map(entry => [entry.name, entry.tier])), [game.tiers])
  const snapshot = useMemo(() => snapshotWinRates(game), [game])
  const winRates = useMemo(
    () => (live.rates ? new Map([...live.rates].map(([name, rates]) => [name, rates.winRate])) : snapshot),
    [live.rates, snapshot],
  )

  const plan = planLineup({ roles: game.roles, pool: kit.heroes, members, enemies, matchups, winRates, tiers })
  const threats = readThreats(enemies, kit)
  const hasEnemies = enemies.length > 0
  const draftStage = hasEnemies
    ? `Against ${enemies.length} enemy ${enemies.length === 1 ? 'pick' : 'picks'}`
    : 'Before the draft'

  return (
    <section className="panel recommended-lineup" aria-labelledby="lineup-title">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{draftStage}</p>
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

      {threats.length > 0 && (
        <div className="threats">
          <h3 className="threats-title">Build against their draft</h3>
          <ul className="threat-list">
            {threats.map(({ threat, heroes }) => (
              <li key={threat}>
                <p>
                  <b>{THREAT_COPY[threat].title}.</b> {THREAT_COPY[threat].detail(formatList(heroes))}
                </p>
                <p className="threat-answers">
                  {kit.answers[threat].map(item => (
                    <span key={item} className="tag">
                      {item}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="fine-print">{sourceLine(game, hasEnemies, matchupStatus, live)}</p>
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
            {pick.reasons.length > 0 && (
              <ul className="pick-reasons">
                {pick.reasons.slice(0, MAX_REASONS).map(reason => (
                  <li key={reason.text} className={`is-${reason.tone}`}>
                    <Icon name={reason.tone === 'good' ? 'check' : 'trendDown'} size={13} />
                    {reason.text}
                  </li>
                ))}
              </ul>
            )}
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

function sourceLine(game: GameGuide, hasEnemies: boolean, status: MatchupStatus, live: LiveStats): string {
  const form = live.rates ? `this week’s win rates (${live.rankLabel})` : `the patch ${game.patch} snapshot`
  const meta = `Meta picks use ${form} and the tier list.`
  return hasEnemies ? `${meta} ${counterSource(status, live)}` : meta
}

function counterSource(status: MatchupStatus, live: LiveStats): string {
  if (!live.feed?.matchups) return 'Counters use Moonton’s official counter list.'
  switch (status) {
    case 'idle':
    case 'loading':
      return 'Loading this week’s matchup stats…'
    case 'live':
      return `Counters use this week’s matchup stats (${live.rankLabel}) and Moonton’s official counter list.`
    case 'partial':
      return 'Some matchup stats didn’t load, so a few counters lean on Moonton’s official counter list.'
    case 'error':
      return 'Matchup stats are unreachable right now, so counters come from Moonton’s official counter list.'
  }
}
