import { useState } from 'react'
import { initials } from '../../utils/format'

/**
 * A hero's portrait from the game's CDN, or their initials when it can't load.
 * Decorative: the hero's name is always shown next to it.
 */
export function HeroPortrait({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className="hero-portrait is-fallback" aria-hidden="true">
        {initials(name)}
      </span>
    )
  }

  return (
    <img
      className="hero-portrait"
      src={src}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
