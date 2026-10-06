import { Link } from 'react-router-dom'
import { CATEGORIES, CATEGORY_META } from '../lib/categories'
import { ROOM_SIZE, roomPhase, type RoomPhase } from '../lib/rooms'
import { GAMES } from '../data/games'
import { useSite } from '../hooks/useSite'
import { formatSessionDate } from '../utils/format'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { StatusPill, type Tone } from '../components/StatusPill'
import { AnnouncementEditor } from '../components/Announcement'
import { ScheduleForm, ScheduleList } from '../components/ScheduleList'
import moonArt from '../assets/images/Ruby_moon.jpg'

const ROOM_PILL: Record<RoomPhase, { tone: Tone; label: string }> = {
  unscheduled: { tone: 'offline', label: 'No time set' },
  ended: { tone: 'offline', label: 'No time set' },
  upcoming: { tone: 'open', label: 'Scheduled' },
  starting: { tone: 'open', label: 'Starting' },
  inGame: { tone: 'live', label: 'In game' },
}

export function ControlRoomPage() {
  const { state, moderate } = useSite()
  const { stream, polls, chat, schedule, rooms } = state

  const totalVotes = CATEGORIES.reduce(
    (sum, category) => sum + polls[category].options.reduce((acc, option) => acc + option.votes, 0),
    0,
  )

  const resetSite = () => {
    const message = 'Reset all polls, chat, schedule, squad posts, songs, game rooms and stream settings to the defaults?'
    if (window.confirm(message)) moderate({ type: 'site/reset' })
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Moderator"
        title="Control room"
        lead="Everything users see, in one place. Changes go live immediately for every open tab."
        art={{ src: moonArt, position: 'center 30%', effect: 'shards' }}
      />

      <dl className="stat-row">
        <div>
          <dt>Total votes</dt>
          <dd>{totalVotes}</dd>
        </div>
        <div>
          <dt>Chat messages</dt>
          <dd>{chat.length}</dd>
        </div>
        <div>
          <dt>Sessions scheduled</dt>
          <dd>{schedule.length}</dd>
        </div>
        <div>
          <dt>Poll options</dt>
          <dd>{CATEGORIES.reduce((sum, category) => sum + polls[category].options.length, 0)}</dd>
        </div>
      </dl>

      <div className="control-grid">
        <Panel
          eyebrow="Stream"
          title={stream.title}
          actions={<StatusPill tone={stream.isLive ? 'live' : 'offline'} />}
        >
          <div className="mod-row">
            <button
              type="button"
              className={`btn ${stream.isLive ? 'btn-ghost' : 'btn-primary'}`}
              onClick={() => moderate({ type: 'stream/update', patch: { isLive: !stream.isLive } })}
            >
              <Icon name="live" size={16} /> {stream.isLive ? 'End stream' : 'Go live'}
            </button>
            <Link to="/live" className="link-arrow">
              Stream settings <Icon name="arrow" size={14} />
            </Link>
          </div>
        </Panel>

        <Panel eyebrow="Banner" title="Announcement">
          <AnnouncementEditor />
        </Panel>

        <Panel eyebrow="Votes" title="Polls" className="span-2">
          <ul className="control-table">
            {CATEGORIES.map(category => {
              const poll = polls[category]
              const votes = poll.options.reduce((sum, option) => sum + option.votes, 0)
              return (
                <li key={category} className={`accent-${CATEGORY_META[category].accent}`}>
                  <span className="control-table-name">
                    <small>{CATEGORY_META[category].label}</small>
                    <b>{poll.title}</b>
                  </span>
                  <span className="control-table-count">
                    {votes} votes · {poll.options.length} options
                  </span>
                  <StatusPill tone={poll.isOpen ? 'open' : 'closed'} />
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => moderate({ type: 'poll/update', category, patch: { isOpen: !poll.isOpen } })}
                  >
                    {poll.isOpen ? 'Close' : 'Reopen'}
                  </button>
                  <Link to={`/votes/${category}`} className="link-arrow">
                    Edit <Icon name="arrow" size={14} />
                  </Link>
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel eyebrow="Rooms" title="Game rooms" className="span-2">
          <ul className="control-table">
            {GAMES.map(game => {
              const room = rooms[game.id]
              const pill = ROOM_PILL[roomPhase(room.startsAt, Date.now())]
              return (
                <li key={game.id} className={`accent-${game.accent}`}>
                  <span className="control-table-name">
                    <small>{game.shortName}</small>
                    <b>{room.startsAt ? formatSessionDate(room.startsAt) : 'No start time'}</b>
                  </span>
                  <span className="control-table-count">
                    {room.members.length}/{ROOM_SIZE} in the room · {room.enemyPicks.length} enemy picks
                  </span>
                  <StatusPill tone={pill.tone} label={pill.label} />
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => moderate({ type: 'room/reset', game: game.id })}
                  >
                    Reset
                  </button>
                  <Link to={`/games/${game.id}/room`} className="link-arrow">
                    Open <Icon name="arrow" size={14} />
                  </Link>
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel eyebrow="Schedule" title="Sessions" className="span-2">
          <ScheduleForm />
          <ScheduleList />
        </Panel>

        <Panel eyebrow="Danger zone" title="Reset the site" className="span-2 danger">
          <div className="mod-row">
            <p className="muted">
              Restores the default polls, schedule, squad board, song queue, game rooms and stream, and clears the chat.
            </p>
            <button type="button" className="btn btn-danger" onClick={resetSite}>
              <Icon name="refresh" size={16} /> Reset everything
            </button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
