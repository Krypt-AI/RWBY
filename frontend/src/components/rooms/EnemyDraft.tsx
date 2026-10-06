import type { DraftHero, DraftKit } from '../../data/games/types'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import { ENEMY_PICK_LIMIT } from '../../lib/rooms'
import { HeroSearch } from './HeroSearch'
import { PickSlots } from './PickSlots'

type EnemyDraftProps = {
  kit: DraftKit
  enemies: DraftHero[]
  controls: GameRoomControls
}

/** The enemy's five picks, shared by everyone in the room. */
export function EnemyDraft({ kit, enemies, controls }: EnemyDraftProps) {
  const { canEdit, pickEnemy, unpickEnemy, clearPicks } = controls

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

      <PickSlots
        label="Enemy picks"
        side="enemy"
        count={ENEMY_PICK_LIMIT}
        picks={enemies}
        placeholder={index => `Pick ${index + 1}`}
        onRemove={canEdit ? unpickEnemy : undefined}
      />

      {canEdit ? (
        <HeroSearch
          label="Add an enemy pick"
          noun="heroes"
          options={kit.heroes}
          taken={new Set(enemies.map(hero => hero.name))}
          fullText={enemies.length >= ENEMY_PICK_LIMIT ? 'All five picks are in' : undefined}
          onPick={pickEnemy}
        />
      ) : (
        <p className="room-note">Join the room to enter enemy picks. Everyone in the room sees the same draft.</p>
      )}
    </section>
  )
}
