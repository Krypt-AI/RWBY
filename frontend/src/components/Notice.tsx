import { useNotice } from '../hooks/useNotice'
import { Icon } from './Icon'

/** A short message when the server refuses a change, e.g. "The room is full." */
export function Notice() {
  const { notice, dismiss } = useNotice()

  return (
    // The live region stays mounted so screen readers announce each new message.
    <div className="notice-region" role="status" aria-live="assertive">
      {notice && (
        <p key={notice.id} className="notice">
          <Icon name="alert" size={16} />
          <span>{notice.message}</span>
          <button type="button" className="icon-button" onClick={dismiss} aria-label="Dismiss">
            <Icon name="close" size={15} />
          </button>
        </p>
      )}
    </div>
  )
}
