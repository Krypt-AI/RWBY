import { Link } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'
import { GAMES } from '../data/games'
import { useSite } from '../hooks/useSite'
import { Icon } from '../components/Icon'
import { EmptyState, ModPanel, Panel } from '../components/Panel'
import { ScheduleList } from '../components/ScheduleList'
import { StatusPill } from '../components/StatusPill'
import { AnnouncementEditor } from '../components/Announcement'
import { VoteSummaryCard } from '../components/VoteSummaryCard'
import { EmblemStripe } from '../components/Wordmark'
import { GameCard } from '../components/games/GameCard'
import { TrackQueue } from '../components/music/TrackQueue'
import { LfgCard } from '../components/squad/LfgCard'
import teamArt from '../assets/images/RWBY1.jpg'

const LATEST_SQUADS = 2
const TOP_TRACKS = 4

export function HomePage() {
  const { stream, lfg } = useSite().state

  return (
    <div className="page home">
      <section className="hero">
        <img className="hero-art" src={teamArt} alt="Silhouettes of Ruby, Weiss, Blake and Yang above their emblems" />
        <div className="hero-petals" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="hero-copy">
          <p className="eyebrow">
            <EmblemStripe /> Fan-run friends community
          </p>
          <h1>
            Squad up.
            <br />
            <em>Turn it up.</em>
          </h1>
          <p className="lead">
            Game nights, ranked pushes, a shared playlist and the anime of the season. The group votes and we queue.
          </p>
          <div className="hero-actions">
            <Link to="/squad" className="btn btn-primary">
              <Icon name="users" size={16} /> Find a squad
            </Link>
            <Link to="/games" className="btn btn-outline">
              <Icon name="gamepad" size={16} /> Meta guides
            </Link>
          </div>
        </div>
      </section>

      <Link to="/live" className={`now-strip ${stream.isLive ? 'is-live' : ''}`}>
        <StatusPill tone={stream.isLive ? 'live' : 'offline'} />
        <span className="now-title">
          {stream.title}
          <small>Hosted by {stream.host}</small>
        </span>
        <Icon name="arrow" />
      </Link>

      <ModPanel title="Front page announcement">
        <AnnouncementEditor />
      </ModPanel>

      <section aria-labelledby="home-games">
        <div className="section-head">
          <h2 id="home-games" className="section-title">
            Current meta
          </h2>
          <Link to="/games" className="link-arrow">
            All guides <Icon name="arrow" size={14} />
          </Link>
        </div>
        <div className="game-cards">
          {GAMES.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <div className="split-layout">
        <section aria-labelledby="home-squads">
          <div className="section-head">
            <h2 id="home-squads" className="section-title">
              Looking for group
            </h2>
            <Link to="/squad" className="link-arrow">
              Squad board <Icon name="arrow" size={14} />
            </Link>
          </div>
          {lfg.length === 0 ? (
            <EmptyState>Nobody is looking right now. Post a squad.</EmptyState>
          ) : (
            <ul className="lfg-list">
              {lfg.slice(0, LATEST_SQUADS).map(post => (
                <LfgCard key={post.id} post={post} />
              ))}
            </ul>
          )}
        </section>

        <Panel
          eyebrow="Music"
          title="Top of the queue"
          className="accent-nora"
          actions={
            <Link to="/music" className="link-arrow">
              Music <Icon name="arrow" size={14} />
            </Link>
          }
        >
          <TrackQueue limit={TOP_TRACKS} />
        </Panel>
      </div>

      <section aria-labelledby="home-votes">
        <div className="section-head">
          <h2 id="home-votes" className="section-title">
            This week’s votes
          </h2>
          <Link to="/votes" className="link-arrow">
            All votes <Icon name="arrow" size={14} />
          </Link>
        </div>
        <div className="vote-cards">
          {CATEGORIES.map(category => (
            <VoteSummaryCard key={category} category={category} />
          ))}
        </div>
      </section>

      <Panel
        eyebrow="Schedule"
        title="Up next"
        actions={
          <Link to="/live" className="link-arrow">
            Full schedule <Icon name="arrow" size={14} />
          </Link>
        }
      >
        <ScheduleList limit={3} />
      </Panel>
    </div>
  )
}
