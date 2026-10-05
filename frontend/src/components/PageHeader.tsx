import type { ReactNode } from 'react'
import { EmblemStripe } from './Wordmark'

type PageHeaderProps = {
  eyebrow: string
  title: string
  lead?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, lead, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">
          <EmblemStripe /> {eyebrow}
        </p>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}
