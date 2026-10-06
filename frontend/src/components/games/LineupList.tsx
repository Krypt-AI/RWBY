import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GameGuide } from '../../data/games/types'
import { characterPool, lineupGroup, roleName } from '../../data/games'
import { ChipGroup } from '../ChipGroup'
import { Icon } from '../Icon'
import { HeroPortrait } from './HeroPortrait'
import { SectionIntro } from './SectionIntro'

const ALL = 'all'

/** Every meta lineup on the current patch, five players each, filterable by map or source. */
export function LineupList({ game }: { game: GameGuide }) {
  const [group, setGroup] = useState(ALL)
  const portraits = useMemo(() => new Map(characterPool(game).map(entry => [entry.name, entry.portrait])), [game])

  const counts = new Map<string, number>()
  for (const lineup of game.lineups) counts.set(lineupGroup(lineup), (counts.get(lineupGroup(lineup)) ?? 0) + 1)
  const options = [
    { value: ALL, label: `All (${game.lineups.length})` },
    ...[...counts].map(([name, count]) => ({ value: name, label: `${name} (${count})` })),
  ]
  const shown = group === ALL ? game.lineups : game.lineups.filter(lineup => lineupGroup(lineup) === group)

  return (
    <section aria-labelledby="lineups-title" className="guide-section">
      <SectionIntro id="lineups-title" title="Lineups" intro={game.lineupsIntro} />
      <ChipGroup label="Show lineups" options={options} isSelected={value => value === group} onSelect={setGroup} />

      <ol className="lineup-list">
        {shown.map(lineup => (
          <li key={lineup.id} className="panel lineup-row">
            <div className="lineup-row-head">
              <div>
                <p className="eyebrow">{lineup.map ? `${lineup.map} · ${lineup.context}` : lineup.context}</p>
                <h3 className="panel-title">{lineup.name}</h3>
              </div>
              <span className="record">{lineup.record}</span>
            </div>
            <ol className="lineup-heroes" aria-label={`${lineup.name}: five ${game.characterTerm.many}`}>
              {lineup.slots.map(slot => (
                <li key={slot.name}>
                  <HeroPortrait name={slot.name} src={portraits.get(slot.name)} />
                  <b>{slot.name}</b>
                  <span className="slot-role">{roleName(game, slot.roleId)}</span>
                </li>
              ))}
            </ol>
            <p className="card-note">{lineup.plan}</p>
            {lineup.example && <p className="fine-print">{lineup.example}</p>}
          </li>
        ))}
      </ol>

      <Link to={`/games/${game.id}/room`} className="link-arrow">
        Fit a lineup to your squad in the game room <Icon name="arrow" size={14} />
      </Link>
    </section>
  )
}
