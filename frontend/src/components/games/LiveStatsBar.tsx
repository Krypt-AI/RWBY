import type { GameGuide } from '../../data/games/types'
import type { LiveStats, LiveStatus } from '../../hooks/useLiveStats'
import { useNow } from '../../hooks/useNow'
import { formatDate, formatRelative } from '../../utils/format'
import { Icon } from '../Icon'

const STATE_LABEL: Record<LiveStatus, string> = {
  none: 'Snapshot',
  loading: 'Connecting',
  live: 'Live',
  stale: 'Delayed',
  error: 'Offline',
}

/** Where the page's numbers come from right now, with the controls for the live feed. */
export function LiveStatsBar({ game, live }: { game: GameGuide; live: LiveStats }) {
  const now = useNow(30_000)
  const { feed, status, fetchedAt } = live

  if (!feed) {
    return (
      <section className="live-bar is-none" aria-label="Live stats">
        <span className="live-state">
          <i aria-hidden="true" /> {STATE_LABEL.none}
        </span>
        <p className="live-detail">
          Patch {game.patch} numbers from {formatDate(game.asOf)}. {game.shortName} has no public live feed, so check
          today’s rates here:
        </p>
        <ul className="live-links">
          {game.liveLinks.map(link => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer" className="link-arrow">
                {link.label} <Icon name="external" size={13} />
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const age = fetchedAt ? formatRelative(new Date(fetchedAt).toISOString(), now) : ''
  const source = (
    <a href={feed.sourceUrl} target="_blank" rel="noreferrer">
      {feed.source}
    </a>
  )

  return (
    <section className={`live-bar is-${status}`} aria-label="Live stats" aria-busy={live.isRefreshing}>
      <span className="live-state">
        <i aria-hidden="true" /> <span role="status">{STATE_LABEL[status]}</span>
      </span>
      <p className="live-detail">
        {status === 'loading' && <>Fetching this week’s rates from {source}…</>}
        {status === 'live' && (
          <>
            {live.rankLabel}, last 7 days. From {source}, checked {age}.
          </>
        )}
        {status === 'stale' && <>Couldn’t refresh, so these numbers are from {age}.</>}
        {status === 'error' && <>The live feed isn’t answering, so you’re seeing the patch {game.patch} snapshot.</>}
      </p>
      <div className="live-controls">
        <label className="live-rank">
          <span className="visually-hidden">Rank bracket</span>
          <select value={live.rank} onChange={event => live.setRank(event.target.value)}>
            {feed.ranks.map(rank => (
              <option key={rank.value} value={rank.value}>
                {rank.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`icon-button ${live.isRefreshing ? 'is-spinning' : ''}`}
          onClick={live.refresh}
          disabled={live.isRefreshing}
          aria-label="Refresh live stats"
        >
          <Icon name="refresh" size={16} />
        </button>
      </div>
    </section>
  )
}
