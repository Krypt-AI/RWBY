import type { DraftHero, DraftKit, Threat } from '../../data/games/types'
import { readThreats } from '../../lib/counterPicks'
import { formatList } from '../../utils/format'

const THREAT_COPY: Record<Threat, { title: string; detail: (heroes: string) => string }> = {
  healing: { title: 'Healing', detail: heroes => `${heroes} heal through fights.` },
  dive: { title: 'Dive', detail: heroes => `${heroes} will hunt your backline.` },
  magic: { title: 'Magic damage', detail: heroes => `${heroes} deal magic damage.` },
  physical: { title: 'Physical damage', detail: heroes => `${heroes} deal physical damage.` },
  control: { title: 'Crowd control', detail: heroes => `${heroes} chain crowd control.` },
}

/** What in the enemy draft the build should answer, with the items that do. Nothing until a threat shows. */
export function DraftThreats({ kit, enemies }: { kit: DraftKit; enemies: DraftHero[] }) {
  const threats = readThreats(enemies, kit)
  if (threats.length === 0) return null

  return (
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
  )
}
