import type { SiteStatus } from '../services/backend'
import { EmblemStripe } from './Wordmark'

/** Stands in for the page while the shared data loads, or while the server can't be reached. */
export function SiteStatusMessage({ status }: { status: Exclude<SiteStatus, 'ready'> }) {
  const unreachable = status === 'unreachable'

  return (
    <div className={`site-status ${unreachable ? 'is-unreachable' : ''}`} role="status">
      <EmblemStripe className="site-status-stripe" />
      <p className="site-status-title">{unreachable ? 'Can’t reach Beacon' : 'Opening Beacon…'}</p>
      {unreachable && <p className="muted">The server isn’t answering. Trying again every few seconds.</p>}
    </div>
  )
}
