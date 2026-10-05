import { Link } from 'react-router-dom'
import { GAMES } from '../data/games'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { ScheduleList } from '../components/ScheduleList'
import { VoteSummaryCard } from '../components/VoteSummaryCard'
import { GameCard } from '../components/games/GameCard'

export function GamesPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Game guides"
        title="Know the meta"
        lead="Tier lists, lineups, builds and roles for the games we actually queue. Each guide is a dated snapshot of the current patch."
        actions={
          <Link to="/squad" className="btn btn-primary">
            <Icon name="users" size={16} /> Find a squad
          </Link>
        }
      />

      <div className="game-cards">
        {GAMES.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      <div className="split-layout">
        <Panel eyebrow="Schedule" title="Game nights">
          <ScheduleList categories={['game']} />
        </Panel>
        <VoteSummaryCard category="game" />
      </div>
    </div>
  )
}
