import type { LfgPost } from '../../lib/types'
import { GAME_BY_ID, gameLabel } from '../../data/games'
import { useLfg } from '../../hooks/useLfg'
import { useMode } from '../../hooks/useMode'
import { useSite } from '../../hooks/useSite'
import { formatRelative } from '../../utils/format'
import { Icon } from '../Icon'
import { StatusPill } from '../StatusPill'

export function LfgCard({ post }: { post: LfgPost }) {
  const { isJoined, isOwn, isFull, toggleJoin, remove } = useLfg()
  const { isModerator } = useMode()
  const { moderate } = useSite()
  const accent = post.game === 'other' ? 'weiss' : GAME_BY_ID[post.game].accent
  const joined = isJoined(post)
  const own = isOwn(post)
  const full = isFull(post)

  return (
    <li className={`panel lfg-card accent-${accent}`}>
      <div className="panel-head">
        <div>
          <p className="eyebrow lfg-game">{gameLabel(post.game)}</p>
          <h3 className="panel-title">
            {post.mode}
            {post.rank && <span className="lfg-rank"> · {post.rank}</span>}
          </h3>
        </div>
        <StatusPill tone={full ? 'closed' : 'open'} label={full ? 'Full' : `${post.slots - post.joined} open`} />
      </div>

      {post.note && <p className="card-note">{post.note}</p>}

      {post.roles.length > 0 && (
        <p className="lfg-roles">
          <small>Needs</small>
          {post.roles.map(role => (
            <span key={role} className="tag">
              {role}
            </span>
          ))}
        </p>
      )}

      <div className="lfg-foot">
        <span className="lfg-meta">
          <b>{post.author}</b> · <time dateTime={post.at}>{formatRelative(post.at)}</time> · {post.joined}/{post.slots}{' '}
          joined
        </span>
        <span className="lfg-actions">
          {own ? (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => remove(post)}>
              Close post
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn-small ${joined ? 'btn-ghost is-on' : 'btn-outline'}`}
              onClick={() => toggleJoin(post)}
              aria-pressed={joined}
              disabled={full && !joined}
            >
              {joined ? (
                <>
                  <Icon name="check" size={14} /> I’m in
                </>
              ) : (
                'Join'
              )}
            </button>
          )}
          {isModerator && !own && (
            <button
              type="button"
              className="icon-button is-danger"
              onClick={() => moderate({ type: 'lfg/remove', id: post.id })}
              aria-label={`Remove ${post.author}’s post`}
            >
              <Icon name="trash" size={15} />
            </button>
          )}
        </span>
      </div>
    </li>
  )
}
