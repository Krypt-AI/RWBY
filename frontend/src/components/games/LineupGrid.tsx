import { Link } from 'react-router-dom'
import type { GameGuide } from '../../data/games/types'
import { roleName } from '../../data/games'
import { Icon } from '../Icon'
import { SectionIntro } from './SectionIntro'

export function LineupGrid({ game }: { game: GameGuide }) {
  return (
    <section aria-labelledby="lineups-title" className="guide-section">
      <SectionIntro id="lineups-title" title="Lineups" intro={game.lineupsIntro} />

      <ul className="card-grid">
        {game.lineups.map(lineup => (
          <li key={lineup.name} className="panel lineup-card">
            <div className="lineup-head">
              <p className="eyebrow">{lineup.context}</p>
              <h3 className="panel-title">{lineup.name}</h3>
              {lineup.record && <span className="record">{lineup.record}</span>}
            </div>
            <ol className="lineup-slots">
              {lineup.slots.map(slot => (
                <li key={slot.name}>
                  <span className="slot-role">{roleName(game, slot.roleId)}</span>
                  <b>{slot.name}</b>
                </li>
              ))}
            </ol>
            <p className="card-note">{lineup.plan}</p>
          </li>
        ))}
      </ul>

      <Link to={`/games/${game.id}/room`} className="link-arrow">
        Fit a lineup to your squad in the game room <Icon name="arrow" size={14} />
      </Link>
    </section>
  )
}
