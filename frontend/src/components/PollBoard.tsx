import type { Category } from '../lib/types'
import { CATEGORY_META } from '../lib/categories'
import { usePoll } from '../hooks/usePoll'
import { percent } from '../utils/format'
import { Icon } from './Icon'
import { EmptyState } from './Panel'
import { StatusPill } from './StatusPill'

/** The voting list a user interacts with. Results show once you vote or the poll closes. */
export function PollBoard({ category }: { category: Category }) {
  const { poll, votedFor, totalVotes, leader, vote } = usePoll(category)
  const accent = CATEGORY_META[category].accent
  const showResults = Boolean(votedFor) || !poll.isOpen

  return (
    <section className={`panel poll accent-${accent}`} aria-labelledby={`poll-${category}`}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast
          </p>
          <h2 className="panel-title" id={`poll-${category}`}>
            {poll.title}
          </h2>
        </div>
        <StatusPill tone={poll.isOpen ? 'open' : 'closed'} />
      </div>

      {poll.options.length === 0 ? (
        <EmptyState>No options yet. A moderator will add them soon.</EmptyState>
      ) : (
        <ul className="poll-options">
          {poll.options.map(option => {
            const share = percent(option.votes, totalVotes)
            const chosen = option.id === votedFor
            const winning = !poll.isOpen && option.id === leader?.id
            return (
              <li key={option.id} className={`poll-option ${chosen ? 'is-chosen' : ''} ${winning ? 'is-winner' : ''}`}>
                <button
                  type="button"
                  className="poll-choice"
                  onClick={() => vote(option.id)}
                  disabled={!poll.isOpen}
                  aria-pressed={chosen}
                >
                  {showResults && <span className="poll-bar" style={{ inlineSize: `${share}%` }} aria-hidden="true" />}
                  <span className="poll-mark" aria-hidden="true">
                    {chosen && <Icon name="check" size={14} />}
                  </span>
                  <span className="poll-text">
                    <b>{option.title}</b>
                    {option.note && <small>{option.note}</small>}
                  </span>
                  {showResults && (
                    <span className="poll-share">
                      {share}%<small>{option.votes}</small>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="poll-foot muted">
        {!poll.isOpen
          ? leader
            ? `Voting has closed. ${leader.title} takes it.`
            : 'Voting has closed.'
          : votedFor
            ? 'Vote counted. You can change it while voting is open.'
            : 'Pick one. Results appear after you vote.'}
      </p>
    </section>
  )
}
