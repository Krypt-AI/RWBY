/** "RWBY" with each letter in its team colour, plus the hub name underneath. */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`wordmark ${compact ? 'is-compact' : ''}`}>
      <span className="wordmark-letters" aria-label="RWBY">
        <span className="tone-ruby">R</span>
        <span className="tone-weiss">W</span>
        <span className="tone-blake">B</span>
        <span className="tone-yang">Y</span>
      </span>
      {!compact && <span className="wordmark-sub">Afterlight</span>}
    </span>
  )
}

/** The four-colour team stripe used as a divider and accent. */
export function EmblemStripe({ className = '' }: { className?: string }) {
  return (
    <span className={`emblem-stripe ${className}`} aria-hidden="true">
      <i className="bg-ruby" />
      <i className="bg-weiss" />
      <i className="bg-blake" />
      <i className="bg-yang" />
    </span>
  )
}
