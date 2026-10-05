import type { GameGuide } from '../../data/games/types'
import { Panel } from '../Panel'
import { SectionIntro } from './SectionIntro'

/** Hero builds or buy rounds, followed by the item / weapon reference. */
export function BuildsSection({ game }: { game: GameGuide }) {
  return (
    <>
      <section aria-labelledby="loadouts-title" className="guide-section">
        <SectionIntro id="loadouts-title" title={game.loadoutsTitle} />
        <ul className="card-grid">
          {game.loadouts.map(loadout => (
            <li key={loadout.title} className="panel loadout-card">
              <div>
                <p className="eyebrow">{loadout.subtitle}</p>
                <h3 className="panel-title">{loadout.title}</h3>
              </div>
              <ol className="item-steps">
                {loadout.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              <dl className="loadout-extras">
                {loadout.extras.map(extra => (
                  <div key={extra.label}>
                    <dt>{extra.label}</dt>
                    <dd>{extra.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="card-note">{loadout.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="equipment-title" className="guide-section">
        <SectionIntro id="equipment-title" title={game.equipmentTitle} />
        <div className="equipment-grid">
          {game.equipment.map(group => (
            <Panel key={group.title} title={group.title}>
              <ul className="equipment-list">
                {group.items.map(item => (
                  <li key={item.name}>
                    <span className="equipment-name">
                      <b>{item.name}</b>
                      {item.cost && <span className="cost">{item.cost}</span>}
                    </span>
                    <small>{item.detail}</small>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </section>
    </>
  )
}
