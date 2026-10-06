import { useMemo } from 'react'
import type { DraftHero, DraftKit, GameGuide } from '../../data/games/types'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import type { LiveStats } from '../../hooks/useLiveStats'
import { useMatchups } from '../../hooks/useMatchups'
import { EnemyDraft } from './EnemyDraft'
import { RecommendedLineup } from './RecommendedLineup'

type DraftPlannerProps = {
  game: GameGuide
  kit: DraftKit
  live: LiveStats
  controls: GameRoomControls
}

/** The enemy draft and the squad's roles and favourites in, a five-hero lineup out. */
export function DraftPlanner({ game, kit, live, controls }: DraftPlannerProps) {
  const byName = useMemo(() => new Map(kit.heroes.map(hero => [hero.name, hero])), [kit.heroes])
  const enemies = controls.room.enemyPicks
    .map(name => byName.get(name))
    .filter((hero): hero is DraftHero => hero !== undefined)
  const { matchups, status } = useMatchups(live.feed, enemies.map(hero => hero.id), live.rank)

  return (
    <div className="side-stack">
      <EnemyDraft kit={kit} enemies={enemies} controls={controls} />
      <RecommendedLineup
        game={game}
        kit={kit}
        members={controls.room.members}
        enemies={enemies}
        matchups={matchups}
        matchupStatus={status}
        live={live}
      />
    </div>
  )
}
