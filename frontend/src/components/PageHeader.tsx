import type { CSSProperties, ReactNode } from 'react'
import { ArtEffect, type ArtEffectKind } from './ArtEffect'
import { EmblemStripe } from './Wordmark'

type PageArt = {
  src: string
  /** CSS object-position that keeps the subject in frame. */
  position?: string
  /** Position on narrow screens, where the art sits above the copy. Defaults to `position`. */
  narrowPosition?: string
  /** Art drawn on black: shown whole, with its black taking on the panel colour. Ignores the positions. */
  onBlack?: boolean
  /** The member's element drifting over the art. */
  effect?: ArtEffectKind
}

type PageHeaderProps = {
  eyebrow: string
  title: string
  lead?: string
  actions?: ReactNode
  /** Character art that fills the right side of the header. Decorative. */
  art?: PageArt
}

export function PageHeader({ eyebrow, title, lead, actions, art }: PageHeaderProps) {
  const artStyle = art && ({ '--art-position': art.position, '--art-position-narrow': art.narrowPosition } as CSSProperties)
  const artVariant = art?.onBlack ? 'is-on-black' : ''

  return (
    <header className={`page-header ${art ? 'has-art' : ''}`}>
      {art && <img className={`page-header-art ${artVariant}`} src={art.src} alt="" style={artStyle} />}
      {art?.effect && <ArtEffect kind={art.effect} className={`page-header-effect ${artVariant}`} />}
      <div className="page-header-copy">
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
