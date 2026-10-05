import { Navigate, NavLink, useParams } from 'react-router-dom'
import type { GameGuide, GameSection } from '../data/games/types'
import { GAME_BY_ID, GAME_SECTIONS, isGameId, isGameSection } from '../data/games'
import { useActiveTabInView } from '../hooks/useActiveTabInView'
import { useLiveStats, type LiveStats } from '../hooks/useLiveStats'
import { formatDate } from '../utils/format'
import { PageHeader } from '../components/PageHeader'
import { BuildsSection } from '../components/games/BuildsSection'
import { GameSources } from '../components/games/GameSources'
import { GameStats } from '../components/games/GameStats'
import { LineupGrid } from '../components/games/LineupGrid'
import { LiveLeaderboard } from '../components/games/LiveLeaderboard'
import { LiveStatsBar } from '../components/games/LiveStatsBar'
import { MetaNotes } from '../components/games/MetaNotes'
import { RoleGrid } from '../components/games/RoleGrid'
import { TierList } from '../components/games/TierList'
import { GameRoomSection } from '../components/rooms/GameRoomSection'

const DEFAULT_SECTION: GameSection = 'meta'

const sectionPath = (game: GameGuide, section: GameSection) =>
  section === DEFAULT_SECTION ? `/games/${game.id}` : `/games/${game.id}/${section}`

export function GamePage() {
  const { gameId, section } = useParams()

  if (!isGameId(gameId)) return <Navigate to="/games" replace />
  if (section !== undefined && !isGameSection(section)) return <Navigate to={`/games/${gameId}`} replace />

  // Keyed by game so switching guides starts from a clean live feed and tab position.
  return <GameGuideView key={gameId} game={GAME_BY_ID[gameId]} section={section ?? DEFAULT_SECTION} />
}

function GameGuideView({ game, section }: { game: GameGuide; section: GameSection }) {
  const tabsRef = useActiveTabInView<HTMLElement>(section)
  const live = useLiveStats(game.id)

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

      <GameStats game={game} live={live} />
      <LiveStatsBar game={game} live={live} />

      <nav ref={tabsRef} className="category-tabs" aria-label={`${game.shortName} guide sections`}>
        {GAME_SECTIONS.map(item => (
          <NavLink key={item.id} to={sectionPath(game, item.id)} end className="category-tab">
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <GameSectionView game={game} section={section} live={live} />
      <GameSources game={game} />
    </div>
  )
}

function GameSectionView({ game, section, live }: { game: GameGuide; section: GameSection; live: LiveStats }) {
  switch (section) {
    case 'meta':
      return (
        <div className="meta-layout">
          <TierList game={game} rates={live.rates} />
          <div className="side-stack">
            <LiveLeaderboard game={game} live={live} />
            <MetaNotes game={game} />
          </div>
        </div>
      )
    case 'lineups':
      return <LineupGrid game={game} />
    case 'builds':
      return <BuildsSection game={game} />
    case 'roles':
      return <RoleGrid game={game} />
    case 'room':
      return <GameRoomSection game={game} live={live} />
  }
}
