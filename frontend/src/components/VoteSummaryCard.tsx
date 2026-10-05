import { Link } from 'react-router-dom'
import type { Category } from '../lib/types'
import { CATEGORY_META } from '../lib/categories'
import { usePoll } from '../hooks/usePoll'
import { percent } from '../utils/format'
import { StatusPill } from './StatusPill'

/** Compact poll teaser that links to the full vote page. */
export function VoteSummaryCard({ category }: { category: Category }) {
  const { poll, totalVotes, leader, votedFor } = usePoll(category)
  const meta = CATEGORY_META[category]

  return (
    <Link to={`/votes/${category}`} className={`vote-card accent-${meta.accent}`}>
      <span className="vote-card-label">{meta.label}</span>
      <b className="vote-card-title">{poll.title}</b>
      <span className="vote-card-leader">
        {leader ? (
          <>
            Leading: <b>{leader.title}</b> · {percent(leader.votes, totalVotes)}%
          </>
        ) : (
          'No votes yet. Be the first.'
        )}
      </span>
      <span className="vote-card-foot">
        <StatusPill tone={poll.isOpen ? 'open' : 'closed'} />
        <span>{votedFor ? 'You voted' : poll.isOpen ? 'Vote now' : 'See results'}</span>
      </span>
    </Link>
  )
}
