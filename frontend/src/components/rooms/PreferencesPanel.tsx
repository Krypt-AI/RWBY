import { useId, useMemo, type ReactNode } from 'react'
import type { GameGuide } from '../../data/games/types'
import { characterPool } from '../../data/games'
import { FAVOURITE_LIMIT } from '../../lib/rooms'
import type { RoomMember } from '../../lib/types'
import { ChipGroup } from '../ChipGroup'
import { HeroSearch } from './HeroSearch'
import { PickSlots } from './PickSlots'

/** Chip value for "no role": the player fills whatever the team needs. */
const FILL = 'fill'

const FAVOURITE_LABELS = ['Top pick', '2nd pick', '3rd pick']

type Preferences = Pick<RoomMember, 'role' | 'picks'>

type PreferencesPanelProps = {
  game: GameGuide
  title: string
  /** What the role is called here, e.g. "Role" or "Your lane". */
  roleLabel: string
  preferences: Preferences
  onChange: (preferences: Preferences) => void
  /** A line under the role chips, e.g. who else plays it. */
  note?: ReactNode
}

/** A player's role and up to three favourite heroes or agents, which their suggestions are built around. */
export function PreferencesPanel({ game, title, roleLabel, preferences, onChange, note }: PreferencesPanelProps) {
  const titleId = useId()
  const pool = useMemo(() => characterPool(game), [game])
  const { role, picks } = preferences
  const byName = new Map(pool.map(character => [character.name, character]))
  const favourites = picks.map(name => byName.get(name) ?? { name })
  const roleOptions = [
    { value: FILL, label: 'Fill' },
    ...game.roles.map(option => ({ value: option.id, label: option.name })),
  ]
  const { one, many } = game.characterTerm

  return (
    <section className="panel room-preferences" aria-labelledby={titleId}>
      <div className="panel-head">
        <h2 className="panel-title" id={titleId}>
          {title}
        </h2>
      </div>

      <fieldset className="field">
        <legend>{roleLabel}</legend>
        <ChipGroup
          label={roleLabel}
          options={roleOptions}
          isSelected={value => value === (role ?? FILL)}
          onSelect={value => onChange({ role: value === FILL ? null : value, picks })}
        />
      </fieldset>
      {note && <p className="muted">{note}</p>}

      <PickSlots
        label={`Favourite ${many}`}
        side="ally"
        count={FAVOURITE_LIMIT}
        picks={favourites}
        placeholder={index => FAVOURITE_LABELS[index] ?? `Pick ${index + 1}`}
        onRemove={name => onChange({ role, picks: picks.filter(pick => pick !== name) })}
      />
      <HeroSearch
        label={`Add a favourite ${one}`}
        noun={many}
        options={pool}
        browse={role ? pool.filter(character => character.roleIds.includes(role)) : undefined}
        taken={new Set(picks)}
        fullText={picks.length >= FAVOURITE_LIMIT ? `${FAVOURITE_LIMIT} favourites picked` : undefined}
        onPick={name => onChange({ role, picks: [...picks, name] })}
      />
    </section>
  )
}
