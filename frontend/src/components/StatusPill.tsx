type Tone = 'live' | 'open' | 'closed' | 'offline'

const LABELS: Record<Tone, string> = { live: 'Live', open: 'Voting open', closed: 'Voting closed', offline: 'Offline' }

export function StatusPill({ tone, label }: { tone: Tone; label?: string }) {
  return (
    <span className={`status-pill is-${tone}`}>
      <i aria-hidden="true" />
      {label ?? LABELS[tone]}
    </span>
  )
}
