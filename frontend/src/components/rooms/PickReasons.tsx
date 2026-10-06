import type { Reason } from '../../lib/counterPicks'
import { Icon } from '../Icon'
import { MAX_REASONS } from './draftCopy'

/** Why a hero is suggested: strengths first, then warnings. */
export function PickReasons({ reasons }: { reasons: Reason[] }) {
  if (reasons.length === 0) return null

  return (
    <ul className="pick-reasons">
      {reasons.slice(0, MAX_REASONS).map(reason => (
        <li key={reason.text} className={`is-${reason.tone}`}>
          <Icon name={reason.tone === 'good' ? 'check' : 'trendDown'} size={13} />
          {reason.text}
        </li>
      ))}
    </ul>
  )
}
