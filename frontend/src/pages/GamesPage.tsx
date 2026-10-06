import { Link } from 'react-router-dom'
import { GAMES } from '../data/games'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { ScheduleList } from '../components/ScheduleList'
import { VoteSummaryCard } from '../components/VoteSummaryCard'
import { GameCard } from '../components/games/GameCard'
import { RoomCard } from '../components/rooms/RoomCard'
import rubyArt from '../assets/images/RubyRose.jpg'

export function GamesPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Game guides"
        title="Know the meta"
        lead="Tier lists, lineups, builds and roles for the games we actually queue. MLBB rates update live; every guide is dated to its patch."
        art={{ src: rubyArt, position: 'center 30%', effect: 'petals' }}
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

      <section aria-labelledby="games-rooms">
        <div className="section-head">
          <h2 id="games-rooms" className="section-title">
            Game rooms
          </h2>
        </div>
        <div className="room-cards">
          {GAMES.map(game => (
            <RoomCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <div className="split-layout">
        <Panel eyebrow="Schedule" title="Game nights">
          <ScheduleList categories={['game']} />
        </Panel>
        <VoteSummaryCard category="game" />
      </div>
    </div>
  )
}
