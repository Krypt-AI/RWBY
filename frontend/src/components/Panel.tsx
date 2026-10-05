import type { ReactNode } from 'react'
import { useMode } from '../hooks/useMode'
import { Icon } from './Icon'

type PanelProps = {
  title?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export function Panel({ title, eyebrow, actions, className = '', children }: PanelProps) {
  const hasHead = Boolean(title || eyebrow || actions)
  return (
    <section className={`panel ${className}`}>
      {hasHead && (
        <div className="panel-head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="panel-title">{title}</h2>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

/** Moderator tools. Renders nothing for regular users. */
export function ModPanel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  const { isModerator } = useMode()
  if (!isModerator) return null
  return (
    <section className={`panel mod-panel ${className}`} aria-label={`Moderator: ${title}`}>
      <div className="panel-head">
        <div>
          <p className="eyebrow mod-tag">
            <Icon name="shield" size={12} /> Moderator
          </p>
          <h2 className="panel-title">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>
}
