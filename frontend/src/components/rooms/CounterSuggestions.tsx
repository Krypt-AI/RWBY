import { useMemo, useState } from 'react'
import type { DraftHero, DraftKit, GameGuide, MatchupStat, Threat } from '../../data/games/types'
import { roleName } from '../../data/games'
import type { LiveStats } from '../../hooks/useLiveStats'
import type { MatchupStatus } from '../../hooks/useMatchups'
import { readThreats, suggestCounters, type Fit } from '../../lib/counterPicks'
import { formatList } from '../../utils/format'
import { ChipGroup } from '../ChipGroup'
import { Icon } from '../Icon'
import { EmptyState } from '../Panel'
import { HeroPortrait } from '../games/HeroPortrait'

const ANY_LANE = 'any'

/** Reasons shown per suggestion; the strongest come first. */
const MAX_REASONS = 4

const FIT_LABEL: Record<Fit, string> = { strong: 'Strong counter', good: 'Good counter', situational: 'Situational' }

const THREAT_COPY: Record<Threat, { title: string; detail: (heroes: string) => string }> = {
  healing: { title: 'Healing', detail: heroes => `${heroes} heal through fights.` },
  dive: { title: 'Dive', detail: heroes => `${heroes} will hunt your backline.` },
  magic: { title: 'Magic damage', detail: heroes => `${heroes} deal magic damage.` },
  physical: { title: 'Physical damage', detail: heroes => `${heroes} deal physical damage.` },
  control: { title: 'Crowd control', detail: heroes => `${heroes} chain crowd control.` },
}

type CounterSuggestionsProps = {
  game: GameGuide
  kit: DraftKit
  enemies: DraftHero[]
  matchups: Map<number, MatchupStat[]>
  matchupStatus: MatchupStatus
  live: LiveStats
}

/** Counter picks for the enemy draft, ranked by live matchup stats and the official counter list. */
export function CounterSuggestions({ game, kit, enemies, matchups, matchupStatus, live }: CounterSuggestionsProps) {
  const [lane, setLane] = useState(ANY_LANE)
  const tiers = useMemo(() => new Map(game.tiers.map(entry => [entry.name, entry.tier])), [game.tiers])

  const suggestions = suggestCounters({
    pool: kit.heroes,
    enemies,
    matchups,
    rates: live.rates,
    tiers,
    lane: lane === ANY_LANE ? undefined : lane,
  })
  const threats = readThreats(enemies, kit)
  const laneOptions = [
    { value: ANY_LANE, label: 'Any lane' },
    ...game.roles.map(role => ({ value: role.id, label: role.name })),
  ]

  return (
    <section className="panel counter-suggestions" aria-labelledby="counters-title">
      <div className="panel-head">
        <h2 className="panel-title" id="counters-title">
          Suggested counters
        </h2>
      </div>

      <ChipGroup label="Your lane" options={laneOptions} isSelected={value => value === lane} onSelect={setLane} />

      {enemies.length === 0 ? (
        <EmptyState>
          Add the enemy’s picks as they lock in. Counters re-rank after every pick, using this week’s matchup stats and
          Moonton’s official counter list.
        </EmptyState>
      ) : suggestions.length === 0 ? (
        <EmptyState>
          No clear counter {lane === ANY_LANE ? 'for this draft' : `in ${roleName(game, lane)}`} yet. Try another lane.
        </EmptyState>
      ) : (
        <ol className="counter-list" aria-busy={matchupStatus === 'loading'}>
          {suggestions.map(({ hero, fit, reasons }, index) => (
            <li key={hero.id} className={`counter-row fit-${fit}`}>
              <span className="counter-rank" aria-hidden="true">
                {index + 1}
              </span>
              <HeroPortrait name={hero.name} src={hero.portrait} />
              <div className="counter-body">
                <p className="counter-head">
                  <b>{hero.name}</b>
                  <span className="counter-lanes">{hero.lanes.map(id => roleName(game, id)).join(' · ')}</span>
                </p>
                <ul className="counter-reasons">
                  {reasons.slice(0, MAX_REASONS).map(reason => (
                    <li key={reason.text} className={`is-${reason.tone}`}>
                      <Icon name={reason.tone === 'good' ? 'check' : 'trendDown'} size={13} />
                      {reason.text}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="counter-fit">{FIT_LABEL[fit]}</span>
            </li>
          ))}
        </ol>
      )}

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

      {enemies.length > 0 && <p className="fine-print">{sourceLine(matchupStatus, live)}</p>}
    </section>
  )
}

function sourceLine(status: MatchupStatus, live: LiveStats): string {
  if (!live.feed?.matchups) return 'Ranked by Moonton’s official counter list.'
  switch (status) {
    case 'idle':
    case 'loading':
      return 'Loading this week’s matchup stats…'
    case 'live':
      return `Ranked by this week’s matchup stats (${live.rankLabel}) and Moonton’s official counter list.`
    case 'partial':
      return 'Some matchup stats didn’t load, so a few picks lean on Moonton’s official counter list.'
    case 'error':
      return 'Matchup stats are unreachable right now, so these come from Moonton’s official counter list.'
  }
}
