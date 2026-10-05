import type { DraftHero, DraftKit } from '../../data/games/types'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { ENEMY_PICK_LIMIT } from '../../lib/rooms'
import { Icon } from '../Icon'
import { HeroPortrait } from '../games/HeroPortrait'
import { HeroSearch } from './HeroSearch'

type EnemyDraftProps = {
  kit: DraftKit
  enemies: DraftHero[]
  controls: GameRoomControls
}

/** The enemy's five picks, shared by everyone in the room. */
export function EnemyDraft({ kit, enemies, controls }: EnemyDraftProps) {
  const { canEdit, pickEnemy, unpickEnemy, clearPicks } = controls
  const slots = Array.from({ length: ENEMY_PICK_LIMIT }, (_, index) => enemies[index])

  return (
    <section className="panel enemy-draft" aria-labelledby="enemy-draft-title">
      <div className="panel-head">
        <h2 className="panel-title" id="enemy-draft-title">
          Enemy picks
        </h2>
        {canEdit && enemies.length > 0 && (
          <button type="button" className="btn btn-ghost btn-small" onClick={clearPicks}>
            Clear picks
          </button>
        )}
      </div>

      <ol className="enemy-slots">
        {slots.map((hero, index) =>
          hero ? (
            <li key={hero.id} className="enemy-slot is-picked">
              <HeroPortrait name={hero.name} src={hero.portrait} />
              <span className="enemy-slot-name">{hero.name}</span>
              {canEdit && (
                <button
                  type="button"
                  className="enemy-slot-remove"
                  onClick={() => unpickEnemy(hero.name)}
                  aria-label={`Remove ${hero.name}`}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </li>
          ) : (
            <li key={`open-${index}`} className="enemy-slot">
              <span className="enemy-slot-name">Pick {index + 1}</span>
            </li>
          ),
        )}
      </ol>

      {canEdit ? (
        <HeroSearch
          heroes={kit.heroes}
          takenIds={new Set(enemies.map(hero => hero.id))}
          isFull={enemies.length >= ENEMY_PICK_LIMIT}
          onPick={pickEnemy}
        />
      ) : (
        <p className="room-note">Join the room to enter enemy picks. Everyone in the room sees the same draft.</p>
      )}
    </section>
  )
}
