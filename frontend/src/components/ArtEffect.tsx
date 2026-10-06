import type { CSSProperties } from 'react'

/** One effect per picture, each matching its member (see styles/effects.css). */
export type ArtEffectKind = 'petals' | 'aura' | 'snow' | 'dust' | 'slivers' | 'embers' | 'shards'

type EffectShape = {
  count: number
  /** Splits the layer into this many columns, filled in turn (Dust uses one per member). */
  lanes?: number
}

const EFFECTS: Record<ArtEffectKind, EffectShape> = {
  petals: { count: 9 },
  /** One glow per member, placed on her panel by the stylesheet. */
  aura: { count: 4 },
  snow: { count: 18 },
  dust: { count: 12, lanes: 4 },
  slivers: { count: 9 },
  embers: { count: 10 },
  shards: { count: 6 },
}

/** Evenly scattered values in [0, 1): the fractional parts of an irrational step. */
function scatter(index: number, step: number, offset: number): number {
  return (offset + index * step) % 1
}

/** Where a particle starts across the layer, how far into its cycle, and how near it is. */
function particleStyle(index: number, lanes: number): CSSProperties {
  const lane = index % lanes
  const x = (lane + 0.12 + 0.76 * scatter(index, 0.618034, 0)) / lanes
  return {
    '--x': x.toFixed(3),
    '--phase': scatter(index, 0.414214, 0.3).toFixed(3),
    '--depth': scatter(index, 0.754878, 0.6).toFixed(3),
  } as CSSProperties
}

/** Decorative particles drifting over a picture. Hidden when the visitor prefers reduced motion. */
export function ArtEffect({ kind, className = '' }: { kind: ArtEffectKind; className?: string }) {
  const { count, lanes = 1 } = EFFECTS[kind]

  return (
    <div className={`art-effect is-${kind} ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i key={index} style={particleStyle(index, lanes)} />
      ))}
    </div>
  )
}
