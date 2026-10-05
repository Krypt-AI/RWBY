import { useMemo } from 'react'
import type { DraftHero, DraftKit, GameGuide } from '../../data/games/types'
import type { GameRoomControls } from '../../hooks/useGameRoom'
import type { LiveStats } from '../../hooks/useLiveStats'
import { useMatchups } from '../../hooks/useMatchups'
import { CounterSuggestions } from './CounterSuggestions'
import { EnemyDraft } from './EnemyDraft'

type CounterPickerProps = {
  game: GameGuide
  kit: DraftKit
  live: LiveStats
  controls: GameRoomControls
}

/** Enemy draft in, counter picks out. */
export function CounterPicker({ game, kit, live, controls }: CounterPickerProps) {
  const byName = useMemo(() => new Map(kit.heroes.map(hero => [hero.name, hero])), [kit.heroes])
  const enemies = controls.room.enemyPicks
    .map(name => byName.get(name))
    .filter((hero): hero is DraftHero => hero !== undefined)
  const { matchups, status } = useMatchups(live.feed, enemies.map(hero => hero.id), live.rank)

  return (
    <div className="side-stack">
      <EnemyDraft kit={kit} enemies={enemies} controls={controls} />
      <CounterSuggestions
        game={game}
        kit={kit}
        enemies={enemies}
        matchups={matchups}
        matchupStatus={status}
        live={live}
      />
    </div>
  )
}
