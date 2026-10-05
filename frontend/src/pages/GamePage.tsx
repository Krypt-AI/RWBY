import { Navigate, NavLink, useParams } from 'react-router-dom'
import type { GameGuide, GameSection } from '../data/games/types'
import { GAME_BY_ID, GAME_SECTIONS, isGameId, isGameSection } from '../data/games'
import { useActiveTabInView } from '../hooks/useActiveTabInView'
import { formatDate } from '../utils/format'
import { PageHeader } from '../components/PageHeader'
import { BuildsSection } from '../components/games/BuildsSection'
import { GameSources } from '../components/games/GameSources'
import { LineupGrid } from '../components/games/LineupGrid'
import { MetaNotes } from '../components/games/MetaNotes'
import { RoleGrid } from '../components/games/RoleGrid'
import { TierList } from '../components/games/TierList'

const DEFAULT_SECTION: GameSection = 'meta'

const sectionPath = (game: GameGuide, section: GameSection) =>
  section === DEFAULT_SECTION ? `/games/${game.id}` : `/games/${game.id}/${section}`

export function GamePage() {
  const { gameId, section } = useParams()
  const tabsRef = useActiveTabInView<HTMLElement>(`${gameId}/${section ?? ''}`)

  if (!isGameId(gameId)) return <Navigate to="/games" replace />
  if (section !== undefined && !isGameSection(section)) return <Navigate to={`/games/${gameId}`} replace />

  const game = GAME_BY_ID[gameId]
  const active = section ?? DEFAULT_SECTION

  return (
    <div className={`page accent-${game.accent}`}>
      <PageHeader
        eyebrow={`Game guide · ${game.genre}`}
        title={game.name}
        lead={game.tagline}
        actions={
          <span className="snapshot-tag">
            Patch {game.patch} · {formatDate(game.asOf)}
          </span>
        }
      />

      <dl className="game-stats">
        {game.stats.map(stat => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
            <dd className="game-stat-note">{stat.note}</dd>
          </div>
        ))}
      </dl>

      <nav ref={tabsRef} className="category-tabs" aria-label={`${game.shortName} guide sections`}>
        {GAME_SECTIONS.map(item => (
          <NavLink key={item.id} to={sectionPath(game, item.id)} end className="category-tab">
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <GameSectionView game={game} section={active} />
      <GameSources game={game} />
    </div>
  )
}

function GameSectionView({ game, section }: { game: GameGuide; section: GameSection }) {
  switch (section) {
    case 'meta':
      return (
        <div className="meta-layout">
          <TierList game={game} />
          <MetaNotes game={game} />
        </div>
      )
    case 'lineups':
      return <LineupGrid game={game} />
    case 'builds':
      return <BuildsSection game={game} />
    case 'roles':
      return <RoleGrid game={game} />
  }
}
