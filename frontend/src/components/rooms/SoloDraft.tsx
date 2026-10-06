import { useId, useMemo } from 'react'
import type { DraftHero, DraftKit, GameGuide, GameRole } from '../../data/games/types'
import { roleName } from '../../data/games'
import { useDraftRates } from '../../hooks/useDraftRates'
import type { LiveStats } from '../../hooks/useLiveStats'
import { useMatchups, type MatchupStatus } from '../../hooks/useMatchups'
import { useSoloDraft } from '../../hooks/useSoloDraft'
import { planSolo, type SoloPlan } from '../../lib/lineupPlanner'
import { ALLY_PICK_LIMIT, ENEMY_PICK_LIMIT } from '../../lib/rooms'
import { HeroPortrait } from '../games/HeroPortrait'
import { DraftPicksPanel } from './DraftPicksPanel'
import { DraftThreats } from './DraftThreats'
import { draftSourceLine, draftStage, FIT_LABEL } from './draftCopy'
import { PickReasons } from './PickReasons'
import { PreferencesPanel } from './PreferencesPanel'

type SoloDraftProps = { game: GameGuide; kit: DraftKit; live: LiveStats }

/** The counter-pick helper for one player in solo queue: their own board, kept in this browser. */
export function SoloDraft({ game, kit, live }: SoloDraftProps) {
  const solo = useSoloDraft(game.id)
  const { draft, taken } = solo
  const byName = useMemo(() => new Map(kit.heroes.map(hero => [hero.name, hero])), [kit.heroes])
  const heroes = (names: string[]) =>
    names.map(name => byName.get(name)).filter((hero): hero is DraftHero => hero !== undefined)
  const enemies = heroes(draft.enemyPicks)
  const allies = heroes(draft.allyPicks)

  const { matchups, status } = useMatchups(live.feed, enemies.map(hero => hero.id), live.rank)
  const { tiers, winRates } = useDraftRates(game, live)
  const plan = planSolo({
    roles: game.roles,
    pool: kit.heroes,
    role: draft.role,
    favourites: draft.picks,
    allies,
    enemies,
    matchups,
    winRates,
    tiers,
  })

  return (
    <div className="room-layout">
      <div className="side-stack">
        <PreferencesPanel
          game={game}
          title="Your lane and picks"
          roleLabel="Your lane"
          preferences={draft}
          onChange={solo.setPreferences}
          note="Kept in this browser only: no sign-in needed, and nothing is shared."
        />
        <DraftPicksPanel
          title="Your team’s picks"
          side="ally"
          heroes={kit.heroes}
          picks={allies}
          limit={ALLY_PICK_LIMIT}
          taken={taken}
          searchLabel="Add a teammate’s pick"
          fullText="All four teammates have picked"
          edits={{ onPick: solo.pickAlly, onRemove: solo.unpickAlly, onClear: solo.clearAllies }}
        />
      </div>
      <div className="side-stack">
        <DraftPicksPanel
          title="Enemy picks"
          side="enemy"
          heroes={kit.heroes}
          picks={enemies}
          limit={ENEMY_PICK_LIMIT}
          taken={taken}
          searchLabel="Add an enemy pick"
          fullText="All five picks are in"
          edits={{ onPick: solo.pickEnemy, onRemove: solo.unpickEnemy, onClear: solo.clearEnemies }}
        />
        <SoloPicks game={game} kit={kit} plan={plan} enemies={enemies} matchupStatus={status} live={live} />
      </div>
    </div>
  )
}

type SoloPicksProps = {
  game: GameGuide
  kit: DraftKit
  plan: SoloPlan
  enemies: DraftHero[]
  matchupStatus: MatchupStatus
  live: LiveStats
}

/** The solo player's best picks, ranked, with why and what to build. */
function SoloPicks({ game, kit, plan, enemies, matchupStatus, live }: SoloPicksProps) {
  const titleId = useId()
  const hasEnemies = enemies.length > 0

  return (
    <section className="panel solo-picks" aria-labelledby={titleId}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">{draftStage(enemies)}</p>
          <h2 className="panel-title" id={titleId}>
            Your best picks
          </h2>
        </div>
      </div>
      <p className="card-note">{introFor(plan.role, hasEnemies)}</p>

      <ol className="lane-plan" aria-busy={matchupStatus === 'loading'}>
        {plan.picks.map((pick, index) => (
          <li key={pick.hero.id} className={`lane-row is-ranked fit-${pick.fit}`}>
            <span className="pick-rank" aria-hidden="true">
              {index + 1}
            </span>
            <HeroPortrait name={pick.hero.name} src={pick.hero.portrait} />
            <div className="lane-body">
              <p className="pick-head">
                <b className="lane-hero">{pick.hero.name}</b>
                <span className="pick-lanes">{pick.hero.lanes.map(id => roleName(game, id)).join(' · ')}</span>
              </p>
              <PickReasons reasons={pick.reasons} />
            </div>
            {hasEnemies && <span className="fit-badge">{FIT_LABEL[pick.fit]}</span>}
          </li>
        ))}
      </ol>
      {plan.benched && (
        <p className="lane-aside">
          <b>{plan.benched.hero}</b> sits out. {plan.benched.why}
        </p>
      )}

      <DraftThreats kit={kit} enemies={enemies} />
      <p className="fine-print">{draftSourceLine(game, hasEnemies, matchupStatus, live)}</p>
    </section>
  )
}

function introFor(role: GameRole | undefined, hasEnemies: boolean): string {
  const lane = role ? `For ${role.name}.` : 'You’re filling, so these are the best picks for any lane.'
  if (!hasEnemies) return `${lane} Add the enemy’s picks as they lock in to counter them.`
  return `${lane} Re-ranked after every pick. Your favourites stay on top unless an enemy pick counters them.`
}
