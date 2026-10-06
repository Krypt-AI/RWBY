import { useMemo } from 'react'
import type { DraftHero, DraftKit, GameGuide } from '../../data/games/types'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import type { LiveStats } from '../../hooks/useLiveStats'
import { useMatchups } from '../../hooks/useMatchups'
import { ENEMY_PICK_LIMIT } from '../../lib/rooms'
import { DraftPicksPanel } from './DraftPicksPanel'
import { RecommendedLineup } from './RecommendedLineup'

type DraftPlannerProps = {
  game: GameGuide
  kit: DraftKit
  live: LiveStats
  controls: GameRoomControls
}

/** The room's shared enemy draft and the squad's roles and favourites in, a five-hero lineup out. */
export function DraftPlanner({ game, kit, live, controls }: DraftPlannerProps) {
  const { room, canEdit, pickEnemy, unpickEnemy, clearPicks } = controls
  const byName = useMemo(() => new Map(kit.heroes.map(hero => [hero.name, hero])), [kit.heroes])
  const enemies = room.enemyPicks
    .map(name => byName.get(name))
    .filter((hero): hero is DraftHero => hero !== undefined)
  const { matchups, status } = useMatchups(live.feed, enemies.map(hero => hero.id), live.rank)

  return (
    <div className="side-stack">
      <DraftPicksPanel
        title="Enemy picks"
        side="enemy"
        heroes={kit.heroes}
        picks={enemies}
        limit={ENEMY_PICK_LIMIT}
        taken={new Set(room.enemyPicks)}
        searchLabel="Add an enemy pick"
        fullText="All five picks are in"
        edits={canEdit ? { onPick: pickEnemy, onRemove: unpickEnemy, onClear: clearPicks } : undefined}
        readOnlyNote="Join the room to enter enemy picks. Everyone in the room sees the same draft."
      />
      <RecommendedLineup
        game={game}
        kit={kit}
        members={room.members}
        enemies={enemies}
        matchups={matchups}
        matchupStatus={status}
        live={live}
      />
    </div>
  )
}
