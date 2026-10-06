import type { CSSProperties } from 'react'
import { Icon } from '../Icon'
import { HeroPortrait } from '../games/HeroPortrait'

type Pick = { name: string; portrait?: string }

type PickSlotsProps = {
  /** Accessible name for the list. */
  label: string
  /** Enemy picks read red, as on the in-game draft screen; the squad's own read in the page accent. */
  side: 'enemy' | 'ally'
  count: number
  picks: Pick[]
  /** Text for an empty slot, by position. */
  placeholder: (index: number) => string
  /** Shows a remove button on each pick when given. */
  onRemove?: (name: string) => void
}

/** A fixed row of draft slots, filled in pick order. */
export function PickSlots({ label, side, count, picks, placeholder, onRemove }: PickSlotsProps) {
  const slots = Array.from({ length: count }, (_, index) => picks[index])

  return (
    <ol className={`pick-slots is-${side}`} aria-label={label} style={{ '--slot-count': count } as CSSProperties}>
      {slots.map((pick, index) =>
        pick ? (
          <li key={pick.name} className="pick-slot is-picked">
            <HeroPortrait name={pick.name} src={pick.portrait} />
            <span className="pick-slot-name">{pick.name}</span>
            {onRemove && (
              <button
                type="button"
                className="pick-slot-remove"
                onClick={() => onRemove(pick.name)}
                aria-label={`Remove ${pick.name}`}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </li>
        ) : (
          <li key={`open-${index}`} className="pick-slot">
            <span className="pick-slot-name">{placeholder(index)}</span>
          </li>
        ),
      )}
    </ol>
  )
}
