import { Link } from 'react-router-dom'
import { CATEGORIES, CATEGORY_META } from '../lib/categories'
import { useSite } from '../hooks/useSite'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { StatusPill } from '../components/StatusPill'
import { AnnouncementEditor } from '../components/Announcement'
import { ScheduleForm, ScheduleList } from '../components/ScheduleList'

export function ControlRoomPage() {
  const { state, moderate } = useSite()
  const { stream, polls, chat, schedule } = state

  const totalVotes = CATEGORIES.reduce(
    (sum, category) => sum + polls[category].options.reduce((acc, option) => acc + option.votes, 0),
    0,
  )

  const resetSite = () => {
    if (window.confirm('Reset all polls, chat, schedule, squad posts, songs and stream settings to the defaults?')) {
      moderate({ type: 'site/reset' })
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Moderator"
        title="Control room"
        lead="Everything users see, in one place. Changes go live immediately for every open tab."
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
          <ul className="poll-table">
            {CATEGORIES.map(category => {
              const poll = polls[category]
              const votes = poll.options.reduce((sum, option) => sum + option.votes, 0)
              return (
                <li key={category} className={`accent-${CATEGORY_META[category].accent}`}>
                  <span className="poll-table-name">
                    <small>{CATEGORY_META[category].label}</small>
                    <b>{poll.title}</b>
                  </span>
                  <span className="poll-table-count">
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

        <Panel eyebrow="Schedule" title="Sessions" className="span-2">
          <ScheduleForm />
          <ScheduleList />
        </Panel>

        <Panel eyebrow="Danger zone" title="Reset the site" className="span-2 danger">
          <div className="mod-row">
            <p className="muted">Restores the default polls, schedule, squad board, song queue and stream, and clears the chat.</p>
            <button type="button" className="btn btn-danger" onClick={resetSite}>
              <Icon name="refresh" size={16} /> Reset everything
            </button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
