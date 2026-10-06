import type { CSSProperties, ReactNode } from 'react'
import { CONTENT_WIDTH_SIZES } from '../layout/imageSizes'
import { ArtEffect, type ArtEffectKind } from './ArtEffect'
import { EmblemStripe } from './Wordmark'

type PageArt = {
  src: string
  /** Wider and narrower copies of the art, as an img srcset. */
  srcSet?: string
  /** CSS object-position that keeps the subject in frame. */
  position?: string
  /** Position on narrow screens, where the art sits above the copy. Defaults to `position`. */
  narrowPosition?: string
  /** Art that fills the whole header on wide screens, with the copy over it at the bottom. */
  fill?: boolean
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
  const artVariant = art?.fill ? 'is-fill' : ''

  return (
    <header className={`page-header ${art ? 'has-art' : ''} ${artVariant}`}>
      {art && (
        <img
          className={`page-header-art ${artVariant}`}
          src={art.src}
          srcSet={art.srcSet}
          sizes={art.srcSet ? CONTENT_WIDTH_SIZES : undefined}
          alt=""
          style={artStyle}
        />
      )}
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
