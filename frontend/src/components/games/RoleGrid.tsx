import type { GameGuide } from '../../data/games/types'
import { SectionIntro } from './SectionIntro'

export function RoleGrid({ game }: { game: GameGuide }) {
  return (
    <section aria-labelledby="roles-title" className="guide-section">
      <SectionIntro id="roles-title" title="Roles" />
      <ul className="card-grid">
        {game.roles.map(role => (
          <li key={role.id} className="panel role-card">
            <h3 className="panel-title">{role.name}</h3>
            <p className="card-note">{role.summary}</p>
            <ul className="role-duties">
              {role.duties.map(duty => (
                <li key={duty}>{duty}</li>
              ))}
            </ul>
            <div className="role-picks">
              <small>Best right now</small>
              <span>
                {role.picks.map(pick => (
                  <span key={pick} className="tag">
                    {pick}
                  </span>
                ))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
